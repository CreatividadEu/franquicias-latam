import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { ensureFranchiseStorageBucket } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

function sanitizeBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.pdf$/i, "");
  const normalized = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || "brochure";
}

async function ensureBucketAcceptsPdf() {
  const storage = await ensureFranchiseStorageBucket();
  if (!storage) {
    return null;
  }

  const { client, bucket } = storage;
  const { data: bucketData, error } = await client.storage.getBucket(bucket);

  const allowedMimeTypes = bucketData?.allowed_mime_types ?? null;
  const fileSizeLimit = bucketData?.file_size_limit ?? undefined;

  if (error || !allowedMimeTypes?.length) {
    return storage;
  }

  if (allowedMimeTypes.includes("application/pdf")) {
    return storage;
  }

  const nextAllowedMimeTypes = [...new Set([...allowedMimeTypes, "application/pdf"])];
  const { error: updateError } = await client.storage.updateBucket(bucket, {
    public: bucketData.public,
    fileSizeLimit,
    allowedMimeTypes: nextAllowedMimeTypes,
  });

  if (updateError) {
    console.warn(
      "[brochure-upload] Could not add application/pdf to bucket allowed mime types:",
      updateError.message
    );
  }

  return storage;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: franchiseId } = await params;

  try {
    const franchise = await prisma.franchise.findUnique({
      where: { id: franchiseId },
      select: { id: true },
    });

    if (!franchise) {
      return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
    }

    const body = (await request.json()) as {
      contentType?: string;
      fileName?: string;
      fileSize?: number;
    };

    const fileName = body.fileName?.trim();
    const contentType = body.contentType?.trim() || "";
    const fileSize = Number(body.fileSize ?? 0);

    if (!fileName) {
      return NextResponse.json({ error: "Falta el nombre del archivo" }, { status: 400 });
    }

    const isPdf =
      contentType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 });
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json({ error: "El archivo PDF es inválido" }, { status: 400 });
    }

    if (fileSize > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: `El PDF supera el máximo de ${Math.round(MAX_PDF_SIZE_BYTES / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }

    const storage = await ensureBucketAcceptsPdf();
    if (!storage) {
      return NextResponse.json(
        { error: "Supabase storage no disponible. Verifica las variables de entorno." },
        { status: 500 }
      );
    }

    const safeBaseName = sanitizeBaseName(fileName);
    const storagePath = `dossiers/${franchiseId}/${Date.now()}-${safeBaseName}.pdf`;

    const { data, error } = await storage.client.storage
      .from(storage.bucket)
      .createSignedUploadUrl(storagePath, {
        upsert: false,
      });

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? "No se pudo preparar el upload del PDF" },
        { status: 500 }
      );
    }

    const { data: publicData } = storage.client.storage
      .from(storage.bucket)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      publicUrl: publicData.publicUrl,
      signedUrl: data.signedUrl,
      storagePath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno preparando el upload";
    console.error("[brochure-upload]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
