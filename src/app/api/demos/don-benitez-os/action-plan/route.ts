import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, MODEL, streamTextResponse } from "../_lib/anthropic";
import { ACTION_PLAN_SYSTEM_PROMPT } from "@/app/demos/don-benitez-os/_lib/prompts";
import { POINTS_BY_ID, latest } from "@/app/demos/don-benitez-os/_lib/seed";
import type { PointId } from "@/app/demos/don-benitez-os/_lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { pointId?: PointId };
  const pointId = body.pointId;

  if (!pointId || !POINTS_BY_ID[pointId]) {
    return NextResponse.json({ error: "pointId inválido" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  const point = POINTS_BY_ID[pointId];
  const recent = point.daily.slice(-14);
  const avgRevenue = Math.round(recent.reduce((a, d) => a + d.revenue, 0) / recent.length);
  const avgWait = recent.reduce((a, d) => a + d.waitTimeAvg, 0) / recent.length;
  const avgNps = Math.round(recent.reduce((a, d) => a + d.nps, 0) / recent.length);
  const today = latest(point);

  const userMessage = `Diagnóstico de ${point.name} (${point.city}, gerente ${point.manager}):

Últimos 14 días:
- Ingresos promedio diario: $${avgRevenue.toLocaleString("es-CO")} COP
- Wait time promedio: ${avgWait.toFixed(1)} min
- NPS promedio: ${avgNps}
- Food cost: ${today.foodCostPct}%
- Staff: ${today.staffCount} / vacantes abiertas: ${today.positionsOpen}

Anomalía detectada: ${point.headline}

Propón 3 palancas ejecutables HOY según el formato especificado.`;

  try {
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 500,
      system: ACTION_PLAN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return new Response(streamTextResponse(stream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "stream-failed" },
      { status: 502 }
    );
  }
}
