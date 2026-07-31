/**
 * SAJÚ Command Center — dominio compartido.
 *
 * Etiquetas en español, orden canónico de las etapas y la rampa de color que
 * hilvana embudo → kanban → barras por país → drawer. La rampa se deriva del
 * teal de marca (#108474, ver src/app/saju/saju.css): claro en PROSPECTO,
 * profundo en FIRMADO. El amarillo Sajú queda reservado a acciones primarias.
 */
import type {
  SajuChannel,
  SajuEffortStatus,
  SajuEventType,
  SajuInterest,
  SajuLeadStatus,
  SajuLeadType,
  SajuMilestoneStatus,
  SajuStage,
} from "@prisma/client";

// ── Etapas ──────────────────────────────────────────────────────────────────

export const SAJU_STAGES = [
  "PROSPECTO",
  "CONTACTADO",
  "MATERIAL_ENVIADO",
  "PRESENTADO",
  "EVALUACION_INTERNA",
  "NEGOCIACION",
  "FIRMADO",
] as const satisfies readonly SajuStage[];

export const STAGE_LABEL: Record<SajuStage, string> = {
  PROSPECTO: "Prospecto",
  CONTACTADO: "Contactado",
  MATERIAL_ENVIADO: "Material enviado",
  PRESENTADO: "Presentado",
  EVALUACION_INTERNA: "Evaluación interna",
  NEGOCIACION: "Negociación",
  FIRMADO: "Firmado",
};

/** Etiqueta corta para columnas estrechas y chips. */
export const STAGE_SHORT: Record<SajuStage, string> = {
  PROSPECTO: "Prospecto",
  CONTACTADO: "Contactado",
  MATERIAL_ENVIADO: "Material",
  PRESENTADO: "Presentado",
  EVALUACION_INTERNA: "Evaluación",
  NEGOCIACION: "Negociación",
  FIRMADO: "Firmado",
};

/** Etapa a partir de la cual el lead cuenta como «avanzado». */
export const ADVANCED_STAGE: SajuStage = "EVALUACION_INTERNA";

export function stageIndex(stage: SajuStage): number {
  return SAJU_STAGES.indexOf(stage);
}

/** Posición 1–7 (la que se muestra como «avance promedio»). */
export function stagePosition(stage: SajuStage): number {
  return stageIndex(stage) + 1;
}

export function isAdvancedStage(stage: SajuStage): boolean {
  return stageIndex(stage) >= stageIndex(ADVANCED_STAGE);
}

/**
 * Rampa semántica de etapa. `bg`/`fg` para chips y cabeceras; `solid` para
 * embudo, barras apiladas y puntos. Un único color por etapa, idéntico en
 * todas las superficies del dashboard.
 */
export type StageColor = { bg: string; fg: string; solid: string; border: string };

export const STAGE_COLOR: Record<SajuStage, StageColor> = {
  PROSPECTO: { bg: "#EAF3F1", fg: "#134E45", solid: "#CFE5E0", border: "#D5E7E3" },
  CONTACTADO: { bg: "#D8EBE6", fg: "#124A42", solid: "#A9D3CB", border: "#BFDFD8" },
  MATERIAL_ENVIADO: { bg: "#BFE0D9", fg: "#0F443C", solid: "#7FBFB4", border: "#A5D2C9" },
  PRESENTADO: { bg: "#9CCFC5", fg: "#0C3B34", solid: "#4FA79A", border: "#84C1B5" },
  EVALUACION_INTERNA: { bg: "#2E9689", fg: "#FFFFFF", solid: "#2E9689", border: "#2E9689" },
  NEGOCIACION: { bg: "#108474", fg: "#FFFFFF", solid: "#108474", border: "#108474" },
  FIRMADO: { bg: "#0A5A50", fg: "#FFFFFF", solid: "#0A5A50", border: "#0A5A50" },
};

// ── Tipo, estado, interés ───────────────────────────────────────────────────

export const SAJU_LEAD_TYPES = [
  "PUNTO_UNICO",
  "MULTI_UNIDAD",
  "MASTER_FRANQUICIA",
] as const satisfies readonly SajuLeadType[];

export const TYPE_LABEL: Record<SajuLeadType, string> = {
  PUNTO_UNICO: "Punto único",
  MULTI_UNIDAD: "Multi-unidad",
  MASTER_FRANQUICIA: "Máster",
};

export const SAJU_LEAD_STATUSES = [
  "ACTIVO",
  "PAUSADO",
  "GANADO",
  "PERDIDO",
] as const satisfies readonly SajuLeadStatus[];

