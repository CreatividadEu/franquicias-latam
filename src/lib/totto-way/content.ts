/**
 * Contenido de Totto Way (PLAN §7): vocabulario de bloques, quiz y el
 * snapshot congelado que ven los alumnos al publicar un capítulo. Puro y
 * validado con Zod para que el Estudio, el seed y el renderer compartan
 * exactamente la misma forma.
 */
import { z } from "zod";

// ── Bloques del vocabulario Totto ──────────────────────────────────────────

export const TwBlockSchema = z.discriminatedUnion("type", [
  /** Texto. `**negrita**` se pinta con font-weight 500. */
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  /** Bloque negro "Traducción simple": la idea en una línea. */
  z.object({ type: z.literal("simple_translation"), text: z.string().min(1) }),
  /** Banda amarilla con "!": regla que no se negocia. */
  z.object({ type: z.literal("rule"), text: z.string().min(1) }),
  /** Pasos con números rojos. */
  z.object({
    type: z.literal("steps"),
    items: z.array(z.object({ lead: z.string().optional(), text: z.string().min(1) })).min(1),
  }),
  /** Chip DOC: documento oficial o enlace para profundizar. */
  z.object({
    type: z.literal("doc"),
    code: z.string().min(1),
    label: z.string().min(1),
    href: z.string().optional(),
  }),
  /** Imagen / screenshot del manual. */
  z.object({
    type: z.literal("image"),
    src: z.string().min(1),
    alt: z.string().default(""),
    caption: z.string().optional(),
  }),
  /** Video paso a paso (asset del storage) con poster y marcadores. */
  z.object({
    type: z.literal("video"),
    assetId: z.string().optional(),
    src: z.string().optional(),
    poster: z.string().optional(),
    markers: z.array(z.object({ sec: z.number().int().nonnegative(), label: z.string() })).default([]),
  }),
  /** Lista de verificación (lecciones tipo CHECKLIST). */
  z.object({ type: z.literal("checklist"), items: z.array(z.string().min(1)).min(1) }),
]);

export type TwBlock = z.infer<typeof TwBlockSchema>;
export const TwBlocksSchema = z.array(TwBlockSchema);

export function parseBlocks(value: unknown): TwBlock[] {
  const parsed = TwBlocksSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

// ── Quiz ───────────────────────────────────────────────────────────────────

export const QuizQuestionSchema = z.object({
  q: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export const QuizQuestionsSchema = z.array(QuizQuestionSchema);

export function parseQuizQuestions(value: unknown): QuizQuestion[] {
  const parsed = QuizQuestionsSchema.safeParse(value);
  return parsed.success ? parsed.data.filter((q) => q.correctIndex < q.options.length) : [];
}

// ── Snapshot publicado ─────────────────────────────────────────────────────

export const LessonSnapshotSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  type: z.enum(["READING", "VIDEO", "CHECKLIST", "CHECKPOINT"]),
  minutes: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  order: z.number().int(),
  missionCode: z.string(),
  blocks: TwBlocksSchema,
  keyTakeaway: z.string(),
  ruleBanner: z.string().nullable(),
  posterUrl: z.string().nullable(),
  videoSrc: z.string().nullable(),
  docRefs: z.array(z.string()),
  quiz: z
    .object({ questions: QuizQuestionsSchema, passScore: z.number().int(), bonusXp: z.number().int() })
    .nullable(),
});
export type LessonSnapshot = z.infer<typeof LessonSnapshotSchema>;

export const MissionSnapshotSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  order: z.number().int(),
  lessonIds: z.array(z.string()),
});
export type MissionSnapshot = z.infer<typeof MissionSnapshotSchema>;

export const CheckpointSnapshotSchema = z.object({
  id: z.string(),
  title: z.string(),
  instructions: z.string(),
  xp: z.number().int(),
  validatorRole: z.string(),
});

