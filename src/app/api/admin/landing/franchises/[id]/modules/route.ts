import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: franchiseId } = await params;
  const body = await req.json();

  const boolFields = [
    "heroEnabled", "videoEnabled", "galleryEnabled", "businessModelsEnabled",
    "financialsEnabled", "faqEnabled", "brochureEnabled", "bookingEnabled",
    "chatbotEnabled", "nurturingEnabled", "showVerifiedBadge",
  ] as const;

  const data: Record<string, boolean> = {};
  for (const f of boolFields) {
    if (f in body) data[f] = Boolean(body[f]);
  }

  const config = await prisma.franchiseModuleConfig.upsert({
    where: { franchiseId },
    update: data,
    create: { franchiseId, ...data },
  });

  return NextResponse.json(config);
}
