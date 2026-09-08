import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson } from "@/lib/totto-way/api";
import { awardStoreXp } from "@/lib/totto-way/award";
import { monthKey, NPS_THRESHOLD, verifyWebhook } from "@/lib/totto-way/webhooks";
import { XP_RULES } from "@/lib/totto-way/xp";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * NPS mensual por tienda (PLAN §6). Un NPS de 9 o más suma +300 XP a la
 * tienda entera, una sola vez por mes: la clave de idempotencia es
 * (tienda, NPS, "nps:YYYY-MM") y la sostiene un índice único parcial.
 *
 *   POST /api/totto-way/webhooks/nps
 *   x-totto-way-secret: <NPS_WEBHOOK_SECRET>
 *   { "month": "2026-09", "scores": [{ "storeCode": "andino", "nps": 9.4 }] }
 */
const BodySchema = z.object({
  month: z.string().trim().min(7).max(7),
  scores: z
    .array(z.object({ storeCode: z.string().trim().min(1).max(60), nps: z.number().min(0).max(10) }))
    .min(1)
    .max(500),
});

export async function POST(request: Request) {
  const auth = verifyWebhook(request, "NPS_WEBHOOK_SECRET");
  if (!auth.ok) {
    return auth.reason === "NOT_CONFIGURED"
      ? jsonError("La integración de NPS no está configurada.", 503)
      : jsonError("No autorizado", 401);
  }

  const parsed = BodySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Cuerpo inválido: se espera { month: 'YYYY-MM', scores: [...] }.", 400);

  const month = monthKey(parsed.data.month);
  if (!month) return jsonError("El mes debe venir como YYYY-MM.", 400);

  let awarded = 0;
  let belowThreshold = 0;
  const unknown: string[] = [];

  for (const score of parsed.data.scores) {
    const store = await prisma.twStore.findFirst({
      where: { code: { equals: score.storeCode, mode: "insensitive" } },
      select: { id: true, franchiseId: true, timezone: true },
    });
    if (!store) {
      if (unknown.length < 20) unknown.push(score.storeCode);
      continue;
    }
    if (score.nps < NPS_THRESHOLD) {
      belowThreshold += 1;
      continue;
    }

    const result = await awardStoreXp({
      franchiseId: store.franchiseId,
      storeId: store.id,
      source: "NPS",
      points: XP_RULES.NPS,
      refId: `nps:${month}`,
      meta: { month, nps: score.nps },
      timeZone: store.timezone,
    });
    if (result.awarded) awarded += 1;
  }

  if (unknown.length > 0) {
    console.warn("[totto-way/nps] códigos de tienda desconocidos:", unknown.join(", "));
  }

  return NextResponse.json({
    ok: true,
    month,
    received: parsed.data.scores.length,
    awarded,
    belowThreshold,
    unknownStores: unknown.length,
  });
}
