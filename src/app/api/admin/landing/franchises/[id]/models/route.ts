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
  const models = await prisma.franchiseBusinessModel.findMany({
    where: { franchiseId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(models);
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

  const model = await prisma.franchiseBusinessModel.create({
    data: {
      franchiseId,
      name: body.name || "Nuevo modelo",
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
  return NextResponse.json(model, { status: 201 });
}
