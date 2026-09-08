import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson } from "@/lib/totto-way/api";
import { awardXp } from "@/lib/totto-way/award";
import { verifyWebhook } from "@/lib/totto-way/webhooks";
import { XP_RULES } from "@/lib/totto-way/xp";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Cuánto se acepta que el proveedor reenvíe hacia atrás: 48 horas. */
const MAX_BACKDATE_MS = 48 * 60 * 60 * 1000;

/**
 * Marcación de jornada desde Geovictoria (PLAN §6).
 *
 * Contrato acordado con el proveedor: una llamada puede traer varias
 * marcaciones. Solo la ENTRADA puntual paga, +10 XP, una vez al día; el tope
 * lo impone el índice único parcial de tw_xp_events, no este código, así que
 * reenviar el mismo lote no paga dos veces.
 *
 *   POST /api/totto-way/webhooks/geovictoria
 *   x-totto-way-secret: <GEOVICTORIA_WEBHOOK_SECRET>
 *   { "events": [{ "employeeCode": "TA-0412", "type": "IN", "at": "2026-09-07T13:02:00Z", "onTime": true }] }
 */
const BodySchema = z.object({
  events: z
    .array(
      z.object({
        employeeCode: z.string().trim().min(1).max(40),
        type: z.enum(["IN", "OUT", "PAUSE", "RESUME"]),
        at: z.string().datetime().optional(),
        /** Ausente = se asume puntual; el proveedor solo lo manda cuando hay retraso. */
        onTime: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(500),
});

export async function POST(request: Request) {
  const auth = verifyWebhook(request, "GEOVICTORIA_WEBHOOK_SECRET");
  if (!auth.ok) {
    return auth.reason === "NOT_CONFIGURED"
      ? jsonError("La integración con Geovictoria no está configurada.", 503)
      : jsonError("No autorizado", 401);
  }

  const parsed = BodySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Cuerpo inválido: se espera { events: [...] }.", 400);

  let awarded = 0;
  let skipped = 0;
  const unknown: string[] = [];

  for (const event of parsed.data.events) {
    if (event.type !== "IN" || event.onTime === false) {
      skipped += 1;
      continue;
    }

    const employee = await prisma.twEmployee.findFirst({
      where: { employeeCode: { equals: event.employeeCode, mode: "insensitive" } },
      select: { userId: true, franchiseId: true, storeId: true, store: { select: { timezone: true } } },
    });
    if (!employee) {
      if (unknown.length < 20) unknown.push(event.employeeCode);
      continue;
    }

    // La marca del proveedor se acota: un lote atrasado o con fecha futura
    // movía `lastActivityAt` y rompía la racha y las alertas de inactividad.
    const now = new Date();
    const reported = event.at ? new Date(event.at) : now;
    const floor = new Date(now.getTime() - MAX_BACKDATE_MS);
    const at = reported > now ? now : reported < floor ? floor : reported;
    const result = await awardXp({
      franchiseId: employee.franchiseId,
      userId: employee.userId,
      storeId: employee.storeId,
      source: "ATTENDANCE",
      points: XP_RULES.ATTENDANCE,
      meta: { employeeCode: event.employeeCode },
      timeZone: employee.store?.timezone ?? undefined,
      now: at,
    });
    if (result.awarded) awarded += 1;
    else skipped += 1;
  }

  if (unknown.length > 0) {
    console.warn("[totto-way/geovictoria] códigos sin colaborador:", unknown.join(", "));
  }

  return NextResponse.json({
    ok: true,
    received: parsed.data.events.length,
    awarded,
    skipped,
    unknownCodes: unknown.length,
  });
}
