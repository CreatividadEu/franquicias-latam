import test from "node:test";
import assert from "node:assert/strict";
import {
  buildChapterSnapshot,
  parseBlocks,
  parseChapterSnapshot,
  parseQuizQuestions,
  slugify,
  validateForPublish,
  type ChapterTreeInput,
} from "../src/lib/totto-way/content";

function tree(overrides: Partial<ChapterTreeInput> = {}): ChapterTreeInput {
  return {
    id: "c1",
    number: 1,
    slug: "01-introduccion",
    title: "Introducción",
    subtitle: "Bienvenida",
    color: "#FCCE01",
    version: 1,
    missions: [{ id: "m1", code: "M01", title: "Bienvenida", order: 0 }],
    lessons: [
      {
        id: "l1",
        slug: "bienvenida",
        title: "Bienvenida a la expedición",
        type: "READING",
        minutes: 4,
        xp: 50,
        order: 0,
        missionId: "m1",
        blocks: [{ type: "paragraph", text: "Hola" }, { type: "simple_translation", text: "Idea" }],
        keyTakeaway: "Idea",
        ruleBanner: null,
        posterUrl: null,
        docRefs: [],
        quiz: { questions: [{ q: "¿?", options: ["a", "b"], correctIndex: 1 }], passScore: 1, bonusXp: 40 },
      },
    ],
    checkpoints: [],
    ...overrides,
  };
}

test("parseBlocks descarta arrays inválidos y acepta el vocabulario Totto", () => {
  assert.deepEqual(parseBlocks("nope"), []);
  assert.deepEqual(parseBlocks([{ type: "otro" }]), []);
  const blocks = parseBlocks([
    { type: "rule", text: "Sin marcación no hay turno." },
    { type: "steps", items: [{ text: "Saluda" }, { lead: "Explica", text: "que el sistema se activó" }] },
    { type: "doc", code: "DOC-01-03", label: "Política de antena" },
  ]);
  assert.equal(blocks.length, 3);
});

test("parseQuizQuestions descarta índices fuera de rango", () => {
  const qs = parseQuizQuestions([
    { q: "a", options: ["x", "y"], correctIndex: 1 },
    { q: "b", options: ["x", "y"], correctIndex: 5 },
  ]);
  assert.equal(qs.length, 1);
});

test("snapshot congelado: se construye, se parsea y ordena por order", () => {
  const input = tree({
    lessons: [
      { ...tree().lessons[0], id: "l2", slug: "dos", order: 1 },
      { ...tree().lessons[0], id: "l1", slug: "uno", order: 0 },
    ],
  });
  const snap = buildChapterSnapshot(input, new Date("2026-09-07T00:00:00Z"), 3);
  assert.equal(snap.version, 3);
  assert.deepEqual(snap.lessons.map((l) => l.id), ["l1", "l2"]);
  assert.deepEqual(snap.missions[0].lessonIds, ["l1", "l2"]);
  assert.equal(snap.lessons[0].missionCode, "M01");
  assert.equal(snap.lessons[0].quiz?.questions.length, 1);
  const parsed = parseChapterSnapshot(JSON.parse(JSON.stringify(snap)));
  assert.ok(parsed);
  assert.equal(parsed?.title, "Introducción");
  assert.equal(parseChapterSnapshot({ nope: true }), null);
});

test("una lección de video con solo póster sí se puede publicar", () => {
  // El paso a paso se graba después; el manual pide dejar el screenshot como
  // póster mientras tanto, así que eso no debe bloquear la publicación.
  const withPoster = tree({
    lessons: [{ ...tree().lessons[0], type: "VIDEO", posterUrl: "/totto-way/manual/p21.png" }],
  });
  assert.deepEqual(validateForPublish(withPoster), []);
});

test("validateForPublish detecta lecciones incompletas", () => {
  assert.deepEqual(validateForPublish(tree()), []);
  const bad = tree({
    lessons: [
      { ...tree().lessons[0], blocks: [], keyTakeaway: "", xp: 0, missionId: "m9", type: "VIDEO", quiz: { questions: [], passScore: 3, bonusXp: 40 } },
    ],
  });
  const issues = validateForPublish(bad).map((i) => i.message);
  assert.ok(issues.some((m) => /bloque/.test(m)));
  assert.ok(issues.some((m) => /Traducción simple/.test(m)));
  assert.ok(issues.some((m) => /XP/.test(m)));
  assert.ok(issues.some((m) => /póster/.test(m)));
  assert.ok(issues.some((m) => /quiz/.test(m)));
  assert.ok(issues.some((m) => /misión/.test(m)));
  assert.ok(validateForPublish(tree({ lessons: [] })).length > 0);
});

test("slugify normaliza acentos y símbolos", () => {
  assert.equal(slugify("Ecosistema SER: las 8 herramientas"), "ecosistema-ser-las-8-herramientas");
  assert.equal(slugify("¿Quiénes somos? Misión, Visión"), "quienes-somos-mision-vision");
  assert.equal(slugify("   "), "item");
});
