"use server";

/**
 * Estudio de contenido (PLAN §4.10). Todas las mutaciones del árbol vivo
 * Chapter → Mission → Lesson → Quiz. Solo formador y admin; cada acción
 * revalida la sesión y comprueba que el objeto pertenezca a su franquicia.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTwSessionOrNull, type TwSession } from "@/lib/totto-way/auth";
import { reindexChapter, reindexSideContent } from "@/lib/totto-way/assistant/retrieval";
import {
  buildChapterSnapshot,
  QuizQuestionsSchema,
  slugify,
  TwBlocksSchema,
  validateForPublish,
  type PublishIssue,
} from "@/lib/totto-way/content";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { canEditContent } from "@/lib/totto-way/scope";

export type StudioResult<T = undefined> = ({ ok: true } & (T extends undefined ? object : { data: T })) | { ok: false; error: string; issues?: PublishIssue[] };

const DENIED = { ok: false as const, error: "No tienes permiso para editar contenido." };

async function requireEditor(): Promise<TwSession | null> {
  const session = await getTwSessionOrNull();
  if (!session || !canEditContent(session.user.role)) return null;
  return session;
}

/** El capítulo tiene que ser de la franquicia de quien edita. */
async function ownedChapter(session: TwSession, chapterId: string) {
  return prisma.twChapter.findFirst({ where: { id: chapterId, franchiseId: session.franchiseId } });
}

function revalidateChapter(slug?: string) {
  revalidatePath(NAV_HREF.studio);
  revalidatePath(NAV_HREF.learn);
  revalidatePath(NAV_HREF.home);
  if (slug) {
    revalidatePath(`${NAV_HREF.studio}/${slug}`);
    revalidatePath(`${NAV_HREF.learn}/${slug}`);
  }
}

// ── Capítulo ───────────────────────────────────────────────────────────────

const ChapterSchema = z.object({
  chapterId: z.string().min(1).max(64),
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(240),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function updateChapter(input: z.infer<typeof ChapterSchema>): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const parsed = ChapterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisa el título y el color del capítulo." };
  const chapter = await ownedChapter(session, parsed.data.chapterId);
  if (!chapter) return { ok: false, error: "Ese capítulo no existe." };

  await prisma.twChapter.update({
    where: { id: chapter.id },
    data: { title: parsed.data.title, subtitle: parsed.data.subtitle, color: parsed.data.color },
  });
  revalidateChapter(chapter.slug);
  return { ok: true };
}

// ── Misión ─────────────────────────────────────────────────────────────────

const MissionSchema = z.object({
  chapterId: z.string().min(1).max(64),
  missionId: z.string().max(64).nullish(),
  code: z.string().trim().regex(/^M\d{2}$/, "El código va como M01"),
  title: z.string().trim().min(2).max(120),
});

export async function upsertMission(input: z.infer<typeof MissionSchema>): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const parsed = MissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const chapter = await ownedChapter(session, parsed.data.chapterId);
  if (!chapter) return { ok: false, error: "Ese capítulo no existe." };

  if (parsed.data.missionId) {
    // La misión tiene que ser de ESTE capítulo: con el id suelto se podía
    // renombrar la misión de cualquier otro capítulo de la plataforma.
    const owned = await prisma.twMission.findFirst({
      where: { id: parsed.data.missionId, chapterId: chapter.id },
      select: { id: true },
    });
    if (!owned) return { ok: false, error: "Esa misión no pertenece a este capítulo." };

    const clash = await prisma.twMission.findFirst({
      where: { chapterId: chapter.id, code: parsed.data.code, NOT: { id: owned.id } },
      select: { id: true },
    });
    if (clash) return { ok: false, error: `Ya existe la misión ${parsed.data.code}.` };

    await prisma.twMission.update({
      where: { id: owned.id },
      data: { code: parsed.data.code, title: parsed.data.title },
    });
  } else {
    const count = await prisma.twMission.count({ where: { chapterId: chapter.id } });
    const duplicate = await prisma.twMission.findFirst({ where: { chapterId: chapter.id, code: parsed.data.code } });
    if (duplicate) return { ok: false, error: `Ya existe la misión ${parsed.data.code}.` };
    await prisma.twMission.create({
      data: { chapterId: chapter.id, code: parsed.data.code, title: parsed.data.title, order: count },
    });
  }
  revalidateChapter(chapter.slug);
  return { ok: true };
}

export async function deleteMission(missionId: string): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const mission = await prisma.twMission.findFirst({
    where: { id: missionId, chapter: { franchiseId: session.franchiseId } },
    select: { id: true, chapter: { select: { slug: true } }, _count: { select: { lessons: true } } },
  });
  if (!mission) return { ok: false, error: "Esa misión no existe." };
  if (mission._count.lessons > 0) return { ok: false, error: "Mueve o borra antes sus lecciones." };

  await prisma.twMission.delete({ where: { id: mission.id } });
  revalidateChapter(mission.chapter.slug);
  return { ok: true };
}

