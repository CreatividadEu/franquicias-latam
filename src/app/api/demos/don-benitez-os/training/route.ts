import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, MODEL, streamTextResponse } from "../_lib/anthropic";
import { TRAINING_SYSTEM_PROMPT } from "@/app/demos/don-benitez-os/_lib/prompts";
import { POINTS_BY_ID, latest } from "@/app/demos/don-benitez-os/_lib/seed";
import type { PointId, Competency } from "@/app/demos/don-benitez-os/_lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_COMPETENCIES: Competency[] = ["Servicio", "Bar", "Cocina", "Caja", "Celebraciones"];

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    pointId?: PointId;
    competency?: Competency;
  };
  const pointId = body.pointId;
  const competency = body.competency;

  if (!pointId || !POINTS_BY_ID[pointId]) {
    return NextResponse.json({ error: "pointId inválido" }, { status: 400 });
  }
  if (!competency || !VALID_COMPETENCIES.includes(competency)) {
    return NextResponse.json({ error: "competency inválida" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  const point = POINTS_BY_ID[pointId];
  const today = latest(point);

  const userMessage = `Contexto del punto:
- Nombre: ${point.name} (${point.city})
- Gerente: ${point.manager}
- NPS actual: ${today.nps}
- Wait time promedio: ${today.waitTimeAvg} min
- Food cost: ${today.foodCostPct}%
- Headline del momento: ${point.headline}
- Capacidad: ${point.capacity} personas
- Staff en planta: ${today.staffCount}

Competencia a cerrar: ${competency}

Genera el micro-módulo siguiendo exactamente el formato de las tres etiquetas.`;

  try {
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 800,
      system: TRAINING_SYSTEM_PROMPT,
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
