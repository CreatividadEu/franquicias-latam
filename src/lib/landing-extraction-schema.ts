/**
 * Single source of truth for AI-powered landing page autofill.
 *
 * Each field declares:
 * - max: character limit for strings (used in JSON Schema + UI hints)
 * - desc: instruction for Claude on what to extract
 * - type: "string" (default) or "number"
 *
 * To add an autofillable field: add it here, and surface it in the UI diff.
 */

export type FieldSpec = {
  desc: string;
  max?: number;
  type?: "string" | "number" | "integer";
};

// ── Hero / branding ──────────────────────────────────────────────────────────
export const HERO_FIELDS = {
  name: { max: 60, desc: "Nombre comercial de la franquicia, sin sufijos legales (S.A., S.A.S., LLC)" },
  headline: { max: 80, desc: "Titular emocional H1 para la landing page. Una frase corta de propuesta de valor. NO incluir el nombre de la marca" },
  subheadline: { max: 200, desc: "Primer parrafo bajo el H1. Resume la propuesta de valor en 1-2 oraciones" },
  shortDescription: { max: 240, desc: "Descripcion corta del negocio (catalogos, listados)" },
  longDescription: { max: 1500, desc: "Descripcion larga del negocio: historia, modelo, diferenciales" },
  credibilityLine: { max: 120, desc: "Cifra o hecho diferenciador. Ej: '+45 unidades operando' o '20 anos en el mercado'" },
  foundingYear: { type: "integer" as const, desc: "Año de fundacion de la marca (4 digitos)" },
} satisfies Record<string, FieldSpec>;

// ── Financials ───────────────────────────────────────────────────────────────
export const FINANCIAL_FIELDS = {
  investmentMin: { type: "number" as const, desc: "Inversion total minima en USD (numero, sin texto). Si solo aparece en moneda local, convertir al tipo de cambio implicito del documento" },
  investmentMax: { type: "number" as const, desc: "Inversion total maxima en USD (numero, sin texto)" },
  canonEntrada: { type: "number" as const, desc: "Canon de entrada / franchise fee inicial en USD (numero)" },
  ebitdaReference: { max: 100, desc: "EBITDA de referencia. Texto corto. Ej: '18-22% sobre ventas' o 'USD 80K anuales'" },
  paybackMonths: { type: "integer" as const, desc: "Meses estimados de recuperacion de la inversion (payback)" },
  royaltyInfo: { max: 100, desc: "Regalia / royalty mensual. Texto corto. Ej: '5% sobre ventas brutas'" },
  operatorProfile: { max: 280, desc: "Perfil ideal del franquiciado / operador. 1-2 frases" },
} satisfies Record<string, FieldSpec>;

// ── Business model (per item in array) ───────────────────────────────────────
export const BUSINESS_MODEL_FIELDS = {
  name: { max: 60, desc: "Nombre del modelo o formato. Ej: 'Express', 'Mall', 'Standalone'" },
  size: { max: 60, desc: "Tamano del local. Ej: '40-60 m2'" },
  investmentMin: { type: "number" as const, desc: "Inversion minima del modelo en USD" },
  investmentMax: { type: "number" as const, desc: "Inversion maxima del modelo en USD" },
  ebitda: { max: 80, desc: "EBITDA esperado del modelo. Texto corto" },
  paybackMonths: { type: "integer" as const, desc: "Meses de payback del modelo" },
  roiAnnual: { type: "number" as const, desc: "ROI anual estimado del modelo (porcentaje, ej: 32 para 32%)" },
  description: { max: 280, desc: "Descripcion del modelo en 1-2 frases" },
} satisfies Record<string, FieldSpec>;

// ── FAQ (per item in array) ──────────────────────────────────────────────────
export const FAQ_FIELDS = {
  question: { max: 140, desc: "Pregunta frecuente del prospecto" },
  answer: { max: 600, desc: "Respuesta clara y concreta" },
} satisfies Record<string, FieldSpec>;

// ── Build JSON Schema for Claude tool input ──────────────────────────────────

function fieldsToSchema(fields: Record<string, FieldSpec>) {
  const properties: Record<string, Record<string, unknown>> = {};
  for (const [key, spec] of Object.entries(fields)) {
    const t = spec.type ?? "string";
    const prop: Record<string, unknown> = {
      type: t,
      description: spec.desc + (spec.max ? ` (max ${spec.max} caracteres)` : ""),
    };
    if (spec.max && t === "string") {
      prop.maxLength = spec.max;
    }
    properties[key] = prop;
  }
  return { type: "object", properties, additionalProperties: false };
}

