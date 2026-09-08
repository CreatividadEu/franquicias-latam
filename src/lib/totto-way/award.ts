/**
 * Otorgamiento de XP (PLAN §8). Único camino por el que se pagan puntos: una
 * transacción que registra el evento, mueve el acumulado y la racha del
 * empleado, desbloquea insignias con su hito y suma a la Liga.
 *
 * La idempotencia la garantiza la base de datos con dos índices únicos
 * parciales (migración 20260907140000): un evento por usuario/día para las
 * fuentes con tope, y uno por objeto para lección, quiz y checkpoint. Si el
 * índice rechaza el insert, se devuelve `awarded: false` sin tocar nada más.
 */
import { Prisma, type TwXpSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badgesUnlocked, dayKey, nextStreak, type BadgeRule } from "./xp";

export type AwardInput = {
  franchiseId: string;
  userId: string;
  storeId: string | null;
  source: TwXpSource;
  points: number;
  /** Lección, quiz o checkpoint que origina el pago (clave de idempotencia). */
  refId?: string | null;
  meta?: Prisma.InputJsonValue;
  timeZone?: string;
  now?: Date;
};

export type AwardResult = {
  awarded: boolean;
  points: number;
  xpTotal: number;
  streakDays: number;
  badges: BadgeRule[];
};

const BADGE_LABEL: Record<string, string> = {
  EXPLORADOR: "Explorador",
  GUIA: "Guía",
  LIDER_RUTA: "Líder de ruta",
  CUMBRE: "Cumbre",
};

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function awardXp(input: AwardInput): Promise<AwardResult> {
  const now = input.now ?? new Date();
  const timeZone = input.timeZone ?? "America/Bogota";
  const points = Math.round(input.points);

  if (points <= 0) {
    const employee = await prisma.twEmployee.findUnique({ where: { userId: input.userId } });
    return { awarded: false, points: 0, xpTotal: employee?.xpTotal ?? 0, streakDays: employee?.streakDays ?? 0, badges: [] };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.twXpEvent.create({
        data: {
          franchiseId: input.franchiseId,
          userId: input.userId,
          storeId: input.storeId,
          source: input.source,
          points,
          dayKey: dayKey(now, timeZone),
          refId: input.refId ?? null,
          meta: input.meta,
          createdAt: now,
        },
      });

      const employee = await tx.twEmployee.findUnique({ where: { userId: input.userId } });
      // Un ADMIN/formador sin ficha puede generar eventos, pero no acumula.
      if (!employee) {
        return { awarded: true, points, xpTotal: 0, streakDays: 0, badges: [] };
      }

      // La actividad nunca retrocede: el webhook de Geovictoria puede reenviar
      // un lote atrasado y, si se escribiera esa fecha, la racha se rompería y
      // el cron avisaría de una inactividad que no existe.
      const lastActivityAt =
        !employee.lastActivityAt || now > employee.lastActivityAt ? now : employee.lastActivityAt;
      const streakDays = nextStreak(employee, lastActivityAt, timeZone);

      // Incremento atómico: dos pagos simultáneos (una lección y una marcación,
      // por ejemplo) se sumaban leyendo el mismo valor y uno se perdía.
      const updated = await tx.twEmployee.update({
        where: { id: employee.id },
        data: { xpTotal: { increment: points }, streakDays, lastActivityAt },
        select: { xpTotal: true },
      });
      const after = updated.xpTotal;
      const before = after - points;

      // Insignias nuevas + su hito en Mi viaje.
      const unlocked = badgesUnlocked(before, after);
      for (const rule of unlocked) {
        const badge = await tx.twBadge.findUnique({
          where: { franchiseId_code: { franchiseId: input.franchiseId, code: rule.code } },
          select: { id: true, name: true },
        });
        if (!badge) continue;
        await tx.twUserBadge.upsert({
          where: { userId_badgeId: { userId: input.userId, badgeId: badge.id } },
          update: {},
          create: { userId: input.userId, badgeId: badge.id, earnedAt: now },
        });
        await tx.twJourneyMilestone.create({
          data: {
            userId: input.userId,
            type: "BADGE",
            title: `Insignia ${badge.name ?? BADGE_LABEL[rule.code] ?? rule.code}`,
            desc: `${rule.minXp.toLocaleString("es-CO")} XP acumulados`,
            date: now,
            icon: rule.icon,
          },
        });
      }

      // Liga: la posición la recalcula el job nocturno (fase 2); aquí solo se suma.
      const season = await tx.twLeagueSeason.findFirst({
        where: { franchiseId: input.franchiseId, status: "ACTIVE" },
        orderBy: { startsAt: "desc" },
        select: { id: true },
      });
      if (season) {
        const entities: { entityType: "USER" | "STORE"; entityId: string }[] = [
          { entityType: "USER", entityId: input.userId },
        ];
        if (input.storeId) entities.push({ entityType: "STORE", entityId: input.storeId });
        for (const entity of entities) {
          await tx.twLeagueScore.upsert({
            where: { seasonId_entityType_entityId: { seasonId: season.id, ...entity } },
            update: { points: { increment: points } },
            create: { seasonId: season.id, ...entity, points, position: 0 },
          });
        }
      }

      return { awarded: true, points, xpTotal: after, streakDays, badges: unlocked };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const employee = await prisma.twEmployee.findUnique({ where: { userId: input.userId } });
      return { awarded: false, points: 0, xpTotal: employee?.xpTotal ?? 0, streakDays: employee?.streakDays ?? 0, badges: [] };
    }
    throw error;
  }
}

/** Registra un hito si no existe ya uno igual (evita duplicados al reintentar). */
export async function recordMilestoneOnce(input: {
  userId: string;
  type: "CHAPTER_DONE" | "STREAK" | "PROMOTION" | "CUSTOM" | "NPS" | "JOINED";
  title: string;
  desc: string;
  icon: string;
  now?: Date;
}) {
  const existing = await prisma.twJourneyMilestone.findFirst({
    where: { userId: input.userId, type: input.type, title: input.title },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.twJourneyMilestone.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      desc: input.desc,
      icon: input.icon,
      date: input.now ?? new Date(),
    },
    select: { id: true },
  });
  return created.id;
}

export type StoreAwardResult = { awarded: boolean; points: number };

/**
 * XP que pertenece a la tienda entera y no a una persona: hoy solo el NPS del
 * mes (+300 al equipo). Va sin `userId`, así que no toca acumulados
 * individuales ni rachas, y el índice único parcial de la migración
 * 20260908090000 impide pagarlo dos veces por (tienda, mes).
 */
export async function awardStoreXp(input: {
  franchiseId: string;
  storeId: string;
  source: TwXpSource;
  points: number;
  /** Clave de idempotencia, p. ej. "nps:2026-09". */
  refId: string;
  meta?: Prisma.InputJsonValue;
  timeZone?: string;
  now?: Date;
}): Promise<StoreAwardResult> {
  const now = input.now ?? new Date();
  const points = Math.round(input.points);
  if (points <= 0) return { awarded: false, points: 0 };

  try {
    await prisma.twXpEvent.create({
      data: {
        franchiseId: input.franchiseId,
        userId: null,
        storeId: input.storeId,
        source: input.source,
        points,
        dayKey: dayKey(now, input.timeZone ?? "America/Bogota"),
        refId: input.refId,
        meta: input.meta,
        createdAt: now,
      },
    });
    return { awarded: true, points };
  } catch (error) {
    if (isUniqueViolation(error)) return { awarded: false, points: 0 };
    throw error;
  }
}