export const STATUS_LABEL: Record<SajuLeadStatus, string> = {
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export const SAJU_INTERESTS = ["ALTO", "MEDIO", "BAJO"] as const satisfies readonly SajuInterest[];

export const INTEREST_LABEL: Record<SajuInterest, string> = {
  ALTO: "Interés alto",
  MEDIO: "Interés medio",
  BAJO: "Interés bajo",
};

/** El punto de interés usa el amarillo de marca solo en ALTO. */
export const INTEREST_COLOR: Record<SajuInterest, string> = {
  ALTO: "#E0B500",
  MEDIO: "#8A8A8A",
  BAJO: "#C9C9C9",
};

export function interestWeight(interest: SajuInterest): number {
  return interest === "ALTO" ? 2 : interest === "MEDIO" ? 1 : 0;
}

// ── Canales ─────────────────────────────────────────────────────────────────

/** Canales con tablero propio. LANDING_FORM es solo origen de lead. */
export const SAJU_BOARD_CHANNELS = [
  "OUTREACH_SELECTIVO",
  "PR",
  "REELS_ADS",
  "LINKEDIN",
] as const satisfies readonly SajuChannel[];

export const SAJU_CHANNELS = [
  ...SAJU_BOARD_CHANNELS,
  "LANDING_FORM",
] as const satisfies readonly SajuChannel[];

export const CHANNEL_LABEL: Record<SajuChannel, string> = {
  OUTREACH_SELECTIVO: "Outreach selectivo",
  PR: "PR",
  REELS_ADS: "Reels / Ads",
  LINKEDIN: "LinkedIn",
  LANDING_FORM: "Formulario landing",
};

export const EFFORT_STATUSES = [
  "PLANEADO",
  "EN_CURSO",
  "COMPLETADO",
] as const satisfies readonly SajuEffortStatus[];

export const EFFORT_STATUS_LABEL: Record<SajuEffortStatus, string> = {
  PLANEADO: "Planeado",
  EN_CURSO: "En curso",
  COMPLETADO: "Completado",
};

// ── Eventos e hitos ─────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  "NOTA",
  "TOUCHPOINT",
  "CAMBIO_ETAPA",
  "REUNION",
] as const satisfies readonly SajuEventType[];

export const EVENT_LABEL: Record<SajuEventType, string> = {
  NOTA: "Nota",
  TOUCHPOINT: "Touchpoint",
  CAMBIO_ETAPA: "Cambio de etapa",
  REUNION: "Reunión",
};

export const MILESTONE_STATUSES = [
  "PROXIMO",
  "REALIZADO",
  "REPROGRAMADO",
] as const satisfies readonly SajuMilestoneStatus[];

export const MILESTONE_STATUS_LABEL: Record<SajuMilestoneStatus, string> = {
  PROXIMO: "Próximo",
  REALIZADO: "Realizado",
  REPROGRAMADO: "Reprogramado",
};

// ── Países ──────────────────────────────────────────────────────────────────

export type SajuCountryMeta = { code: string; name: string; flag: string };

/** Código sentinela: lead sin país definido (p. ej. «Otro» en el formulario). */
export const UNKNOWN_COUNTRY = "XX";

/** Países del plan de expansión. `countryMeta` degrada a genérico si aparece otro. */
export const SAJU_COUNTRIES: SajuCountryMeta[] = [
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: UNKNOWN_COUNTRY, name: "Por definir", flag: "🏳️" },
];

const COUNTRY_BY_CODE = new Map(SAJU_COUNTRIES.map((c) => [c.code, c]));

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const COUNTRY_BY_NAME = new Map(SAJU_COUNTRIES.map((c) => [normalizeName(c.name), c.code]));

/**
 * Resuelve el nombre de país que envía el formulario del landing (en español)
 * a ISO alpha-2. Lo que no se reconoce — «Otro», texto libre — cae en XX para
 * que el lead entre igualmente al pipeline y el equipo lo corrija a mano.
 */
export function countryCodeFromName(value: string | null | undefined): string {
  if (!value) return UNKNOWN_COUNTRY;
  const normalized = normalizeName(value);
  if (/^[a-z]{2}$/.test(normalized) && COUNTRY_BY_CODE.has(normalized.toUpperCase())) {
    return normalized.toUpperCase();
  }
  return COUNTRY_BY_NAME.get(normalized) ?? UNKNOWN_COUNTRY;
}

/** Convierte un ISO alpha-2 en emoji de bandera (regional indicators). */
function flagFromCode(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}

export function countryMeta(code: string): SajuCountryMeta {
  const normalized = code.trim().toUpperCase();
  return (
    COUNTRY_BY_CODE.get(normalized) ?? {
      code: normalized,
      name: normalized,
      flag: flagFromCode(normalized),
    }
  );
}

// ── Genéricos ───────────────────────────────────────────────────────────────

/** Type guard para leer enums desde searchParams / FormData sin `any`. */
export function isMember<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}
