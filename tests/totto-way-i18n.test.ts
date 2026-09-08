import test from "node:test";
import assert from "node:assert/strict";
import { collectLeafPaths, createDictionary, interpolate } from "../src/lib/i18n/dictionary";
import { TW_MESSAGES, createTranslator, translate } from "../src/lib/totto-way/i18n";

test("es y en tienen exactamente las mismas claves", () => {
  const es = collectLeafPaths(TW_MESSAGES.es).sort();
  const en = collectLeafPaths(TW_MESSAGES.en).sort();
  assert.deepEqual(en, es);
  assert.ok(es.length > 50);
});

test("ninguna hoja está vacía", () => {
  const walk = (node: unknown, path: string) => {
    if (typeof node === "string") {
      assert.ok(node.trim().length > 0, `hoja vacía en ${path}`);
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(TW_MESSAGES.es, "");
  walk(TW_MESSAGES.en, "");
});

test("translate interpola y cae al español si falta la clave", () => {
  assert.equal(translate("es", "common.xpChip", { n: 120 }), "+120 XP");
  assert.equal(translate("en", "home.greeting", { name: "Camila" }), "Hi, Camila");
  const t = createTranslator("es");
  assert.equal(t("brand.motto"), "¿Listos? ¡Vamos!");
  // Clave inexistente devuelve la clave (visible en QA).
  assert.equal(translate("en", "nope.missing" as never), "nope.missing");
});

test("createDictionary hace fallback al idioma base por hoja", () => {
  const dict = createDictionary({ es: { a: { b: "hola {{x}}" } }, en: { a: {} } as never });
  assert.equal(dict.translate("en", "a.b", { x: 1 }), "hola 1");
  assert.equal(interpolate("{{ n }} días", { n: 3 }), "3 días");
  assert.equal(interpolate("{{missing}}"), "{{missing}}");
});
