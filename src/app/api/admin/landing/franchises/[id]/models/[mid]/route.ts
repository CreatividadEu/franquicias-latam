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
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { mid } = await params;
  const body = await req.json();

  const model = await prisma.franchiseBusinessModel.update({
    where: { id: mid },
    data: {
      name: body.name,
      size: body.size || null,
      investmentMin: body.investmentMin ? Number(body.investmentMin) : null,
      investmentMax: body.investmentMax ? Number(body.investmentMax) : null,
      ebitda: body.ebitda || null,
      paybackMonths: body.paybackMonths ? Number(body.paybackMonths) : null,
      roiAnnual: body.roiAnnual ? Number(body.roiAnnual) : null,
      imageUrl: body.imageUrl || null,
      description: body.description || null,
      order: body.order !== undefined ? Number(body.order) : 0,
    },
  });
  return NextResponse.json(model);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { mid } = await params;
  await prisma.franchiseBusinessModel.delete({ where: { id: mid } });
  return new Response(null, { status: 204 });
}
