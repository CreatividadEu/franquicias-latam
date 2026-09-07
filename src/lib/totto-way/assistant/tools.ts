/**
 * Herramientas del Asistente (PLAN §9). Dos se ejecutan en el servidor
 * (buscar y pedir validación) y dos son acciones de interfaz: el servidor
 * valida que el destino exista y esté al alcance, y el cliente las pinta como
 * un botón. El modelo nunca decide solo a dónde puede navegar alguien.
 */
import { prisma } from "@/lib/prisma";
import type { TwSession } from "../auth";
import { parseChapterSnapshot } from "../content";
import { notifyCheckpointRequest } from "../notify";
import { searchKnowledge, type KbHit } from "./retrieval";

export const ASSISTANT_TOOLS = [
  {
    name: "search_kb",
    description: "Busca en el manual de Totto Way. Úsala si la pregunta toca algo que no venga en los documentos entregados.",
    strict: true,
    input_schema: {
      type: "object" as const,
      properties: { query: { type: "string", description: "Qué buscar, en español" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "open_lesson",
    description: "Ofrece abrir una lección concreta del manual. Usa el slug de capítulo y lección tal como aparecen en las citas.",
    strict: true,
    input_schema: {
      type: "object" as const,
      properties: {
        chapter_slug: { type: "string" },
        lesson_slug: { type: "string" },
      },
      required: ["chapter_slug", "lesson_slug"],
      additionalProperties: false,
    },
  },
  {
    name: "show_benefit",
    description: "Ofrece abrir un beneficio del colaborador por su título exacto.",
    strict: true,
    input_schema: {
      type: "object" as const,
      properties: { title: { type: "string" } },
      required: ["title"],
      additionalProperties: false,
    },
  },
  {
    name: "log_checkpoint_request",
    description: "Avisa al líder de tienda de que la persona pide que le valide el checkpoint de un capítulo.",
    strict: true,
    input_schema: {
      type: "object" as const,
      properties: {
        chapter_slug: { type: "string" },
        note: { type: "string", description: "Una línea con lo que la persona quiere validar" },
      },
      required: ["chapter_slug", "note"],
      additionalProperties: false,
    },
  },
];

export type AssistantAction = { type: "open_lesson" | "show_benefit"; href: string; label: string };

export type ToolOutcome = {
  /** Lo que se le devuelve al modelo. */
  result: string;
  /** Acción que el cliente debe pintar, si la hay. */
  action?: AssistantAction;
  /** Fragmentos nuevos para citar en la siguiente vuelta. */
  hits?: KbHit[];
  isError?: boolean;
};

export async function runTool(
  session: TwSession,
  name: string,
  input: Record<string, unknown>,
): Promise<ToolOutcome> {
  switch (name) {
    case "search_kb": {
      const query = String(input.query ?? "");
      const hits = await searchKnowledge(session.franchiseId, query);
      if (hits.length === 0) return { result: "Sin resultados en el manual para esa búsqueda." };
      return {
        result: hits.map((hit, index) => `[${index + 1}] ${hit.title}\n${hit.text.slice(0, 700)}`).join("\n\n"),
        hits,
      };
    }

    case "open_lesson": {
      const chapterSlug = String(input.chapter_slug ?? "");
      const lessonSlug = String(input.lesson_slug ?? "");
      const chapter = await prisma.twChapter.findFirst({
        where: { franchiseId: session.franchiseId, slug: chapterSlug, status: "PUBLISHED" },
        select: { publishedSnapshot: true, slug: true },
      });
      const snapshot = chapter ? parseChapterSnapshot(chapter.publishedSnapshot) : null;
      const lesson = snapshot?.lessons.find((item) => item.slug === lessonSlug);
      if (!snapshot || !lesson) return { result: "Esa lección no existe o no está publicada.", isError: true };
      return {
        result: `Se le ofreció abrir la lección "${lesson.title}".`,
        action: { type: "open_lesson", href: `/totto-way/aprender/${snapshot.slug}/${lesson.slug}`, label: lesson.title },
      };
    }

    case "show_benefit": {
      const title = String(input.title ?? "");
      const benefit = await prisma.twBenefit.findFirst({
        where: { franchiseId: session.franchiseId, title: { equals: title, mode: "insensitive" } },
        select: { id: true, title: true },
      });
      if (!benefit) return { result: "Ese beneficio no existe.", isError: true };
      return {
        result: `Se le ofreció abrir el beneficio "${benefit.title}".`,
        action: { type: "show_benefit", href: `/totto-way/beneficios#${benefit.id}`, label: benefit.title },
      };
    }

    case "log_checkpoint_request": {
      const chapterSlug = String(input.chapter_slug ?? "");
      const note = String(input.note ?? "").slice(0, 300);
      const storeId = session.scope.homeStoreId;
      if (!storeId) return { result: "No tienes tienda asignada, así que no hay líder a quien avisar.", isError: true };

      const chapter = await prisma.twChapter.findFirst({
        where: { franchiseId: session.franchiseId, slug: chapterSlug },
        select: { title: true, number: true },
      });
      if (!chapter) return { result: "Ese capítulo no existe.", isError: true };

      const leaders = await prisma.twEmployee.findMany({
        where: { storeId, user: { role: "TW_LIDER_TIENDA" } },
        select: { user: { select: { name: true, email: true } } },
      });
      if (leaders.length === 0) return { result: "Tu tienda no tiene un líder registrado todavía." };

      for (const leader of leaders) {
        await notifyCheckpointRequest({
          to: leader.user.email,
          leaderName: leader.user.name,
          memberName: session.user.name,
          chapter: `Capítulo ${String(chapter.number).padStart(2, "0")} · ${chapter.title}`,
          note,
        });
      }
      return { result: `Aviso enviado a ${leaders.length === 1 ? "tu líder de tienda" : "los líderes de tu tienda"}.` };
    }

    default:
      return { result: `Herramienta desconocida: ${name}`, isError: true };
  }
}
