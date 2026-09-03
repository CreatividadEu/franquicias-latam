/**
 * Las siete paradas del Sandbox y su presupuesto de tiempo (§1, hard budget).
 * Intro 1' · Estrategia 3.5' · Finanzas 3.5' · Operaciones 3.5' · Legal 1.5'
 * · Marketing 2' · Reporte 1'. Es la única fuente de verdad del orden: el rail
 * de progreso, el modo presentador y el log de eventos leen de aquí.
 */

export const SANDBOX_PHASE_IDS = [
  "intro",
  "estrategia",
  "finanzas",
  "operaciones",
  "legal",
  "marketing",
  "reporte",
] as const;

export type SandboxPhaseId = (typeof SANDBOX_PHASE_IDS)[number];

export type SandboxPhaseDef = {
  id: SandboxPhaseId;
  /** Presupuesto en segundos. */
  budgetSec: number;
  /** Las cinco fases "de método" (sin intro ni reporte) tienen take-home. */
  hasTakeHome: boolean;
};

export const SANDBOX_PHASES: readonly SandboxPhaseDef[] = [
  { id: "intro", budgetSec: 60, hasTakeHome: false },
  { id: "estrategia", budgetSec: 210, hasTakeHome: true },
  { id: "finanzas", budgetSec: 210, hasTakeHome: true },
  { id: "operaciones", budgetSec: 210, hasTakeHome: true },
  { id: "legal", budgetSec: 90, hasTakeHome: true },
  { id: "marketing", budgetSec: 120, hasTakeHome: true },
  { id: "reporte", budgetSec: 60, hasTakeHome: false },
];

export const SANDBOX_METHOD_PHASES = SANDBOX_PHASES.filter((p) => p.hasTakeHome);

export const SANDBOX_TOTAL_BUDGET_SEC = SANDBOX_PHASES.reduce(
  (acc, p) => acc + p.budgetSec,
  0,
);

export function isSandboxPhaseId(value: unknown): value is SandboxPhaseId {
  return (
    typeof value === "string" &&
    (SANDBOX_PHASE_IDS as readonly string[]).includes(value)
  );
}

export function phaseIndex(id: SandboxPhaseId): number {
  return SANDBOX_PHASE_IDS.indexOf(id);
}

export function phaseDef(id: SandboxPhaseId): SandboxPhaseDef {
  return SANDBOX_PHASES[phaseIndex(id)];
}

export function nextPhase(id: SandboxPhaseId): SandboxPhaseId | null {
  const i = phaseIndex(id);
  return i >= 0 && i < SANDBOX_PHASE_IDS.length - 1 ? SANDBOX_PHASE_IDS[i + 1] : null;
}

export function prevPhase(id: SandboxPhaseId): SandboxPhaseId | null {
  const i = phaseIndex(id);
  return i > 0 ? SANDBOX_PHASE_IDS[i - 1] : null;
}

/** "3.5'" / "1'" — etiqueta corta del presupuesto para el rail y el presentador. */
export function formatBudget(sec: number): string {
  const min = sec / 60;
  return Number.isInteger(min) ? `${min}'` : `${min.toFixed(1).replace(/\.0$/, "")}'`;
}

/** Mapea el id de fase (URL, UI) al enum de Prisma `SandboxPhase`. */
export function toPrismaPhase(id: SandboxPhaseId) {
  return id.toUpperCase() as Uppercase<SandboxPhaseId>;
}

/** Fase inicial desde `?fase=`: cualquier valor desconocido cae en intro. */
export function parsePhaseParam(value: string | string[] | undefined): SandboxPhaseId {
  const raw = Array.isArray(value) ? value[0] : value;
  return isSandboxPhaseId(raw) ? raw : "intro";
}
