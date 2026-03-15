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
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { fid } = await params;
  const body = await req.json();

  const faq = await prisma.franchiseFaq.update({
    where: { id: fid },
    data: {
      question: body.question,
      answer: body.answer,
      order: body.order !== undefined ? Number(body.order) : 0,
    },
  });
  return NextResponse.json(faq);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { fid } = await params;
  await prisma.franchiseFaq.delete({ where: { id: fid } });
  return new Response(null, { status: 204 });
}
