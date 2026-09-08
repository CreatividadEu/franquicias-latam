import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { forbidden, jsonError, readJson, unauthorized } from "@/lib/totto-way/api";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { canEditContent } from "@/lib/totto-way/scope";
import { isUploadKind } from "@/lib/totto-way/storage";

export const runtime = "nodejs";

const BodySchema = z.object({
  kind: z.string().min(2).max(20),
  path: z.string().trim().min(3).max(400),
  fileName: z.string().trim().min(1).max(200),
  mime: z.string().trim().min(3).max(120),
  sizeBytes: z.number().int().min(1),
  /** Slug del capítulo al que pertenece, cuando es el PDF del manual. */
  chapterSlug: z.string().trim().max(80).nullish(),
});

/** Registra en la base un archivo ya subido y devuelve su URL de servicio. */
export async function POST(request: Request) {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  if (!canEditContent(session.user.role)) return forbidden();

  const parsed = BodySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Datos del archivo inválidos.", 400);

  const { kind, path, fileName, mime, sizeBytes, chapterSlug } = parsed.data;
  if (!isUploadKind(kind)) return jsonError("Tipo de archivo no admitido.", 400);

  // La ruta la firmó /sign con el franchiseId de esta sesión: comprobar el
  // prefijo impide registrar un objeto de otra franquicia.
  if (!path.startsWith(`${session.franchiseId}/`)) return forbidden();

  const kindToMedia = { PDF: "PDF", POSTER: "POSTER", IMAGE: "IMAGE", VIDEO: "VIDEO", SUBTITLE: "SUBTITLE" } as const;

  const asset = await prisma.twMediaAsset.create({
    data: {
      franchiseId: session.franchiseId,
      kind: kindToMedia[kind],
      storagePath: path,
      originalName: fileName,
      mime,
      sizeBytes,
      status: "READY",
      meta: chapterSlug ? { chapterSlug } : undefined,
    },
    select: { id: true },
  });

  return NextResponse.json({ assetId: asset.id, url: `/api/totto-way/media/${asset.id}` });
}
