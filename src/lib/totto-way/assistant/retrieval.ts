/**
 * Recuperación del Asistente (PLAN §9). Sin proveedor de embeddings (D3), la
 * búsqueda va por full-text de Postgres en español: la columna generada `tsv`
 * y su índice GIN los crea la migración 20260907190000.
 *
 * `embedding` sigue siendo el plan a futuro; cuando exista, este módulo pasa a
 * híbrido y el resto del asistente no cambia.
 */
import type { Prisma, TwKbSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseBlocks, parseChapterSnapshot, type TwBlock } from "../content";

export type KbLocator = {
  chapter?: number;
  chapterTitle?: string;
  chapterSlug?: string;
  mission?: string;
  lesson?: string;
  lessonSlug?: string;
  href?: string;
};

export type KbHit = {
  id: string;
  source: TwKbSource;
  sourceId: string | null;
  title: string;
  text: string;
  locator: KbLocator;
  rank: number;
};

/** Máximo de fragmentos que se le pasan al modelo en una pregunta. */
export const DEFAULT_TOP_K = 6;

/**
 * Busca en la base de conocimiento de una franquicia.
 *
 * `websearch_to_tsquery` acepta lo que un asesor escribe de verdad ("como
 * marco en geovictoria") sin romperse con la puntuación, a diferencia de
 * `to_tsquery`. Si no hay ninguna coincidencia se cae a una búsqueda por
 * prefijo del término más largo, que rescata errores de tecleo parciales.
 */
export async function searchKnowledge(
  franchiseId: string,
  query: string,
  limit = DEFAULT_TOP_K,
): Promise<KbHit[]> {
  const clean = query.trim().slice(0, 400);
  if (clean.length < 2) return [];

  const rows = await prisma.$queryRaw<
    { id: string; source: TwKbSource; sourceId: string | null; title: string; text: string; locator: Prisma.JsonValue; rank: number }[]
  >`
    SELECT "id", "source", "sourceId", "title", "text", "locator",
           ts_rank("tsv", websearch_to_tsquery('spanish', ${clean})) AS "rank"
    FROM "tw_knowledge_chunks"
    WHERE "franchiseId" = ${franchiseId}
      AND "tsv" @@ websearch_to_tsquery('spanish', ${clean})
    ORDER BY "rank" DESC
    LIMIT ${limit}
  `;

  if (rows.length > 0) return rows.map(toHit);

  // `to_tsquery` es sintaxis, no texto: un "&", un "!" o un paréntesis del
  // usuario lanzaba un error de sintaxis en Postgres. Se deja solo el término
  // más largo reducido a letras y números.
  const longest = clean
    .split(/\s+/)
    .map((word) => word.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length >= 4)
    .sort((a, b) => b.length - a.length)[0];
  if (!longest) return [];

  const fallback = await prisma.$queryRaw<
    { id: string; source: TwKbSource; sourceId: string | null; title: string; text: string; locator: Prisma.JsonValue; rank: number }[]
  >`
    SELECT "id", "source", "sourceId", "title", "text", "locator",
           ts_rank("tsv", to_tsquery('spanish', ${`${longest}:*`})) AS "rank"
    FROM "tw_knowledge_chunks"
    WHERE "franchiseId" = ${franchiseId}
      AND "tsv" @@ to_tsquery('spanish', ${`${longest}:*`})
    ORDER BY "rank" DESC
    LIMIT ${limit}
  `;
  return fallback.map(toHit);
}

function toHit(row: {
  id: string;
  source: TwKbSource;
  sourceId: string | null;
  title: string;
  text: string;
  locator: Prisma.JsonValue;
  rank: number;
}): KbHit {
  return {
    id: row.id,
    source: row.source,
    sourceId: row.sourceId,
    title: row.title,
    text: row.text,
    locator: (row.locator ?? {}) as KbLocator,
    rank: Number(row.rank),
  };
}

// ── Indexado ───────────────────────────────────────────────────────────────

/** Texto plano de los bloques de una lección, sin el vocabulario visual. */
export function blocksToText(blocks: TwBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        parts.push(block.text.replace(/\*\*/g, ""));
        break;
      case "simple_translation":
        parts.push(`Traducción simple: ${block.text}`);
        break;
      case "rule":
        parts.push(`Regla: ${block.text}`);
        break;
      case "steps":
        parts.push(block.items.map((item, index) => `${index + 1}. ${item.lead ? `${item.lead} ` : ""}${item.text}`).join(" "));
        break;
      case "checklist":
        parts.push(block.items.join(". "));
        break;
      case "doc":
        parts.push(`Documento ${block.code}: ${block.label}`);
        break;
      case "image":
        if (block.caption) parts.push(block.caption);
        break;
      case "video":
        break;
    }
  }
  return parts.join("\n").trim();
}

