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

// GET — list all franchises with landing summary
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const franchises = await prisma.franchise.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      planTier: true,
      published: true,
      updatedAt: true,
      headline: true,
      logoUrl: true,
      heroImageUrl: true,
      moduleConfig: { select: { heroEnabled: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(franchises);
}

// POST — create a new franchise for the landing system
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, planTier, sectorId } = body;

  if (!name || !sectorId) {
    return NextResponse.json({ error: "name y sectorId son requeridos" }, { status: 400 });
  }

  const sector = await prisma.sector.findFirst();
  const resolvedSectorId = sectorId || sector?.id;
  if (!resolvedSectorId) {
    return NextResponse.json({ error: "Sector no encontrado" }, { status: 400 });
  }

  const franchise = await prisma.franchise.create({
    data: {
      name,
      slug: slug || null,
      description: body.shortDescription || name,
      investmentMin: Number(body.investmentMin) || 0,
      investmentMax: Number(body.investmentMax) || 0,
      sectorId: resolvedSectorId,
      planTier: planTier || "BASIC",
      published: false,
      active: body.active !== false,
      moduleConfig: {
        create: {
          heroEnabled: true,
          financialsEnabled: true,
        },
      },
    },
  });

  return NextResponse.json(franchise, { status: 201 });
}
