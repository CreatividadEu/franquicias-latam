import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requireAdminApi, unauthorized } from "@/lib/sandbox/admin";
import { createAssetDownloadUrl, deleteAssetObject } from "@/lib/sandbox/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; assetId: string }> };

/** GET — redirige a una URL firmada de 2 minutos para que el admin revise el documento. */
export async function GET(_req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id, assetId } = await params;
  const asset = await prisma.sandboxAsset.findFirst({ where: { id: assetId, sessionId: id } });
  if (!asset || asset.storagePath === "pending") return jsonError("Archivo no encontrado", 404);
  try {
    const url = await createAssetDownloadUrl(asset.storagePath, asset.originalName);
    return NextResponse.redirect(url, 302);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "No se pudo firmar la descarga", 500);
  }
}

/** DELETE — borra objeto y fila. El preload no se toca: se reconstruye con «Procesar». */
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id, assetId } = await params;
  const asset = await prisma.sandboxAsset.findFirst({ where: { id: assetId, sessionId: id } });
  if (!asset) return jsonError("Archivo no encontrado", 404);
  if (asset.storagePath !== "pending") await deleteAssetObject(asset.storagePath);
  await prisma.sandboxAsset.delete({ where: { id: asset.id } });
  return NextResponse.json({ ok: true });
}