/**
 * Reindexa un capítulo publicado: una entrada por lección, con el locator que
 * el Asistente usa para citar y enlazar. Borra primero lo anterior del mismo
 * capítulo para que una republicación no deje fragmentos viejos.
 */
export async function reindexChapter(chapterId: string): Promise<number> {
  const chapter = await prisma.twChapter.findUnique({
    where: { id: chapterId },
    select: { id: true, franchiseId: true, number: true, title: true, slug: true, status: true, version: true, publishedSnapshot: true },
  });
  if (!chapter) return 0;

  await prisma.twKnowledgeChunk.deleteMany({ where: { source: "LESSON", sourceId: { startsWith: `${chapter.id}:` } } });
  await prisma.twKnowledgeChunk.deleteMany({ where: { source: "CHAPTER", sourceId: chapter.id } });

  const snapshot = chapter.status === "PUBLISHED" ? parseChapterSnapshot(chapter.publishedSnapshot) : null;
  if (!snapshot) return 0;

  const rows: Prisma.TwKnowledgeChunkCreateManyInput[] = [
    {
      franchiseId: chapter.franchiseId,
      source: "CHAPTER",
      sourceId: chapter.id,
      title: `Capítulo ${String(snapshot.number).padStart(2, "0")} · ${snapshot.title}`,
      text: `${snapshot.title}. ${snapshot.subtitle}. Misiones: ${snapshot.missions.map((m) => `${m.code} ${m.title}`).join(", ")}.`,
      locator: { chapter: snapshot.number, chapterTitle: snapshot.title, chapterSlug: snapshot.slug, href: `/totto-way/aprender/${snapshot.slug}` },
      version: chapter.version,
    },
  ];

  for (const lesson of snapshot.lessons) {
    const body = blocksToText(parseBlocks(lesson.blocks));
    const text = [body, lesson.keyTakeaway ? `Traducción simple: ${lesson.keyTakeaway}` : "", lesson.ruleBanner ? `Regla: ${lesson.ruleBanner}` : ""]
      .filter(Boolean)
      .join("\n");
    if (!text.trim()) continue;
    rows.push({
      franchiseId: chapter.franchiseId,
      source: "LESSON",
      sourceId: `${chapter.id}:${lesson.id}`,
      title: `Capítulo ${String(snapshot.number).padStart(2, "0")} · ${lesson.missionCode} · ${lesson.title}`,
      text,
      locator: {
        chapter: snapshot.number,
        chapterTitle: snapshot.title,
        chapterSlug: snapshot.slug,
        mission: lesson.missionCode,
        lesson: lesson.title,
        lessonSlug: lesson.slug,
        href: `/totto-way/aprender/${snapshot.slug}/${lesson.slug}`,
      },
      version: chapter.version,
    });
  }

  await prisma.twKnowledgeChunk.createMany({ data: rows });
  return rows.length;
}

/** Reindexa beneficios e Inspira, que también son consultables. */
export async function reindexSideContent(franchiseId: string): Promise<number> {
  await prisma.twKnowledgeChunk.deleteMany({ where: { franchiseId, source: { in: ["BENEFIT", "INSPIRE"] } } });

  const [benefits, inspire] = await Promise.all([
    prisma.twBenefit.findMany({ where: { franchiseId } }),
    prisma.twInspireItem.findMany({ where: { franchiseId, publishedAt: { not: null } } }),
  ]);

  const rows: Prisma.TwKnowledgeChunkCreateManyInput[] = [
    ...benefits.map((benefit) => ({
      franchiseId,
      source: "BENEFIT" as const,
      sourceId: benefit.id,
      title: `Beneficio · ${benefit.title}`,
      text: `${benefit.category}. ${benefit.title}. ${benefit.desc}`,
      locator: { href: "/totto-way/beneficios" },
    })),
    ...inspire.map((item) => ({
      franchiseId,
      source: "INSPIRE" as const,
      sourceId: item.id,
      title: `Inspira · ${item.title}`,
      text: [item.title, item.who, item.desc, item.quote].filter(Boolean).join(". "),
      locator: { href: `/totto-way/inspira/${item.id}` },
    })),
  ];

  if (rows.length > 0) await prisma.twKnowledgeChunk.createMany({ data: rows });
  return rows.length;
}

/** Reindexa todo lo publicado de una franquicia. Lo usa el seed y el Estudio. */
export async function reindexFranchise(franchiseId: string): Promise<number> {
  const chapters = await prisma.twChapter.findMany({
    where: { franchiseId, status: "PUBLISHED" },
    select: { id: true },
  });
  let total = 0;
  for (const chapter of chapters) total += await reindexChapter(chapter.id);
  total += await reindexSideContent(franchiseId);
  return total;
}
