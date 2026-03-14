import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ensureFranchiseStorageBucket, getSupabaseAdminClient } from "@/lib/supabaseAdmin";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: franchiseId } = await params;
  const media = await prisma.franchiseMedia.findMany({
    where: { franchiseId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(media);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: franchiseId } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "image";
  const label = (formData.get("label") as string) || null;
  const altText = (formData.get("altText") as string) || null;
  const order = Number(formData.get("order") ?? 0);

  // If a URL is provided directly (no file upload), create the media record directly
  const directUrl = formData.get("url") as string | null;

  let url: string;

  if (directUrl) {
    url = directUrl;
  } else if (file) {
    const result = await ensureFranchiseStorageBucket();
    if (!result) {
      return NextResponse.json({ error: "Supabase storage no disponible" }, { status: 500 });
    }
    const { client, bucket } = result;

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${franchiseId}/landing/gallery/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
    url = publicData.publicUrl;
  } else {
    return NextResponse.json({ error: "Se requiere un archivo o URL" }, { status: 400 });
  }

  const media = await prisma.franchiseMedia.create({
    data: { franchiseId, type, url, label, altText, order },
  });
  return NextResponse.json(media, { status: 201 });
}
