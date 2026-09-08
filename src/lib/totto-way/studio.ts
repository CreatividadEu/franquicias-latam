/**
 * Consultas del Estudio de contenido y su analítica. A diferencia del resto
 * de la app, aquí se lee el **árbol vivo** (no el snapshot publicado): el
 * Estudio edita lo que todavía no ve el alumno.
 */
import { prisma } from "@/lib/prisma";
import type { TwSession } from "./auth";
import { parseBlocks, parseQuizQuestions, validateForPublish, type QuizQuestion, type TwBlock } from "./content";

export type StudioChapterRow = {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  color: string;
  status: "DRAFT" | "PUBLISHED";
  version: number;
  publishedAt: Date | null;
  lessons: number;
  missions: number;
  /** Problemas que impiden publicar; vacío = listo. */
  issues: string[];
  /** Hay cambios posteriores a la última publicación. */
  dirty: boolean;
};

export async function getStudioChapters(session: TwSession): Promise<StudioChapterRow[]> {
  const chapters = await prisma.twChapter.findMany({
    where: { franchiseId: session.franchiseId },
    orderBy: [{ order: "asc" }, { number: "asc" }],
    include: { missions: true, lessons: { include: { quiz: true } }, checkpoints: true },
  });

  return chapters.map((chapter) => {
    const tree = { ...chapter, lessons: chapter.lessons.map((lesson) => ({ ...lesson, videoSrc: null })) };
    const lastEdit = chapter.lessons.reduce<Date>((acc, lesson) => (lesson.updatedAt > acc ? lesson.updatedAt : acc), chapter.updatedAt);
    return {
      id: chapter.id,
      number: chapter.number,
      slug: chapter.slug,
      title: chapter.title,
      subtitle: chapter.subtitle,
      color: chapter.color,
      status: chapter.status,
      version: chapter.version,
      publishedAt: chapter.publishedAt,
      lessons: chapter.lessons.length,
      missions: chapter.missions.length,
      issues: validateForPublish(tree).map((issue) => `${issue.path}: ${issue.message}`),
      dirty: !!chapter.publishedAt && lastEdit > chapter.publishedAt,
    };
  });
}

export type StudioLessonRow = {
  id: string;
  slug: string;
  title: string;
  type: "READING" | "VIDEO" | "CHECKLIST" | "CHECKPOINT";
  minutes: number;
  xp: number;
  order: number;
  missionId: string;
  blocks: number;
  hasQuiz: boolean;
};

export type StudioChapterView = {
  chapter: StudioChapterRow;
  missions: { id: string; code: string; title: string; order: number; lessons: StudioLessonRow[] }[];
  checkpoint: { id: string; title: string; instructions: string; xp: number } | null;
};

export async function getStudioChapter(session: TwSession, slug: string): Promise<StudioChapterView | null> {
  const chapters = await getStudioChapters(session);
  const row = chapters.find((chapter) => chapter.slug === slug);
  if (!row) return null;

  const [missions, lessons, checkpoint] = await Promise.all([
    prisma.twMission.findMany({ where: { chapterId: row.id }, orderBy: { order: "asc" } }),
    prisma.twLesson.findMany({ where: { chapterId: row.id }, orderBy: { order: "asc" }, include: { quiz: true } }),
    prisma.twCheckpoint.findFirst({ where: { chapterId: row.id } }),
  ]);

  const toRow = (lesson: (typeof lessons)[number]): StudioLessonRow => ({
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    type: lesson.type,
    minutes: lesson.minutes,
    xp: lesson.xp,
    order: lesson.order,
    missionId: lesson.missionId,
    blocks: parseBlocks(lesson.blocks).length,
    hasQuiz: !!lesson.quiz,
  });

  return {
    chapter: row,
    missions: missions.map((mission) => ({
      id: mission.id,
      code: mission.code,
      title: mission.title,
      order: mission.order,
      lessons: lessons.filter((lesson) => lesson.missionId === mission.id).map(toRow),
    })),
    checkpoint: checkpoint
      ? { id: checkpoint.id, title: checkpoint.title, instructions: checkpoint.instructions, xp: checkpoint.xp }
      : null,
  };
}

export type StudioLessonView = {
  chapter: { id: string; slug: string; number: number; title: string };
  missions: { id: string; code: string; title: string }[];
  lesson: {
    id: string;
    slug: string;
    title: string;
    type: "READING" | "VIDEO" | "CHECKLIST" | "CHECKPOINT";
    minutes: number;
    xp: number;
    missionId: string;
    keyTakeaway: string;
    ruleBanner: string | null;
    posterUrl: string | null;
    docRefs: string[];
    blocks: TwBlock[];
    quiz: { questions: QuizQuestion[]; bonusXp: number } | null;
  };
};

