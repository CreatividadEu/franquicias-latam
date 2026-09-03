import test from "node:test";
import assert from "node:assert/strict";
import {
  assemblePreload,
  assignHeroes,
  buildMarketing,
  buildOffering,
  buildOpex,
  buildPains,
  heroItemNames,
  ideasFromAi,
  marketingFromInputs,
  offeringItemsFromAi,
  slugifyId,
} from "../src/lib/sandbox/pipeline-core";
import { countryCodeFromText, benchmarkMonthlySalesUsd, fallbackPains } from "../src/lib/sandbox/fallbacks";
import { hashInputs, stripFences, tryParseJson } from "../src/lib/sandbox/ai";
import type { AiOffering, AiPains, AiMarketingAudit, AiOpex } from "../src/lib/sandbox/prompts";

const menu: AiOffering = {
  currency: "cop",
  notes: "Costos estimados con food cost del 32 %.",
  items: [
    { name: "Pollo a la brasa entero", category: "Fuertes", price: 42000, estimatedCogs: 14000, cogsConfidence: "med", components: [{ name: "Pollo", estCost: 11000 }, { name: "Papa", estCost: 2000 }, { name: "Salsas", estCost: 1000 }], popularityGuess: "high" },
    { name: "Medio pollo", category: "Fuertes", price: 24000, estimatedCogs: 7500, cogsConfidence: "med", components: [{ name: "Pollo", estCost: 5500 }, { name: "Papa", estCost: 2000 }], popularityGuess: "high" },
    { name: "Arepa con queso", category: "Adicionales", price: 4000, estimatedCogs: 1800, cogsConfidence: "low", components: [{ name: "Arepa", estCost: 1000 }, { name: "Queso", estCost: 800 }], popularityGuess: "med" },
    { name: "Gaseosa", category: "Bebidas", price: 4000, estimatedCogs: 1600, cogsConfidence: "high", components: [{ name: "Gaseosa", estCost: 1600 }], popularityGuess: "high" },
    { name: "Costillas BBQ", category: "Fuertes", price: 38000, estimatedCogs: 15000, cogsConfidence: "low", components: [{ name: "Costilla", estCost: 13000 }], popularityGuess: "low" },
    { name: "Sin precio", category: "Otros", price: 0, estimatedCogs: 0, cogsConfidence: "low", components: [], popularityGuess: "low" },
  ],
};

test("offeringItemsFromAi genera ids, moneda y etiqueta estimate", () => {
  const items = offeringItemsFromAi(menu);
  assert.equal(items.length, 6);
  assert.equal(items[0].id, "pollo-a-la-brasa-entero-1");
  assert.equal(items[0].currency, "COP");
  assert.ok(items.every((i) => i.estimate === true));
  assert.equal(items[0].ingredients.length, 3);
});

test("assignHeroes elige los 3 de mayor margen y arma topByMargin", () => {
  const items = offeringItemsFromAi(menu);
  const { items: withHeroes, topByMargin, topByPopularityGuess } = assignHeroes(items, new Map([[items[3].id, "high"]]));
  const heroes = withHeroes.filter((i) => i.isHero).map((i) => i.name);
  assert.deepEqual(heroes, ["Pollo a la brasa entero", "Medio pollo", "Costillas BBQ"]);
  assert.equal(topByMargin[0], "pollo-a-la-brasa-entero-1");
  assert.equal(topByMargin.length, 5, "el ítem sin precio queda fuera del ranking");
  assert.deepEqual(topByPopularityGuess, [items[3].id]);
  assert.ok(withHeroes[0].heroReason.includes("Margen"));
  assert.ok(!withHeroes.find((i) => i.name === "Sin precio")?.isHero);
});

test("buildOffering fusiona documentos, dedupe por nombre y detecta la moneda dominante", () => {
  const priceList: AiOffering = {
    currency: "COP",
    notes: "",
    items: [
      { name: "POLLO A LA BRASA ENTERO", category: "", price: 43000, estimatedCogs: 14000, cogsConfidence: "high", components: [], popularityGuess: "high" },
      { name: "Jugo natural", category: "Bebidas", price: 6000, estimatedCogs: 1500, cogsConfidence: "med", components: [], popularityGuess: "med" },
    ],
  };
  const offering = buildOffering([menu, priceList], "restaurante");
  assert.equal(offering.source, "doc");
  assert.equal(offering.currency, "COP");
  assert.equal(offering.items.length, 7, "el pollo repetido no se duplica");
  assert.equal(offering.items.filter((i) => i.isHero).length, 3);
  assert.ok(offering.notes.includes("food cost"));
});

