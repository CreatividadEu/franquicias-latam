/**
 * Reglas de gamificación (PLAN §8). Funciones puras y testeables; la
 * persistencia (awardXp con transacción Prisma) vive en progress-actions.
 */
import type { TwBadgeCode, TwXpSource } from "@prisma/client";

export const XP_RULES = {
  /** Lección: lesson.xp (50–120). */
  QUIZ_PERFECT: 40,
  CHECKPOINT: 150,
  ATTENDANCE: 10,
  INSPIRE: 20,
  NPS: 300,
} as const;

/** Fuentes con tope de un evento por día (dayKey en TZ de la tienda). */
export const DAILY_CAPPED_SOURCES: readonly TwXpSource[] = ["ATTENDANCE", "INSPIRE"];

export function isDailyCapped(source: TwXpSource): boolean {
  return DAILY_CAPPED_SOURCES.includes(source);
}

export type BadgeRule = { code: TwBadgeCode; minXp: number; icon: string };

export const BADGE_RULES: readonly BadgeRule[] = [
  { code: "EXPLORADOR", minXp: 0, icon: "compass" },
  { code: "GUIA", minXp: 5000, icon: "map" },
  { code: "LIDER_RUTA", minXp: 12000, icon: "flag" },
  { code: "CUMBRE", minXp: 25000, icon: "mountain" },
];

/** Insignia actual para un total de XP. */
export function badgeFor(xpTotal: number): BadgeRule {
  let current = BADGE_RULES[0];
  for (const rule of BADGE_RULES) {
    if (xpTotal >= rule.minXp) current = rule;
  }
  return current;
}

/** Siguiente insignia y XP que faltan; null en el nivel máximo. */
export function nextBadge(xpTotal: number): (BadgeRule & { remaining: number }) | null {
  const next = BADGE_RULES.find((rule) => rule.minXp > xpTotal);
  return next ? { ...next, remaining: next.minXp - xpTotal } : null;
}

/** Insignias que se desbloquean al pasar de `before` a `after` XP. */
export function badgesUnlocked(before: number, after: number): BadgeRule[] {
  return BADGE_RULES.filter((rule) => rule.minXp > before && rule.minXp <= after);
}

/** Progreso 0–1 hacia la siguiente insignia (1 en el nivel máximo). */
export function badgeProgress(xpTotal: number): number {
  const current = badgeFor(xpTotal);
  const next = nextBadge(xpTotal);
  if (!next) return 1;
  const span = next.minXp - current.minXp;
  return span > 0 ? Math.min(1, Math.max(0, (xpTotal - current.minXp) / span)) : 1;
}

/** YYYY-MM-DD en una zona horaria IANA (Intl, sin dependencias). */
export function dayKey(date: Date, timeZone = "America/Bogota"): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function daysBetween(aKey: string, bKey: string): number {
  const a = Date.UTC(+aKey.slice(0, 4), +aKey.slice(5, 7) - 1, +aKey.slice(8, 10));
  const b = Date.UTC(+bKey.slice(0, 4), +bKey.slice(5, 7) - 1, +bKey.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/**
 * Racha = días consecutivos con ≥ 1 evento. Mismo día: no cambia; día
 * siguiente: +1; hueco: vuelve a 1.
 */
export function nextStreak(
  prev: { streakDays: number; lastActivityAt: Date | null },
  now: Date,
  timeZone = "America/Bogota",
): number {
  if (!prev.lastActivityAt || prev.streakDays <= 0) return 1;
  const gap = daysBetween(dayKey(prev.lastActivityAt, timeZone), dayKey(now, timeZone));
  if (gap <= 0) return prev.streakDays;
  if (gap === 1) return prev.streakDays + 1;
  return 1;
}

/** Racha vigente para mostrar: cae a 0 si el último evento fue hace > 1 día. */
export function currentStreak(
  prev: { streakDays: number; lastActivityAt: Date | null },
  now: Date,
  timeZone = "America/Bogota",
): number {
  if (!prev.lastActivityAt) return 0;
  const gap = daysBetween(dayKey(prev.lastActivityAt, timeZone), dayKey(now, timeZone));
  return gap <= 1 ? prev.streakDays : 0;
}

/** XP de completar una lección (más bonus si el quiz fue perfecto). */
export function lessonReward(lessonXp: number, quiz?: { correct: number; total: number; bonusXp?: number } | null) {
  const perfect = !!quiz && quiz.total > 0 && quiz.correct === quiz.total;
  const bonus = perfect ? (quiz?.bonusXp ?? XP_RULES.QUIZ_PERFECT) : 0;
  return { base: lessonXp, bonus, total: lessonXp + bonus, perfect };
}
