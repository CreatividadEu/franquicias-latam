/**
 * Lecturas de Totto Way con scope (PLAN §2). Solo server. El alumno siempre
 * lee del `publishedSnapshot` congelado del capítulo, nunca del árbol vivo
 * que edita el Estudio.
 */
import { prisma } from "@/lib/prisma";
import type { TwSession } from "./auth";
import { parseChapterSnapshot, type ChapterSnapshot, type LessonSnapshot } from "./content";
import {
  chapterProgress,
  lessonNeighbours,
  lessonsByMission,
  toProgressMap,
  unlockedChapters,
  videoRatio,
  type ProgressMap,
  type ProgressRow,
} from "./progress";
import { badgeFor, badgeProgress, currentStreak, nextBadge } from "./xp";

export type ChapterCard = {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  color: string;
  status: "DRAFT" | "PUBLISHED";
  lessonsTotal: number;
  lessonsDone: number;
  pct: number;
  unlocked: boolean;
};

export type CurrentLesson = {
  chapter: { number: number; title: string; slug: string };
  lesson: { id: string; slug: string; title: string; xp: number };
  remaining: number;
};

export type HomeData = {
  chapters: ChapterCard[];
  current: CurrentLesson | null;
  overallPct: number;
  xpTotal: number;
  streakDays: number;
  badge: { code: string; progress: number };
  nextBadge: { code: string; remaining: number } | null;
  league: { position: number | null; enabled: boolean };
  quote: { text: string; who: string; title: string } | null;
  team: { userId: string; name: string; initials: string; points: number; me: boolean }[];
};

