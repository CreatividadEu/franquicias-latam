import test from "node:test";
import assert from "node:assert/strict";
import {
  ACT_III,
  BIG_NUMBER,
  CLOSING,
  DECISIONS,
  DROPI,
  EVIDENCE,
  PROGRAM,
  STEP_A,
  STEP_C,
  STEP_D,
  breakdownTotal,
  evidenceSrc,
  formatCo,
  type EvidenceSlug,
} from "../src/lib/totto/caso001";

/** Todo el texto visible del expediente, para las reglas de voz. */
function allCopy(): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk([ACT_III, BIG_NUMBER, CLOSING, DECISIONS, DROPI, PROGRAM, STEP_A, STEP_C, STEP_D]);
  return out;
}

test("la descomposición suma exactamente la gran cifra", () => {
  assert.equal(breakdownTotal(), BIG_NUMBER.value);
  assert.equal(BIG_NUMBER.value, 214_025);
});

test("las tarjetas de los tres hermanos cuadran con la descomposición", () => {
  const fromSiblings = ACT_III.siblings.reduce((acc, s) => acc + s.units, 0);
  assert.equal(fromSiblings, BIG_NUMBER.value);

  // Cada hermano aparece con la misma cifra en la gran cifra y en su tarjeta.
  for (const part of BIG_NUMBER.breakdown) {
    const sibling = ACT_III.siblings.find((s) => s.name === part.name);
    assert.ok(sibling, `falta la tarjeta de ${part.name}`);
    assert.equal(sibling.units, part.value);
  }
});

test("la línea de suma impresa dice lo que suma", () => {
  const expected = `${ACT_III.siblings
    .map((s) => formatCo(s.units))
    .join(" + ")} = ${formatCo(BIG_NUMBER.value)} unidades`;
  assert.equal(ACT_III.sumLine, expected);
});

test("el nodo central del grafo lleva la cifra del caso", () => {
  assert.equal(STEP_C.core.value, `${formatCo(BIG_NUMBER.value)} u`);
  // Un nodo por hermano, con su bodega.
  assert.equal(STEP_C.people.length, ACT_III.siblings.length);
  for (const person of STEP_C.people) {
    const sibling = ACT_III.siblings.find((s) => s.id === person.id);
    assert.ok(sibling, `el grafo tiene un nodo sin tarjeta: ${person.id}`);
    assert.equal(person.warehouse, sibling.warehouse);
  }
});

test("toda evidencia declara alt real y ruta congelada", () => {
  for (const [slug, item] of Object.entries(EVIDENCE)) {
    assert.equal(item.slug, slug);
    assert.ok(item.alt.length > 24, `alt demasiado corto en ${slug}`);
    assert.ok(item.caption.length > 0, `falta pie de foto en ${slug}`);
    assert.ok(item.source.length > 0, `falta la fuente en ${slug}`);
    assert.equal(evidenceSrc(slug as EvidenceSlug), `/totto/caso-001/${slug}.webp`);
  }
});

test("cada cifra de la descomposición apunta a una evidencia existente", () => {
  for (const part of BIG_NUMBER.breakdown) {
    assert.ok(EVIDENCE[part.evidence], `${part.name} apunta a evidencia inexistente`);
  }
  for (const sibling of ACT_III.siblings) {
    assert.ok(EVIDENCE[sibling.evidence], `${sibling.name} apunta a evidencia inexistente`);
  }
});

test("el resaltado del JSON cae sobre la ciudad y la bodega", () => {
  const lines = STEP_D.code.split("\n");
  const highlighted = STEP_D.highlightLines.map((n) => lines[n] ?? "");
  assert.ok(highlighted.some((line) => line.includes("CUCUTA")), "falta resaltar la ciudad");
  assert.ok(
    highlighted.some((line) => line.includes("DISTRIBUIDORA ALISON")),
    "falta resaltar la bodega",
  );
});

test("el barrido conserva los scores y señales del expediente", () => {
  assert.deepEqual(
    STEP_A.listings.map((l) => l.score),
    [90, 90, 50, 50],
  );
  assert.deepEqual(
    STEP_A.listings.map((l) => l.signal),
    ["réplica", "aaa", "1.1", "tipo totto"],
  );
  // Ningún listado por debajo del umbral publicado en los KPIs.
  const threshold = 50;
  for (const listing of STEP_A.listings) {
    assert.ok(listing.score >= threshold, `${listing.title} no supera el umbral`);
  }
});

test("el reveal de Dropi mantiene las cifras de la captura embebida", () => {
  const orders = DROPI.kpis.find((k) => k.label === "órdenes despachadas");
  assert.equal(orders?.value, 39_495);
  // La cifra anterior del expediente queda declarada en la nota, no escondida.
  assert.ok(DROPI.footnote.includes("38.760"));
});

test("el programa solo publica precio donde hay cifra verificada", () => {
  const priced = PROGRAM.phases.filter((p) => p.price !== null);
  assert.deepEqual(
    priced.map((p) => p.price),
    ["US$10.000/mes", "$12.000.000", "Por caso"],
  );
  // Fase 3 no tiene precio publicado: no se inventa uno.
  const fase3 = PROGRAM.phases.find((p) => p.name === "Trazabilidad profunda");
  assert.equal(fase3?.price, null);
});

test("reglas de voz: sin signos de exclamación ni emojis", () => {
  for (const text of allCopy()) {
    assert.ok(!text.includes("!"), `signo de exclamación en: ${text}`);
    assert.ok(!text.includes("¡"), `signo de exclamación en: ${text}`);
    assert.ok(
      !/\p{Extended_Pictographic}/u.test(text),
      `emoji en: ${text}`,
    );
  }
});

test("formatCo escribe los miles como se escriben en Colombia", () => {
  assert.equal(formatCo(214_025), "214.025");
  assert.equal(formatCo(39_495), "39.495");
});
