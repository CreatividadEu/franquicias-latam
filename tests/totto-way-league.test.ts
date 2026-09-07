import test from "node:test";
import assert from "node:assert/strict";
import { computeStandings, positionDelta, seasonCountdown, SCORING_TABLE, weekKey } from "../src/lib/totto-way/league";
import { buildTimeline, CAREER_PATH, careerProgress } from "../src/lib/totto-way/journey";
import { daysSince, isInactive, teamCsv, teamKpis, type TeamMemberRow } from "../src/lib/totto-way/leader";

test("la clasificación ordena por puntos y comparte posición en empate", () => {
  const standings = computeStandings([
    { entityId: "b", points: 100 },
    { entityId: "a", points: 300 },
    { entityId: "c", points: 100 },
    { entityId: "d", points: 50 },
  ]);
  assert.deepEqual(
    standings.map((s) => [s.entityId, s.position]),
    [
      ["a", 1],
      ["b", 2],
      ["c", 2],
      ["d", 4],
    ],
    "empate comparte el 2 y el siguiente salta al 4",
  );
  assert.deepEqual(computeStandings([]), []);
});

test("el orden es estable entre ejecuciones del job", () => {
  const rows = [
    { entityId: "z", points: 10 },
    { entityId: "a", points: 10 },
  ];
  assert.deepEqual(computeStandings(rows).map((s) => s.entityId), ["a", "z"]);
  assert.deepEqual(computeStandings([...rows].reverse()).map((s) => s.entityId), ["a", "z"]);
});

test("weekKey usa semanas ISO", () => {
  assert.equal(weekKey(new Date("2026-09-07T12:00:00Z")), "2026-W37");
  // El 1 de enero de 2027 cae en viernes: pertenece a la semana 53 de 2026.
  assert.equal(weekKey(new Date("2027-01-01T12:00:00Z")), "2026-W53");
  // Un lunes y el domingo siguiente comparten semana.
  assert.equal(weekKey(new Date("2026-08-31T00:00:00Z")), weekKey(new Date("2026-09-06T23:00:00Z")));
});

test("el delta compara con la semana anterior", () => {
  assert.equal(positionDelta(2, 4), 2, "subir dos puestos es positivo");
  assert.equal(positionDelta(5, 3), -2);
  assert.equal(positionDelta(1, 1), 0);
  assert.equal(positionDelta(1, null), null, "sin foto previa no hay delta");
  assert.equal(positionDelta(1, 0), null);
});

test("la cuenta regresiva de la temporada", () => {
  const now = new Date("2026-09-07T12:00:00Z");
  assert.deepEqual(seasonCountdown(new Date("2026-09-30T12:00:00Z"), now), { days: 23, ended: false });
  assert.deepEqual(seasonCountdown(new Date("2026-09-01T12:00:00Z"), now), { days: 0, ended: true });
  assert.equal(SCORING_TABLE.length, 6);
});

test("la línea de tiempo ordena y marca el hito actual", () => {
  const now = new Date("2026-09-07T12:00:00Z");
  const items = buildTimeline(
    [
      { id: "3", type: "BADGE", title: "Insignia", desc: "", date: new Date("2026-06-01"), icon: "badge" },
      { id: "1", type: "JOINED", title: "Ingreso", desc: "", date: new Date("2025-03-10"), icon: "flag" },
      { id: "4", type: "CUSTOM", title: "Futuro", desc: "", date: new Date("2026-12-01"), icon: "star" },
    ],
    now,
  );
  assert.deepEqual(items.map((i) => i.id), ["1", "3", "4"]);
  assert.deepEqual(items.map((i) => i.done), [true, true, false]);
  assert.deepEqual(items.map((i) => i.current), [false, true, false], "el actual es el último ya ocurrido");
  assert.deepEqual(buildTimeline([], now), []);
});

test("la ruta de carrera cruza capítulos completados con el rol", () => {
  const progress = careerProgress([1, 2], "TW_ASESOR");
  assert.equal(progress.length, CAREER_PATH.length);
  assert.equal(progress[0].complete, true, "Asesor solo exige el capítulo 1");
  assert.equal(progress[0].current, true);
  assert.equal(progress[1].done, 2);
  assert.equal(progress[1].complete, false, "Asesor senior exige tres capítulos");
  assert.equal(progress[3].current, false);
  assert.equal(careerProgress([1, 2, 3, 4, 5, 6, 7], "TW_JEFE_COMERCIAL").every((step) => step.complete), true);
});

function member(overrides: Partial<TeamMemberRow> = {}): TeamMemberRow {
  return {
    userId: "u1",
    name: "Camila Rojas",
    initials: "CR",
    roleTitle: "Asesor comercial",
    storeName: "Totto Andino",
    currentLesson: "Ecosistema SER",
    lessonsDone: 5,
    lessonsTotal: 8,
    pct: 63,
    points: 2450,
    lastActivityAt: new Date("2026-09-06T12:00:00Z"),
    inactiveDays: 1,
    pendingCheckpoint: null,
    ...overrides,
  };
}

test("la inactividad se cuenta en días completos", () => {
  const now = new Date("2026-09-07T12:00:00Z");
  assert.equal(daysSince(new Date("2026-09-01T12:00:00Z"), now), 6);
  assert.equal(daysSince(null, now), null);
  assert.equal(isInactive(new Date("2026-09-01T12:00:00Z"), now), false, "6 días todavía no alerta");
  assert.equal(isInactive(new Date("2026-08-31T12:00:00Z"), now), true, "7 días alerta");
  assert.equal(isInactive(null, now), true, "sin actividad registrada también alerta");
});

test("los KPIs del equipo resumen actividad, progreso y pendientes", () => {
  const now = new Date("2026-09-07T12:00:00Z");
  const rows = [
    member(),
    member({ userId: "u2", pct: 25, lastActivityAt: new Date("2026-08-20T12:00:00Z") }),
    member({ userId: "u3", pct: 100, pendingCheckpoint: { checkpointId: "c1", chapter: "Introducción", xp: 150 } }),
  ];
  const kpis = teamKpis(rows, now);
  assert.equal(kpis.total, 3);
  assert.equal(kpis.inactive, 1);
  assert.equal(kpis.active, 2);
  assert.equal(kpis.averagePct, 63);
  assert.equal(kpis.pendingCheckpoints, 1);
  assert.deepEqual(teamKpis([], now), { total: 0, active: 0, averagePct: 0, pendingCheckpoints: 0, inactive: 0 });
});

test("el CSV escapa comas y comillas", () => {
  const csv = teamCsv([member({ name: 'Rojas, "Cami"', currentLesson: "Antena; seguridad" })], new Date("2026-09-07T12:00:00Z"));
  const [header, row] = csv.split("\n");
  assert.match(header, /^Nombre,Rol,Tienda/);
  assert.ok(row.includes('"Rojas, ""Cami"""'), row);
  assert.ok(row.includes('"Antena; seguridad"'), row);
  assert.equal(teamCsv([]).split("\n").length, 1, "sin filas queda solo la cabecera");
});
