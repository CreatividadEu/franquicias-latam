import test from "node:test";
import assert from "node:assert/strict";
import {
  badgeFor,
  badgeProgress,
  badgesUnlocked,
  currentStreak,
  dayKey,
  isDailyCapped,
  lessonReward,
  nextBadge,
  nextStreak,
  XP_RULES,
} from "../src/lib/totto-way/xp";

test("insignias por umbral", () => {
  assert.equal(badgeFor(0).code, "EXPLORADOR");
  assert.equal(badgeFor(4999).code, "EXPLORADOR");
  assert.equal(badgeFor(5000).code, "GUIA");
  assert.equal(badgeFor(12000).code, "LIDER_RUTA");
  assert.equal(badgeFor(99999).code, "CUMBRE");
  assert.deepEqual(nextBadge(2450), { code: "GUIA", minXp: 5000, icon: "map", remaining: 2550 });
  assert.equal(nextBadge(25000), null);
  assert.deepEqual(badgesUnlocked(4900, 5100).map((b) => b.code), ["GUIA"]);
  assert.deepEqual(badgesUnlocked(100, 200), []);
  assert.equal(badgeProgress(2500), 0.5);
  assert.equal(badgeProgress(30000), 1);
});

test("dayKey respeta la zona horaria", () => {
  // 03:30Z del 7 de septiembre es todavía 6 de septiembre en Bogotá (UTC-5).
  const d = new Date("2026-09-07T03:30:00Z");
  assert.equal(dayKey(d, "America/Bogota"), "2026-09-06");
  assert.equal(dayKey(d, "UTC"), "2026-09-07");
});

test("racha: mismo día no cambia, día siguiente suma, hueco reinicia", () => {
  const tz = "America/Bogota";
  const base = new Date("2026-09-06T15:00:00Z");
  assert.equal(nextStreak({ streakDays: 0, lastActivityAt: null }, base, tz), 1);
  assert.equal(nextStreak({ streakDays: 5, lastActivityAt: base }, new Date("2026-09-06T23:00:00Z"), tz), 5);
  assert.equal(nextStreak({ streakDays: 5, lastActivityAt: base }, new Date("2026-09-07T15:00:00Z"), tz), 6);
  assert.equal(nextStreak({ streakDays: 5, lastActivityAt: base }, new Date("2026-09-09T15:00:00Z"), tz), 1);
  assert.equal(currentStreak({ streakDays: 12, lastActivityAt: base }, new Date("2026-09-07T15:00:00Z"), tz), 12);
  assert.equal(currentStreak({ streakDays: 12, lastActivityAt: base }, new Date("2026-09-10T15:00:00Z"), tz), 0);
});

test("recompensa de lección y bonus de quiz perfecto", () => {
  assert.deepEqual(lessonReward(120, { correct: 3, total: 3 }), { base: 120, bonus: XP_RULES.QUIZ_PERFECT, total: 160, perfect: true });
  assert.deepEqual(lessonReward(80, { correct: 2, total: 3 }), { base: 80, bonus: 0, total: 80, perfect: false });
  assert.equal(lessonReward(50).total, 50);
  assert.ok(isDailyCapped("ATTENDANCE"));
  assert.ok(isDailyCapped("INSPIRE"));
  assert.ok(!isDailyCapped("LESSON"));
});
