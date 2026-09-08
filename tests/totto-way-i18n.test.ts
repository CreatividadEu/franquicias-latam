import test from "node:test";
import assert from "node:assert/strict";
import { collectLeafPaths, createDictionary, interpolate } from "../src/lib/i18n/dictionary";
import { TW_DICTIONARY, TW_LOCALE_LABELS, TW_MESSAGES, createTranslator, intlLocale, translate } from "../src/lib/totto-way/i18n";

/** Idiomas que deben estar completos; los regionales solo declaran lo que cambia. */
const COMPLETE = ["es", "en", "pt-BR"] as const;
const OVERRIDES = ["es-MX"] as const;

test("los idiomas completos tienen exactamente las mismas claves", () => {
  const base = collectLeafPaths(TW_MESSAGES.es).sort();
  assert.ok(base.length > 200, `el base tiene ${base.length} claves`);
  for (const locale of COMPLETE) {
    const keys = collectLeafPaths(TW_MESSAGES[locale]).sort();
    assert.deepEqual(keys, base, `${locale} no coincide con el español base`);
  }
});

test("un idioma regional solo declara claves que existen en su base", () => {
  const base = new Set(collectLeafPaths(TW_MESSAGES.es));
  for (const locale of OVERRIDES) {
    const keys = collectLeafPaths(TW_MESSAGES[locale]).filter((key) => !key.startsWith("_"));
    assert.ok(keys.length > 0, `${locale} no aporta nada`);
    const extra = keys.filter((key) => !base.has(key));
    assert.deepEqual(extra, [], `${locale} declara claves inexistentes en el base`);
  }
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
  for (const locale of [...COMPLETE, ...OVERRIDES]) walk(TW_MESSAGES[locale], locale);
});

test("la cadena de respaldo va del más específico al base", () => {
  assert.deepEqual(TW_DICTIONARY.chain("es-MX"), ["es-MX", "es"]);
  assert.deepEqual(TW_DICTIONARY.chain("pt-BR"), ["pt-BR", "es"]);
  assert.deepEqual(TW_DICTIONARY.chain("es"), ["es"]);
  // Un idioma desconocido no rompe: resuelve como el base.
  assert.deepEqual(TW_DICTIONARY.chain("gl" as never), ["es"]);
});

test("es-MX usa su override y cae al español para el resto", () => {
  // Declarada en es-MX.
  assert.equal(translate("es-MX", "nav.benefits"), "Prestaciones");
  assert.equal(translate("es", "nav.benefits"), "Beneficios");
  // No declarada: cae al base sin quedarse en blanco.
  assert.equal(translate("es-MX", "nav.home"), translate("es", "nav.home"));
  assert.equal(translate("es-MX", "brand.motto"), "¿Listos? ¡Vamos!");
});

test("el portugués está traducido de verdad, no copiado del español", () => {
  assert.equal(translate("pt-BR", "nav.journey"), "Minha jornada");
  assert.equal(translate("pt-BR", "brand.mottoLine2"), "VAMOS!");
  assert.equal(translate("pt-BR", "common.days", { n: 3 }), "3 dias");
  // Una muestra amplia debe diferir del español.
  const keys = ["nav.home", "nav.learn", "login.title", "home.title", "leader.title", "assistant.thinking"] as const;
  const iguales = keys.filter((key) => translate("pt-BR", key) === translate("es", key));
  assert.ok(iguales.length <= 1, `demasiadas claves sin traducir: ${iguales.join(", ")}`);
});

test("translate interpola y devuelve la clave si no existe en ningún idioma", () => {
  assert.equal(translate("es", "common.xpChip", { n: 120 }), "+120 XP");
  assert.equal(translate("en", "home.greeting", { name: "Camila" }), "Hi, Camila");
  const t = createTranslator("pt-BR");
  assert.equal(t("common.xpChip", { n: 40 }), "+40 XP");
  assert.equal(translate("en", "nope.missing" as never), "nope.missing");
});

test("cada idioma tiene etiqueta y locale de Intl", () => {
  for (const locale of TW_DICTIONARY.locales) {
    assert.ok(TW_LOCALE_LABELS[locale], `${locale} sin etiqueta`);
    assert.ok(/^[a-z]{2}(-[A-Z]{2})?$/.test(intlLocale(locale)), `${locale} → ${intlLocale(locale)}`);
    // Comprueba que Intl lo acepte de verdad.
    assert.doesNotThrow(() => new Intl.DateTimeFormat(intlLocale(locale)).format(new Date(0)));
  }
  assert.equal(intlLocale("gl" as never), "es-CO", "un idioma desconocido cae al base");
});

test("createDictionary encadena varios niveles de respaldo", () => {
  const dict = createDictionary<"a" | "b" | "c", { x: { y: string; z: string } }>(
    { a: { x: { y: "base-y", z: "base-z" } }, b: { x: { z: "b-z" } }, c: { x: {} } },
    { base: "a", fallbacks: { c: "b", b: "a" } },
  );
  assert.deepEqual(dict.chain("c"), ["c", "b", "a"]);
  assert.equal(dict.translate("c", "x.z"), "b-z", "toma el del intermedio");
  assert.equal(dict.translate("c", "x.y"), "base-y", "y cae al base para lo demás");
  assert.equal(interpolate("{{ n }} días", { n: 3 }), "3 días");
  assert.equal(interpolate("{{missing}}"), "{{missing}}");
});