function initials(name: string | null | undefined, fallback = "TW"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

async function loadProgress(userId: string): Promise<ProgressMap> {
  const rows = await prisma.twLessonProgress.findMany({
    where: { userId },
    select: { lessonId: true, status: true, videoSeconds: true, videoDuration: true, quizScore: true, xpEarned: true },
  });
  return toProgressMap(rows as ProgressRow[]);
}

/** ¿La Liga y el XP están activos para este usuario (feature flag + país)? */
export async function isGamificationOn(session: TwSession): Promise<boolean> {
  const settings = await prisma.twSettings.findUnique({ where: { franchiseId: session.franchiseId } });
  const country = session.employee?.store?.country ?? null;
  return (
    (settings?.showGamification ?? true) &&
    (!settings?.leagueEnabledCountries?.length || !country || settings.leagueEnabledCountries.includes(country))
  );
}

/** Capítulos publicados (snapshot) + borradores visibles como "próximamente". */
export async function getChapterCards(
  session: TwSession,
): Promise<{ cards: ChapterCard[]; snapshots: ChapterSnapshot[]; progress: ProgressMap }> {
  const [chapters, settings, progress] = await Promise.all([
    prisma.twChapter.findMany({
      where: { franchiseId: session.franchiseId },
      orderBy: [{ order: "asc" }, { number: "asc" }],
      select: { id: true, number: true, slug: true, title: true, subtitle: true, color: true, status: true, publishedSnapshot: true },
    }),
    prisma.twSettings.findUnique({ where: { franchiseId: session.franchiseId } }),
    loadProgress(session.user.id),
  ]);

  const sequential = settings?.sequentialUnlock ?? true;
  const snapshots: ChapterSnapshot[] = [];
  for (const chapter of chapters) {
    if (chapter.status !== "PUBLISHED") continue;
    const snapshot = parseChapterSnapshot(chapter.publishedSnapshot);
    if (snapshot) snapshots.push(snapshot);
  }
  const unlocked = unlockedChapters(snapshots, progress, sequential);

  const cards: ChapterCard[] = chapters.map((chapter) => {
    const snapshot = snapshots.find((s) => s.id === chapter.id);
    const stats = snapshot ? chapterProgress(snapshot, progress) : { total: 0, done: 0, pct: 0 };
    return {
      id: chapter.id,
      number: chapter.number,
      slug: chapter.slug,
      title: chapter.title,
      subtitle: chapter.subtitle,
      color: chapter.color,
      status: chapter.status,
      lessonsTotal: stats.total,
      lessonsDone: stats.done,
      pct: stats.pct,
      unlocked: !!snapshot && (unlocked.get(chapter.id) ?? false),
    };
  });

  return { cards, snapshots, progress };
}

export function findCurrentLesson(snapshots: ChapterSnapshot[], cards: ChapterCard[], progress: ProgressMap): CurrentLesson | null {
  for (const snapshot of snapshots) {
    const card = cards.find((c) => c.id === snapshot.id);
    if (!card?.unlocked) continue;
    const stats = chapterProgress(snapshot, progress);
    if (!stats.nextLesson) continue;
    return {
      chapter: { number: snapshot.number, title: snapshot.title, slug: snapshot.slug },
      lesson: { id: stats.nextLesson.id, slug: stats.nextLesson.slug, title: stats.nextLesson.title, xp: stats.nextLesson.xp },
      remaining: stats.total - stats.done,
    };
  }
  return null;
}

export async function getHomeData(session: TwSession, now = new Date()): Promise<HomeData> {
  const { cards, snapshots, progress } = await getChapterCards(session);
  const current = findCurrentLesson(snapshots, cards, progress);
  const totals = cards.reduce(
    (acc, c) => ({ done: acc.done + c.lessonsDone, total: acc.total + c.lessonsTotal }),
    { done: 0, total: 0 },
  );

  const employee = session.employee;
  const xpTotal = employee?.xpTotal ?? 0;
  const timeZone = employee?.store?.timezone ?? "America/Bogota";
  const streakDays = employee ? currentStreak(employee, now, timeZone) : 0;
  const next = nextBadge(xpTotal);

  const [leagueEnabled, season, quotes] = await Promise.all([
    isGamificationOn(session),
    prisma.twLeagueSeason.findFirst({
      where: { franchiseId: session.franchiseId, status: "ACTIVE" },
      orderBy: { startsAt: "desc" },
      select: { id: true },
    }),
    prisma.twInspireItem.findMany({
      where: { franchiseId: session.franchiseId, quote: { not: null }, publishedAt: { lte: now } },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      select: { quote: true, who: true, title: true },
    }),
  ]);

  let position: number | null = null;
  let team: HomeData["team"] = [];
  const homeStoreId = session.scope.homeStoreId;

  if (season && leagueEnabled && homeStoreId) {
    const [storeScore, teammates] = await Promise.all([
      prisma.twLeagueScore.findUnique({
        where: { seasonId_entityType_entityId: { seasonId: season.id, entityType: "STORE", entityId: homeStoreId } },
        select: { position: true },
      }),
      prisma.twEmployee.findMany({
        where: { storeId: homeStoreId, franchiseId: session.franchiseId },
        select: { userId: true, user: { select: { name: true } } },
      }),
    ]);
    position = storeScore?.position ?? null;
    const userIds = teammates.map((t) => t.userId);
    if (userIds.length > 0) {
      const scores = await prisma.twLeagueScore.findMany({
        where: { seasonId: season.id, entityType: "USER", entityId: { in: userIds } },
        orderBy: { points: "desc" },
        take: 4,
      });
      team = scores.map((s) => {
        const mate = teammates.find((t) => t.userId === s.entityId);
        return {
          userId: s.entityId,
          name: mate?.user.name ?? "—",
          initials: initials(mate?.user.name),
          points: s.points,
          me: s.entityId === session.user.id,
        };
      });
    }
  }

  // Frase del día: rotación determinista por día del año.
  const dayOfYear = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86_400_000);
  const picked = quotes.length > 0 ? quotes[dayOfYear % quotes.length] : null;

  return {
    chapters: cards,
    current,
    quote: picked?.quote ? { text: picked.quote, who: picked.who, title: picked.title } : null,
    overallPct: totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0,
    xpTotal,
    streakDays,
    badge: { code: badgeFor(xpTotal).code, progress: badgeProgress(xpTotal) },
    nextBadge: next ? { code: next.code, remaining: next.remaining } : null,
    league: { position, enabled: leagueEnabled },
    team,
  };
}

