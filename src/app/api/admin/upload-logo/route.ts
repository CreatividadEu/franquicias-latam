import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const rawFile = formData.get("file");

    if (!(rawFile instanceof File)) {
      return NextResponse.json(
        { error: "No se recibio ningun archivo" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES[rawFile.type]) {
      return NextResponse.json(
        { error: "Formato invalido. Usa JPG, PNG, WebP o AVIF" },
        { status: 400 }
      );
    }

    if (rawFile.size <= 0 || rawFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La imagen debe pesar maximo 5MB" },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_TYPES[rawFile.type];
    const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "franchises"
    );
    const filePath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await rawFile.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    return NextResponse.json(
      {
        url: `/uploads/franchises/${fileName}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading franchise image:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}

