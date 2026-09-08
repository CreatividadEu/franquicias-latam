/**
 * Comprobación manual del job nocturno de la Liga contra la base de datos:
 * congela la semana, recalcula desde tw_xp_events e imprime el antes/después.
 * No forma parte del build; sirve para verificar la fase 2 a mano.
 *
 * Run: npx tsx scripts/tw-league-check.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { recomputeSeason, rollSeasonStatuses, snapshotWeek, weekKey } from "../src/lib/totto-way/league";

const prisma = new PrismaClient();

async function main() {
  const franchise = await prisma.franchise.findFirstOrThrow({ where: { slug: "totto" }, select: { id: true } });
  const season = await prisma.twLeagueSeason.findFirstOrThrow({ where: { franchiseId: franchise.id, status: "ACTIVE" } });

  const before = await prisma.twLeagueScore.findMany({
    where: { seasonId: season.id, entityType: "STORE" },
    orderBy: { position: "asc" },
  });
  console.log("Antes (sembrado):  ", before.map((r) => `#${r.position} ${r.points}`).join("  "));

  await rollSeasonStatuses(franchise.id);
  const snap = await snapshotWeek(season.id, weekKey(new Date()));
  const result = await recomputeSeason(season.id);
  console.log(`snapshot: ${snap} filas · recompute: ${result.users} personas, ${result.stores} tiendas`);

  const after = await prisma.twLeagueScore.findMany({
    where: { seasonId: season.id, entityType: "STORE" },
    orderBy: { position: "asc" },
  });
  const users = await prisma.twLeagueScore.findMany({
    where: { seasonId: season.id, entityType: "USER" },
    orderBy: { position: "asc" },
  });
  console.log("Después (real):    ", after.map((r) => `#${r.position} ${r.points} (prev ${r.prevPosition ?? "—"})`).join("  "));
  console.log("Personas:          ", users.map((r) => `#${r.position} ${r.points} (prev ${r.prevPosition ?? "—"})`).join("  "));

  const withStore = await prisma.twXpEvent.aggregate({ where: { franchiseId: franchise.id, storeId: { not: null } }, _sum: { points: true } });
  console.log(`Suma en tiendas: ${after.reduce((acc, r) => acc + r.points, 0)} · suma de eventos con tienda: ${withStore._sum.points}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
