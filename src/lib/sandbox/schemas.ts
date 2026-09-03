/**
 * Esquemas zod del Sandbox: la forma canónica de `SandboxPreload` (§3) y de
 * las salidas de IA que alimentan `SandboxResult` (§4). Se validan al escribir
 * (pipeline admin, M2) y al leer (ruta pública), así el cliente nunca recibe
 * JSON malformado. Ningún array lleva `.max()`: los topes (8 dolores, 4
 * fortalezas, 3 ideas) se aplican al normalizar, no rechazando el documento.
 */
import { z } from "zod";

// ── Comunes ──────────────────────────────────────────────────────────────────

export const confidenceSchema = z.enum(["low", "med", "high"]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const dataSourceSchema = z.enum(["doc", "benchmark", "fallback"]);

// ── 3a. Oferta (menú / catálogo / servicios) ─────────────────────────────────

export const offeringComponentSchema = z.object({
  name: z.string().min(1),
  estCost: z.number().nonnegative().default(0),
});

export const offeringItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default(""),
  price: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
  estimatedCogs: z.number().nonnegative().default(0),
  cogsConfidence: confidenceSchema.default("low"),
  /** Restaurante: ingredientes · retail: SKUs/componentes · servicios: horas + insumos. */
  ingredients: z.array(offeringComponentSchema).default([]),
  isHero: z.boolean().default(false),
  heroReason: z.string().default(""),
  /** §6: todo número generado va etiquetado como estimado. */
  estimate: z.boolean().default(true),
});

export const offeringSchema = z.object({
  items: z.array(offeringItemSchema).default([]),
  topByMargin: z.array(z.string()).default([]),
  topByPopularityGuess: z.array(z.string()).default([]),
  notes: z.string().default(""),
  source: dataSourceSchema.default("doc"),
});

export type OfferingItem = z.infer<typeof offeringItemSchema>;
export type OfferingData = z.infer<typeof offeringSchema>;

// ── 3b. OSINT → dolores y fortalezas ─────────────────────────────────────────

export const painAreaSchema = z.enum([
  "servicio",
  "producto",
  "tiempos",
  "limpieza",
  "ventas",
  "equipo",
  "comunicación",
]);
export const painSourceSchema = z.enum([
  "google_reviews",
  "instagram",
  "site_visit",
  "other",
]);

export const painSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Cita textual (reseña, comentario). */
  evidence: z.string().default(""),
  source: painSourceSchema.default("other"),
  area: painAreaSchema.default("servicio"),
  severity: z.number().int().min(1).max(5).default(3),
  /** Palanca propuesta, una frase. */
  lever: z.string().default(""),
  /** Nombre del manual / proceso que lo resuelve. */
  standardTitle: z.string().default(""),
});

export const strengthSchema = z.object({
  title: z.string().min(1),
  evidence: z.string().default(""),
});

export const painsSchema = z.object({
  pains: z.array(painSchema).default([]),
  strengths: z.array(strengthSchema).default([]),
  source: dataSourceSchema.default("doc"),
});

export type PainItem = z.infer<typeof painSchema>;
export type PainsData = z.infer<typeof painsSchema>;

export const MAX_PAINS = 8;
export const MAX_STRENGTHS = 4;

// ── 3c. Auditoría de marketing ───────────────────────────────────────────────

export const MARKETING_AXES = [
  "marca",
  "contenido",
  "conversión",
  "presencia_local",
  "atracción_franquiciados",
] as const;
export type MarketingAxis = (typeof MARKETING_AXES)[number];

export const marketingScoreSchema = z.object({
  score: z.number().min(0).max(100),
  evidence: z.string().default(""),
  quickWin: z.string().default(""),
  estimate: z.boolean().default(true),
});

export const marketingIdeaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  channel: z.string().default(""),
  hook: z.string().default(""),
  /** Plato / producto héroe involucrado (id o nombre). */
  heroItem: z.string().default(""),
  metric: z.string().default(""),
});

export const marketingInputsSchema = z.object({
  instagramHandle: z.string().default(""),
  followers: z.number().nonnegative().default(0),
  postingCadence: z.string().default(""),
  hasWebsite: z.boolean().default(false),
  googleRating: z.number().min(0).max(5).nullable().default(null),
  adSpendGuess: z.number().nonnegative().default(0),
});

