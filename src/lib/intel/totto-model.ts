/**
 * Modelo financiero — Simulador de Impacto por Falsificación · TOTTO (Nalsani S.A.S.).
 *
 * Funciones puras: sin React, sin DOM, sin I/O. Todo el estado vive en el
 * cliente y este módulo solo transforma supuestos en resultados, de modo que el
 * modelo se puede testear de forma aislada (ver tests/totto-model.test.ts).
 *
 * Unidades: COP M (millones de pesos corrientes) salvo que el nombre del campo
 * diga lo contrario (`asp`, `fake`, `clv` van en COP nominales; `units` e `inf`
 * son conteos). Los porcentajes se guardan en unidades de display (52 = 52 %) y
 * se normalizan dentro del modelo.
 */

// ── Constantes del modelo ────────────────────────────────────────────────────

export const SMLMV = 1_750_905; // Decretos 1469/1470 de 2025, vigencia 2026
export const TRM = 4_000; // TRM de referencia para la lectura en USD
export const MKT_PCT = 0.04; // inversión en marketing como % de ingresos
export const COSTOS_INCR = 900; // COP M/año de costos incrementales de defensa
export const CLV_YEARS = 3; // el CLV destruido se imputa a 3 años
export const GROWTH = 0.18; // crecimiento a.a. del comercio ilícito
export const IVA_RATE = 0.19;
export const MONTHS = 12;
export const RECOVERY_FIRST_MONTH = 7; // los recuperos aterrizan M7–M12

const RECOVERY_MONTHS = MONTHS - RECOVERY_FIRST_MONTH + 1;

// ── Planes ───────────────────────────────────────────────────────────────────

export type PlanId = 0 | 1 | 2 | 3;

export interface Plan {
  id: PlanId;
  /** Nombre corto para el control segmentado. */
  name: string;
  /** Precio, tal como se muestra en el segmento. */
  price: string;
  /** COP M cobrados una sola vez, en el mes 1. */
  fixed: number;
  /** COP M por mes. */
  monthly: number;
  /** Efectividad de contención en el mes `m` (1-indexado), 0–1. */
  eff: (m: number) => number;
  /** Fracción del recupero legal esperado que el plan alcanza a perseguir. */
  pipeline: number;
  /** Success fee sobre el recupero legal. */
  successFee: number;
}

export const PLANS: readonly Plan[] = [
  {
    id: 0,
    name: "Inacción",
    price: "COP 0",
    fixed: 0,
    monthly: 0,
    eff: () => 0,
    pipeline: 0,
    successFee: 0,
  },
  {
    id: 1,
    name: "Plan 1 · Radar",
    price: "COP 60 M una vez",
    fixed: 60,
    monthly: 0,
    eff: (m) => (m >= 1 ? 0.15 : 0),
    pipeline: 0.4,
    successFee: 0,
  },
  {
    id: 2,
    name: "Plan 2 · Escudo",
    price: "COP 16 M/mes",
    fixed: 0,
    monthly: 16,
    eff: (m) => Math.min(0.6, (0.6 * m) / 6),
    pipeline: 0.7,
    successFee: 0,
  },
  {
    id: 3,
    name: "Plan 3 · Fortaleza",
    price: "COP 36 M/mes + success fee",
    fixed: 0,
    monthly: 36,
    eff: (m) => Math.min(0.82, (0.82 * m) / 8),
    pipeline: 1,
    successFee: 0.2,
  },
] as const;

export function getPlan(id: number): Plan {
  return PLANS[isPlanId(id) ? id : 0];
}

export function isPlanId(id: number): id is PlanId {
  return id === 0 || id === 1 || id === 2 || id === 3;
}

// ── Supuestos (inputs) ───────────────────────────────────────────────────────

export type InputKey =
  | "units"
  | "asp"
  | "fake"
  | "rev"
  | "gm"
  | "sub"
  | "ero"
  | "dec"
  | "def"
  | "clv"
  | "mkt"
  | "inf"
  | "mks"
  | "sml"
  | "win";

export type Inputs = Record<InputKey, number>;

export type GroupId = "mercado" | "unitaria" | "marca" | "legal";

export interface GroupSpec {
  id: GroupId;
  title: string;
  note: string;
}

export const GROUPS: readonly GroupSpec[] = [
  { id: "mercado", title: "Mercado ilícito", note: "Volumen y precio de la falsificación" },
  { id: "unitaria", title: "Economía unitaria Totto", note: "P&L de la marca en Colombia" },
  { id: "marca", title: "Cliente y marca", note: "Daño reputacional y valor de vida" },
  { id: "legal", title: "Recuperación legal", note: "Indemnización preestablecida" },
] as const;

