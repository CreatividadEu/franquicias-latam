/**
 * Liga de la Expedición (PLAN §4.4). La parte pura —clasificación, semanas,
 * cuenta regresiva y deltas— vive arriba y es testeable; abajo van las
 * funciones de servidor que materializan `tw_league_scores` desde los eventos
 * de XP. El job nocturno es el único que escribe posiciones.
 */
import type { TwLeagueEntity, TwXpSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ── Puro ───────────────────────────────────────────────────────────────────

export type StandingInput = { entityId: string; points: number };
export type Standing = { entityId: string; points: number; position: number };

/**
 * Clasificación con empates al estilo competición: 1, 2, 2, 4. Ordena por
 * puntos y, a igualdad, por id para que el resultado sea estable entre
 * ejecuciones del job.
 */
export function computeStandings(rows: readonly StandingInput[]): Standing[] {
  const sorted = [...rows].sort((a, b) => b.points - a.points || a.entityId.localeCompare(b.entityId));
  const standings: Standing[] = [];
  let position = 0;
  let previousPoints: number | null = null;
  sorted.forEach((row, index) => {
    if (previousPoints === null || row.points !== previousPoints) position = index + 1;
    previousPoints = row.points;
    standings.push({ entityId: row.entityId, points: row.points, position });
  });
  return standings;
}

/** Semana ISO 8601 en formato `2026-W35`, que es la clave de los snapshots. */
export function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Jueves de la misma semana define el año ISO.
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Posiciones ganadas respecto a la semana anterior. Positivo = subió. */
export function positionDelta(position: number, prevPosition: number | null | undefined): number | null {
  if (!prevPosition || prevPosition <= 0 || position <= 0) return null;
  return prevPosition - position;
}

export type Countdown = { days: number; ended: boolean };

/** Días completos que quedan de temporada. */
export function seasonCountdown(endsAt: Date, now = new Date()): Countdown {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, ended: true };
  return { days: Math.ceil(ms / 86_400_000), ended: false };
}

/** Tabla "Cómo se ganan puntos" (PLAN §5). El orden es el del manual. */
export const SCORING_TABLE: { source: TwXpSource; points: string }[] = [
  { source: "LESSON", points: "+50 a +120" },
  { source: "QUIZ", points: "+40" },
  { source: "CHECKPOINT", points: "+150" },
  { source: "ATTENDANCE", points: "+10 / día" },
  { source: "INSPIRE", points: "+20 / día" },
  { source: "NPS", points: "+300 a la tienda" },
];

// ── Servidor ───────────────────────────────────────────────────────────────

/**
 * Recalcula la clasificación de una temporada desde `tw_xp_events`. La
 * posición anterior se toma del último snapshot semanal, que es lo que
 * sostiene el delta ▲▼ de la tabla.
 */
export async function recomputeSeason(seasonId: string): Promise<{ users: number; stores: number }> {
  const season = await prisma.twLeagueSeason.findUnique({ where: { id: seasonId } });
  if (!season) return { users: 0, stores: 0 };

  const range = { gte: season.startsAt, lte: season.endsAt };
  const [byUser, byStore, snapshots, stores, employees] = await Promise.all([
    prisma.twXpEvent.groupBy({
      by: ["userId"],
      where: { franchiseId: season.franchiseId, createdAt: range },
      _sum: { points: true },
    }),
    prisma.twXpEvent.groupBy({
      by: ["storeId"],
      where: { franchiseId: season.franchiseId, createdAt: range, storeId: { not: null } },
      _sum: { points: true },
    }),
    prisma.twLeagueSnapshot.findMany({ where: { seasonId }, orderBy: { weekKey: "desc" } }),
    prisma.twStore.findMany({ where: { franchiseId: season.franchiseId, active: true }, select: { id: true } }),
    // Compiten las personas de tienda; el formador y los admin no entran.
    prisma.twEmployee.findMany({
      where: { franchiseId: season.franchiseId, storeId: { not: null } },
      select: { userId: true },
    }),
  ]);

  // Solo la semana más reciente cuenta como "anterior".
  const latestWeek = snapshots[0]?.weekKey ?? null;
  const previous = new Map<string, number>();
  for (const row of snapshots) {
    if (row.weekKey !== latestWeek) break;
    previous.set(`${row.entityType}:${row.entityId}`, row.position);
  }

  /**
   * La tabla se reconstruye completa en cada pasada: toda tienda y toda
   * persona activa entra, con 0 si no tuvo eventos, y se borran las filas de
   * entidades que ya no existen. Si solo se actualizaran las que puntuaron,
   * las demás conservarían puntos viejos y la clasificación quedaría
   * incoherente.
   */
  const write = async (entityType: TwLeagueEntity, ids: string[], points: Map<string, number>) => {
    const standings = computeStandings(ids.map((entityId) => ({ entityId, points: points.get(entityId) ?? 0 })));
    for (const standing of standings) {
      await prisma.twLeagueScore.upsert({
        where: { seasonId_entityType_entityId: { seasonId, entityType, entityId: standing.entityId } },
        update: {
          points: standing.points,
          position: standing.position,
          prevPosition: previous.get(`${entityType}:${standing.entityId}`) ?? null,
        },
        create: {
          seasonId,
          entityType,
          entityId: standing.entityId,
          points: standing.points,
          position: standing.position,
          prevPosition: previous.get(`${entityType}:${standing.entityId}`) ?? null,
        },
      });
    }
    await prisma.twLeagueScore.deleteMany({
      where: { seasonId, entityType, entityId: { notIn: ids.length > 0 ? ids : ["__none__"] } },
    });
    return standings.length;
  };

  const users = await write(
    "USER",
    employees.map((employee) => employee.userId),
    new Map(byUser.map((row) => [row.userId, row._sum.points ?? 0])),
  );
  const stores_ = await write(
    "STORE",
    stores.map((store) => store.id),
    new Map(byStore.filter((row) => row.storeId).map((row) => [row.storeId as string, row._sum.points ?? 0])),
  );

  return { users, stores: stores_ };
}

/** Congela las posiciones actuales como la foto de esta semana. */
export async function snapshotWeek(seasonId: string, key = weekKey(new Date())): Promise<number> {
  const scores = await prisma.twLeagueScore.findMany({ where: { seasonId } });
  for (const score of scores) {
    await prisma.twLeagueSnapshot.upsert({
      where: {
        seasonId_weekKey_entityType_entityId: {
          seasonId,
          weekKey: key,
          entityType: score.entityType,
          entityId: score.entityId,
        },
      },
      update: { points: score.points, position: score.position },
      create: {
        seasonId,
        weekKey: key,
        entityType: score.entityType,
        entityId: score.entityId,
        points: score.points,
        position: score.position,
      },
    });
  }
  return scores.length;
}

/** Abre y cierra temporadas según la fecha. Lo llama el job nocturno. */
export async function rollSeasonStatuses(franchiseId: string, now = new Date()): Promise<void> {
  await prisma.twLeagueSeason.updateMany({
    where: { franchiseId, status: { not: "CLOSED" }, endsAt: { lt: now } },
    data: { status: "CLOSED" },
  });
  await prisma.twLeagueSeason.updateMany({
    where: { franchiseId, status: "UPCOMING", startsAt: { lte: now }, endsAt: { gte: now } },
    data: { status: "ACTIVE" },
  });
}
