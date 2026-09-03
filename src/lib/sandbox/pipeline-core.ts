/**
 * Núcleo PURO del preload (§3): fusiona lo extraído por Claude de cada asset,
 * elige los ítems héroe, puntúa marketing desde el quick-form y arma el OPEX.
 * Sin Prisma, sin red: se prueba en tests/sandbox-pipeline.test.ts.
 */
import {
  MAX_IDEAS,
  MAX_PAINS,
  MAX_STRENGTHS,
  capPreload,
  sandboxPreloadSchema,
  type MarketingData,
  type MarketingIdea,
  type MarketingInputs,
  type OfferingData,
  type OfferingItem,
  type OpexSkeleton,
  type PainItem,
  type PainsData,
  type SandboxPreloadData,
} from "./schemas";
import type { AiIdeas, AiMarketingAudit, AiOffering, AiOpex, AiPains } from "./prompts";
import {
  FALLBACK_OFFERING_NOTE,
  OPEX_LABELS,
  benchmarkMonthlySalesUsd,
  benchmarkOpexLines,
  fallbackIdeas,
  fallbackOfferingItems,
  fallbackPains,
} from "./fallbacks";
import type { SandboxSectorId } from "./types";

// ── Utilidades ───────────────────────────────────────────────────────────────

export function slugifyId(name: string, index: number): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "item";
  return `${base}-${index + 1}`;
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round2 = (value: number) => Math.round(value * 100) / 100;

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

// ── 3a. Oferta ───────────────────────────────────────────────────────────────

export const HERO_COUNT = 3;
export const MAX_OFFERING_ITEMS = 60;

export function contributionMargin(item: Pick<OfferingItem, "price" | "estimatedCogs">): number {
  return item.price - item.estimatedCogs;
}

/** Ítems de un extracto de IA → dominio (ids, estimate, ingredientes). */
export function offeringItemsFromAi(record: AiOffering): OfferingItem[] {
  const currency = (record.currency || "USD").toUpperCase().slice(0, 3);
  return record.items
    .filter((item) => item.name.trim().length > 0)
    .map((item, i) => ({
      id: slugifyId(item.name, i),
      name: item.name.trim(),
      category: item.category.trim(),
      price: round2(nonNegative(item.price)),
      currency,
      estimatedCogs: round2(nonNegative(item.estimatedCogs)),
      cogsConfidence: item.cogsConfidence,
      ingredients: item.components
        .filter((c) => c.name.trim().length > 0)
        .map((c) => ({ name: c.name.trim(), estCost: round2(nonNegative(c.estCost)) })),
      isHero: false,
      heroReason: "",
      estimate: true,
    }));
}

/**
 * Marca los 3 héroes = mayor margen de contribución estimado (precio − costo),
 * y arma topByMargin (5) y topByPopularityGuess (3).
 */
export function assignHeroes(
  items: OfferingItem[],
  popularityHints: Map<string, "high" | "med" | "low"> = new Map(),
): Pick<OfferingData, "items" | "topByMargin" | "topByPopularityGuess"> {
  const priced = items.filter((i) => i.price > 0);
  const byMargin = [...priced].sort((a, b) => contributionMargin(b) - contributionMargin(a));
  const heroIds = new Set(byMargin.slice(0, HERO_COUNT).map((i) => i.id));

  const withHeroes = items.map((item) => {
    const hero = heroIds.has(item.id);
    return {
      ...item,
      isHero: hero,
      heroReason: hero
        ? item.heroReason || `Margen de contribución estimado: ${round2(contributionMargin(item))} ${item.currency}`
        : "",
    };
  });

  const popular = items.filter((i) => popularityHints.get(i.id) === "high").map((i) => i.id);
  const topByPopularityGuess = (popular.length ? popular : withHeroes.map((i) => i.id)).slice(0, 3);

  return {
    items: withHeroes,
    topByMargin: byMargin.slice(0, 5).map((i) => i.id),
    topByPopularityGuess,
  };
}

