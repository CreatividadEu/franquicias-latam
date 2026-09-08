"use server";

/**
 * Mutaciones de la lección. Cada acción revalida la sesión y vuelve a leer el
 * snapshot publicado: el cliente nunca decide qué lección toca, cuánto XP vale
 * ni si el quiz estuvo bien. Ver PLAN §8.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { awardXp, recordMilestoneOnce } from "@/lib/totto-way/award";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { canCompleteLesson, chapterProgress, gradeQuiz, VIDEO_COMPLETION_RATIO, type QuizResult } from "@/lib/totto-way/progress";
import { findAccessibleLesson } from "@/lib/totto-way/queries";
import { NAV_HREF } from "@/lib/totto-way/nav";

export type ActionError = { ok: false; error: string; code?: string };

const IdSchema = z.string().min(1).max(64);

function unauthorized(): ActionError {
  return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar.", code: "UNAUTHORIZED" };
}
function notFound(): ActionError {
  return { ok: false, error: "Esta lección no está disponible.", code: "NOT_FOUND" };
}

/** Marca la lección como iniciada (idempotente). */
export async function startLesson(lessonId: string): Promise<{ ok: true } | ActionError> {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  if (!IdSchema.safeParse(lessonId).success) return notFound();
  const found = await findAccessibleLesson(session, lessonId);
  if (!found) return notFound();

  await prisma.twLessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: {},
    create: { userId: session.user.id, lessonId, status: "IN_PROGRESS", startedAt: new Date() },
  });
  return { ok: true };
}

const VideoSchema = z.object({
  lessonId: IdSchema,
  seconds: z.number().finite().min(0).max(60 * 60 * 12),
  duration: z.number().finite().min(0).max(60 * 60 * 12).nullable(),
});

/**
 * Guarda el avance del video. Se llama cada ~10 s, así que va en una sola
 * sentencia atómica que conserva siempre el máximo visto y nunca degrada el
 * estado de una lección ya completada.
 */
export async function saveVideoProgress(input: {
  lessonId: string;
  seconds: number;
  duration: number | null;
}): Promise<{ ok: true; ratio: number } | ActionError> {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  const parsed = VideoSchema.safeParse(input);
  if (!parsed.success) return notFound();
  const found = await findAccessibleLesson(session, parsed.data.lessonId);
  if (!found) return notFound();

  const seconds = Math.floor(parsed.data.seconds);
  const duration = parsed.data.duration ? Math.floor(parsed.data.duration) : null;

  await prisma.$executeRaw`
    INSERT INTO "tw_lesson_progress"
      ("userId", "lessonId", "status", "startedAt", "videoSeconds", "videoDuration", "xpEarned", "updatedAt")
    VALUES
      (${session.user.id}, ${parsed.data.lessonId}, 'IN_PROGRESS', NOW(), ${seconds}, ${duration}, 0, NOW())
    ON CONFLICT ("userId", "lessonId") DO UPDATE SET
      "videoSeconds" = GREATEST("tw_lesson_progress"."videoSeconds", EXCLUDED."videoSeconds"),
      "videoDuration" = COALESCE(EXCLUDED."videoDuration", "tw_lesson_progress"."videoDuration"),
      "updatedAt" = NOW()
  `;

  const ratio = duration && duration > 0 ? Math.min(1, seconds / duration) : 0;
  return { ok: true, ratio };
}

const QuizSchema = z.object({
  lessonId: IdSchema,
  answers: z.array(z.number().int().min(0).max(9).nullable()).max(20),
});

export type QuizSubmission = {
  ok: true;
  results: QuizResult[];
  score: number;
  total: number;
  perfect: boolean;
  /** XP de bonus efectivamente pagado (0 si ya se había cobrado antes). */
  bonusAwarded: number;
};

