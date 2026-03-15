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

// POST — create a new FranchiseBotFaq
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { question, answer, priority, enabled } = body as {
    question: string;
    answer: string;
    priority?: number;
    enabled?: boolean;
  };

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "question y answer son requeridos" }, { status: 400 });
  }

  const faq = await prisma.franchiseBotFaq.create({
    data: {
      franchiseId: id,
      question: question.trim(),
      answer: answer.trim(),
      priority: Number(priority ?? 0),
      enabled: enabled !== false,
    },
  });

  return NextResponse.json(faq, { status: 201 });
}