export const ChapterSnapshotSchema = z.object({
  version: z.number().int().positive(),
  id: z.string(),
  number: z.number().int(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  color: z.string(),
  missions: z.array(MissionSnapshotSchema),
  lessons: z.array(LessonSnapshotSchema),
  checkpoints: z.array(CheckpointSnapshotSchema),
  publishedAt: z.string(),
});
export type ChapterSnapshot = z.infer<typeof ChapterSnapshotSchema>;

export function parseChapterSnapshot(value: unknown): ChapterSnapshot | null {
  const parsed = ChapterSnapshotSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Forma mínima del árbol vivo que hace falta para congelarlo. */
export type ChapterTreeInput = {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  color: string;
  version: number;
  missions: { id: string; code: string; title: string; order: number }[];
  lessons: {
    id: string;
    slug: string;
    title: string;
    type: "READING" | "VIDEO" | "CHECKLIST" | "CHECKPOINT";
    minutes: number;
    xp: number;
    order: number;
    missionId: string;
    blocks: unknown;
    keyTakeaway: string;
    ruleBanner: string | null;
    posterUrl: string | null;
    videoSrc?: string | null;
    docRefs: string[];
    quiz: { questions: unknown; passScore: number; bonusXp: number } | null;
  }[];
  checkpoints: { id: string; title: string; instructions: string; xp: number; validatorRole: string }[];
};

export type PublishIssue = { path: string; message: string };

/** Valida que el árbol pueda publicarse. Vacío = OK. */
export function validateForPublish(tree: ChapterTreeInput): PublishIssue[] {
  const issues: PublishIssue[] = [];
  if (!tree.title.trim()) issues.push({ path: "title", message: "El capítulo necesita título" });
  if (tree.lessons.length === 0) issues.push({ path: "lessons", message: "Un capítulo publicado necesita al menos una lección" });
  for (const lesson of tree.lessons) {
    const p = `lessons.${lesson.slug}`;
    if (parseBlocks(lesson.blocks).length === 0 && lesson.type !== "CHECKPOINT") {
      issues.push({ path: p, message: "La lección necesita al menos un bloque" });
    }
    if (!lesson.keyTakeaway.trim()) issues.push({ path: p, message: "Falta la Traducción simple" });
    if (lesson.xp <= 0) issues.push({ path: p, message: "El XP debe ser mayor que 0" });
    // Una lección de video puede publicarse con solo el screenshot del manual
    // como póster: el paso a paso se graba después (así lo pide el manual, y es
    // la misma regla que deja completarla sin archivo). Lo que no puede es
    // quedarse sin nada que mostrar.
    if (lesson.type === "VIDEO" && !lesson.videoSrc && !lesson.posterUrl && !parseBlocks(lesson.blocks).some((b) => b.type === "video")) {
      issues.push({ path: p, message: "La lección de video necesita al menos un póster mientras se graba" });
    }
    if (lesson.quiz && parseQuizQuestions(lesson.quiz.questions).length === 0) {
      issues.push({ path: `${p}.quiz`, message: "El quiz no tiene preguntas válidas" });
    }
    if (!tree.missions.some((m) => m.id === lesson.missionId)) {
      issues.push({ path: p, message: "La lección apunta a una misión inexistente" });
    }
  }
  return issues;
}

export function buildChapterSnapshot(tree: ChapterTreeInput, publishedAt: Date, version: number): ChapterSnapshot {
  const missions = [...tree.missions].sort((a, b) => a.order - b.order);
  const lessons = [...tree.lessons].sort((a, b) => a.order - b.order);
  return {
    version,
    id: tree.id,
    number: tree.number,
    slug: tree.slug,
    title: tree.title,
    subtitle: tree.subtitle,
    color: tree.color,
    publishedAt: publishedAt.toISOString(),
    missions: missions.map((m) => ({
      id: m.id,
      code: m.code,
      title: m.title,
      order: m.order,
      lessonIds: lessons.filter((l) => l.missionId === m.id).map((l) => l.id),
    })),
    lessons: lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      type: l.type,
      minutes: l.minutes,
      xp: l.xp,
      order: l.order,
      missionCode: missions.find((m) => m.id === l.missionId)?.code ?? "",
      blocks: parseBlocks(l.blocks),
      keyTakeaway: l.keyTakeaway,
      ruleBanner: l.ruleBanner,
      posterUrl: l.posterUrl,
      videoSrc: l.videoSrc ?? null,
      docRefs: l.docRefs,
      quiz: l.quiz
        ? { questions: parseQuizQuestions(l.quiz.questions), passScore: l.quiz.passScore, bonusXp: l.quiz.bonusXp }
        : null,
    })),
    checkpoints: tree.checkpoints.map((c) => ({
      id: c.id,
      title: c.title,
      instructions: c.instructions,
      xp: c.xp,
      validatorRole: c.validatorRole,
    })),
  };
}

export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}
