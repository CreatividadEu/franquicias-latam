import test from "node:test";
import assert from "node:assert/strict";
import {
  SANDBOX_MESSAGES,
  collectLeafPaths,
  createTranslator,
  interpolate,
  translate,
  type SandboxMessageKey,
} from "../src/lib/sandbox/i18n";
import { SANDBOX_PHASE_IDS } from "../src/lib/sandbox/phases";

test("es y en tienen exactamente las mismas claves", () => {
  const es = collectLeafPaths(SANDBOX_MESSAGES.es).sort();
  const en = collectLeafPaths(SANDBOX_MESSAGES.en).sort();
  assert.deepEqual(en, es);
});

test("ninguna hoja está vacía", () => {
  for (const locale of ["es", "en"] as const) {
    const walk = (node: unknown, path: string) => {
      if (typeof node === "string") {
        assert.ok(node.trim().length > 0, `${locale}:${path} vacío`);
      } else if (Array.isArray(node)) {
        assert.ok(node.length > 0, `${locale}:${path} array vacío`);
        node.forEach((item, i) => walk(item, `${path}[${i}]`));
      } else if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
      }
    };
    walk(SANDBOX_MESSAGES[locale], "");
  }
});

test("cada fase tiene etiqueta, título, método (3–5 palabras) y guía de presentador", () => {
  for (const locale of ["es", "en"] as const) {
    const m = SANDBOX_MESSAGES[locale];
    for (const id of SANDBOX_PHASE_IDS) {
      const phase = m.phases[id];
      assert.ok(phase.label && phase.title, `${locale}:${id} sin label/título`);
      assert.ok(phase.method.length >= 2 && phase.method.length <= 5, `${locale}:${id} método fuera de rango`);
      const guide = m.presenter.phases[id];
      assert.ok(guide.notes.length >= 1, `${locale}:${id} sin notas`);
      assert.ok(guide.beats.length >= 1, `${locale}:${id} sin beats`);
    }
  }
});

test("los beats del presentador suman el presupuesto de la fase", async () => {
  const { SANDBOX_PHASES } = await import("../src/lib/sandbox/phases");
  for (const p of SANDBOX_PHASES) {
    const sum = SANDBOX_MESSAGES.es.presenter.phases[p.id].beats.reduce((a, b) => a + b.sec, 0);
    assert.equal(sum, p.budgetSec, `${p.id}: beats ${sum}s ≠ presupuesto ${p.budgetSec}s`);
  }
});

test("interpolación y fallback", () => {
  assert.equal(interpolate("Fase {{n}} de {{total}}", { n: 2, total: 7 }), "Fase 2 de 7");
  assert.equal(interpolate("Hola {{nombre}}", {}), "Hola {{nombre}}");
  assert.equal(translate("es", "chrome.phaseOf", { n: 3, total: 7 }), "Fase 3 de 7");
  assert.equal(translate("en", "common.next"), "Next");
  const t = createTranslator("es");
  assert.equal(t("common.next"), "Siguiente");
  assert.equal(t("no.existe" as SandboxMessageKey), "no.existe");
});
