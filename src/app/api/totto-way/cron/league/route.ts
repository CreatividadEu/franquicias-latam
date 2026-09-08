import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCron } from "@/lib/totto-way/cron";
import { recomputeSeason, rollSeasonStatuses, snapshotWeek, weekKey } from "@/lib/totto-way/league";
import { unauthorized } from "@/lib/totto-way/api";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Job nocturno de la Liga: abre y cierra temporadas, recalcula la
 * clasificación desde los eventos de XP y, los lunes, congela la foto semanal
 * que sostiene el delta ▲▼. `?snapshot=1` la fuerza fuera de lunes.
 */
async function run(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const url = new URL(request.url);
  const now = new Date();
  const forceSnapshot = url.searchParams.get("snapshot") === "1";
  const isMonday = now.getUTCDay() === 1;

  const franchises = await prisma.twSettings.findMany({ select: { franchiseId: true } });
  const report: { franchiseId: string; season: string | null; users: number; stores: number; snapshot: number }[] = [];

  for (const { franchiseId } of franchises) {
    await rollSeasonStatuses(franchiseId, now);
    const season = await prisma.twLeagueSeason.findFirst({
      where: { franchiseId, status: "ACTIVE" },
      orderBy: { startsAt: "desc" },
      select: { id: true, name: true },
    });
    if (!season) {
      report.push({ franchiseId, season: null, users: 0, stores: 0, snapshot: 0 });
      continue;
    }

    // El snapshot va ANTES del recálculo: guarda las posiciones de la semana
    // que termina, y el recálculo las lee como "anterior" para el delta.
    const snapshot = isMonday || forceSnapshot ? await snapshotWeek(season.id, weekKey(now)) : 0;
    const { users, stores } = await recomputeSeason(season.id);
    report.push({ franchiseId, season: season.name, users, stores, snapshot });
  }

  return NextResponse.json({ ok: true, at: now.toISOString(), week: weekKey(now), report });
}

export const GET = run;
export const POST = run;
