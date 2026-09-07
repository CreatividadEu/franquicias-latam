/**
 * Panel líder (PLAN §4.9). Parte pura: KPIs del equipo, alerta de inactividad
 * y el CSV de exportación. El scoping lo aporta siempre `TwScope`.
 */

/** Días sin ningún evento a partir de los cuales el líder ve la alerta. */
export const INACTIVITY_DAYS = 7;

export type TeamMemberRow = {
  userId: string;
  name: string;
  initials: string;
  roleTitle: string;
  storeName: string | null;
  currentLesson: string | null;
  lessonsDone: number;
  lessonsTotal: number;
  pct: number;
  points: number;
  lastActivityAt: Date | null;
  inactiveDays: number | null;
  /** Checkpoint listo para validar (capítulo terminado, sin validación). */
  pendingCheckpoint: { checkpointId: string; chapter: string; xp: number } | null;
};

export function daysSince(date: Date | null | undefined, now = new Date()): number | null {
  if (!date) return null;
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

export function isInactive(lastActivityAt: Date | null | undefined, now = new Date(), threshold = INACTIVITY_DAYS): boolean {
  const days = daysSince(lastActivityAt, now);
  return days === null || days >= threshold;
}

export type TeamKpis = {
  active: number;
  total: number;
  averagePct: number;
  pendingCheckpoints: number;
  inactive: number;
};

export function teamKpis(rows: readonly TeamMemberRow[], now = new Date()): TeamKpis {
  const total = rows.length;
  const inactive = rows.filter((row) => isInactive(row.lastActivityAt, now)).length;
  const sum = rows.reduce((acc, row) => acc + row.pct, 0);
  return {
    total,
    active: total - inactive,
    averagePct: total > 0 ? Math.round(sum / total) : 0,
    pendingCheckpoints: rows.filter((row) => row.pendingCheckpoint).length,
    inactive,
  };
}

/** CSV del equipo. Escapa comillas para que Excel no rompa las filas. */
export function teamCsv(rows: readonly TeamMemberRow[], now = new Date()): string {
  const escape = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = ["Nombre", "Rol", "Tienda", "Progreso %", "Lecciones", "Puntos", "Lección actual", "Días sin actividad", "Checkpoint por validar"];
  const lines = rows.map((row) =>
    [
      escape(row.name),
      escape(row.roleTitle),
      escape(row.storeName),
      row.pct,
      escape(`${row.lessonsDone}/${row.lessonsTotal}`),
      row.points,
      escape(row.currentLesson),
      daysSince(row.lastActivityAt, now) ?? "",
      escape(row.pendingCheckpoint ? row.pendingCheckpoint.chapter : ""),
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
