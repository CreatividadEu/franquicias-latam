import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const BUCKET = "franchise-assets";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin client no disponible" }, { status: 500 });
  }

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
  if (bucketError) {
    const missing =
      bucketError.message.toLowerCase().includes("not found") ||
      bucketError.message.toLowerCase().includes("does not exist");
    if (missing) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
      if (createError && !createError.message.toLowerCase().includes("already exists")) {
        return NextResponse.json({ error: "Error creando bucket: " + createError.message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Error accediendo al bucket: " + bucketError.message }, { status: 500 });
    }
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Error parseando form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const storagePath = formData.get("storagePath") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!storagePath) {
    return NextResponse.json({ error: "storagePath requerido" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Error subiendo archivo: " + uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return NextResponse.json({ url: urlData.publicUrl });
}
