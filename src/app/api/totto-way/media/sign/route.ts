import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, jsonError, readJson, unauthorized } from "@/lib/totto-way/api";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { canEditContent } from "@/lib/totto-way/scope";
import { acceptsMime, assetStoragePath, createUploadUrl, isUploadKind, UPLOAD_KINDS } from "@/lib/totto-way/storage";

export const runtime = "nodejs";

const BodySchema = z.object({
  kind: z.string().min(2).max(20),
  fileName: z.string().trim().min(1).max(200),
  mime: z.string().trim().min(3).max(120),
  sizeBytes: z.number().int().min(1),
});

/**
 * Firma una subida al bucket privado. El archivo va directo del navegador a
 * Supabase, así que Vercel no ve el binario. Devuelve además el `path`, que el
 * cliente manda de vuelta a /register cuando la subida termina.
 */
export async function POST(request: Request) {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  if (!canEditContent(session.user.role)) return forbidden();

  const parsed = BodySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Datos de subida inválidos.", 400);

  const { kind, fileName, mime, sizeBytes } = parsed.data;
  if (!isUploadKind(kind)) return jsonError("Tipo de archivo no admitido.", 400);
  if (!acceptsMime(kind, mime)) {
    return jsonError(`Un ${kind} debe ser ${UPLOAD_KINDS[kind].mime.join(" o ")}.`, 400);
  }
  if (sizeBytes > UPLOAD_KINDS[kind].maxBytes) {
    return jsonError(`El archivo supera el máximo de ${Math.round(UPLOAD_KINDS[kind].maxBytes / 1024 / 1024)} MB.`, 400);
  }

  // El id se genera aquí para que la ruta del objeto no dependa del nombre.
  const assetId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  const path = assetStoragePath(session.franchiseId, kind, assetId, fileName);

  try {
    const { signedUrl, token } = await createUploadUrl(path);
    return NextResponse.json({ signedUrl, token, path, assetId });
  } catch (error) {
    console.error("[totto-way/media/sign]", error);
    return jsonError("No se pudo preparar la subida. Revisa la configuración de Supabase.", 503);
  }
}