export async function getStudioLesson(session: TwSession, chapterSlug: string, lessonSlug: string): Promise<StudioLessonView | null> {
  const lesson = await prisma.twLesson.findFirst({
    where: { slug: lessonSlug, chapter: { slug: chapterSlug, franchiseId: session.franchiseId } },
    include: { quiz: true, chapter: { select: { id: true, slug: true, number: true, title: true } } },
  });
  if (!lesson) return null;

  const missions = await prisma.twMission.findMany({
    where: { chapterId: lesson.chapter.id },
    orderBy: { order: "asc" },
    select: { id: true, code: true, title: true },
  });

  return {
    chapter: lesson.chapter,
    missions,
    lesson: {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      type: lesson.type,
      minutes: lesson.minutes,
      xp: lesson.xp,
      missionId: lesson.missionId,
      keyTakeaway: lesson.keyTakeaway,
      ruleBanner: lesson.ruleBanner,
      posterUrl: lesson.posterUrl,
      docRefs: lesson.docRefs,
      blocks: parseBlocks(lesson.blocks),
      quiz: lesson.quiz ? { questions: parseQuizQuestions(lesson.quiz.questions), bonusXp: lesson.quiz.bonusXp } : null,
    },
  };
}

// ── Analítica ──────────────────────────────────────────────────────────────

export type LessonAnalytics = {
  lessonId: string;
  chapter: number;
  title: string;
  started: number;
  completed: number;
  completionPct: number;
  /** Promedio de aciertos del quiz sobre el total de preguntas. */
  quizAverage: number | null;
  quizAttempts: number;
};

export type StudioAnalytics = {
  learners: number;
  lessons: LessonAnalytics[];
  questions: { question: string; sample: string; count: number; lastAskedAt: Date }[];
  kbChunks: number;
};

export async function getStudioAnalytics(session: TwSession): Promise<StudioAnalytics> {
  const [learners, lessons, progress, questions, kbChunks] = await Promise.all([
    prisma.twEmployee.count({ where: { franchiseId: session.franchiseId, storeId: { not: null } } }),
    prisma.twLesson.findMany({
      where: { chapter: { franchiseId: session.franchiseId, status: "PUBLISHED" } },
      orderBy: [{ chapter: { number: "asc" } }, { order: "asc" }],
      select: { id: true, title: true, chapter: { select: { number: true } }, quiz: { select: { passScore: true } } },
    }),
    prisma.twLessonProgress.findMany({
      select: { lessonId: true, status: true, quizScore: true },
    }),
    prisma.twAssistantQuestionStat.findMany({
      where: { franchiseId: session.franchiseId },
      orderBy: [{ count: "desc" }, { lastAskedAt: "desc" }],
      take: 12,
    }),
    prisma.twKnowledgeChunk.count({ where: { franchiseId: session.franchiseId } }),
  ]);

  const byLesson = new Map<string, { started: number; completed: number; scores: number[] }>();
  for (const row of progress) {
    const entry = byLesson.get(row.lessonId) ?? { started: 0, completed: 0, scores: [] };
    entry.started += 1;
    if (row.status === "COMPLETED") entry.completed += 1;
    if (row.quizScore !== null) entry.scores.push(row.quizScore);
    byLesson.set(row.lessonId, entry);
  }

  return {
    learners,
    kbChunks,
    lessons: lessons.map((lesson) => {
      const entry = byLesson.get(lesson.id) ?? { started: 0, completed: 0, scores: [] };
      const total = lesson.quiz?.passScore ?? 0;
      const average = entry.scores.length > 0 ? entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length : null;
      return {
        lessonId: lesson.id,
        chapter: lesson.chapter.number,
        title: lesson.title,
        started: entry.started,
        completed: entry.completed,
        completionPct: learners > 0 ? Math.round((entry.completed / learners) * 100) : 0,
        quizAverage: average !== null && total > 0 ? Math.round((average / total) * 100) : null,
        quizAttempts: entry.scores.length,
      };
    }),
    questions: questions.map((row) => ({
      question: row.normalizedQuestion,
      sample: row.sample,
      count: row.count,
      lastAskedAt: row.lastAskedAt,
    })),
  };
}
