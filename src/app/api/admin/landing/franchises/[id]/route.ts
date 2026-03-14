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

// GET — full landing data for one franchise
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const franchise = await prisma.franchise.findUnique({
    where: { id },
    include: {
      businessModels: { orderBy: { order: "asc" } },
      media: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      moduleConfig: true,
      automationConfig: true,
      sector: true,
    },
  });

  if (!franchise) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  return NextResponse.json(franchise);
}

// PUT — update core landing fields
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowedFields = [
    "planTier", "published", "headline", "subheadline", "shortDescription",
    "longDescription", "logoUrl", "heroImageUrl", "youtubeUrl", "brochureUrl",
    "bookingUrl", "credibilityLine", "cta1Label", "cta1Url", "cta2Label",
    "cta2Url", "ebitdaReference", "paybackMonths", "royaltyInfo",
    "operatorProfile", "name", "slug", "investmentMin", "investmentMax",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field] === "" ? null : body[field];
    }
  }

  if (data.investmentMin !== undefined) data.investmentMin = Number(data.investmentMin);
  if (data.investmentMax !== undefined) data.investmentMax = Number(data.investmentMax);
  if (data.paybackMonths !== undefined)
    data.paybackMonths = data.paybackMonths ? Number(data.paybackMonths) : null;

  const franchise = await prisma.franchise.update({ where: { id }, data });
  return NextResponse.json(franchise);
}
