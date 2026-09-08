import test from "node:test";
import assert from "node:assert/strict";
import { blocksToText } from "../src/lib/totto-way/assistant/retrieval";
import { contextBlock, documentBlocks, normalizeQuestion, SYSTEM_PROMPT } from "../src/lib/totto-way/assistant/prompts";
import { checkRateLimit, resetRateLimit } from "../src/lib/totto-way/assistant/rate-limit";
import type { TwBlock } from "../src/lib/totto-way/content";

test("blocksToText aplana el vocabulario Totto a texto indexable", () => {
  const blocks: TwBlock[] = [
    { type: "paragraph", text: "Marca **entrada** y salida." },
    { type: "rule", text: "Sin marcación no hay turno." },
    { type: "simple_translation", text: "Sin turno no hay XP." },
    { type: "steps", items: [{ lead: "Acércate", text: "con calma" }, { text: "Saluda" }] },
    { type: "checklist", items: ["Ticket", "Producto"] },
    { type: "doc", code: "DOC-01-03", label: "Política de antena" },
    { type: "image", src: "/a.png", alt: "", caption: "Pantalla de Geovictoria" },
    { type: "video", markers: [] },
  ];
  const text = blocksToText(blocks);

  assert.ok(text.includes("Marca entrada y salida."), "quita los asteriscos de la negrita");
  assert.ok(text.includes("Regla: Sin marcación no hay turno."));
  assert.ok(text.includes("Traducción simple: Sin turno no hay XP."));
  assert.ok(text.includes("1. Acércate con calma 2. Saluda"), text);
  assert.ok(text.includes("Ticket. Producto"));
  assert.ok(text.includes("Documento DOC-01-03: Política de antena"));
  assert.ok(text.includes("Pantalla de Geovictoria"), "la leyenda de la imagen sí se indexa");
  assert.equal(blocksToText([]), "");
});

test("normalizeQuestion agrupa la misma pregunta escrita de varias formas", () => {
  const a = normalizeQuestion("¿Cómo marco mi jornada en Geovictoria?");
  const b = normalizeQuestion("como  marco mi jornada en geovictoria");
  assert.equal(a, b);
  assert.equal(a, "como marco mi jornada en geovictoria");
  assert.equal(normalizeQuestion("  ¡¡ÑOÑO!!  "), "nono");
  assert.ok(normalizeQuestion("x".repeat(400)).length <= 160);
});

test("el contexto no se mezcla con el prompt estable", () => {
  const block = contextBlock({
    name: "Camila Rojas",
    roleTitle: "Asesor comercial",
    store: "Totto Andino",
    country: "CO",
    lesson: { title: "Ecosistema SER", chapter: "Capítulo 01 · Introducción" },
  });
  assert.ok(block.includes("Camila Rojas · Asesor comercial"));
  assert.ok(block.includes("Totto Andino (CO)"));
  assert.ok(block.includes("Está leyendo: Capítulo 01 · Introducción · Ecosistema SER"));
  // El prompt de sistema es estable: si llevara el nombre dentro, rompería la caché.
  assert.ok(!SYSTEM_PROMPT.includes("Camila"));
  assert.ok(SYSTEM_PROMPT.includes("90 palabras"));
  assert.ok(SYSTEM_PROMPT.includes("Traducción simple:"));
});

test("sin tienda ni lección el contexto se queda en una línea", () => {
  const block = contextBlock({ name: null, roleTitle: "Formador", store: null, country: null, lesson: null });
  assert.equal(block.split("\n").length, 2, block);
  assert.ok(block.includes("colaborador · Formador"));
});

test("los fragmentos viajan como documentos con citas activadas", () => {
  const docs = documentBlocks([
    { id: "1", source: "LESSON", sourceId: null, title: "Capítulo 01 · M05 · Geovictoria", text: "Marca entrada y salida.", locator: {}, rank: 1 },
  ]);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].type, "document");
  assert.equal(docs[0].citations.enabled, true);
  assert.equal(docs[0].title, "Capítulo 01 · M05 · Geovictoria");
  assert.equal(docs[0].source.data, "Marca entrada y salida.");
  assert.deepEqual(documentBlocks([]), []);
});

test("el límite por usuario corta la ráfaga y se libera al vencer la ventana", () => {
  resetRateLimit();
  const now = Date.now();
  for (let i = 0; i < 30; i += 1) {
    assert.equal(checkRateLimit("u1", now).ok, true, `petición ${i + 1} debería pasar`);
  }
  const blocked = checkRateLimit("u1", now);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter > 0);

  // Otro usuario no queda afectado.
  assert.equal(checkRateLimit("u2", now).ok, true);
  // Pasada la hora, vuelve a contar desde cero.
  assert.equal(checkRateLimit("u1", now + 61 * 60 * 1000).ok, true);
  resetRateLimit();
});
