import test from "node:test";
import assert from "node:assert/strict";
import {
  computeCountries,
  computeFunnel,
  computeKpis,
  groupByStage,
  hottestLead,
} from "../src/lib/saju/metrics";
import {
  countryCodeFromName,
  countryMeta,
  isAdvancedStage,
  stagePosition,
  UNKNOWN_COUNTRY,
} from "../src/lib/saju/command-center";
import {
  daysFromToday,
  formatDecimal,
  fromDateInputValue,
  isOverdue,
  toDateInputValue,
} from "../src/lib/saju/format";
import type { SajuLeadDTO } from "../src/lib/saju/types";

const NOW = new Date("2026-07-31T10:00:00.000Z");

function lead(overrides: Partial<SajuLeadDTO> & { id: string }): SajuLeadDTO {
  return {
    name: overrides.id,
    company: null,
    role: null,
    country: "PA",
    city: null,
    type: "PUNTO_UNICO",
    stage: "PROSPECTO",
    status: "ACTIVO",
    interest: "MEDIO",
    keyInsight: null,
    nextAction: null,
    nextActionDate: null,
    source: null,
    notes: null,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

test("los KPIs cuentan sólo leads activos y separan acciones vencidas", () => {
  const leads = [
    lead({ id: "a", stage: "NEGOCIACION", nextActionDate: "2026-08-02T12:00:00.000Z" }),
    lead({ id: "b", stage: "EVALUACION_INTERNA", country: "ES" }),
    lead({ id: "c", stage: "PROSPECTO", nextActionDate: "2026-07-28T12:00:00.000Z" }),
    lead({ id: "d", stage: "FIRMADO", country: "GT", status: "PAUSADO" }),
  ];

  const kpis = computeKpis(leads, NOW);

  assert.equal(kpis.leadsActivos, 3, "el lead pausado no cuenta");
  assert.equal(kpis.paisesActivos, 2, "GT sólo tiene un lead pausado");
  assert.equal(kpis.enNegociacion, 1);
  assert.equal(kpis.pctAvanzados, 67, "2 de 3 activos están en evaluación o más");
  assert.equal(kpis.accionesProximas, 1);
  assert.equal(kpis.accionesVencidas, 1);
});

test("el embudo acumula hacia adelante y calcula conversión etapa a etapa", () => {
  const leads = [
    lead({ id: "a", stage: "CONTACTADO" }),
    lead({ id: "b", stage: "NEGOCIACION" }),
    lead({ id: "c", stage: "NEGOCIACION" }),
  ];

  const funnel = computeFunnel(leads);
  const byStage = Object.fromEntries(funnel.map((row) => [row.stage, row]));

  assert.equal(byStage.PROSPECTO.count, 3);
  assert.equal(byStage.PROSPECTO.conversion, null);
  assert.equal(byStage.CONTACTADO.count, 3);
  assert.equal(byStage.MATERIAL_ENVIADO.count, 2);
  assert.equal(byStage.MATERIAL_ENVIADO.conversion, 67);
  assert.equal(byStage.FIRMADO.count, 0);
});

test("groupByStage devuelve las 7 etapas aunque estén vacías", () => {
  const grouped = groupByStage([lead({ id: "a", stage: "PRESENTADO" })]);
  assert.equal(Object.keys(grouped).length, 7);
  assert.equal(grouped.PRESENTADO.length, 1);
  assert.deepEqual(grouped.FIRMADO, []);
});

test("el lead más caliente desempata por etapa y luego por interés", () => {
  const winner = hottestLead([
    lead({ id: "a", stage: "PRESENTADO", interest: "ALTO" }),
    lead({ id: "b", stage: "NEGOCIACION", interest: "BAJO" }),
    lead({ id: "c", stage: "NEGOCIACION", interest: "ALTO" }),
  ]);
  assert.equal(winner?.id, "c");
});

test("las tarjetas por país reparten etapas y promedian el avance", () => {
  const countries = computeCountries([
    lead({ id: "a", country: "ES", stage: "NEGOCIACION" }), // posición 6
    lead({ id: "b", country: "ES", stage: "CONTACTADO" }), // posición 2
    lead({ id: "c", country: "PA", stage: "PROSPECTO" }),
  ]);

  const es = countries.find((country) => country.code === "ES");
  assert.ok(es);
  assert.equal(es.total, 2);
  assert.equal(es.avanceMedio, 4);
  assert.equal(es.distribution.length, 2);
  assert.equal(es.hottest?.id, "a");
  assert.equal(countries[0].code, "ES", "ordena por avance medio");
});

test("las etapas avanzadas arrancan en evaluación interna", () => {
  assert.equal(isAdvancedStage("PRESENTADO"), false);
  assert.equal(isAdvancedStage("EVALUACION_INTERNA"), true);
  assert.equal(stagePosition("FIRMADO"), 7);
});

test("las fechas se comparan en el día natural de Madrid", () => {
  // 23:30 UTC del 31/07 ya es 01:30 del 01/08 en Madrid (UTC+2 en verano).
  const lateNight = new Date("2026-07-31T23:30:00.000Z");
  assert.equal(daysFromToday(new Date("2026-08-01T09:00:00.000Z"), lateNight), 0);
  assert.equal(isOverdue(new Date("2026-07-31T09:00:00.000Z"), lateNight), true);
});

test("el ida y vuelta del input de fecha conserva el día", () => {
  const parsed = fromDateInputValue("2026-08-03");
  assert.ok(parsed);
  assert.equal(toDateInputValue(parsed), "2026-08-03");
  assert.equal(fromDateInputValue("no-es-fecha"), null);
});

test("el formato decimal usa coma española", () => {
  assert.equal(formatDecimal(4.25), "4,3");
});

test("los países del formulario se resuelven a ISO alpha-2", () => {
  assert.equal(countryCodeFromName("Panamá"), "PA");
  assert.equal(countryCodeFromName("panama"), "PA");
  assert.equal(countryCodeFromName("España"), "ES");
  assert.equal(countryCodeFromName("Otro"), UNKNOWN_COUNTRY);
  assert.equal(countryCodeFromName(null), UNKNOWN_COUNTRY);
  assert.equal(countryMeta("GT").flag, "🇬🇹");
  assert.equal(countryMeta("NL").name, "NL", "país fuera del plan degrada a su código");
});
