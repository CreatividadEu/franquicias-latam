import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { validateCountryIds } from "@/lib/validation/countries";
import {
  ensureFranchiseLandingConfig,
  syncFranchiseBotFaqs,
  toGalleryUrls,
} from "@/lib/franchiseLanding";

const adminFranchiseInclude = {
  sector: true,
  coverageCountries: { include: { country: true } },
  profile: true,
  featureFlags: true,
  botConfig: true,
  botFaqs: {
    orderBy: [{ priority: "desc" as const }, { createdAt: "asc" as const }],
  },
  _count: { select: { matches: true } },
};

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
    include: adminFranchiseInclude,
  });

  if (!franchise) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  await ensureFranchiseLandingConfig({
    id: franchise.id,
    name: franchise.name,
    description: franchise.description,
    logo: franchise.logo,
    video: franchise.video,
    investmentMin: franchise.investmentMin,
    investmentMax: franchise.investmentMax,
  });

  const refreshedFranchise = await prisma.franchise.findUnique({
    where: { id },
    include: adminFranchiseInclude,
  });

  return NextResponse.json(refreshedFranchise);
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
      coverageCountryIds,
      profile,
      featureFlags,
      botConfig,
    } = body;

    const resolvedCountryIds = Array.isArray(coverageCountryIds)
      ? coverageCountryIds
      : countryIds;

    const existingFranchise = await prisma.franchise.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        video: true,
        investmentMin: true,
        investmentMax: true,
      },
    });

    if (!existingFranchise) {
      return NextResponse.json(
        { error: "Franquicia no encontrada" },
        { status: 404 }
      );
    }

    await ensureFranchiseLandingConfig(existingFranchise);

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

    if (profile !== undefined) {
      if (profile.heroImageUrl !== undefined && logo === undefined) {
        updateData.logo = profile.heroImageUrl || null;
      }
      if (profile.heroVideoUrl !== undefined && video === undefined) {
        updateData.video = profile.heroVideoUrl || null;
      }
      if (profile.investmentMin !== undefined && investmentMin === undefined) {
        updateData.investmentMin =
          profile.investmentMin === "" || profile.investmentMin === null
            ? null
            : parseFloat(profile.investmentMin);
      }
      if (profile.investmentMax !== undefined && investmentMax === undefined) {
        updateData.investmentMax =
          profile.investmentMax === "" || profile.investmentMax === null
            ? null
            : parseFloat(profile.investmentMax);
      }
    }

    // If countryIds are provided, rebuild coverage
    if (resolvedCountryIds !== undefined) {
      // Validate country IDs
      if (resolvedCountryIds.length > 0) {
        const validation = await validateCountryIds(resolvedCountryIds, prisma);
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

      if (resolvedCountryIds.length > 0) {
        await prisma.franchiseCoverage.createMany({
          data: resolvedCountryIds.map((countryId: string) => ({
            franchiseId: id,
            countryId,
          })),
        });
      }
    }

    await prisma.franchise.update({
      where: { id },
      data: updateData,
    });

    if (profile !== undefined) {
      const profileUpdate: Record<string, unknown> = {};

      if (profile.headline !== undefined) profileUpdate.headline = profile.headline;
      if (profile.subheadline !== undefined) {
        profileUpdate.subheadline = profile.subheadline;
      }
      if (profile.heroImageUrl !== undefined) {
        profileUpdate.heroImageUrl = profile.heroImageUrl || null;
      }
      if (profile.heroVideoUrl !== undefined) {
        profileUpdate.heroVideoUrl = profile.heroVideoUrl || null;
      }
      if (profile.galleryUrls !== undefined) {
        profileUpdate.galleryUrls = toGalleryUrls(profile.galleryUrls);
      }
      if (profile.brochureUrl !== undefined) {
        profileUpdate.brochureUrl = profile.brochureUrl || null;
      }
      if (profile.investmentMin !== undefined) {
        profileUpdate.investmentMin =
          profile.investmentMin === "" || profile.investmentMin === null
            ? null
            : parseFloat(profile.investmentMin);
      }
      if (profile.investmentMax !== undefined) {
        profileUpdate.investmentMax =
          profile.investmentMax === "" || profile.investmentMax === null
            ? null
            : parseFloat(profile.investmentMax);
      }
      if (profile.countryCoverage !== undefined) {
        profileUpdate.countryCoverage = profile.countryCoverage || null;
      }

      await prisma.franchiseProfile.update({
        where: { franchiseId: id },
        data: profileUpdate,
      });
    }

    if (featureFlags !== undefined) {
      await prisma.franchiseFeatureFlags.update({
        where: { franchiseId: id },
        data: {
          showVideo: featureFlags.showVideo,
          showGallery: featureFlags.showGallery,
          showTestimonials: featureFlags.showTestimonials,
          showKpis: featureFlags.showKpis,
          showBot: featureFlags.showBot,
          showDownloads: featureFlags.showDownloads,
          showContactForm: featureFlags.showContactForm,
          planTier: featureFlags.planTier || "BASIC",
        },
      });
    }

    if (botConfig !== undefined) {
      await prisma.franchiseBotConfig.update({
        where: { franchiseId: id },
        data: {
          enabled: Boolean(botConfig.enabled),
          systemInstructions: botConfig.systemInstructions || "",
          fallbackMessage: botConfig.fallbackMessage || "",
          tone: botConfig.tone || null,
        },
      });

      if (Array.isArray(botConfig.faqs)) {
        await syncFranchiseBotFaqs(prisma, id, botConfig.faqs);
      }
    }

    const franchise = await prisma.franchise.findUnique({
      where: { id },
      include: adminFranchiseInclude,
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
