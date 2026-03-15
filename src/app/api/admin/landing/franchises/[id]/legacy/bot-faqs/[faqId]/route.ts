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

// PUT — update a FranchiseBotFaq
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { faqId } = await params;
  const body = await req.json();
  const { question, answer, priority, enabled } = body as {
    question?: string;
    answer?: string;
    priority?: number;
    enabled?: boolean;
  };

  const faq = await prisma.franchiseBotFaq.update({
    where: { id: faqId },
    data: {
      ...(question !== undefined && { question: question.trim() }),
      ...(answer !== undefined && { answer: answer.trim() }),
      ...(priority !== undefined && { priority: Number(priority) }),
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
    },
  });

  return NextResponse.json(faq);
}

// DELETE — delete a FranchiseBotFaq
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { faqId } = await params;

  await prisma.franchiseBotFaq.delete({ where: { id: faqId } });

  return NextResponse.json({ success: true });
}
