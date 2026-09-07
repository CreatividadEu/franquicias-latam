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
import { badgeFor, badgeProgress, currentStreak, dayKey, nextBadge } from "./xp";
import { positionDelta, seasonCountdown, type Countdown } from "./league";
import { buildTimeline, careerProgress, type CareerProgress, type TimelineItem } from "./journey";
import { daysSince, teamKpis, type TeamKpis, type TeamMemberRow } from "./leader";
import { employeeWhere, storeWhere } from "./scope";

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


// ── Liga ───────────────────────────────────────────────────────────────────

export type LeagueRow = {
  entityId: string;
  position: number;
  delta: number | null;
  points: number;
  name: string;
  /** Ciudad (tiendas) o tienda/rol (personas). */
  place: string | null;
  /** Personas de la tienda; null en la vista individual (la pluraliza la vista). */
  members: number | null;
  me: boolean;
};

export type LeagueView = {
  enabled: boolean;
  season: { id: string; name: string; prizeText: string; endsAt: Date; countdown: Countdown } | null;
  seasons: { id: string; name: string; status: string }[];
  stores: LeagueRow[];
  people: LeagueRow[];
  /** Posición global de la tienda propia cuando el franquiciado solo ve las suyas. */
  globalPosition: number | null;
  scoped: boolean;
};

export async function getLeagueView(session: TwSession, seasonId?: string, now = new Date()): Promise<LeagueView> {
  const enabled = await isGamificationOn(session);
  const seasons = await prisma.twLeagueSeason.findMany({
    where: { franchiseId: session.franchiseId },
    orderBy: { startsAt: "desc" },
    select: { id: true, name: true, status: true, prizeText: true, endsAt: true },
  });
  const season = seasonId
    ? seasons.find((s) => s.id === seasonId)
    : (seasons.find((s) => s.status === "ACTIVE") ?? seasons[0]);

  if (!enabled || !season) {
    return { enabled, season: null, seasons, stores: [], people: [], globalPosition: null, scoped: false };
  }

  const [scores, stores, employees] = await Promise.all([
    prisma.twLeagueScore.findMany({ where: { seasonId: season.id }, orderBy: { position: "asc" } }),
    prisma.twStore.findMany({
      where: { franchiseId: session.franchiseId },
      select: { id: true, name: true, city: true, _count: { select: { employees: true } } },
    }),
    prisma.twEmployee.findMany({
      where: { franchiseId: session.franchiseId },
      select: { userId: true, roleTitle: true, storeId: true, user: { select: { name: true } }, store: { select: { name: true } } },
    }),
  ]);

  // La Liga es una competencia entre todas las tiendas: asesores, líderes y
  // jefes ven el ranking completo. Solo el franquiciado, que compite con
  // marcas ajenas en la misma tabla, ve recortadas sus tiendas y conserva su
  // posición global (PLAN §4.4).
  const restricted = session.user.role === "FRANCHISE_OWNER" && session.scope.storeIds !== "all";
  const visibleStores = restricted ? new Set(session.scope.storeIds as string[]) : null;
  const storeById = new Map(stores.map((store) => [store.id, store]));
  const employeeByUser = new Map(employees.map((employee) => [employee.userId, employee]));

  const storeRows: LeagueRow[] = scores
    .filter((score) => score.entityType === "STORE")
    .map((score) => {
      const store = storeById.get(score.entityId);
      return {
        entityId: score.entityId,
        position: score.position,
        delta: positionDelta(score.position, score.prevPosition),
        points: score.points,
        name: store?.name ?? "—",
        place: store?.city ?? null,
        members: store?._count.employees ?? null,
        me: score.entityId === session.scope.homeStoreId,
      };
    });

  const peopleRows: LeagueRow[] = scores
    .filter((score) => score.entityType === "USER")
    .map((score) => {
      const employee = employeeByUser.get(score.entityId);
      return {
        entityId: score.entityId,
        position: score.position,
        delta: positionDelta(score.position, score.prevPosition),
        points: score.points,
        name: employee?.user.name ?? "—",
        place: employee?.store?.name ?? employee?.roleTitle ?? null,
        members: null,
        me: score.entityId === session.user.id,
      };
    });

  // El franquiciado solo ve sus tiendas, pero conserva su posición global.
  const globalPosition = storeRows.find((row) => row.me)?.position ?? null;
  const scopedStores = visibleStores ? storeRows.filter((row) => visibleStores.has(row.entityId)) : storeRows;
  const scopedPeople = visibleStores
    ? peopleRows.filter((row) => {
        const storeId = employeeByUser.get(row.entityId)?.storeId;
        return storeId ? visibleStores.has(storeId) : row.me;
      })
    : peopleRows;

  return {
    enabled,
    season: {
      id: season.id,
      name: season.name,
      prizeText: season.prizeText,
      endsAt: season.endsAt,
      countdown: seasonCountdown(season.endsAt, now),
    },
    seasons,
    stores: scopedStores,
    people: scopedPeople,
    globalPosition: visibleStores ? globalPosition : null,
    scoped: !!visibleStores,
  };
}

