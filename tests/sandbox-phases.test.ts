import test from "node:test";
import assert from "node:assert/strict";
import {
  SANDBOX_METHOD_PHASES,
  SANDBOX_PHASES,
  SANDBOX_PHASE_IDS,
  SANDBOX_TOTAL_BUDGET_SEC,
  formatBudget,
  nextPhase,
  parsePhaseParam,
  phaseIndex,
  prevPhase,
  toPrismaPhase,
} from "../src/lib/sandbox/phases";

test("siete paradas en el orden del brief", () => {
  assert.deepEqual([...SANDBOX_PHASE_IDS], [
    "intro",
    "estrategia",
    "finanzas",
    "operaciones",
    "legal",
    "marketing",
    "reporte",
  ]);
  assert.equal(SANDBOX_PHASES.length, 7);
  assert.equal(SANDBOX_METHOD_PHASES.length, 5);
});

test("el presupuesto total es 16 minutos (1+3.5+3.5+3.5+1.5+2+1)", () => {
  assert.equal(SANDBOX_TOTAL_BUDGET_SEC, 960);
  assert.equal(formatBudget(210), "3.5'");
  assert.equal(formatBudget(60), "1'");
  assert.equal(formatBudget(90), "1.5'");
});

test("navegación siguiente/anterior sin callejones", () => {
  assert.equal(nextPhase("intro"), "estrategia");
  assert.equal(nextPhase("reporte"), null);
  assert.equal(prevPhase("intro"), null);
  assert.equal(prevPhase("finanzas"), "estrategia");
  assert.equal(phaseIndex("legal"), 4);
});

test("parsePhaseParam tolera basura y arrays", () => {
  assert.equal(parsePhaseParam(undefined), "intro");
  assert.equal(parsePhaseParam("finanzas"), "finanzas");
  assert.equal(parsePhaseParam(["legal", "x"]), "legal");
  assert.equal(parsePhaseParam("hack"), "intro");
});

test("toPrismaPhase mapea al enum", () => {
  assert.equal(toPrismaPhase("operaciones"), "OPERACIONES");
});