/** Formato del valor en la lectura del slider. */
export type InputUnit = "u" | "cop" | "copM" | "pct" | "count" | "smlmv";

export interface InputSpec {
  key: InputKey;
  /** Clave corta usada en la URL. */
  short: string;
  group: GroupId;
  label: string;
  unit: InputUnit;
  min: number;
  max: number;
  step: number;
  default: number;
  hint?: string;
}

export const INPUT_SPECS: readonly InputSpec[] = [
  {
    key: "units",
    short: "u",
    group: "mercado",
    label: "Unidades falsificadas / año",
    unit: "u",
    min: 20_000,
    max: 600_000,
    step: 5_000,
    default: 180_000,
  },
  {
    key: "fake",
    short: "f",
    group: "mercado",
    label: "Precio de venta de la falsificación",
    unit: "cop",
    min: 20_000,
    max: 150_000,
    step: 5_000,
    default: 65_000,
  },
  {
    key: "sub",
    short: "s",
    group: "mercado",
    label: "Tasa de sustitución (venta perdida)",
    unit: "pct",
    min: 5,
    max: 50,
    step: 1,
    default: 25,
    hint: "La industria usa 40–50 %; el default es conservador.",
  },
  {
    key: "rev",
    short: "r",
    group: "unitaria",
    label: "Ingresos Colombia",
    unit: "copM",
    min: 300_000,
    max: 800_000,
    step: 1_000,
    default: 496_000,
    hint: "≈ 60 % de COP 827.000 M del grupo en 2025; ~40 % es internacional.",
  },
  {
    key: "asp",
    short: "a",
    group: "unitaria",
    label: "Precio promedio Totto (ASP)",
    unit: "cop",
    min: 80_000,
    max: 350_000,
    step: 5_000,
    default: 200_000,
  },
  {
    key: "gm",
    short: "g",
    group: "unitaria",
    label: "Margen bruto",
    unit: "pct",
    min: 35,
    max: 70,
    step: 1,
    default: 52,
    hint: "Histórico Nalsani 51–53 %.",
  },
  {
    key: "ero",
    short: "e",
    group: "unitaria",
    label: "Erosión de precio sobre ingresos",
    unit: "pct",
    min: 0,
    max: 3,
    step: 0.1,
    default: 0.8,
  },
  {
    key: "mkt",
    short: "m",
    group: "unitaria",
    label: "Fuga de la inversión en marketing",
    unit: "pct",
    min: 0,
    max: 15,
    step: 1,
    default: 6,
    hint: "Se aplica sobre el 4 % de ingresos invertido en marketing.",
  },
  {
    key: "dec",
    short: "d",
    group: "marca",
    label: "Clientes engañados que se dan cuenta",
    unit: "pct",
    min: 0,
    max: 60,
    step: 1,
    default: 30,
  },
  {
    key: "def",
    short: "x",
    group: "marca",
    label: "De esos, los que abandonan la marca",
    unit: "pct",
    min: 0,
    max: 40,
    step: 1,
    default: 15,
  },
  {
    key: "clv",
    short: "c",
    group: "marca",
    label: "CLV por cliente perdido",
    unit: "cop",
    min: 200_000,
    max: 2_000_000,
    step: 50_000,
    default: 700_000,
    hint: "Utilidad de vida, imputada a 3 años.",
  },
  {
    key: "inf",
    short: "i",
    group: "legal",
    label: "Infractores accionables",
    unit: "count",
    min: 5,
    max: 80,
    step: 1,
    default: 25,
  },
  {
    key: "mks",
    short: "k",
    group: "legal",
    label: "Marcas infringidas por infractor",
    unit: "count",
    min: 1,
    max: 4,
    step: 1,
    default: 2,
    hint: "Nominativa + mixta/logo.",
  },
  {
    key: "sml",
    short: "l",
    group: "legal",
    label: "Indemnización por marca",
    unit: "smlmv",
    min: 3,
    max: 200,
    step: 1,
    default: 15,
    hint: "Rango legal 3–100 SMLMV; hasta 200 con agravantes.",
  },
  {
    key: "win",
    short: "w",
    group: "legal",
    label: "Probabilidad de éxito ponderada",
    unit: "pct",
    min: 10,
    max: 80,
    step: 5,
    default: 35,
  },
] as const;

export const DEFAULT_INPUTS: Inputs = INPUT_SPECS.reduce((acc, spec) => {
  acc[spec.key] = spec.default;
  return acc;
}, {} as Inputs);

const SPEC_BY_KEY = new Map<InputKey, InputSpec>(
  INPUT_SPECS.map((spec) => [spec.key, spec]),
);

