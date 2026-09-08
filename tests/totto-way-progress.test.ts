import test from "node:test";
import assert from "node:assert/strict";
import {
  canCompleteLesson,
  chapterProgress,
  gradeQuiz,
  lessonNeighbours,
  lessonVideo,
  lessonsByMission,
  toProgressMap,
  unlockedChapters,
  videoRatio,
  VIDEO_COMPLETION_RATIO,
  type ProgressRow,
} from "../src/lib/totto-way/progress";
import type { ChapterSnapshot, LessonSnapshot } from "../src/lib/totto-way/content";

function lesson(overrides: Partial<LessonSnapshot> = {}): LessonSnapshot {
  return {
    id: "l1",
    slug: "uno",
    title: "Lección uno",
    type: "READING",
    minutes: 5,
    xp: 50,
    order: 0,
    missionCode: "M01",
    blocks: [],
    keyTakeaway: "Idea",
    ruleBanner: null,
    posterUrl: null,
    videoSrc: null,
    docRefs: [],
    quiz: null,
    ...overrides,
  };
}

function snapshot(lessons: LessonSnapshot[], id = "c1", number = 1): ChapterSnapshot {
  return {
    version: 1,
    id,
    number,
    slug: `0${number}-cap`,
    title: `Capítulo ${number}`,
    subtitle: "",
    color: "#FCCE01",
    publishedAt: "2026-09-01T00:00:00.000Z",
    missions: [{ id: "m1", code: "M01", title: "Misión", order: 0, lessonIds: lessons.map((l) => l.id) }],
    lessons,
    checkpoints: [],
  };
}

function row(overrides: Partial<ProgressRow> = {}): ProgressRow {
  return { lessonId: "l1", status: "IN_PROGRESS", videoSeconds: 0, videoDuration: null, quizScore: null, xpEarned: 0, ...overrides };
}

test("videoRatio se acota entre 0 y 1 y tolera duración desconocida", () => {
  assert.equal(videoRatio(undefined), 0);
  assert.equal(videoRatio({ videoSeconds: 30, videoDuration: null }), 0);
  assert.equal(videoRatio({ videoSeconds: 30, videoDuration: 0 }), 0);
  assert.equal(videoRatio({ videoSeconds: 45, videoDuration: 90 }), 0.5);
  assert.equal(videoRatio({ videoSeconds: 200, videoDuration: 90 }), 1);
});

test("una lectura se completa siempre; una completada no se repite", () => {
  assert.deepEqual(canCompleteLesson(lesson(), undefined), { ok: true });
  const blocked = canCompleteLesson(lesson(), row({ status: "COMPLETED" }));
  assert.equal(blocked.ok, false);
  assert.equal(blocked.ok === false && blocked.reason, "ALREADY_COMPLETED");
});

test("un video con archivo exige el 90 % visto", () => {
  const video = lesson({ type: "VIDEO", videoSrc: "/v.mp4" });
  const short = canCompleteLesson(video, row({ videoSeconds: 50, videoDuration: 100 }));
  assert.equal(short.ok, false);
  assert.equal(short.ok === false && short.reason, "VIDEO_NOT_WATCHED");
  assert.equal(short.ok === false && short.ratio, 0.5);
  assert.deepEqual(canCompleteLesson(video, row({ videoSeconds: 90, videoDuration: 100 })), { ok: true });
  assert.equal(VIDEO_COMPLETION_RATIO, 0.9);
});

test("un video todavía sin grabar no bloquea el capítulo", () => {
  // Solo poster del manual: exigir el 90 % dejaría la lección imposible.
  const placeholder = lesson({ type: "VIDEO", posterUrl: "/totto-way/manual/p21.png" });
  assert.deepEqual(canCompleteLesson(placeholder, undefined), { ok: true });
});

test("lessonVideo toma el src del snapshot o del bloque", () => {
  assert.deepEqual(lessonVideo(lesson({ videoSrc: "/a.mp4", posterUrl: "/p.png" })), { src: "/a.mp4", poster: "/p.png", markers: [] });
  const fromBlock = lessonVideo(
    lesson({ blocks: [{ type: "video", src: "/b.mp4", poster: "/bp.png", markers: [{ sec: 30, label: "SER" }] }] }),
  );
  assert.equal(fromBlock.src, "/b.mp4");
  assert.deepEqual(fromBlock.markers, [{ sec: 30, label: "SER" }]);
  assert.equal(lessonVideo(lesson()).src, null);
});

test("chapterProgress cuenta completadas y señala la siguiente", () => {
  const snap = snapshot([lesson(), lesson({ id: "l2", slug: "dos", order: 1 }), lesson({ id: "l3", slug: "tres", order: 2 })]);
  const progress = toProgressMap([row({ lessonId: "l1", status: "COMPLETED" })]);
  const stats = chapterProgress(snap, progress);
  assert.equal(stats.total, 3);
  assert.equal(stats.done, 1);
  assert.equal(stats.pct, 33);
  assert.equal(stats.complete, false);
  assert.equal(stats.nextLesson?.id, "l2");

  const all = toProgressMap(["l1", "l2", "l3"].map((id) => row({ lessonId: id, status: "COMPLETED" })));
  const full = chapterProgress(snap, all);
  assert.equal(full.complete, true);
  assert.equal(full.nextLesson, null);
});

test("desbloqueo secuencial: el 02 espera a que el 01 esté completo", () => {
  const c1 = snapshot([lesson()], "c1", 1);
  const c2 = snapshot([lesson({ id: "l9" })], "c2", 2);
  const none = unlockedChapters([c1, c2], toProgressMap([]), true);
  assert.equal(none.get("c1"), true);
  assert.equal(none.get("c2"), false);

  const done = unlockedChapters([c1, c2], toProgressMap([row({ lessonId: "l1", status: "COMPLETED" })]), true);
  assert.equal(done.get("c2"), true);

  const off = unlockedChapters([c1, c2], toProgressMap([]), false);
  assert.equal(off.get("c2"), true);
});

test("misiones y vecinos ordenan la navegación del capítulo", () => {
  const snap = snapshot([lesson(), lesson({ id: "l2", slug: "dos", order: 1 })]);
  const missions = lessonsByMission(snap);
  assert.equal(missions.length, 1);
  assert.deepEqual(missions[0].lessons.map((l) => l.id), ["l1", "l2"]);

  assert.equal(lessonNeighbours(snap, "l1").previous, null);
  assert.equal(lessonNeighbours(snap, "l1").next?.id, "l2");
  assert.equal(lessonNeighbours(snap, "l2").previous?.id, "l1");
  assert.equal(lessonNeighbours(snap, "l2").next, null);
});

test("gradeQuiz corrige en servidor y detecta el perfecto", () => {
  const questions = [
    { options: ["a", "b", "c"], correctIndex: 1, explanation: "Porque sí" },
    { options: ["a", "b"], correctIndex: 0 },
  ];
  const partial = gradeQuiz(questions, [1, 1]);
  assert.equal(partial.score, 1);
  assert.equal(partial.perfect, false);
  assert.equal(partial.results[0].correct, true);
  assert.equal(partial.results[0].explanation, "Porque sí");
  assert.equal(partial.results[1].correct, false);

  const perfect = gradeQuiz(questions, [1, 0]);
  assert.equal(perfect.score, 2);
  assert.equal(perfect.perfect, true);

  // Sin responder cuenta como incorrecta, nunca como acierto.
  const empty = gradeQuiz(questions, [null, null]);
  assert.equal(empty.score, 0);
  assert.equal(empty.results[0].chosen, null);
  assert.equal(gradeQuiz([], []).perfect, false);
});