/** Corrige el quiz en servidor y paga el bonus una sola vez si es perfecto. */
export async function submitQuiz(input: { lessonId: string; answers: (number | null)[] }): Promise<QuizSubmission | ActionError> {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  const parsed = QuizSchema.safeParse(input);
  if (!parsed.success) return notFound();
  const found = await findAccessibleLesson(session, parsed.data.lessonId);
  if (!found?.lesson.quiz) return notFound();

  const quiz = found.lesson.quiz;
  const { results, score, perfect } = gradeQuiz(quiz.questions, parsed.data.answers);

  const previous = found.progress.get(found.lesson.id)?.quizScore ?? null;
  await prisma.twLessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: found.lesson.id } },
    update: { quizScore: previous === null ? score : Math.max(previous, score) },
    create: { userId: session.user.id, lessonId: found.lesson.id, status: "IN_PROGRESS", startedAt: new Date(), quizScore: score },
  });

  let bonusAwarded = 0;
  if (perfect && quiz.bonusXp > 0) {
    const result = await awardXp({
      franchiseId: session.franchiseId,
      userId: session.user.id,
      storeId: session.scope.homeStoreId,
      source: "QUIZ",
      points: quiz.bonusXp,
      refId: found.lesson.id,
      meta: { lesson: found.lesson.title },
      timeZone: session.employee?.store?.timezone ?? undefined,
    });
    bonusAwarded = result.awarded ? result.points : 0;
  }

  revalidatePath(`${NAV_HREF.learn}/${found.snapshot.slug}/${found.lesson.slug}`);
  return { ok: true, results, score, total: quiz.questions.length, perfect, bonusAwarded };
}

export type CompletionResult = {
  ok: true;
  points: number;
  title: string;
  badges: string[];
  chapterComplete: boolean;
  chapterSlug: string;
};

/** Completa la lección: valida el ≥ 90 % de video, paga el XP y cierra el capítulo si toca. */
export async function completeLesson(lessonId: string): Promise<CompletionResult | ActionError> {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  if (!IdSchema.safeParse(lessonId).success) return notFound();
  const found = await findAccessibleLesson(session, lessonId);
  if (!found) return notFound();

  const { snapshot, lesson, progress } = found;
  const row = progress.get(lesson.id);
  const gate = canCompleteLesson(lesson, row);
  if (!gate.ok) {
    if (gate.reason === "VIDEO_NOT_WATCHED") {
      return {
        ok: false,
        code: "VIDEO_NOT_WATCHED",
        error: `Mira al menos el ${Math.round(VIDEO_COMPLETION_RATIO * 100)} % del video para completar la lección.`,
      };
    }
    return { ok: false, code: "ALREADY_COMPLETED", error: "Ya completaste esta lección." };
  }

  const award = await awardXp({
    franchiseId: session.franchiseId,
    userId: session.user.id,
    storeId: session.scope.homeStoreId,
    source: "LESSON",
    points: lesson.xp,
    refId: lesson.id,
    meta: { lesson: lesson.title, chapter: snapshot.number },
    timeZone: session.employee?.store?.timezone ?? undefined,
  });

  const now = new Date();
  await prisma.twLessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
    // Si el XP ya estaba pagado (reintento), `awarded` es false y `points` 0:
    // no se toca `xpEarned` para no borrar lo que la persona ya había ganado.
    update: { status: "COMPLETED", completedAt: now, xpEarned: award.awarded ? award.points : undefined },
    create: {
      userId: session.user.id,
      lessonId: lesson.id,
      status: "COMPLETED",
      startedAt: now,
      completedAt: now,
      xpEarned: award.points,
    },
  });

  // ¿Se cerró el capítulo con esta lección?
  const after = new Map(progress);
  after.set(lesson.id, {
    lessonId: lesson.id,
    status: "COMPLETED",
    videoSeconds: row?.videoSeconds ?? 0,
    videoDuration: row?.videoDuration ?? null,
    quizScore: row?.quizScore ?? null,
    xpEarned: award.points,
  });
  const stats = chapterProgress(snapshot, after);
  if (stats.complete) {
    await recordMilestoneOnce({
      userId: session.user.id,
      type: "CHAPTER_DONE",
      title: `Capítulo ${String(snapshot.number).padStart(2, "0")} completado`,
      desc: `${snapshot.title} · ${stats.total}/${stats.total} lecciones`,
      icon: "book",
      now,
    });
  }

  revalidatePath(NAV_HREF.home);
  revalidatePath(NAV_HREF.learn);
  revalidatePath(`${NAV_HREF.learn}/${snapshot.slug}`);
  revalidatePath(NAV_HREF.profile);

  return {
    ok: true,
    points: award.awarded ? award.points : lesson.xp,
    title: lesson.title,
    badges: award.badges.map((badge) => badge.code),
    chapterComplete: stats.complete,
    chapterSlug: snapshot.slug,
  };
}
