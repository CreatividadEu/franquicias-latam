import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { resolveListingState } from "@/lib/listing-config";

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
      listingType: true,
      availabilityLabel: true,
      editorialBadge: true,
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
  const listingState = resolveListingState({
    listingType: body.listingType,
    verificationStatus: body.verificationStatus,
    editorialBadge: body.editorialBadge,
    publicInterestCount: body.publicInterestCount,
    publicInterestEnabled: body.publicInterestEnabled,
    publicInterestLabel: body.publicInterestLabel,
    interestCtaMode: body.interestCtaMode,
    availabilityLabel: body.availabilityLabel,
    statusDisclaimer: body.statusDisclaimer,
    showApplicationForm: body.showApplicationForm,
    showFinancialData: body.showFinancialData,
    showVerifiedBadge: body.showVerifiedBadge,
  });

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
      listingType: listingState.listingType,
      verificationStatus: listingState.verificationStatus,
      editorialBadge: listingState.editorialBadge,
      publicInterestCount: listingState.publicInterestCount,
      publicInterestEnabled: listingState.publicInterestEnabled,
      publicInterestLabel: listingState.publicInterestLabel,
      interestCtaMode: listingState.interestCtaMode,
      availabilityLabel: listingState.availabilityLabel,
      statusDisclaimer: listingState.statusDisclaimer,
      showApplicationForm: listingState.showApplicationForm,
      showFinancialData: listingState.showFinancialData,
      showVerifiedBadge: listingState.showVerifiedBadge,
      moduleConfig: {
        create: {
          heroEnabled: true,
          financialsEnabled: listingState.showFinancialData,
          showVerifiedBadge: listingState.showVerifiedBadge,
        },
      },
    },
  });

  return NextResponse.json(franchise, { status: 201 });
}