export function specFor(key: InputKey): InputSpec {
  // El mapa se construye desde INPUT_SPECS, así que la clave siempre existe.
  return SPEC_BY_KEY.get(key)!;
}

/** Acota un valor al rango del slider y lo cuadra a su paso. */
export function clampToSpec(spec: InputSpec, raw: number): number {
  if (!Number.isFinite(raw)) return spec.default;
  const clamped = Math.min(spec.max, Math.max(spec.min, raw));
  const steps = Math.round((clamped - spec.min) / spec.step);
  const snapped = spec.min + steps * spec.step;
  // El paso decimal (ero: 0.1) arrastra error de coma flotante.
  return Math.round(snapped * 1e6) / 1e6;
}

// ── Estado serializable en la URL ────────────────────────────────────────────

export interface SimState {
  inputs: Inputs;
  plan: PlanId;
}

export const PLAN_PARAM = "p";

export const DEFAULT_STATE: SimState = { inputs: DEFAULT_INPUTS, plan: 0 };

/** Query string con solo los valores que se desvían del default. */
export function encodeState(state: SimState): string {
  const params = new URLSearchParams();
  for (const spec of INPUT_SPECS) {
    const value = state.inputs[spec.key];
    if (value !== spec.default) params.set(spec.short, String(value));
  }
  if (state.plan !== DEFAULT_STATE.plan) params.set(PLAN_PARAM, String(state.plan));
  return params.toString();
}

type RawParams = Record<string, string | string[] | undefined>;

