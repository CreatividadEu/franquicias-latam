import test from "node:test";
import assert from "node:assert/strict";
import { certificateFolio } from "../src/lib/totto-way/certificate";
import { monthKey, verifyWebhook } from "../src/lib/totto-way/webhooks";

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/totto-way/webhooks/nps", { method: "POST", headers });
}

test("un webhook sin secreto configurado queda cerrado, no abierto", () => {
  delete process.env.TEST_WEBHOOK_SECRET;
  const result = verifyWebhook(request({ "x-totto-way-secret": "loquesea" }), "TEST_WEBHOOK_SECRET");
  assert.deepEqual(result, { ok: false, reason: "NOT_CONFIGURED" });

  // Un secreto demasiado corto se trata como no configurado.
  process.env.TEST_WEBHOOK_SECRET = "corto";
  assert.deepEqual(verifyWebhook(request({ "x-totto-way-secret": "corto" }), "TEST_WEBHOOK_SECRET"), {
    ok: false,
    reason: "NOT_CONFIGURED",
  });
  delete process.env.TEST_WEBHOOK_SECRET;
});

test("acepta el secreto por cabecera propia y por Bearer", () => {
  process.env.TEST_WEBHOOK_SECRET = "secreto-de-integracion-largo";
  try {
    assert.deepEqual(verifyWebhook(request({ "x-totto-way-secret": "secreto-de-integracion-largo" }), "TEST_WEBHOOK_SECRET"), { ok: true });
    assert.deepEqual(verifyWebhook(request({ authorization: "Bearer secreto-de-integracion-largo" }), "TEST_WEBHOOK_SECRET"), { ok: true });
    assert.deepEqual(verifyWebhook(request({ authorization: "bearer   secreto-de-integracion-largo" }), "TEST_WEBHOOK_SECRET"), { ok: true });
  } finally {
    delete process.env.TEST_WEBHOOK_SECRET;
  }
});

test("rechaza secreto ausente, distinto o de otra longitud sin reventar", () => {
  process.env.TEST_WEBHOOK_SECRET = "secreto-de-integracion-largo";
  try {
    assert.deepEqual(verifyWebhook(request(), "TEST_WEBHOOK_SECRET"), { ok: false, reason: "BAD_SECRET" });
    assert.deepEqual(verifyWebhook(request({ "x-totto-way-secret": "otro-secreto-cualquiera" }), "TEST_WEBHOOK_SECRET"), {
      ok: false,
      reason: "BAD_SECRET",
    });
    // Longitudes distintas no deben lanzar en timingSafeEqual.
    assert.doesNotThrow(() => verifyWebhook(request({ "x-totto-way-secret": "x" }), "TEST_WEBHOOK_SECRET"));
    assert.deepEqual(verifyWebhook(request({ "x-totto-way-secret": "x" }), "TEST_WEBHOOK_SECRET"), {
      ok: false,
      reason: "BAD_SECRET",
    });
  } finally {
    delete process.env.TEST_WEBHOOK_SECRET;
  }
});

test("monthKey solo admite YYYY-MM válido", () => {
  assert.equal(monthKey("2026-09"), "2026-09");
  assert.equal(monthKey("  2026-01  "), "2026-01");
  assert.equal(monthKey("2026-12"), "2026-12");
  assert.equal(monthKey("2026-13"), null, "mes fuera de rango");
  assert.equal(monthKey("2026-00"), null);
  assert.equal(monthKey("2026-9"), null, "sin cero a la izquierda");
  assert.equal(monthKey("septiembre"), null);
  assert.equal(monthKey("2026-09-07"), null);
});

test("el folio del certificado es determinista y distingue persona y capítulo", () => {
  const a = certificateFolio("user-1", "chapter-1", 1);
  assert.equal(a, certificateFolio("user-1", "chapter-1", 1), "misma entrada, mismo folio");
  assert.match(a, /^TW-C01-[0-9A-F]{8}$/);

  assert.notEqual(a, certificateFolio("user-2", "chapter-1", 1), "otra persona, otro folio");
  assert.notEqual(a, certificateFolio("user-1", "chapter-2", 2), "otro capítulo, otro folio");
  assert.match(certificateFolio("user-1", "chapter-7", 7), /^TW-C07-/);
  assert.match(certificateFolio("user-1", "chapter-10", 10), /^TW-C10-/);
});
