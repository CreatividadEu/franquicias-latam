import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { forbidden, unauthorized } from "@/lib/totto-way/api";
import { teamCsv } from "@/lib/totto-way/leader";
import { getLeaderView } from "@/lib/totto-way/queries";
import { canSeeLeaderPanel } from "@/lib/totto-way/scope";

export const runtime = "nodejs";

/** CSV del equipo visible para el líder, respetando el filtro de tienda. */
export async function GET(request: Request) {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  if (!canSeeLeaderPanel(session.user.role)) return forbidden();

  const storeId = new URL(request.url).searchParams.get("tienda");
  const view = await getLeaderView(session, storeId);
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(`﻿${teamCsv(view.rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="totto-way-equipo-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
