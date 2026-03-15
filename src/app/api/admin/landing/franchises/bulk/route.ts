import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

// DELETE — bulk delete franchises
export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { ids } = body as { ids?: string[] };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  // Fetch slugs for storage cleanup
  const franchises = await prisma.franchise.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });

  // Non-blocking storage cleanup for each
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await Promise.all(
      franchises.map(async (f) => {
        const slug = f.slug;
        if (!slug) return;
        try {
          const { data: files } = await supabase.storage
            .from("franchise-assets")
            .list(slug);
          if (files && files.length > 0) {
            const paths = files.map((file) => `${slug}/${file.name}`);
            await supabase.storage.from("franchise-assets").remove(paths);
          }
        } catch (err) {
          console.error(`Storage cleanup failed for ${slug} (non-blocking):`, err);
        }
      })
    );
  }

  await prisma.franchise.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ deleted: ids.length });
}
