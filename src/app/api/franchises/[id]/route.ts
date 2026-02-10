import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { validateCountryIds } from "@/lib/validation/countries";

// GET - Get franchise detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const franchise = await prisma.franchise.findUnique({
    where: { id },
    include: {
      sector: true,
      coverageCountries: { include: { country: true } },
      _count: { select: { matches: true } },
    },
  });

  if (!franchise) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  return NextResponse.json(franchise);
}

// PATCH - Update franchise
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Build update data only with provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo || null;
    if (video !== undefined) updateData.video = video || null;
    if (investmentMin !== undefined) updateData.investmentMin = parseFloat(investmentMin);
    if (investmentMax !== undefined) updateData.investmentMax = parseFloat(investmentMax);
    if (sectorId !== undefined) updateData.sectorId = sectorId;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null;
    if (featured !== undefined) updateData.featured = featured;
    if (active !== undefined) updateData.active = active;

    // If countryIds are provided, rebuild coverage
    if (countryIds !== undefined) {
      // Validate country IDs
      if (countryIds.length > 0) {
        const validation = await validateCountryIds(countryIds, prisma);
        if (!validation.valid) {
          return NextResponse.json(
            { error: `IDs de pais invalidos: ${validation.invalidIds.join(", ")}` },
            { status: 400 }
          );
        }
      }

      await prisma.franchiseCoverage.deleteMany({
        where: { franchiseId: id },
      });

      if (countryIds.length > 0) {
        await prisma.franchiseCoverage.createMany({
          data: countryIds.map((countryId: string) => ({
            franchiseId: id,
            countryId,
          })),
        });
      }
    }

    const franchise = await prisma.franchise.update({
      where: { id },
      data: updateData,
      include: {
        sector: true,
        coverageCountries: { include: { country: true } },
      },
    });

    return NextResponse.json(franchise);
  } catch (error) {
    console.error("Error updating franchise:", error);
    return NextResponse.json(
      { error: "Error al actualizar la franquicia" },
      { status: 500 }
    );
  }
}

// DELETE - Delete franchise
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    await prisma.franchise.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting franchise:", error);
    return NextResponse.json(
      { error: "Error al eliminar la franquicia" },
      { status: 500 }
    );
  }
}
