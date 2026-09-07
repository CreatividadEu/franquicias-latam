import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import * as prismaModule from "../src/lib/prisma";
import { awardXp } from "../src/lib/totto-way/award";

type AnyFn = (...args: unknown[]) => unknown;
type Calls = { table: string; op: string; args: unknown }[];

const prisma = prismaModule.prisma as unknown as Record<string, unknown>;

/**
 * Stub del cliente Prisma: registra cada llamada y devuelve lo que se le pida.
 * `awardXp` corre dentro de $transaction, así que basta con invocar el callback
 * con este mismo objeto.
 */
function stubPrisma(options: {
  employee?: { id: string; xpTotal: number; streakDays: number; lastActivityAt: Date | null } | null;
  season?: { id: string } | null;
  badge?: { id: string; name: string } | null;
  throwOnEvent?: unknown;
}) {
  const calls: Calls = [];
  const record = (table: string, op: string) => (args: unknown) => {
    calls.push({ table, op, args });
    if (table === "twXpEvent" && op === "create" && options.throwOnEvent) throw options.throwOnEvent;
    if (table === "twEmployee" && op === "findUnique") return Promise.resolve(options.employee ?? null);
    if (table === "twLeagueSeason") return Promise.resolve(options.season ?? null);
    if (table === "twBadge") return Promise.resolve(options.badge ?? null);
    return Promise.resolve({});
  };

  const tx = {
    twXpEvent: { create: record("twXpEvent", "create") },
    twEmployee: { findUnique: record("twEmployee", "findUnique"), update: record("twEmployee", "update") },
    twBadge: { findUnique: record("twBadge", "findUnique") },
    twUserBadge: { upsert: record("twUserBadge", "upsert") },
    twJourneyMilestone: { create: record("twJourneyMilestone", "create") },
    twLeagueSeason: { findFirst: record("twLeagueSeason", "findFirst") },
    twLeagueScore: { upsert: record("twLeagueScore", "upsert") },
  };

  const original: Record<string, unknown> = {};
  for (const key of ["$transaction", "twEmployee", "twXpEvent", "twBadge", "twUserBadge", "twJourneyMilestone", "twLeagueSeason", "twLeagueScore"]) {
    original[key] = prisma[key];
  }
  prisma.$transaction = ((fn: (client: typeof tx) => unknown) => Promise.resolve(fn(tx))) as AnyFn;
  Object.assign(prisma, tx);

  return {
    calls,
    restore: () => Object.assign(prisma, original),
    find: (table: string, op: string) => calls.find((c) => c.table === table && c.op === op),
    all: (table: string, op: string) => calls.filter((c) => c.table === table && c.op === op),
  };
}

const BASE = { franchiseId: "f1", userId: "u1", storeId: "s1", source: "LESSON" as const, points: 120, refId: "l6" };

test("paga la lección: crea el evento, sube el acumulado y suma a la Liga", async () => {
  const stub = stubPrisma({
    employee: { id: "e1", xpTotal: 2450, streakDays: 12, lastActivityAt: new Date("2026-09-06T15:00:00Z") },
    season: { id: "season-q3" },
  });
  try {
    const result = await awardXp({ ...BASE, now: new Date("2026-09-07T15:00:00Z"), timeZone: "America/Bogota" });

    assert.equal(result.awarded, true);
    assert.equal(result.points, 120);
    assert.equal(result.xpTotal, 2570);
    assert.equal(result.streakDays, 13, "día siguiente suma racha");
    assert.deepEqual(result.badges, []);

    const event = stub.find("twXpEvent", "create")?.args as { data: Record<string, unknown> };
    assert.equal(event.data.dayKey, "2026-09-07");
    assert.equal(event.data.refId, "l6");
    assert.equal(event.data.points, 120);

    const update = stub.find("twEmployee", "update")?.args as { data: Record<string, unknown> };
    assert.equal(update.data.xpTotal, 2570);
    assert.equal(update.data.streakDays, 13);

    // Un score por usuario y otro por tienda.
    const scores = stub.all("twLeagueScore", "upsert").map((c) => (c.args as { where: { seasonId_entityType_entityId: { entityType: string } } }).where.seasonId_entityType_entityId.entityType);
    assert.deepEqual(scores, ["USER", "STORE"]);
  } finally {
    stub.restore();
  }
});

test("al cruzar los 5.000 XP entrega la insignia Guía con su hito", async () => {
  const stub = stubPrisma({
    employee: { id: "e1", xpTotal: 4950, streakDays: 3, lastActivityAt: new Date("2026-09-07T10:00:00Z") },
    season: null,
    badge: { id: "badge-guia", name: "Guía" },
  });
  try {
    const result = await awardXp({ ...BASE, points: 120, now: new Date("2026-09-07T15:00:00Z") });
    assert.equal(result.xpTotal, 5070);
    assert.deepEqual(result.badges.map((b) => b.code), ["GUIA"]);
    assert.ok(stub.find("twUserBadge", "upsert"), "guarda la insignia");
    const milestone = stub.find("twJourneyMilestone", "create")?.args as { data: { type: string; title: string } };
    assert.equal(milestone.data.type, "BADGE");
    assert.match(milestone.data.title, /Guía/);
    assert.equal(stub.all("twLeagueScore", "upsert").length, 0, "sin temporada activa no toca la Liga");
  } finally {
    stub.restore();
  }
});

test("el índice único corta el doble pago y no altera el acumulado", async () => {
  const duplicate = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.19.2",
  });
  const stub = stubPrisma({
    employee: { id: "e1", xpTotal: 2570, streakDays: 13, lastActivityAt: new Date() },
    throwOnEvent: duplicate,
  });
  try {
    const result = await awardXp({ ...BASE, now: new Date("2026-09-07T15:00:00Z") });
    assert.equal(result.awarded, false);
    assert.equal(result.points, 0);
    assert.equal(result.xpTotal, 2570, "conserva el acumulado real");
    assert.equal(stub.all("twEmployee", "update").length, 0, "no vuelve a sumar");
  } finally {
    stub.restore();
  }
});

test("un formador sin ficha de empleado genera el evento pero no acumula", async () => {
  const stub = stubPrisma({ employee: null, season: { id: "s" } });
  try {
    const result = await awardXp({ ...BASE, storeId: null, now: new Date() });
    assert.equal(result.awarded, true);
    assert.equal(result.xpTotal, 0);
    assert.equal(stub.all("twEmployee", "update").length, 0);
  } finally {
    stub.restore();
  }
});

test("un pago de 0 o negativo no escribe nada", async () => {
  const stub = stubPrisma({ employee: { id: "e1", xpTotal: 100, streakDays: 1, lastActivityAt: null } });
  try {
    const result = await awardXp({ ...BASE, points: 0 });
    assert.equal(result.awarded, false);
    assert.equal(result.xpTotal, 100);
    assert.equal(stub.all("twXpEvent", "create").length, 0);
  } finally {
    stub.restore();
  }
});