// ── Lección ────────────────────────────────────────────────────────────────

const LessonSchema = z.object({
  chapterId: z.string().min(1).max(64),
  lessonId: z.string().max(64).nullish(),
  missionId: z.string().min(1).max(64),
  title: z.string().trim().min(2).max(160),
  type: z.enum(["READING", "VIDEO", "CHECKLIST", "CHECKPOINT"]),
  minutes: z.number().int().min(1).max(180),
  xp: z.number().int().min(10).max(500),
  keyTakeaway: z.string().trim().max(300),
  ruleBanner: z.string().trim().max(300).nullish(),
  posterUrl: z.string().trim().max(500).nullish(),
  videoSrc: z.string().trim().max(500).nullish(),
  docRefs: z.array(z.string().trim().max(60)).max(12).default([]),
  blocks: TwBlocksSchema,
});

export async function upsertLesson(input: z.infer<typeof LessonSchema>): Promise<StudioResult<{ lessonId: string; slug: string }>> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const parsed = LessonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los campos de la lección." };
  }
  const chapter = await ownedChapter(session, parsed.data.chapterId);
  if (!chapter) return { ok: false, error: "Ese capítulo no existe." };

  const mission = await prisma.twMission.findFirst({ where: { id: parsed.data.missionId, chapterId: chapter.id } });
  if (!mission) return { ok: false, error: "La misión no pertenece a este capítulo." };

  const data = {
    missionId: mission.id,
    title: parsed.data.title,
    type: parsed.data.type,
    minutes: parsed.data.minutes,
    xp: parsed.data.xp,
    keyTakeaway: parsed.data.keyTakeaway,
    ruleBanner: parsed.data.ruleBanner || null,
    posterUrl: parsed.data.posterUrl || null,
    blocks: parsed.data.blocks,
    docRefs: parsed.data.docRefs,
  };

  let lesson;
  if (parsed.data.lessonId) {
    const existing = await prisma.twLesson.findFirst({ where: { id: parsed.data.lessonId, chapterId: chapter.id } });
    if (!existing) return { ok: false, error: "Esa lección no existe." };
    lesson = await prisma.twLesson.update({ where: { id: existing.id }, data });
  } else {
    const count = await prisma.twLesson.count({ where: { chapterId: chapter.id } });
    const base = slugify(parsed.data.title);
    const taken = await prisma.twLesson.findFirst({ where: { chapterId: chapter.id, slug: base } });
    lesson = await prisma.twLesson.create({
      data: { ...data, chapterId: chapter.id, slug: taken ? `${base}-${count + 1}` : base, order: count },
    });
  }

  revalidateChapter(chapter.slug);
  return { ok: true, data: { lessonId: lesson.id, slug: lesson.slug } };
}

/**
 * Borra una lección. Dos protecciones que no estaban:
 *
 * 1. `tw_lesson_progress` tiene ON DELETE CASCADE, así que borrar una lección
 *    con avance destruye el progreso de todos los colaboradores mientras sus
 *    eventos de XP sobreviven. Si alguien la empezó, no se borra.
 * 2. El alumno lee del snapshot publicado; borrar sin republicar dejaba el
 *    snapshot apuntando a una lección inexistente. Si el capítulo está
 *    publicado, se vuelve a congelar tras el borrado.
 */
export async function deleteLesson(lessonId: string): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const lesson = await prisma.twLesson.findFirst({
    where: { id: lessonId, chapter: { franchiseId: session.franchiseId } },
    select: { id: true, title: true, chapter: { select: { id: true, slug: true, status: true } } },
  });
  if (!lesson) return { ok: false, error: "Esa lección no existe." };

  const started = await prisma.twLessonProgress.count({ where: { lessonId: lesson.id } });
  if (started > 0) {
    return {
      ok: false,
      error: `No se puede borrar: ${started} ${started === 1 ? "persona ya la empezó" : "personas ya la empezaron"} y se perdería su avance. Quítala de la misión o déjala sin publicar.`,
    };
  }

  await prisma.twLesson.delete({ where: { id: lesson.id } });

  // Si el capítulo estaba publicado, el snapshot todavía la nombra: se vuelve
  // a congelar para que la vista del alumno no apunte a un fantasma.
  if (lesson.chapter.status === "PUBLISHED") {
    const republish = await publishChapter(lesson.chapter.id);
    if (!republish.ok) {
      return {
        ok: false,
        error: "La lección se borró, pero el capítulo quedó sin poder republicarse. Revísalo y publícalo a mano.",
        issues: republish.issues,
      };
    }
  }

  revalidateChapter(lesson.chapter.slug);
  return { ok: true };
}

