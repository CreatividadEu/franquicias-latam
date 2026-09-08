/**
 * Lecturas de Totto Way con scope (PLAN §2). Solo server. Toda función
 * recibe la sesión y filtra por franchiseId / tiendas visibles.
 */
import { prisma } from "@/lib/prisma";
import type { TwSession } from "./auth";
import { parseChapterSnapshot, type ChapterSnapshot, type LessonSnapshot } from "./content";
import { badgeFor, currentStreak, nextBadge, badgeProgress } from "./xp";

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

/** Capítulos publicados (snapshot) + borradores visibles como "próximamente". */
export async function getChapterCards(session: TwSession): Promise<{ cards: ChapterCard[]; snapshots: ChapterSnapshot[]; doneLessonIds: Set<string> }> {
  const [chapters, settings, progress] = await Promise.all([
    prisma.twChapter.findMany({
      where: { franchiseId: session.franchiseId },
      orderBy: [{ order: "asc" }, { number: "asc" }],
      select: { id: true, number: true, slug: true, title: true, subtitle: true, color: true, status: true, publishedSnapshot: true },
    }),
    prisma.twSettings.findUnique({ where: { franchiseId: session.franchiseId } }),
    prisma.twLessonProgress.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      select: { lessonId: true },
    }),
  ]);

  const doneLessonIds = new Set(progress.map((p) => p.lessonId));
  const sequential = settings?.sequentialUnlock ?? true;
  const snapshots: ChapterSnapshot[] = [];
  const cards: ChapterCard[] = [];
  let previousComplete = true;

  for (const chapter of chapters) {
    const snapshot = chapter.status === "PUBLISHED" ? parseChapterSnapshot(chapter.publishedSnapshot) : null;
    const lessonsTotal = snapshot?.lessons.length ?? 0;
    const lessonsDone = snapshot ? snapshot.lessons.filter((l) => doneLessonIds.has(l.id)).length : 0;
    const complete = lessonsTotal > 0 && lessonsDone === lessonsTotal;
    const unlocked = !!snapshot && (!sequential || previousComplete);
    cards.push({
      id: chapter.id,
      number: chapter.number,
      slug: chapter.slug,
      title: chapter.title,
      subtitle: chapter.subtitle,
      color: chapter.color,
      status: chapter.status,
      lessonsTotal,
      lessonsDone,
      pct: lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
      unlocked,
    });
    if (snapshot) {
      snapshots.push(snapshot);
      if (sequential) previousComplete = complete;
    }
  }
  return { cards, snapshots, doneLessonIds };
}

export function findCurrentLesson(snapshots: ChapterSnapshot[], cards: ChapterCard[], doneLessonIds: Set<string>): CurrentLesson | null {
  for (const snapshot of snapshots) {
    const card = cards.find((c) => c.id === snapshot.id);
    if (!card?.unlocked) continue;
    const pending: LessonSnapshot[] = snapshot.lessons.filter((l) => !doneLessonIds.has(l.id));
    if (pending.length === 0) continue;
    const lesson = pending[0];
    return {
      chapter: { number: snapshot.number, title: snapshot.title, slug: snapshot.slug },
      lesson: { id: lesson.id, slug: lesson.slug, title: lesson.title, xp: lesson.xp },
      remaining: pending.length,
    };
  }
  return null;
}

export async function getHomeData(session: TwSession, now = new Date()): Promise<HomeData> {
  const { cards, snapshots, doneLessonIds } = await getChapterCards(session);
  const current = findCurrentLesson(snapshots, cards, doneLessonIds);
  const totals = cards.reduce(
    (acc, c) => ({ done: acc.done + c.lessonsDone, total: acc.total + c.lessonsTotal }),
    { done: 0, total: 0 },
  );

  const employee = session.employee;
  const xpTotal = employee?.xpTotal ?? 0;
  const timeZone = employee?.store?.timezone ?? "America/Bogota";
  const streakDays = employee ? currentStreak(employee, now, timeZone) : 0;
  const next = nextBadge(xpTotal);

  const [settings, season, quotes] = await Promise.all([
    prisma.twSettings.findUnique({ where: { franchiseId: session.franchiseId } }),
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

  const country = employee?.store?.country ?? null;
  const leagueEnabled =
    (settings?.showGamification ?? true) &&
    (!settings?.leagueEnabledCountries?.length || !country || settings.leagueEnabledCountries.includes(country));

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