// ── Capítulo ───────────────────────────────────────────────────────────────

export type ChapterLessonRow = {
  id: string;
  slug: string;
  title: string;
  type: LessonSnapshot["type"];
  minutes: number;
  xp: number;
  missionCode: string;
  done: boolean;
  started: boolean;
};

export type ChapterView = {
  snapshot: ChapterSnapshot;
  unlocked: boolean;
  progress: { total: number; done: number; pct: number; complete: boolean };
  nextLessonSlug: string | null;
  missions: { code: string; title: string; lessons: ChapterLessonRow[] }[];
  checkpoint: { id: string; title: string; instructions: string; xp: number; validated: boolean } | null;
  manualUrl: string | null;
};

export async function getChapterView(session: TwSession, slug: string): Promise<ChapterView | null> {
  const { cards, snapshots, progress } = await getChapterCards(session);
  const card = cards.find((c) => c.slug === slug);
  const snapshot = snapshots.find((s) => s.slug === slug);
  if (!card || !snapshot) return null;

  const stats = chapterProgress(snapshot, progress);
  const row = (lesson: LessonSnapshot): ChapterLessonRow => {
    const entry = progress.get(lesson.id);
    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      type: lesson.type,
      minutes: lesson.minutes,
      xp: lesson.xp,
      missionCode: lesson.missionCode,
      done: entry?.status === "COMPLETED",
      started: entry?.status === "IN_PROGRESS",
    };
  };

  const snapshotCheckpoint = snapshot.checkpoints[0] ?? null;
  let checkpoint: ChapterView["checkpoint"] = null;
  if (snapshotCheckpoint) {
    const validation = await prisma.twCheckpointValidation.findUnique({
      where: { checkpointId_userId: { checkpointId: snapshotCheckpoint.id, userId: session.user.id } },
      select: { validatedAt: true },
    });
    checkpoint = {
      id: snapshotCheckpoint.id,
      title: snapshotCheckpoint.title,
      instructions: snapshotCheckpoint.instructions,
      xp: snapshotCheckpoint.xp,
      validated: !!validation,
    };
  }

  const manual = await prisma.twMediaAsset.findFirst({
    where: { franchiseId: session.franchiseId, kind: "PDF", meta: { path: ["chapterSlug"], equals: slug } },
    select: { storagePath: true },
  });

  return {
    snapshot,
    unlocked: card.unlocked,
    progress: { total: stats.total, done: stats.done, pct: stats.pct, complete: stats.complete },
    nextLessonSlug: stats.nextLesson?.slug ?? null,
    missions: lessonsByMission(snapshot).map((mission) => ({ ...mission, lessons: mission.lessons.map(row) })),
    checkpoint,
    manualUrl: manual?.storagePath ?? null,
  };
}

// ── Lección ────────────────────────────────────────────────────────────────

export type LessonView = {
  chapter: { number: number; slug: string; title: string; color: string };
  lesson: LessonSnapshot;
  progress: ProgressRow | null;
  videoRatio: number;
  quizScore: number | null;
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  position: { index: number; total: number };
};

export async function getLessonView(session: TwSession, chapterSlug: string, lessonSlug: string): Promise<LessonView | null> {
  const { cards, snapshots, progress } = await getChapterCards(session);
  const card = cards.find((c) => c.slug === chapterSlug);
  const snapshot = snapshots.find((s) => s.slug === chapterSlug);
  if (!card || !snapshot || !card.unlocked) return null;

  const index = snapshot.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index < 0) return null;
  const lesson = snapshot.lessons[index];
  const row = progress.get(lesson.id) ?? null;
  const { previous, next } = lessonNeighbours(snapshot, lesson.id);

  return {
    chapter: { number: snapshot.number, slug: snapshot.slug, title: snapshot.title, color: snapshot.color },
    lesson,
    progress: row,
    videoRatio: videoRatio(row ?? undefined),
    quizScore: row?.quizScore ?? null,
    previous: previous ? { slug: previous.slug, title: previous.title } : null,
    next: next ? { slug: next.slug, title: next.title } : null,
    position: { index: index + 1, total: snapshot.lessons.length },
  };
}