// ── Mi viaje ───────────────────────────────────────────────────────────────

export type JourneyView = {
  timeline: TimelineItem[];
  career: CareerProgress[];
  badge: { code: string; name: string; icon: string };
  nextBadge: { code: string; name: string; remaining: number } | null;
  badgeProgress: number;
  xpTotal: number;
  gamification: boolean;
};

export async function getJourneyView(session: TwSession, now = new Date()): Promise<JourneyView> {
  const [milestones, { cards, snapshots, progress }, badges, gamification] = await Promise.all([
    prisma.twJourneyMilestone.findMany({ where: { userId: session.user.id }, orderBy: { date: "asc" } }),
    getChapterCards(session),
    prisma.twBadge.findMany({ where: { franchiseId: session.franchiseId }, orderBy: { minXp: "asc" } }),
    isGamificationOn(session),
  ]);

  const completedChapters = cards
    .filter((card) => {
      const snapshot = snapshots.find((s) => s.id === card.id);
      return snapshot ? chapterProgress(snapshot, progress).complete : false;
    })
    .map((card) => card.number);

  const xpTotal = session.employee?.xpTotal ?? 0;
  const current = badgeFor(xpTotal);
  const next = nextBadge(xpTotal);

  return {
    timeline: buildTimeline(milestones, now),
    career: careerProgress(completedChapters, session.user.role),
    badge: { code: current.code, name: badges.find((b) => b.code === current.code)?.name ?? current.code, icon: current.icon },
    nextBadge: next
      ? { code: next.code, name: badges.find((b) => b.code === next.code)?.name ?? next.code, remaining: next.remaining }
      : null,
    badgeProgress: badgeProgress(xpTotal),
    xpTotal,
    gamification,
  };
}

// ── Panel líder ────────────────────────────────────────────────────────────

export type LeaderView = {
  kpis: TeamKpis;
  rows: TeamMemberRow[];
  stores: { id: string; name: string }[];
  storeFilter: string | null;
  leaguePosition: number | null;
  canFilter: boolean;
};