test("buildOffering sin documentos cae a los ítems genéricos del sector", () => {
  const offering = buildOffering([], "retail");
  assert.equal(offering.source, "fallback");
  assert.equal(offering.items.length, 6);
  assert.equal(offering.items.filter((i) => i.isHero).length, 3);
  assert.ok(offering.items.every((i) => i.estimate && i.cogsConfidence === "low"));
  assert.ok(offering.notes.length > 0);
});

test("buildPains ordena por severidad, limita a 8 y dedupe", () => {
  const record: AiPains = {
    pains: Array.from({ length: 11 }, (_, i) => ({
      title: i === 10 ? "Demoras en hora pico" : `Dolor ${i}`,
      evidence: i === 0 ? "Esperamos 40 minutos por el pedido" : "",
      source: "google_reviews" as const,
      area: "tiempos" as const,
      severity: (i % 5) + 1,
      lever: "Palanca",
      standardTitle: "Estándar",
    })),
    strengths: [
      { title: "Sabor consistente", evidence: "El pollo siempre sabe igual de bien" },
      { title: "Sabor consistente", evidence: "duplicada" },
      { title: "Atención amable", evidence: "" },
    ],
  };
  record.pains.push({ ...record.pains[10], severity: 9 });
  const pains = buildPains([record], "restaurante");
  assert.equal(pains.source, "doc");
  assert.equal(pains.pains.length, 8);
  assert.equal(pains.pains[0].severity, 5, "severidad 9 se recorta a 5 y queda primero");
  assert.equal(pains.strengths.length, 2);
  assert.ok(pains.pains.every((p) => p.id.length > 0));
});

test("buildPains sin OSINT usa 6 dolores universales del sector sin citas inventadas", () => {
  const pains = buildPains([], "servicios");
  assert.equal(pains.source, "fallback");
  assert.equal(pains.pains.length, 6);
  assert.ok(pains.pains.every((p) => p.evidence === "" && p.lever && p.standardTitle));
  assert.deepEqual(fallbackPains("servicios").map((p) => p.id), pains.pains.map((p) => p.id));
});

test("marketingFromInputs es determinista y premia las señales fuertes", () => {
  const weak = marketingFromInputs({ postingCadence: "ninguna", hasWebsite: false });
  const strong = marketingFromInputs({ instagramHandle: "marca", followers: 25_000, postingCadence: "diaria", hasWebsite: true, googleRating: 4.7, adSpendGuess: 800 });
  for (const axis of ["marca", "contenido", "conversión", "presencia_local", "atracción_franquiciados"] as const) {
    assert.ok(strong[axis].score > weak[axis].score, `${axis}: fuerte > débil`);
    assert.ok(strong[axis].score >= 0 && strong[axis].score <= 100);
    assert.ok(strong[axis].evidence.length > 0 && strong[axis].quickWin.length > 0);
    assert.equal(strong[axis].estimate, true);
  }
  assert.deepEqual(marketingFromInputs({ followers: 100 }), marketingFromInputs({ followers: 100 }));
});

test("buildMarketing marca la fuente: auditoría > quick-form > fallback", () => {
  const audit: AiMarketingAudit = {
    scores: {
      marca: { score: 70, evidence: "Logo consistente", quickWin: "Bio unificada" },
      contenido: { score: 55, evidence: "3 posts/semana", quickWin: "Reels de proceso" },
      conversion: { score: 40, evidence: "Sin CTA", quickWin: "Botón WhatsApp" },
      presencia_local: { score: 80, evidence: "4.6 en Google", quickWin: "Responder reseñas" },
      atraccion_franquiciados: { score: 120, evidence: "Nada para inversionistas", quickWin: "Ficha en marketplace" },
    },
    inputs: { instagramHandle: "marca", followers: 3000, postingCadence: "semanal", hasWebsite: true, googleRating: 4.6, adSpendGuess: null },
  };
  const ideas = ideasFromAi(null, "Marca", ["Pollo"]);
  const fromDoc = buildMarketing([audit], null, ideas);
  assert.equal(fromDoc.source, "doc");
  assert.equal(fromDoc.scores["atracción_franquiciados"].score, 100, "se recorta a 100");
  assert.equal(fromDoc.inputs?.followers, 3000);

  const fromInputs = buildMarketing([], { hasWebsite: true }, ideas);
  assert.equal(fromInputs.source, "inputs");
  const fromNothing = buildMarketing([], null, ideas);
  assert.equal(fromNothing.source, "fallback");
  assert.equal(fromNothing.ideas.length, 3);
  assert.ok(fromNothing.ideas[0].title.includes("Pollo"));
});