/**
 * Busca una lección por id dentro de los capítulos publicados y desbloqueados
 * del usuario. Es la puerta de entrada de las server actions: si devuelve null,
 * el usuario no tiene derecho a tocar esa lección.
 */
export async function findAccessibleLesson(
  session: TwSession,
  lessonId: string,
): Promise<{ snapshot: ChapterSnapshot; lesson: LessonSnapshot; progress: ProgressMap } | null> {
  const { cards, snapshots, progress } = await getChapterCards(session);
  for (const snapshot of snapshots) {
    const lesson = snapshot.lessons.find((l) => l.id === lessonId);
    if (!lesson) continue;
    const card = cards.find((c) => c.id === snapshot.id);
    if (!card?.unlocked) return null;
    return { snapshot, lesson, progress };
  }
  return null;
}

// ── Perfil ─────────────────────────────────────────────────────────────────

export type ProfileView = {
  xpTotal: number;
  streakDays: number;
  badge: { code: string; name: string; icon: string };
  nextBadge: { code: string; name: string; remaining: number } | null;
  badgeProgress: number;
  badges: { code: string; name: string; icon: string; earnedAt: Date | null; minXp: number }[];
  certificates: { chapter: string; number: number; complete: boolean; pct: number }[];
  prefs: { locale: string; dailyReminder: boolean; leagueAlerts: boolean };
  gamification: boolean;
};

export async function getProfileView(session: TwSession, now = new Date()): Promise<ProfileView> {
  const [{ cards, snapshots, progress }, allBadges, earned, gamification] = await Promise.all([
    getChapterCards(session),
    prisma.twBadge.findMany({ where: { franchiseId: session.franchiseId }, orderBy: { minXp: "asc" } }),
    prisma.twUserBadge.findMany({ where: { userId: session.user.id }, select: { badgeId: true, earnedAt: true } }),
    isGamificationOn(session),
  ]);

  const employee = session.employee;
  const xpTotal = employee?.xpTotal ?? 0;
  const current = badgeFor(xpTotal);
  const next = nextBadge(xpTotal);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));
  const prefs = (employee?.prefs ?? {}) as Record<string, unknown>;

  return {
    xpTotal,
    streakDays: employee ? currentStreak(employee, now, employee.store?.timezone ?? "America/Bogota") : 0,
    badge: {
      code: current.code,
      name: allBadges.find((b) => b.code === current.code)?.name ?? current.code,
      icon: current.icon,
    },
    nextBadge: next
      ? { code: next.code, name: allBadges.find((b) => b.code === next.code)?.name ?? next.code, remaining: next.remaining }
      : null,
    badgeProgress: badgeProgress(xpTotal),
    badges: allBadges.map((badge) => ({
      code: badge.code,
      name: badge.name,
      icon: badge.icon,
      minXp: badge.minXp,
      earnedAt: earnedMap.get(badge.id) ?? null,
    })),
    certificates: cards
      .filter((card) => card.status === "PUBLISHED")
      .map((card) => {
        const snapshot = snapshots.find((s) => s.id === card.id);
        const stats = snapshot ? chapterProgress(snapshot, progress) : null;
        return { chapter: card.title, number: card.number, complete: stats?.complete ?? false, pct: card.pct };
      }),
    prefs: {
      locale: employee?.locale ?? "es",
      dailyReminder: prefs.dailyReminder !== false,
      leagueAlerts: prefs.leagueAlerts !== false,
    },
    gamification,
  };
}
