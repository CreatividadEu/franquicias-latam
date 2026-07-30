import test from "node:test";
import assert from "node:assert/strict";
import {
  clampToSpec,
  computeModel,
  DEFAULT_INPUTS,
  decodeState,
  encodeState,
  PLANS,
  SMLMV,
  specFor,
  type PlanId,
} from "../src/lib/intel/totto-model";

/** Tolerancia de ±1 COP M sobre las cifras del modelo. */
function assertM(actual: number, expected: number, label: string) {
  assert.ok(
    Math.abs(actual - expected) <= 1,
    `${label}: se esperaba ${expected} ± 1 COP M, se obtuvo ${actual.toFixed(2)}`,
  );
}

test("la pila de daño con los supuestos por defecto", () => {
  const { damage } = computeModel(DEFAULT_INPUTS, 0);

  assertM(damage.lostGP, 4_680, "lostGP");
  assertM(damage.erosion, 3_968, "erosion");
  assertM(damage.clvYear, 1_890, "clvYear");
  assertM(damage.mktLeak, 1_190, "mktLeak");
  assertM(damage.costosIncr, 900, "costosIncr");
  assertM(damage.danoPL, 12_628, "danoPL");

  assert.equal(damage.lostUnits, 45_000);
  assertM(damage.lostRev, 9_000, "lostRev");
  assertM(damage.clvTotal, 5_670, "clvTotal");
  assertM(damage.iva, 2_223, "iva");

  // ≈ 2,5 % de los ingresos Colombia y ≈ USD 3,2 M a TRM 4.000.
  assert.ok(damage.danoPctRev > 0.024 && damage.danoPctRev < 0.026, `danoPctRev=${damage.danoPctRev}`);
  const usd = (damage.danoPL * 1e6) / 4_000;
  assert.ok(usd > 3.1e6 && usd < 3.3e6, `usd=${usd}`);
});

test("la palanca legal se liquida por marca y por infractor", () => {
  const { legal } = computeModel(DEFAULT_INPUTS, 3);
  const base = (25 * 2 * SMLMV) / 1e6;

  assertM(legal.min, base * 3, "piso 3 SMLMV");
  assertM(legal.max, base * 100, "techo 100 SMLMV");
  assertM(legal.aggravated, base * 200, "techo agravado 200 SMLMV");
  assertM(legal.expected, base * 15 * 0.35, "recupero esperado");
});

test("en inacción no hay contención, ni costo, ni retorno", () => {
  const { sim, damage, deltaEbitda } = computeModel(DEFAULT_INPUTS, 0);

  assert.equal(sim.avoided, 0);
  assert.equal(sim.totalCost, 0);
  assert.equal(sim.recNet, 0);
  assert.equal(sim.roi, null);
  assert.equal(sim.payback, null);

  // El daño acumulado a 12 meses supera al daño anual estático por el 18 % a.a.
  assert.ok(sim.cumBase > damage.danoPL, `cumBase=${sim.cumBase}`);
  assert.ok(sim.cumBase < damage.danoPL * 1.12, `cumBase=${sim.cumBase}`);

  // La curva del plan coincide con la de inacción: no hay nada que separarlas.
  assertM(sim.cumPlan, sim.cumBase, "cumPlan == cumBase");

  // Identidad de la tabla: el Δ EBITDA de la inacción es el daño anual completo.
  assertM(deltaEbitda, -damage.danoPL, "Δ EBITDA");
});

test("todos los planes pagan antes de M3 y el Δ EBITDA cuadra con el beneficio", () => {
  for (const plan of PLANS.filter((p) => p.id > 0)) {
    const { sim, deltaEbitda } = computeModel(DEFAULT_INPUTS, plan.id);

    assert.ok(sim.payback !== null, `${plan.name}: sin payback`);
    assert.ok(
      sim.payback !== null && sim.payback <= 3,
      `${plan.name}: payback en M${sim.payback}, se esperaba ≤ M3`,
    );
    assert.ok(sim.roi !== null && sim.roi > 0, `${plan.name}: ROI=${sim.roi}`);

    // El Δ EBITDA de la tabla es, por construcción, el beneficio acumulado.
    assertM(deltaEbitda, sim.cumBenefit, `${plan.name}: Δ EBITDA vs beneficio`);

    // Y el beneficio es daño evitado + recuperos − costo.
    assertM(
      sim.cumBenefit,
      sim.avoided + sim.recNet - sim.totalCost,
      `${plan.name}: composición del beneficio`,
    );
  }
});