test("buildOpex sin notas usa benchmark por sector y país", () => {
  const opex = buildOpex([], "restaurante", "Colombia", "COP");
  assert.equal(opex.source, "benchmark");
  assert.equal(opex.currency, "USD");
  assert.equal(opex.monthlySalesEstimate, 25_000);
  assert.equal(opex.lines.length, 5);
  assert.ok(opex.lines.every((l) => l.source === "benchmark" && l.estimate));
  assert.equal(opex.lines.find((l) => l.key === "payroll")?.value, 6250);
});

test("buildOpex con notas prioriza el documento y completa lo que falta", () => {
  const record: AiOpex = {
    currency: "COP",
    monthlySales: 48_000_000,
    notes: "Ventas promedio de los últimos 3 meses.",
    lines: [
      { key: "rent", label: "Arriendo local", monthlyValue: 4_500_000, confidence: "high", evidence: "Contrato" },
      { key: "payroll", label: "", monthlyValue: 11_000_000, confidence: "med", evidence: "Nómina aprox." },
    ],
  };
  const opex = buildOpex([record], "restaurante", "Colombia", "COP");
  assert.equal(opex.source, "doc");
  assert.equal(opex.currency, "COP");
  assert.equal(opex.monthlySalesEstimate, 48_000_000);
  const rent = opex.lines.find((l) => l.key === "rent");
  assert.equal(rent?.value, 4_500_000);
  assert.equal(rent?.source, "doc");
  assert.equal(rent?.estimate, false, "cifra literal del documento no es estimación");
  assert.equal(opex.lines.find((l) => l.key === "payroll")?.label, "Nómina");
  const utilities = opex.lines.find((l) => l.key === "utilities");
  assert.equal(utilities?.source, "benchmark");
  assert.equal(utilities?.value, Math.round(48_000_000 * 0.04));
  assert.ok(opex.notes.includes("benchmark"));
});

test("assemblePreload valida y recorta topes", () => {
  const offering = buildOffering([menu], "restaurante");
  const pains = buildPains([], "restaurante");
  const marketing = buildMarketing([], null, ideasFromAi({ ideas: Array.from({ length: 5 }, (_, i) => ({ title: `Idea ${i}`, channel: "IG", hook: "h", heroItem: "x", metric: "m" })) }, "M", []));
  const opexSkeleton = buildOpex([], "restaurante", "MX", "COP");
  const preload = assemblePreload({ offering, pains, marketing, opexSkeleton });
  assert.equal(preload.marketing.ideas.length, 3);
  assert.equal(preload.opexSkeleton.monthlySalesEstimate, 35_000);
  assert.deepEqual(heroItemNames(preload.offering), ["Pollo a la brasa entero", "Medio pollo", "Costillas BBQ"]);
});

test("utilidades: país, slug, hash y fences", () => {
  assert.equal(countryCodeFromText("Colombia"), "CO");
  assert.equal(countryCodeFromText("México"), "MX");
  assert.equal(countryCodeFromText("perú"), "PE");
  assert.equal(countryCodeFromText("ec"), "EC");
  assert.equal(countryCodeFromText("Narnia"), null);
  assert.equal(benchmarkMonthlySalesUsd("servicios", "Chile"), 24_000);
  assert.equal(slugifyId("Pollo a la Brasa (entero)", 0), "pollo-a-la-brasa-entero-1");
  assert.equal(hashInputs([{ b: 1, a: 2 }]), hashInputs([{ a: 2, b: 1 }]), "hash estable ante el orden de claves");
  assert.notEqual(hashInputs(["a"]), hashInputs(["b"]));
  assert.deepEqual(tryParseJson('Claro:\n```json\n{"ok":true}\n```'), { ok: true });
  assert.equal(stripFences("```json\n{}\n```"), "{}");
  assert.equal(tryParseJson("no json"), undefined);
});
