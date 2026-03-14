import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getSupabaseAdminClient, getFranchiseStorageBucket } from "@/lib/supabaseAdmin";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: franchiseId, mid } = await params;

  const media = await prisma.franchiseMedia.findUnique({ where: { id: mid } });
  if (!media) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Attempt to remove from Supabase storage if it's a storage URL
  try {
    const client = getSupabaseAdminClient();
    const bucket = getFranchiseStorageBucket();
    if (client && media.url.includes(franchiseId)) {
      const urlPath = new URL(media.url).pathname;
      const pathSegment = urlPath.split(`/${bucket}/`)[1];
      if (pathSegment) {
        await client.storage.from(bucket).remove([pathSegment]);
      }
    }
  } catch {
    // Non-fatal — DB record still gets deleted
  }

  await prisma.franchiseMedia.delete({ where: { id: mid } });
  return new Response(null, { status: 204 });
}