/** Reordena las lecciones de un capítulo con la lista completa de ids. */
export async function reorderLessons(chapterId: string, lessonIds: string[]): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const chapter = await ownedChapter(session, chapterId);
  if (!chapter) return { ok: false, error: "Ese capítulo no existe." };

  const lessons = await prisma.twLesson.findMany({ where: { chapterId: chapter.id }, select: { id: true } });
  const known = new Set(lessons.map((lesson) => lesson.id));
  if (lessonIds.length !== lessons.length || lessonIds.some((id) => !known.has(id))) {
    return { ok: false, error: "La lista de lecciones no coincide con el capítulo." };
  }

  await prisma.$transaction(
    lessonIds.map((id, index) => prisma.twLesson.update({ where: { id }, data: { order: index } })),
  );
  revalidateChapter(chapter.slug);
  return { ok: true };
}

// ── Quiz ───────────────────────────────────────────────────────────────────

const QuizSchema = z.object({
  lessonId: z.string().min(1).max(64),
  questions: QuizQuestionsSchema.max(10),
  bonusXp: z.number().int().min(0).max(200),
});

export async function upsertQuiz(input: z.infer<typeof QuizSchema>): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const parsed = QuizSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisa las preguntas: cada una necesita enunciado, opciones y respuesta correcta." };

  const lesson = await prisma.twLesson.findFirst({
    where: { id: parsed.data.lessonId, chapter: { franchiseId: session.franchiseId } },
    select: { id: true, chapter: { select: { slug: true } } },
  });
  if (!lesson) return { ok: false, error: "Esa lección no existe." };

  const invalid = parsed.data.questions.find((question) => question.correctIndex >= question.options.length);
  if (invalid) return { ok: false, error: "Una pregunta apunta a una opción que no existe." };

  if (parsed.data.questions.length === 0) {
    await prisma.twQuiz.deleteMany({ where: { lessonId: lesson.id } });
  } else {
    await prisma.twQuiz.upsert({
      where: { lessonId: lesson.id },
      update: { questions: parsed.data.questions, passScore: parsed.data.questions.length, bonusXp: parsed.data.bonusXp },
      create: {
        lessonId: lesson.id,
        questions: parsed.data.questions,
        passScore: parsed.data.questions.length,
        bonusXp: parsed.data.bonusXp,
      },
    });
  }

  revalidateChapter(lesson.chapter.slug);
  return { ok: true };
}

// ── Publicación ────────────────────────────────────────────────────────────

/**
 * Publica un capítulo: valida, congela el snapshot que verán los alumnos,
 * sube la versión y reindexa la base del Asistente. Si algo no cumple,
 * devuelve la lista de problemas y no toca nada.
 */
export async function publishChapter(chapterId: string): Promise<StudioResult<{ version: number; chunks: number }>> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const chapter = await prisma.twChapter.findFirst({
    where: { id: chapterId, franchiseId: session.franchiseId },
    include: { missions: true, lessons: { include: { quiz: true } }, checkpoints: true },
  });
  if (!chapter) return { ok: false, error: "Ese capítulo no existe." };

  const tree = {
    ...chapter,
    lessons: chapter.lessons.map((lesson) => ({ ...lesson, videoSrc: null })),
  };

  const issues = validateForPublish(tree);
  if (issues.length > 0) {
    return { ok: false, error: "El capítulo todavía no se puede publicar.", issues };
  }

  const version = chapter.publishedAt ? chapter.version + 1 : chapter.version;
  const snapshot = buildChapterSnapshot(tree, new Date(), version);

  await prisma.twChapter.update({
    where: { id: chapter.id },
    data: { status: "PUBLISHED", version, publishedAt: new Date(), publishedSnapshot: snapshot },
  });

  const chunks = await reindexChapter(chapter.id);
  revalidateChapter(chapter.slug);
  return { ok: true, data: { version, chunks } };
}

/** Despublica: el capítulo vuelve a borrador y sale de la base del Asistente. */
export async function unpublishChapter(chapterId: string): Promise<StudioResult> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const chapter = await ownedChapter(session, chapterId);
  if (!chapter) return { ok: false, error: "Ese capítulo no existe." };

  await prisma.twChapter.update({ where: { id: chapter.id }, data: { status: "DRAFT" } });
  await reindexChapter(chapter.id);
  revalidateChapter(chapter.slug);
  return { ok: true };
}

/** Reindexa beneficios e Inspira, que el Asistente también consulta. */
export async function reindexExtras(): Promise<StudioResult<{ chunks: number }>> {
  const session = await requireEditor();
  if (!session) return DENIED;
  const chunks = await reindexSideContent(session.franchiseId);
  return { ok: true, data: { chunks } };
}