test("ROI y costo total por plan", () => {
  const expected: Record<number, { cost: number; roiMin: number; roiMax: number }> = {
    1: { cost: 60, roiMin: 35, roiMax: 38 },
    2: { cost: 192, roiMin: 34, roiMax: 37 },
    3: { cost: 432, roiMin: 18, roiMax: 20 },
  };

  for (const plan of PLANS.filter((p) => p.id > 0)) {
    const { sim } = computeModel(DEFAULT_INPUTS, plan.id);
    const bounds = expected[plan.id];

    assertM(sim.totalCost, bounds.cost, `${plan.name}: costo total`);
    assert.ok(
      sim.roi !== null && sim.roi >= bounds.roiMin && sim.roi <= bounds.roiMax,
      `${plan.name}: ROI=${sim.roi?.toFixed(2)}, se esperaba ${bounds.roiMin}–${bounds.roiMax}×`,
    );
  }
});

test("la efectividad crece por su curva y se estabiliza en el techo", () => {
  const near = (actual: number, expected: number, label: string) =>
    assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} ≠ ${expected}`);

  const escudo = PLANS[2];
  near(escudo.eff(1), 0.1, "escudo M1");
  near(escudo.eff(6), 0.6, "escudo M6");
  near(escudo.eff(12), 0.6, "escudo M12");

  const fortaleza = PLANS[3];
  near(fortaleza.eff(4), 0.41, "fortaleza M4");
  near(fortaleza.eff(8), 0.82, "fortaleza M8");
  near(fortaleza.eff(12), 0.82, "fortaleza M12");

  // Los recuperos legales aterrizan solo entre M7 y M12.
  const { sim } = computeModel(DEFAULT_INPUTS, 3);
  assert.equal(sim.months.slice(0, 6).reduce((acc, m) => acc + m.recovery, 0), 0);
  assertM(
    sim.months.slice(6).reduce((acc, m) => acc + m.recovery, 0),
    sim.recNet,
    "recuperos M7–M12",
  );
});

test("el estado de la URL va y vuelve sin perder información", () => {
  const state = {
    inputs: { ...DEFAULT_INPUTS, units: 320_000, gm: 61, ero: 1.4 },
    plan: 2 as PlanId,
  };

  const query = encodeState(state);
  assert.equal(query, "u=320000&g=61&e=1.4&p=2");

  const back = decodeState(new URLSearchParams(query));
  assert.deepEqual(back, state);

  // Los defaults no viajan en la URL.
  assert.equal(encodeState({ inputs: DEFAULT_INPUTS, plan: 0 }), "");
});

test("los valores de la URL se acotan al rango del slider", () => {
  const state = decodeState({ u: "99999999", g: "-40", p: "9", l: "no-es-un-numero" });

  assert.equal(state.inputs.units, specFor("units").max);
  assert.equal(state.inputs.gm, specFor("gm").min);
  assert.equal(state.plan, 0);
  assert.equal(state.inputs.sml, specFor("sml").default);
});

test("clampToSpec cuadra el valor a su paso", () => {
  const units = specFor("units");
  assert.equal(clampToSpec(units, 182_400), 180_000);
  assert.equal(clampToSpec(units, 183_000), 185_000);

  const ero = specFor("ero");
  assert.equal(clampToSpec(ero, 1.23), 1.2);
  assert.equal(clampToSpec(ero, 0.8), 0.8);
});

test("mover un supuesto mueve el daño en la dirección esperada", () => {
  const base = computeModel(DEFAULT_INPUTS, 0).damage.danoPL;
  const moreUnits = computeModel({ ...DEFAULT_INPUTS, units: 360_000 }, 0).damage.danoPL;
  const lowerSub = computeModel({ ...DEFAULT_INPUTS, sub: 10 }, 0).damage.danoPL;

  assert.ok(moreUnits > base, "más unidades falsificadas → más daño");
  assert.ok(lowerSub < base, "menos sustitución → menos daño");
});
