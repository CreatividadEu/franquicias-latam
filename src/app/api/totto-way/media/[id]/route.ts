import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, unauthorized } from "@/lib/totto-way/api";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { createReadUrl } from "@/lib/totto-way/storage";

export const runtime = "nodejs";

/**
 * Sirve un archivo del bucket privado a quien tenga sesión en el LMS y sea de
 * la misma franquicia. Redirige a una URL firmada de corta vida en vez de
 * proxear el binario, para no pagar el ancho de banda de un video por Vercel.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();

  const { id } = await params;
  const asset = await prisma.twMediaAsset.findFirst({
    where: { id, franchiseId: session.franchiseId },
    select: { storagePath: true },
  });
  if (!asset) return jsonError("Archivo no encontrado.", 404);

  const url = await createReadUrl(asset.storagePath);
  if (!url) return jsonError("El almacenamiento no está configurado.", 503);

  return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "no-store" } });
}
