import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatZodIssues, jsonError, readJson, requireAdminApi, unauthorized } from "@/lib/sandbox/admin";
import { classifyAsset, normalizeMime, validateAssetSize } from "@/lib/sandbox/extract";
import { SANDBOX_ASSET_KIND_IDS } from "@/lib/sandbox/schemas";
import { assetStoragePath, createAssetUploadUrl } from "@/lib/sandbox/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const prepareSchema = z.object({
  kind: z.enum(SANDBOX_ASSET_KIND_IDS),
  files: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        mime: z.string().max(120).default(""),
        size: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .max(10),
});

/**
 * POST — prepara subidas (§7 paso 2): crea las filas SandboxAsset y devuelve
 * una URL firmada por archivo. El navegador sube directo a Supabase (bucket
 * privado); si una subida falla, el cliente borra la fila con DELETE.
 */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id } = await params;

  const session = await prisma.sandboxSession.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!session) return jsonError("Sesión no encontrada", 404);
  if (session.status === "ARCHIVED") return jsonError("La sesión está archivada");

  const parsed = prepareSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Datos inválidos", 400, { issues: formatZodIssues(parsed.error) });

  const rejected: { name: string; reason: string }[] = [];
  const accepted: { name: string; mime: string; size: number }[] = [];
  for (const file of parsed.data.files) {
    const handler = classifyAsset(file.mime, file.name);
    if (!handler) {
      rejected.push({ name: file.name, reason: "Tipo no soportado (PDF, imagen, DOCX, XLSX, CSV, TXT o MD)" });
      continue;
    }
    const sizeError = validateAssetSize(handler, file.size);
    if (sizeError) {
      rejected.push({ name: file.name, reason: sizeError });
      continue;
    }
    accepted.push({ name: file.name, mime: normalizeMime(file.mime, file.name), size: file.size });
  }
  if (accepted.length === 0) return jsonError("Ningún archivo válido", 400, { rejected });

  const uploads: { assetId: string; name: string; signedUrl: string; token: string; path: string }[] = [];
  try {
    for (const file of accepted) {
      const asset = await prisma.sandboxAsset.create({
        data: {
          sessionId: session.id,
          kind: parsed.data.kind.toUpperCase() as "MENU" | "CATALOG" | "PRICE_LIST" | "SALES_NOTES" | "OPEX_NOTES" | "OSINT" | "MARKETING_AUDIT" | "OTHER",
          storagePath: "pending",
          originalName: file.name,
          mime: file.mime,
          sizeBytes: file.size,
        },
      });
      const path = assetStoragePath(session.id, asset.id, file.name);
      await prisma.sandboxAsset.update({ where: { id: asset.id }, data: { storagePath: path } });
      const signed = await createAssetUploadUrl(path);
      uploads.push({ assetId: asset.id, name: file.name, signedUrl: signed.signedUrl, token: signed.token, path });
    }
  } catch (error) {
    console.error("[admin/sandbox] prepare upload", error);
    // Limpia las filas que quedaron sin URL firmada.
    const created = uploads.map((u) => u.assetId);
    await prisma.sandboxAsset.deleteMany({ where: { sessionId: session.id, storagePath: "pending", id: { notIn: created } } });
    return jsonError(error instanceof Error ? error.message : "No se pudo preparar la subida", 500, { uploads, rejected });
  }

  return NextResponse.json({ uploads, rejected });
}
