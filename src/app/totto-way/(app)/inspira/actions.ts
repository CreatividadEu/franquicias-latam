"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/totto-way/award";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { XP_RULES } from "@/lib/totto-way/xp";

export type ConsumeResult = { ok: true; points: number; title: string } | { ok: false; error: string; code?: string };

/**
 * Marca un contenido de Inspira como consumido. El tope de uno al día lo
 * impone el índice único parcial de `tw_xp_events`, no esta función: si ya
 * cobró hoy, `awardXp` devuelve `awarded: false` y aquí se traduce a un
 * mensaje, sin pagar dos veces.
 */
export async function consumeInspire(itemId: string): Promise<ConsumeResult> {
  const session = await getTwSessionOrNull();
  if (!session) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };
  if (!z.string().min(1).max(64).safeParse(itemId).success) return { ok: false, error: "Contenido inválido." };

  const item = await prisma.twInspireItem.findFirst({
    where: { id: itemId, franchiseId: session.franchiseId, publishedAt: { not: null } },
    select: { id: true, title: true },
  });
  if (!item) return { ok: false, error: "Ese contenido no está disponible." };

  const award = await awardXp({
    franchiseId: session.franchiseId,
    userId: session.user.id,
    storeId: session.scope.homeStoreId,
    source: "INSPIRE",
    points: XP_RULES.INSPIRE,
    meta: { item: item.title },
    timeZone: session.employee?.store?.timezone ?? undefined,
  });

  revalidatePath(NAV_HREF.inspire);
  revalidatePath(NAV_HREF.home);

  if (!award.awarded) {
    return { ok: false, code: "ALREADY_CLAIMED", error: "Ya cobraste el XP de Inspira hoy. Vuelve mañana." };
  }
  return { ok: true, points: award.points, title: item.title };
}