export const EXTRACTION_TOOL_SCHEMA = {
  type: "object",
  properties: {
    hero: fieldsToSchema(HERO_FIELDS),
    financials: fieldsToSchema(FINANCIAL_FIELDS),
    businessModels: {
      type: "array",
      maxItems: 6,
      description: "Modelos de negocio / formatos disponibles. Solo incluir si aparecen claramente en los documentos.",
      items: fieldsToSchema(BUSINESS_MODEL_FIELDS),
    },
    faqs: {
      type: "array",
      maxItems: 8,
      description: "Preguntas frecuentes derivables de los documentos. Solo si hay informacion suficiente.",
      items: fieldsToSchema(FAQ_FIELDS),
    },
  },
  additionalProperties: false,
} as const;

// ── Type exports ─────────────────────────────────────────────────────────────

export type HeroExtraction = Partial<Record<keyof typeof HERO_FIELDS, string | number | null>>;
export type FinancialExtraction = Partial<Record<keyof typeof FINANCIAL_FIELDS, string | number | null>>;
export type BusinessModelExtraction = Partial<Record<keyof typeof BUSINESS_MODEL_FIELDS, string | number | null>>;
export type FaqExtraction = Partial<Record<keyof typeof FAQ_FIELDS, string>>;

export type ExtractionResult = {
  hero?: HeroExtraction;
  financials?: FinancialExtraction;
  businessModels?: BusinessModelExtraction[];
  faqs?: FaqExtraction[];
};

// ── Runtime validator (defensive — Claude usually respects the schema) ──────

function validateField(value: unknown, spec: FieldSpec): string | number | null | undefined {
  if (value === null || value === undefined) return undefined;
  const t = spec.type ?? "string";
  if (t === "string") {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return spec.max ? trimmed.slice(0, spec.max) : trimmed;
  }
  if (t === "number" || t === "integer") {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return undefined;
    return t === "integer" ? Math.round(n) : n;
  }
  return undefined;
}

function validateGroup(
  raw: unknown,
  fields: Record<string, FieldSpec>
): Record<string, string | number> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: Record<string, string | number> = {};
  for (const [key, spec] of Object.entries(fields)) {
    const v = validateField(input[key], spec);
    if (v !== undefined && v !== null) out[key] = v;
  }
  return out;
}

export function validateExtraction(raw: unknown): ExtractionResult {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const result: ExtractionResult = {};

  const hero = validateGroup(input.hero, HERO_FIELDS);
  if (Object.keys(hero).length) result.hero = hero;

  const financials = validateGroup(input.financials, FINANCIAL_FIELDS);
  if (Object.keys(financials).length) result.financials = financials;

  if (Array.isArray(input.businessModels)) {
    const models = input.businessModels
      .map((m) => validateGroup(m, BUSINESS_MODEL_FIELDS))
      .filter((m) => Object.keys(m).length > 0);
    if (models.length) result.businessModels = models;
  }

  if (Array.isArray(input.faqs)) {
    const faqs = input.faqs
      .map((f) => validateGroup(f, FAQ_FIELDS))
      .filter((f) => f.question && f.answer) as FaqExtraction[];
    if (faqs.length) result.faqs = faqs;
  }

  return result;
}

// ── UI helpers ──────────────────────────────────────────────────────────────

export const HERO_LABELS: Record<keyof typeof HERO_FIELDS, string> = {
  name: "Nombre",
  headline: "Titular (H1)",
  subheadline: "Subtítulo",
  shortDescription: "Descripción corta",
  longDescription: "Descripción larga",
  credibilityLine: "Línea de credibilidad",
  foundingYear: "Año fundación",
};

export const FINANCIAL_LABELS: Record<keyof typeof FINANCIAL_FIELDS, string> = {
  investmentMin: "Inversión mínima (USD)",
  investmentMax: "Inversión máxima (USD)",
  canonEntrada: "Canon entrada (USD)",
  ebitdaReference: "EBITDA referencia",
  paybackMonths: "Payback (meses)",
  royaltyInfo: "Regalía",
  operatorProfile: "Perfil operador",
};

export const BUSINESS_MODEL_LABELS: Record<keyof typeof BUSINESS_MODEL_FIELDS, string> = {
  name: "Nombre",
  size: "Tamaño",
  investmentMin: "Inversión mín (USD)",
  investmentMax: "Inversión máx (USD)",
  ebitda: "EBITDA",
  paybackMonths: "Payback (meses)",
  roiAnnual: "ROI anual (%)",
  description: "Descripción",
};