export const marketingSchema = z.object({
  scores: z.object({
    marca: marketingScoreSchema,
    contenido: marketingScoreSchema,
    conversión: marketingScoreSchema,
    presencia_local: marketingScoreSchema,
    atracción_franquiciados: marketingScoreSchema,
  }),
  ideas: z.array(marketingIdeaSchema).default([]),
  inputs: marketingInputsSchema.partial().optional(),
  source: dataSourceSchema.default("doc"),
});

export type MarketingData = z.infer<typeof marketingSchema>;
export type MarketingIdea = z.infer<typeof marketingIdeaSchema>;
export type MarketingInputs = z.infer<typeof marketingInputsSchema>;

export const MAX_IDEAS = 3;

// ── 3d. Esqueleto OPEX ───────────────────────────────────────────────────────

export const OPEX_KEYS = ["rent", "payroll", "utilities", "marketing", "other"] as const;
export type OpexKey = (typeof OPEX_KEYS)[number];

export const opexLineSchema = z.object({
  key: z.enum(OPEX_KEYS),
  label: z.string().default(""),
  /** Valor mensual en la moneda del esqueleto. */
  value: z.number().nonnegative().default(0),
  confidence: confidenceSchema.default("low"),
  source: z.enum(["doc", "benchmark"]).default("benchmark"),
  estimate: z.boolean().default(true),
});

export const opexSkeletonSchema = z.object({
  currency: z.string().default("USD"),
  monthlySalesEstimate: z.number().nonnegative().nullable().default(null),
  lines: z.array(opexLineSchema).default([]),
  notes: z.string().default(""),
  source: dataSourceSchema.default("benchmark"),
});

export type OpexSkeleton = z.infer<typeof opexSkeletonSchema>;

// ── Preload completo ─────────────────────────────────────────────────────────

export const sandboxPreloadSchema = z.object({
  offering: offeringSchema,
  pains: painsSchema,
  marketing: marketingSchema,
  opexSkeleton: opexSkeletonSchema,
});

export type SandboxPreloadData = z.infer<typeof sandboxPreloadSchema>;

/** Aplica los topes de §3 sin rechazar el documento. */
export function capPreload(data: SandboxPreloadData): SandboxPreloadData {
  return {
    ...data,
    pains: {
      ...data.pains,
      pains: data.pains.pains.slice(0, MAX_PAINS),
      strengths: data.pains.strengths.slice(0, MAX_STRENGTHS),
    },
    marketing: {
      ...data.marketing,
      ideas: data.marketing.ideas.slice(0, MAX_IDEAS),
    },
  };
}

// ── 4.1 Estrategia — salida de IA y take-home ────────────────────────────────

export const READINESS_AXES = ["operaciones", "finanzas", "marca", "equipo", "modelo"] as const;
export type ReadinessAxis = (typeof READINESS_AXES)[number];

export const readinessScoresSchema = z.object({
  operaciones: z.number().min(0).max(100),
  finanzas: z.number().min(0).max(100),
  marca: z.number().min(0).max(100),
  equipo: z.number().min(0).max(100),
  modelo: z.number().min(0).max(100),
});
export type ReadinessScores = z.infer<typeof readinessScoresSchema>;

export const growthModelSchema = z.enum([
  "franquicia_clásica",
  "master_franquicia",
  "licencia",
  "corners",
  "dark_kitchen",
  "sucursales_propias",
  "mixto",
]);
export type GrowthModel = z.infer<typeof growthModelSchema>;

export const routeMilestoneSchema = z.object({
  year: z.number().int(),
  milestone: z.string(),
});
export type RouteMilestone = z.infer<typeof routeMilestoneSchema>;

export const strategyOutputSchema = z.object({
  readiness: readinessScoresSchema,
  bestModel: growthModelSchema,
  modelWhy: z.string().default(""),
  route: z.array(routeMilestoneSchema).default([]),
  unexpectedInsight: z.string().default(""),
});
export type StrategyOutput = z.infer<typeof strategyOutputSchema>;
