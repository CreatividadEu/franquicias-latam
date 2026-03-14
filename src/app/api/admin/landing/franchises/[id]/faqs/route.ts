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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: franchiseId } = await params;
  const faqs = await prisma.franchiseFaq.findMany({
    where: { franchiseId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(faqs);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: franchiseId } = await params;
  const body = await req.json();

  const faq = await prisma.franchiseFaq.create({
    data: {
      franchiseId,
      question: body.question || "",
      answer: body.answer || "",
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(faq, { status: 201 });
}