function firstValue(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/** Hidrata el estado desde searchParams, acotando todo al rango del slider. */
export function decodeState(params: RawParams | URLSearchParams): SimState {
  const read = (key: string): string | undefined =>
    params instanceof URLSearchParams
      ? (params.get(key) ?? undefined)
      : firstValue(params[key]);

  const inputs = { ...DEFAULT_INPUTS };
  for (const spec of INPUT_SPECS) {
    const raw = read(spec.short);
    if (raw === undefined || raw === "") continue;
    inputs[spec.key] = clampToSpec(spec, Number(raw));
  }

  const rawPlan = Number(read(PLAN_PARAM));
  const plan: PlanId = isPlanId(rawPlan) ? rawPlan : DEFAULT_STATE.plan;

  return { inputs, plan };
}

// ── Resultados ───────────────────────────────────────────────────────────────

/** Descomposición del daño anual al P&L, en COP M. */
export interface DamageBreakdown {
  lostUnits: number;
  lostRev: number;
  lostGP: number;
  erosion: number;
  clvTotal: number;
  clvYear: number;
  mktLeak: number;
  costosIncr: number;
  danoPL: number;
  /** Daño como fracción de los ingresos Colombia. */
  danoPctRev: number;
  /** IVA evadido por el mercado ilícito (daño al fisco). */
  iva: number;
}

/** Palanca legal: indemnización preestablecida, en COP M. */
export interface LegalLever {
  expected: number;
  min: number;
  max: number;
  aggravated: number;
}

export interface MonthPoint {
  month: number;
  /** Daño del mes en el mundo sin protección. */
  baseDamage: number;
  /** Daño remanente del mes con el plan activo. */
  planDamage: number;
  /** Daño evitado en el mes. */
  avoided: number;
  /** Costo del plan en el mes. */
  cost: number;
  /** Recupero legal neto que aterriza en el mes. */
  recovery: number;
  /** Efectividad de contención del mes. */
  eff: number;
  cumBase: number;
  cumPlan: number;
  cumBenefit: number;
}

export interface Simulation {
  months: MonthPoint[];
  totalCost: number;
  avoided: number;
  recNet: number;
  /** Daño acumulado a 12 meses sin protección. */
  cumBase: number;
  /** Costo acumulado del escenario con plan (daño remanente + costo − recuperos). */
  cumPlan: number;
  cumBenefit: number;
  /** Primer mes con beneficio acumulado ≥ 0; null en Inacción. */
  payback: number | null;
  /** ROI año 1; null en Inacción (no hay inversión). */
  roi: number | null;
  avgEff: number;
  recoveredSales: number;
}

/** Línea del P&L año 1, en COP M. */
export interface PLRow {
  label: string;
  /** Escenario de referencia (inacción, o mundo sin falsificación). */
  base: number;
  /** Escenario evaluado. */
  scenario: number;
  delta: number;
  /** Una mejora del P&L es positiva aunque el delta sea negativo (gastos). */
  goodWhen: "higher" | "lower";
  emphasis?: boolean;
}

export interface ModelResult {
  inputs: Inputs;
  plan: Plan;
  damage: DamageBreakdown;
  legal: LegalLever;
  sim: Simulation;
  pl: PLRow[];
  deltaEbitda: number;
  /** Contención anual efectiva: daño evitado ÷ daño anual. */
  effAnnual: number;
}

// ── Cálculo ──────────────────────────────────────────────────────────────────

function pct(value: number): number {
  return value / 100;
}

export function computeDamage(i: Inputs): DamageBreakdown {
  const lostUnits = i.units * pct(i.sub);
  const lostRev = (lostUnits * i.asp) / 1e6;
  const lostGP = lostRev * pct(i.gm);
  const erosion = i.rev * pct(i.ero);
  const clvTotal = (i.units * pct(i.dec) * pct(i.def) * i.clv) / 1e6;
  const clvYear = clvTotal / CLV_YEARS;
  const mktLeak = i.rev * MKT_PCT * pct(i.mkt);
  const danoPL = lostGP + erosion + clvYear + mktLeak + COSTOS_INCR;
  const iva = (i.units * i.fake * IVA_RATE) / 1e6;

  return {
    lostUnits,
    lostRev,
    lostGP,
    erosion,
    clvTotal,
    clvYear,
    mktLeak,
    costosIncr: COSTOS_INCR,
    danoPL,
    danoPctRev: i.rev > 0 ? danoPL / i.rev : 0,
    iva,
  };
}

export function computeLegal(i: Inputs): LegalLever {
  const base = (i.inf * i.mks * SMLMV) / 1e6;
  return {
    expected: base * i.sml * pct(i.win),
    min: base * 3,
    max: base * 100,
    aggravated: base * 200,
  };
}

export function simulate(
  damage: DamageBreakdown,
  legal: LegalLever,
  plan: Plan,
): Simulation {
  const mBase = damage.danoPL / MONTHS;
  const recNet = plan.id > 0 ? legal.expected * plan.pipeline * (1 - plan.successFee) : 0;
  const recPerMonth = recNet / RECOVERY_MONTHS;

  const months: MonthPoint[] = [];
  let cumBase = 0;
  let cumPlan = 0;
  let cumBenefit = 0;
  let totalCost = 0;
  let avoidedTotal = 0;
  let effTotal = 0;
  let payback: number | null = null;

  for (let m = 1; m <= MONTHS; m++) {
    const baseDamage = mBase * Math.pow(1 + GROWTH, m / MONTHS);
    const eff = plan.eff(m);
    const planDamage = baseDamage * (1 - eff);
    const avoided = baseDamage - planDamage;
    const cost = (m === 1 ? plan.fixed : 0) + plan.monthly;
    const recovery = plan.id > 0 && m >= RECOVERY_FIRST_MONTH ? recPerMonth : 0;

    cumBase += baseDamage;
    // El escenario con plan no puede acumular un costo negativo: si los
    // recuperos superan al daño remanente, la curva se apoya en cero.
    cumPlan = Math.max(0, cumPlan + planDamage + cost - recovery);
    cumBenefit += avoided + recovery - cost;

    totalCost += cost;
    avoidedTotal += avoided;
    effTotal += eff;

    if (payback === null && plan.id > 0 && cumBenefit >= 0) payback = m;

    months.push({
      month: m,
      baseDamage,
      planDamage,
      avoided,
      cost,
      recovery,
      eff,
      cumBase,
      cumPlan,
      cumBenefit,
    });
  }

  const avgEff = effTotal / MONTHS;

  return {
    months,
    totalCost,
    avoided: avoidedTotal,
    recNet,
    cumBase,
    cumPlan,
    cumBenefit,
    payback,
    roi: totalCost > 0 ? (avoidedTotal + recNet - totalCost) / totalCost : null,
    avgEff,
    recoveredSales: damage.lostRev * avgEff,
  };
}

/**
 * Impacto en el P&L año 1. Con un plan activo se compara contra la inacción;
 * en Inacción se compara contra el mundo sin falsificación (que es el único
 * contrafactual honesto: si no se hace nada, el daño ya está en los números).
 *
 * Dos identidades sostienen la tabla, y por eso se construye así:
 *   · Inacción → Δ EBITDA = −danoPL (la tabla reexpresa la pila de daño).
 *   · Con plan → Δ EBITDA = daño evitado + recuperos − costo = beneficio
 *     acumulado a 12 meses (el mismo número que alimentan ROI y payback).
 * Para la segunda, el daño evitado de la simulación se reparte entre las líneas
 * a prorrata de su peso en `danoPL`; el factor resultante (`effAnnual`) no es la
 * media simple de la curva, porque los meses tardíos pesan más (más efectividad
 * y más daño por el crecimiento del 18 % a.a.).
 */
export function buildPL(
  i: Inputs,
  damage: DamageBreakdown,
  sim: Simulation,
  plan: Plan,
): { rows: PLRow[]; deltaEbitda: number; effAnnual: number } {
  const gm = pct(i.gm);
  const mktSpend = i.rev * MKT_PCT;
  const isInaction = plan.id === 0;

  // Mundo sin falsificación: vuelven las ventas sustituidas (a margen bruto) y
  // desaparece el descuento defensivo (que cae directo sobre la utilidad).
  const cleanRev = i.rev + damage.lostRev + damage.erosion;
  const cleanGP = (i.rev + damage.lostRev) * gm + damage.erosion;

  // Inacción: el daño completo golpea el P&L.
  const inactionRev = i.rev;
  const inactionGP = i.rev * gm;

  const effAnnual = damage.danoPL > 0 ? sim.avoided / damage.danoPL : 0;
  const recRev = damage.lostRev * effAnnual;
  const recErosion = damage.erosion * effAnnual;
  const planRev = i.rev + recRev + recErosion;
  const planGP = inactionGP + damage.lostGP * effAnnual + recErosion;
  const eff = effAnnual;

  const rows: PLRow[] = isInaction
    ? [
        { label: "Ingresos netos", base: cleanRev, scenario: inactionRev, delta: inactionRev - cleanRev, goodWhen: "higher" },
        { label: "Utilidad bruta", base: cleanGP, scenario: inactionGP, delta: inactionGP - cleanGP, goodWhen: "higher" },
        { label: "Gastos de marketing", base: mktSpend - damage.mktLeak, scenario: mktSpend, delta: damage.mktLeak, goodWhen: "lower" },
        { label: "Gastos operativos", base: 0, scenario: COSTOS_INCR, delta: COSTOS_INCR, goodWhen: "lower" },
        { label: "CLV (cuota anual)", base: 0, scenario: damage.clvYear, delta: damage.clvYear, goodWhen: "lower" },
        { label: "Gasto en protección", base: 0, scenario: 0, delta: 0, goodWhen: "lower" },
        { label: "Recuperos legales", base: 0, scenario: 0, delta: 0, goodWhen: "higher" },
      ]
    : [
        { label: "Ingresos netos", base: inactionRev, scenario: planRev, delta: planRev - inactionRev, goodWhen: "higher" },
        { label: "Utilidad bruta", base: inactionGP, scenario: planGP, delta: planGP - inactionGP, goodWhen: "higher" },
        { label: "Gastos de marketing", base: mktSpend, scenario: mktSpend - damage.mktLeak * eff, delta: -damage.mktLeak * eff, goodWhen: "lower" },
        { label: "Gastos operativos", base: COSTOS_INCR, scenario: COSTOS_INCR * (1 - eff), delta: -COSTOS_INCR * eff, goodWhen: "lower" },
        { label: "CLV (cuota anual)", base: damage.clvYear, scenario: damage.clvYear * (1 - eff), delta: -damage.clvYear * eff, goodWhen: "lower" },
        { label: "Gasto en protección", base: 0, scenario: sim.totalCost, delta: sim.totalCost, goodWhen: "lower" },
        { label: "Recuperos legales", base: 0, scenario: sim.recNet, delta: sim.recNet, goodWhen: "higher" },
      ];

  // Δ EBITDA = Δ utilidad bruta − Δ gastos (marketing, operativos, CLV,
  // protección) + Δ recuperos. Cada fila ya trae su delta con signo contable.
  const [ingresos, utilidad, mktRow, opexRow, clvRow, protRow, recRow] = rows;
  void ingresos;
  const deltaEbitda =
    utilidad.delta - mktRow.delta - opexRow.delta - clvRow.delta - protRow.delta + recRow.delta;

  rows.push({
    label: "Δ EBITDA",
    base: 0,
    scenario: deltaEbitda,
    delta: deltaEbitda,
    goodWhen: "higher",
    emphasis: true,
  });

  return { rows, deltaEbitda, effAnnual };
}

/** Punto de entrada: supuestos + escenario → todos los resultados. */
export function computeModel(inputs: Inputs, planId: PlanId): ModelResult {
  const plan = getPlan(planId);
  const damage = computeDamage(inputs);
  const legal = computeLegal(inputs);
  const sim = simulate(damage, legal, plan);
  const { rows, deltaEbitda, effAnnual } = buildPL(inputs, damage, sim, plan);

  return { inputs, plan, damage, legal, sim, pl: rows, deltaEbitda, effAnnual };
}
