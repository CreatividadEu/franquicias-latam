import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { validateCountryIds } from "@/lib/validation/countries";

// GET - List all franchises (admin)
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const franchises = await prisma.franchise.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sector: true,
      coverageCountries: {
        include: { country: true },
      },
      _count: {
        select: { matches: true },
      },
    },
  });

  return NextResponse.json(franchises);
}

// POST - Create a new franchise (admin)
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      logo,
      video,
      investmentMin,
      investmentMax,
      sectorId,
      contactEmail,
      featured,
      active,
      countryIds,
    } = body;

    if (!name || !description || !sectorId || !investmentMin || !investmentMax) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre, descripcion, sector, inversion min/max" },
        { status: 400 }
      );
    }

    // Validate country IDs
    if (countryIds && countryIds.length > 0) {
      const validation = await validateCountryIds(countryIds, prisma);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `IDs de pais invalidos: ${validation.invalidIds.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const franchise = await prisma.franchise.create({
      data: {
        name,
        description,
        logo: logo || null,
        video: video || null,
        investmentMin: parseFloat(investmentMin),
        investmentMax: parseFloat(investmentMax),
        sectorId,
        contactEmail: contactEmail || null,
        featured: featured || false,
        active: active !== false,
        coverageCountries: {
          create: (countryIds || []).map((countryId: string) => ({
            countryId,
          })),
        },
      },
      include: {
        sector: true,
        coverageCountries: { include: { country: true } },
      },
    });

    return NextResponse.json(franchise, { status: 201 });
  } catch (error) {
    console.error("Error creating franchise:", error);
    return NextResponse.json(
      { error: "Error al crear la franquicia" },
      { status: 500 }
    );
  }
}