export async function getLeaderView(session: TwSession, storeFilter?: string | null, now = new Date()): Promise<LeaderView> {
  const where = employeeWhere(session.scope);
  const scopedWhere = storeFilter ? { ...where, storeId: { in: [storeFilter] } } : where;

  const [employees, stores, { snapshots }, season] = await Promise.all([
    prisma.twEmployee.findMany({
      where: scopedWhere,
      select: {
        userId: true,
        roleTitle: true,
        lastActivityAt: true,
        user: { select: { name: true, role: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { employeeCode: "asc" },
    }),
    prisma.twStore.findMany({ where: storeWhere(session.scope), select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getChapterCards(session),
    prisma.twLeagueSeason.findFirst({
      where: { franchiseId: session.franchiseId, status: "ACTIVE" },
      orderBy: { startsAt: "desc" },
      select: { id: true },
    }),
  ]);

  const userIds = employees.map((employee) => employee.userId);
  const [progressRows, validations, scores] = await Promise.all([
    prisma.twLessonProgress.findMany({
      where: { userId: { in: userIds }, status: "COMPLETED" },
      select: { userId: true, lessonId: true },
    }),
    prisma.twCheckpointValidation.findMany({ where: { userId: { in: userIds } }, select: { userId: true, checkpointId: true } }),
    season
      ? prisma.twLeagueScore.findMany({ where: { seasonId: season.id, entityType: "USER", entityId: { in: userIds } } })
      : Promise.resolve([]),
  ]);

  const doneByUser = new Map<string, Set<string>>();
  for (const row of progressRows) {
    if (!doneByUser.has(row.userId)) doneByUser.set(row.userId, new Set());
    doneByUser.get(row.userId)!.add(row.lessonId);
  }
  const validatedByUser = new Map<string, Set<string>>();
  for (const row of validations) {
    if (!validatedByUser.has(row.userId)) validatedByUser.set(row.userId, new Set());
    validatedByUser.get(row.userId)!.add(row.checkpointId);
  }
  const pointsByUser = new Map(scores.map((score) => [score.entityId, score.points]));
  const lessonsTotal = snapshots.reduce((acc, snapshot) => acc + snapshot.lessons.length, 0);

  const rows: TeamMemberRow[] = employees.map((employee) => {
    const done = doneByUser.get(employee.userId) ?? new Set<string>();
    const validated = validatedByUser.get(employee.userId) ?? new Set<string>();

    let currentLesson: string | null = null;
    let pendingCheckpoint: TeamMemberRow["pendingCheckpoint"] = null;
    for (const snapshot of snapshots) {
      const next = snapshot.lessons.find((lesson) => !done.has(lesson.id));
      if (next && !currentLesson) currentLesson = next.title;
      const chapterDone = snapshot.lessons.length > 0 && snapshot.lessons.every((lesson) => done.has(lesson.id));
      const checkpoint = snapshot.checkpoints[0];
      if (chapterDone && checkpoint && !validated.has(checkpoint.id) && !pendingCheckpoint) {
        pendingCheckpoint = { checkpointId: checkpoint.id, chapter: snapshot.title, xp: checkpoint.xp };
      }
    }

    const parts = (employee.user.name ?? "").trim().split(/\s+/).filter(Boolean);
    return {
      userId: employee.userId,
      name: employee.user.name ?? "—",
      initials: parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "TW",
      roleTitle: employee.roleTitle,
      storeName: employee.store?.name ?? null,
      currentLesson,
      lessonsDone: done.size,
      lessonsTotal,
      pct: lessonsTotal > 0 ? Math.round((done.size / lessonsTotal) * 100) : 0,
      points: pointsByUser.get(employee.userId) ?? 0,
      lastActivityAt: employee.lastActivityAt,
      inactiveDays: daysSince(employee.lastActivityAt, now),
      pendingCheckpoint,
    };
  });

  let leaguePosition: number | null = null;
  if (season && session.scope.homeStoreId) {
    const storeScore = await prisma.twLeagueScore.findUnique({
      where: { seasonId_entityType_entityId: { seasonId: season.id, entityType: "STORE", entityId: session.scope.homeStoreId } },
      select: { position: true },
    });
    leaguePosition = storeScore?.position ?? null;
  }

  return {
    kpis: teamKpis(rows, now),
    rows,
    stores,
    storeFilter: storeFilter ?? null,
    leaguePosition,
    canFilter: stores.length > 1,
  };
}


// ── Inspira ────────────────────────────────────────────────────────────────

export type InspireItemView = {
  id: string;
  type: "PODCAST" | "ARTICLE" | "VIDEO" | "MESSAGE" | "STORY";
  title: string;
  who: string;
  desc: string;
  lengthMin: number;
  quote: string | null;
  mediaUrl: string | null;
  externalUrl: string | null;
  featured: boolean;
};

export type InspireView = {
  featured: InspireItemView | null;
  items: InspireItemView[];
  /** Ya cobró el XP de Inspira hoy. */
  claimedToday: boolean;
  gamification: boolean;
};

function toInspire(row: {
  id: string;
  type: string;
  title: string;
  who: string;
  desc: string;
  lengthMin: number;
  quote: string | null;
  mediaUrl: string | null;
  externalUrl: string | null;
  featured: boolean;
}): InspireItemView {
  return { ...row, type: row.type as InspireItemView["type"] };
}

/** ¿Ya cobró hoy el XP de Inspira? El tope diario lo impone el índice único. */
export async function hasClaimedInspireToday(session: TwSession, now = new Date()): Promise<boolean> {
  const timeZone = session.employee?.store?.timezone ?? "America/Bogota";
  const existing = await prisma.twXpEvent.findFirst({
    where: { userId: session.user.id, source: "INSPIRE", dayKey: dayKey(now, timeZone) },
    select: { id: true },
  });
  return !!existing;
}

export async function getInspireView(session: TwSession, now = new Date()): Promise<InspireView> {
  const [rows, gamification, claimedToday] = await Promise.all([
    prisma.twInspireItem.findMany({
      where: { franchiseId: session.franchiseId, publishedAt: { not: null, lte: now } },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
    }),
    isGamificationOn(session),
    hasClaimedInspireToday(session, now),
  ]);
  const items = rows.map(toInspire);
  return { featured: items.find((item) => item.featured) ?? null, items, claimedToday, gamification };
}

export async function getInspireItem(session: TwSession, id: string, now = new Date()): Promise<{ item: InspireItemView; claimedToday: boolean; gamification: boolean } | null> {
  const row = await prisma.twInspireItem.findFirst({
    where: { id, franchiseId: session.franchiseId, publishedAt: { not: null, lte: now } },
  });
  if (!row) return null;
  const [gamification, claimedToday] = await Promise.all([isGamificationOn(session), hasClaimedInspireToday(session, now)]);
  return { item: toInspire(row), claimedToday, gamification };
}

// ── Beneficios ─────────────────────────────────────────────────────────────

export type BenefitView = {
  id: string;
  category: string;
  title: string;
  desc: string;
  icon: string;
  link: string | null;
  countries: string[];
};

/** Beneficios vigentes para el rol y el país de la tienda de la persona. */
export async function getBenefits(session: TwSession): Promise<BenefitView[]> {
  const rows = await prisma.twBenefit.findMany({
    where: { franchiseId: session.franchiseId },
    orderBy: { order: "asc" },
  });
  const country = session.employee?.store?.country ?? null;
  return rows
    .filter((row) => row.eligibilityRoles.length === 0 || row.eligibilityRoles.includes(session.user.role))
    .filter((row) => row.countries.length === 0 || !country || row.countries.includes(country))
    .map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      desc: row.desc,
      icon: row.icon,
      link: row.link,
      countries: row.countries,
    }));
}
