/**
 * Formato de fechas y cifras del Command Center.
 *
 * Todo se guarda en UTC y se muestra en Europe/Madrid — el equipo de expansión
 * opera desde España, así que «hoy» y «vencida» se calculan contra el día
 * natural de Madrid, no contra el del servidor.
 */

export const SAJU_TZ = "Europe/Madrid";

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: SAJU_TZ,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: SAJU_TZ,
  day: "2-digit",
  month: "short",
});

const dateTimeFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: SAJU_TZ,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const weekdayFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: SAJU_TZ,
  weekday: "long",
});

/** Partes YYYY-MM-DD del instante, ya trasladado a Madrid. */
function madridParts(date: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAJU_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** Día natural de Madrid como número de días desde epoch (comparable, sin horas). */
export function madridDayNumber(date: Date): number {
  const { y, m, d } = madridParts(date);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Días de diferencia en días naturales de Madrid: negativo = pasado. */
export function daysFromToday(date: Date, now: Date = new Date()): number {
  return madridDayNumber(date) - madridDayNumber(now);
}

export function isOverdue(date: Date | null | undefined, now: Date = new Date()): boolean {
  return date != null && daysFromToday(date, now) < 0;
}

export function isWithinDays(
  date: Date | null | undefined,
  days: number,
  now: Date = new Date(),
): boolean {
  if (!date) return false;
  const diff = daysFromToday(date, now);
  return diff >= 0 && diff <= days;
}

export function formatDate(date: Date): string {
  return dateFmt.format(date).replace(".", "");
}

export function formatShortDate(date: Date): string {
  return shortDateFmt.format(date).replace(".", "");
}

export function formatDateTime(date: Date): string {
  return dateTimeFmt.format(date).replace(".", "");
}

export function formatWeekday(date: Date): string {
  const value = weekdayFmt.format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** «hoy» · «mañana» · «en 4 días» · «hace 2 días». */
export function formatRelativeDay(date: Date, now: Date = new Date()): string {
  const diff = daysFromToday(date, now);
  if (diff === 0) return "hoy";
  if (diff === 1) return "mañana";
  if (diff === -1) return "ayer";
  if (diff > 1) return `en ${diff} días`;
  return `hace ${Math.abs(diff)} días`;
}

/** Valor para `<input type="date">`, en el día natural de Madrid. */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  const { y, m, d } = madridParts(date);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Convierte el `YYYY-MM-DD` de un input a un instante UTC. Se ancla a las
 * 12:00 UTC para que el día natural en Madrid (UTC+1/+2) sea siempre el mismo
 * que el elegido, sin importar el horario de verano.
 */
export function fromDateInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Porcentaje entero, sin decimales de ruido. 0 si el denominador es 0. */
export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function formatPct(value: number): string {
  return `${value}%`;
}

/** Un decimal, coma decimal española. */
export function formatDecimal(value: number): string {
  return value.toFixed(1).replace(".", ",");
}
