/**
 * Reglas de progreso (PLAN §8). Puras y testeables: el servidor las aplica
 * antes de escribir; el cliente solo las usa para pintar estados.
 */
import type { TwProgressStatus } from "@prisma/client";
import type { ChapterSnapshot, LessonSnapshot } from "./content";

/** Porción de video que hay que ver para poder completar una lección. */
export const VIDEO_COMPLETION_RATIO = 0.9;

export type ProgressRow = {
  lessonId: string;
  status: TwProgressStatus;
  videoSeconds: number;
  videoDuration: number | null;
  quizScore: number | null;
  xpEarned: number;
};

export type ProgressMap = Map<string, ProgressRow>;

export function toProgressMap(rows: readonly ProgressRow[]): ProgressMap {
  return new Map(rows.map((row) => [row.lessonId, row]));
}

export function isLessonDone(progress: ProgressMap, lessonId: string): boolean {
  return progress.get(lessonId)?.status === "COMPLETED";
}

/** Fracción vista de un video (0–1). Sin duración conocida, 0. */
export function videoRatio(row: Pick<ProgressRow, "videoSeconds" | "videoDuration"> | undefined): number {
  if (!row?.videoDuration || row.videoDuration <= 0) return 0;
  return Math.min(1, Math.max(0, row.videoSeconds / row.videoDuration));
}

/**
 * Video de una lección: el del snapshot o el del bloque `video`. Devuelve
 * src null cuando el paso a paso todavía se está grabando y la lección solo
 * muestra el screenshot del manual como poster.
 */
export function lessonVideo(lesson: Pick<LessonSnapshot, "videoSrc" | "blocks" | "posterUrl">): {
  src: string | null;
  poster: string | null;
  markers: { sec: number; label: string }[];
} {
  const block = lesson.blocks.find((b) => b.type === "video");
  const fromBlock = block?.type === "video" ? block : null;
  return {
    src: lesson.videoSrc ?? fromBlock?.src ?? null,
    poster: lesson.posterUrl ?? fromBlock?.poster ?? null,
    markers: fromBlock?.markers ?? [],
  };
}

export type CompletionBlock = "VIDEO_NOT_WATCHED" | "ALREADY_COMPLETED";

/**
 * ¿Puede completarse la lección? Las de video exigen ≥ 90 % visto, pero solo
 * cuando ya existe el archivo: si el paso a paso aún se está grabando, exigirlo
 * dejaría el capítulo imposible de terminar. El quiz nunca bloquea (su
 * incentivo es el bonus).
 */
export function canCompleteLesson(
  lesson: Pick<LessonSnapshot, "type" | "videoSrc" | "blocks" | "posterUrl">,
  row: ProgressRow | undefined,
): { ok: true } | { ok: false; reason: CompletionBlock; ratio: number } {
  const ratio = videoRatio(row);
  if (row?.status === "COMPLETED") return { ok: false, reason: "ALREADY_COMPLETED", ratio };
  const gated = lesson.type === "VIDEO" && !!lessonVideo(lesson).src;
  if (gated && ratio < VIDEO_COMPLETION_RATIO) {
    return { ok: false, reason: "VIDEO_NOT_WATCHED", ratio };
  }
  return { ok: true };
}

export type ChapterProgress = {
  total: number;
  done: number;
  pct: number;
  complete: boolean;
  /** Primera lección sin completar; null si el capítulo está terminado. */
  nextLesson: LessonSnapshot | null;
};

export function chapterProgress(snapshot: ChapterSnapshot, progress: ProgressMap): ChapterProgress {
  const total = snapshot.lessons.length;
  const done = snapshot.lessons.filter((lesson) => isLessonDone(progress, lesson.id)).length;
  const nextLesson = snapshot.lessons.find((lesson) => !isLessonDone(progress, lesson.id)) ?? null;
  return {
    total,
    done,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
    complete: total > 0 && done === total,
    nextLesson,
  };
}

/**
 * Desbloqueo secuencial: el capítulo N está disponible si el anterior
 * publicado está completo. Devuelve un mapa chapterId → desbloqueado.
 */
export function unlockedChapters(
  snapshots: readonly ChapterSnapshot[],
  progress: ProgressMap,
  sequential: boolean,
): Map<string, boolean> {
  const result = new Map<string, boolean>();
  let previousComplete = true;
  for (const snapshot of snapshots) {
    const unlocked = !sequential || previousComplete;
    result.set(snapshot.id, unlocked);
    if (sequential) previousComplete = chapterProgress(snapshot, progress).complete;
  }
  return result;
}

/** Lecciones ordenadas de una misión (para las pestañas M01–M08). */
export function lessonsByMission(snapshot: ChapterSnapshot): { code: string; title: string; lessons: LessonSnapshot[] }[] {
  return snapshot.missions.map((mission) => ({
    code: mission.code,
    title: mission.title,
    lessons: mission.lessonIds
      .map((id) => snapshot.lessons.find((lesson) => lesson.id === id))
      .filter((lesson): lesson is LessonSnapshot => !!lesson),
  }));
}

/** Lección anterior y siguiente dentro del capítulo. */
export function lessonNeighbours(snapshot: ChapterSnapshot, lessonId: string) {
  const index = snapshot.lessons.findIndex((lesson) => lesson.id === lessonId);
  return {
    previous: index > 0 ? snapshot.lessons[index - 1] : null,
    next: index >= 0 && index < snapshot.lessons.length - 1 ? snapshot.lessons[index + 1] : null,
  };
}

export type QuizResult = {
  index: number;
  chosen: number | null;
  correctIndex: number;
  correct: boolean;
  explanation: string | null;
};

/** Corrige un intento contra el snapshot. El cliente nunca decide el resultado. */
export function gradeQuiz(
  questions: readonly { options: string[]; correctIndex: number; explanation?: string }[],
  answers: readonly (number | null)[],
): { results: QuizResult[]; score: number; perfect: boolean } {
  const results = questions.map((question, index) => {
    const chosen = answers[index] ?? null;
    return {
      index,
      chosen,
      correctIndex: question.correctIndex,
      correct: chosen === question.correctIndex,
      explanation: question.explanation ?? null,
    };
  });
  const score = results.filter((result) => result.correct).length;
  return { results, score, perfect: questions.length > 0 && score === questions.length };
}