/** Fusiona varios extractos (menú + lista de precios…), dedupe por nombre. */
export function buildOffering(records: AiOffering[], sector: SandboxSectorId): OfferingData {
  const merged: OfferingItem[] = [];
  const seen = new Set<string>();
  const hints = new Map<string, "high" | "med" | "low">();
  const notes: string[] = [];
  const currencies = new Map<string, number>();

  records.forEach((record, r) => {
    const items = offeringItemsFromAi(record);
    if (record.notes.trim()) notes.push(record.notes.trim());
    items.forEach((item, i) => {
      const key = normalizeName(item.name);
      if (!key || seen.has(key)) return;
      seen.add(key);
      const withUniqueId = { ...item, id: slugifyId(item.name, merged.length) };
      merged.push(withUniqueId);
      hints.set(withUniqueId.id, record.items[i]?.popularityGuess ?? "med");
      currencies.set(item.currency, (currencies.get(item.currency) ?? 0) + 1);
      void r;
    });
  });

  if (merged.length === 0) {
    const items = fallbackOfferingItems(sector);
    const heroes = assignHeroes(items, new Map(items.map((i, idx) => [i.id, idx < 2 ? "high" : "med"] as const)));
    return { currency: "USD", ...heroes, notes: FALLBACK_OFFERING_NOTE, source: "fallback" };
  }

  const dominantCurrency = [...currencies.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";
  const capped = merged.slice(0, MAX_OFFERING_ITEMS);
  const heroes = assignHeroes(capped, hints);
  return {
    currency: dominantCurrency,
    ...heroes,
    notes: notes.join(" ").slice(0, 600),
    source: "doc",
  };
}

// ── 3b. Dolores ──────────────────────────────────────────────────────────────

export function buildPains(records: AiPains[], sector: SandboxSectorId): PainsData {
  const pains: PainItem[] = [];
  const strengths: PainsData["strengths"] = [];
  const seenPains = new Set<string>();
  const seenStrengths = new Set<string>();

  for (const record of records) {
    for (const pain of record.pains) {
      const key = normalizeName(pain.title);
      if (!key || seenPains.has(key)) continue;
      seenPains.add(key);
      pains.push({
        id: slugifyId(pain.title, pains.length),
        title: pain.title.trim(),
        evidence: pain.evidence.trim().slice(0, 240),
        source: pain.source,
        area: pain.area,
        severity: clamp(Math.round(pain.severity), 1, 5),
        lever: pain.lever.trim(),
        standardTitle: pain.standardTitle.trim(),
      });
    }
    for (const strength of record.strengths) {
      const key = normalizeName(strength.title);
      if (!key || seenStrengths.has(key)) continue;
      seenStrengths.add(key);
      strengths.push({ title: strength.title.trim(), evidence: strength.evidence.trim().slice(0, 240) });
    }
  }

  if (pains.length === 0) {
    return { pains: fallbackPains(sector), strengths: strengths.slice(0, MAX_STRENGTHS), source: "fallback" };
  }

  pains.sort((a, b) => b.severity - a.severity);
  return { pains: pains.slice(0, MAX_PAINS), strengths: strengths.slice(0, MAX_STRENGTHS), source: "doc" };
}

// ── 3c. Marketing ────────────────────────────────────────────────────────────

const CADENCE_SCORE: Record<MarketingInputs["postingCadence"], number> = {
  diaria: 85,
  semanal: 65,
  quincenal: 45,
  esporadica: 25,
  ninguna: 10,
};

const CADENCE_LABEL: Record<MarketingInputs["postingCadence"], string> = {
  diaria: "publica a diario",
  semanal: "publica cada semana",
  quincenal: "publica cada dos semanas",
  esporadica: "publica de forma esporádica",
  ninguna: "no publica",
};

export const DEFAULT_MARKETING_INPUTS: MarketingInputs = {
  instagramHandle: "",
  followers: 0,
  postingCadence: "esporadica",
  hasWebsite: false,
  googleRating: null,
  adSpendGuess: 0,
};

function followersTier(followers: number): number {
  if (followers >= 50_000) return 15;
  if (followers >= 10_000) return 10;
  if (followers >= 2_000) return 5;
  return 0;
}

function ratingScore(rating: number | null): number {
  if (rating === null) return 20;
  if (rating >= 4.5) return 85;
  if (rating >= 4) return 70;
  if (rating >= 3.5) return 50;
  return 35;
}

function formatFollowers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K seguidores`;
  return n > 0 ? `${n} seguidores` : "sin cuenta activa";
}

/** Puntuación determinista desde el quick-form (sin IA, siempre disponible). */
export function marketingFromInputs(partial: Partial<MarketingInputs> | null | undefined): MarketingData["scores"] {
  const inputs: MarketingInputs = { ...DEFAULT_MARKETING_INPUTS, ...(partial ?? {}) };
  const handle = inputs.instagramHandle.trim();
  const followers = nonNegative(inputs.followers);
  const rating = inputs.googleRating;
  const ads = nonNegative(inputs.adSpendGuess);

  const marca = clamp(
    40 + (inputs.hasWebsite ? 15 : 0) + (handle ? 10 : 0) + (rating !== null ? (rating >= 4.5 ? 20 : rating >= 4 ? 12 : rating >= 3.5 ? 5 : 0) : 0) + followersTier(followers),
    0,
    100,
  );
  const contenido = clamp(CADENCE_SCORE[inputs.postingCadence] + Math.round(followersTier(followers) / 2), 0, 100);
  const conversion = clamp((inputs.hasWebsite ? 45 : 15) + (ads >= 500 ? 30 : ads > 0 ? 20 : 0) + (handle ? 10 : 0), 0, 100);
  const presencia = clamp(ratingScore(rating) + (inputs.hasWebsite ? 5 : 0) + (followers >= 2_000 ? 5 : 0), 0, 100);
  const atraccion = clamp(Math.round(0.35 * marca + 0.25 * conversion + 0.2 * contenido + 0.2 * presencia) - 10, 0, 100);

  const igLine = handle ? `@${handle.replace(/^@/, "")}: ${formatFollowers(followers)}, ${CADENCE_LABEL[inputs.postingCadence]}` : `Sin Instagram activo (${CADENCE_LABEL[inputs.postingCadence]})`;
  const webLine = inputs.hasWebsite ? "Tiene sitio web" : "No tiene sitio web";
  const ratingLine = rating !== null ? `Google Business: ${rating.toFixed(1)} estrellas` : "Sin ficha de Google Business conocida";
  const adsLine = ads > 0 ? `Pauta estimada: ${Math.round(ads)} USD/mes` : "Sin pauta paga";

  const score = (value: number, evidence: string, quickWin: string) => ({ score: value, evidence, quickWin, estimate: true as const });

  return {
    marca: score(marca, `${webLine}. ${igLine}.`, inputs.hasWebsite ? "Unificar logo, colores y bio en todas las redes en una tarde." : "Landing de una página con menú, mapa y WhatsApp."),
    contenido: score(contenido, igLine, inputs.postingCadence === "diaria" ? "Fijar tres formatos repetibles: proceso, equipo y cliente." : "Calendario de 2 publicaciones por semana con el plato/producto héroe."),
    conversión: score(conversion, `${webLine}. ${adsLine}.`, inputs.hasWebsite ? "Botón de WhatsApp y pedido en cada publicación." : "Link en bio hacia WhatsApp con mensaje prellenado."),
    presencia_local: score(presencia, ratingLine, rating !== null && rating >= 4.5 ? "Responder todas las reseñas en 24 h con el nombre del cliente." : "QR de reseña en la mesa o el mostrador y meta de 20 reseñas nuevas al mes."),
    atracción_franquiciados: score(atraccion, "Todavía no existe una ficha pública para inversionistas.", "Activar la ficha de la marca en el marketplace de Franquicias LATAM."),
  };
}

function scoresFromAudit(audit: AiMarketingAudit): MarketingData["scores"] {
  const axis = (a: AiMarketingAudit["scores"]["marca"]) => ({
    score: clamp(Math.round(a.score), 0, 100),
    evidence: a.evidence.trim().slice(0, 200),
    quickWin: a.quickWin.trim().slice(0, 200),
    estimate: true as const,
  });
  return {
    marca: axis(audit.scores.marca),
    contenido: axis(audit.scores.contenido),
    conversión: axis(audit.scores.conversion),
    presencia_local: axis(audit.scores.presencia_local),
    atracción_franquiciados: axis(audit.scores.atraccion_franquiciados),
  };
}

function inputsFromAudit(audit: AiMarketingAudit): Partial<MarketingInputs> {
  const out: Partial<MarketingInputs> = {};
  const i = audit.inputs;
  if (i.instagramHandle) out.instagramHandle = i.instagramHandle;
  if (typeof i.followers === "number") out.followers = nonNegative(i.followers);
  if (i.postingCadence) out.postingCadence = i.postingCadence;
  if (typeof i.hasWebsite === "boolean") out.hasWebsite = i.hasWebsite;
  if (typeof i.googleRating === "number") out.googleRating = clamp(i.googleRating, 0, 5);
  if (typeof i.adSpendGuess === "number") out.adSpendGuess = nonNegative(i.adSpendGuess);
  return out;
}

export function ideasFromAi(record: AiIdeas | null, brandName: string, heroItems: string[]): MarketingIdea[] {
  const ideas = (record?.ideas ?? [])
    .filter((i) => i.title.trim().length > 0)
    .slice(0, MAX_IDEAS)
    .map((i, idx) => ({
      id: `idea-${idx + 1}`,
      title: i.title.trim().slice(0, 80),
      channel: i.channel.trim().slice(0, 60),
      hook: i.hook.trim().slice(0, 200),
      heroItem: i.heroItem.trim().slice(0, 80),
      metric: i.metric.trim().slice(0, 120),
    }));
  return ideas.length >= 1 ? ideas : fallbackIdeas(brandName, heroItems);
}

/**
 * Auditoría cargada → puntajes de IA (source doc); si no, quick-form
 * (source inputs); sin nada → defaults (source fallback).
 */
export function buildMarketing(
  audits: AiMarketingAudit[],
  inputs: Partial<MarketingInputs> | null,
  ideas: MarketingIdea[],
): MarketingData {
  const audit = audits[0] ?? null;
  const hasInputs = Boolean(inputs && Object.keys(inputs).length > 0);
  if (audit) {
    return {
      scores: scoresFromAudit(audit),
      ideas,
      inputs: { ...inputsFromAudit(audit), ...(inputs ?? {}) },
      source: "doc",
    };
  }
  return {
    scores: marketingFromInputs(inputs),
    ideas,
    inputs: hasInputs ? { ...inputs } : undefined,
    source: hasInputs ? "inputs" : "fallback",
  };
}

// ── 3d. OPEX ─────────────────────────────────────────────────────────────────

/**
 * Líneas del documento primero; las que falten se rellenan con benchmark del
 * sector sobre las ventas (del documento o de referencia por país).
 */
export function buildOpex(records: AiOpex[], sector: SandboxSectorId, countryText: string | null, offeringCurrency: string): OpexSkeleton {
  const docLines = new Map<string, OpexSkeleton["lines"][number]>();
  let monthlySales: number | null = null;
  let currency: string | null = null;
  const notes: string[] = [];

  for (const record of records) {
    if (!currency && record.currency) currency = record.currency.toUpperCase().slice(0, 3);
    if (monthlySales === null && typeof record.monthlySales === "number" && record.monthlySales > 0) {
      monthlySales = Math.round(record.monthlySales);
    }
    if (record.notes.trim()) notes.push(record.notes.trim());
    for (const line of record.lines) {
      if (docLines.has(line.key) || !(line.monthlyValue > 0)) continue;
      docLines.set(line.key, {
        key: line.key,
        label: line.label.trim() || OPEX_LABELS[line.key],
        value: Math.round(line.monthlyValue),
        confidence: line.confidence,
        source: "doc",
        estimate: line.confidence !== "high",
      });
    }
  }

  const hasDoc = docLines.size > 0 || monthlySales !== null;
  const resolvedCurrency = currency ?? (hasDoc ? offeringCurrency : "USD");
  // Benchmark sobre ventas del documento si existen; si no, referencia USD por país.
  const salesForBenchmark = monthlySales ?? benchmarkMonthlySalesUsd(sector, countryText);
  const benchmark = benchmarkOpexLines(sector, salesForBenchmark);
  const lines = benchmark.map((b) => docLines.get(b.key) ?? { ...b, label: OPEX_LABELS[b.key] });

  if (!hasDoc) {
    notes.push(`Sin notas de gastos: OPEX de referencia del sector sobre ventas estimadas de ${salesForBenchmark} USD/mes para ${countryText ?? "LATAM"}.`);
  } else if (docLines.size < benchmark.length) {
    notes.push("Las líneas sin dato en el documento se completaron con benchmark del sector.");
  }

  return {
    currency: hasDoc ? resolvedCurrency : "USD",
    monthlySalesEstimate: monthlySales ?? (hasDoc ? null : salesForBenchmark),
    lines,
    notes: notes.join(" ").slice(0, 600),
    source: hasDoc ? "doc" : "benchmark",
  };
}

// ── Ensamble ─────────────────────────────────────────────────────────────────

export function assemblePreload(parts: {
  offering: OfferingData;
  pains: PainsData;
  marketing: MarketingData;
  opexSkeleton: OpexSkeleton;
}): SandboxPreloadData {
  const parsed = sandboxPreloadSchema.parse(parts);
  return capPreload(parsed);
}

export function heroItemNames(offering: OfferingData): string[] {
  return offering.items.filter((i) => i.isHero).map((i) => i.name);
}
