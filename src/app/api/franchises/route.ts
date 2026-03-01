import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { validateCountryIds } from "@/lib/validation/countries";
import {
  buildDefaultFranchiseBotConfig,
  buildDefaultFranchiseFeatureFlags,
  buildDefaultFranchiseProfile,
  ensureFranchiseLandingConfig,
  toGalleryUrls,
} from "@/lib/franchiseLanding";

const adminFranchiseInclude = {
  sector: true,
  coverageCountries: {
    include: { country: true },
  },
  profile: true,
  featureFlags: true,
  botConfig: true,
  botFaqs: {
    orderBy: [{ priority: "desc" as const }, { createdAt: "asc" as const }],
  },
  _count: {
    select: { matches: true },
  },
};

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

  const existingFranchises = await prisma.franchise.findMany({
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

  for (const franchise of existingFranchises) {
    await ensureFranchiseLandingConfig(prisma, franchise);
  }

  const franchises = await prisma.franchise.findMany({
    orderBy: { createdAt: "desc" },
    include: adminFranchiseInclude,
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
      profile,
      featureFlags,
      botConfig,
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

    const parsedInvestmentMin = parseFloat(investmentMin);
    const parsedInvestmentMax = parseFloat(investmentMax);

    const normalizedProfile = {
      ...buildDefaultFranchiseProfile({
        id: "",
        name,
        description,
        logo: (profile?.heroImageUrl as string | undefined) || logo || null,
        video: (profile?.heroVideoUrl as string | undefined) || video || null,
        investmentMin:
          profile?.investmentMin !== undefined
            ? parseFloat(profile.investmentMin)
            : parsedInvestmentMin,
        investmentMax:
          profile?.investmentMax !== undefined
            ? parseFloat(profile.investmentMax)
            : parsedInvestmentMax,
      }),
      ...(profile || {}),
      galleryUrls: toGalleryUrls(profile?.galleryUrls),
      investmentMin:
        profile?.investmentMin !== undefined
          ? parseFloat(profile.investmentMin)
          : parsedInvestmentMin,
      investmentMax:
        profile?.investmentMax !== undefined
          ? parseFloat(profile.investmentMax)
          : parsedInvestmentMax,
    };

    const normalizedFeatureFlags = {
      ...buildDefaultFranchiseFeatureFlags({
        id: "",
        name,
        description,
        logo: normalizedProfile.heroImageUrl || null,
        video: normalizedProfile.heroVideoUrl || null,
        investmentMin: normalizedProfile.investmentMin || parsedInvestmentMin,
        investmentMax: normalizedProfile.investmentMax || parsedInvestmentMax,
      }),
      ...(featureFlags || {}),
      planTier: featureFlags?.planTier || "BASIC",
    };

    const normalizedBotConfig = {
      ...buildDefaultFranchiseBotConfig(),
      ...(botConfig || {}),
    };

    const franchise = await prisma.franchise.create({
      data: {
        name,
        description,
        logo: normalizedProfile.heroImageUrl || logo || null,
        video: normalizedProfile.heroVideoUrl || video || null,
        investmentMin: parsedInvestmentMin,
        investmentMax: parsedInvestmentMax,
        sectorId,
        contactEmail: contactEmail || null,
        featured: featured || false,
        active: active !== false,
        profile: {
          create: {
            headline: normalizedProfile.headline || "",
            subheadline: normalizedProfile.subheadline || "",
            heroImageUrl: normalizedProfile.heroImageUrl || null,
            heroVideoUrl: normalizedProfile.heroVideoUrl || null,
            galleryUrls: normalizedProfile.galleryUrls,
            brochureUrl: normalizedProfile.brochureUrl || null,
            investmentMin:
              normalizedProfile.investmentMin !== null
                ? normalizedProfile.investmentMin
                : null,
            investmentMax:
              normalizedProfile.investmentMax !== null
                ? normalizedProfile.investmentMax
                : null,
            countryCoverage: normalizedProfile.countryCoverage || null,
          },
        },
        featureFlags: {
          create: normalizedFeatureFlags,
        },
        botConfig: {
          create: {
            enabled: Boolean(normalizedBotConfig.enabled),
            systemInstructions: normalizedBotConfig.systemInstructions || "",
            fallbackMessage: normalizedBotConfig.fallbackMessage || "",
            tone: normalizedBotConfig.tone || null,
          },
        },
        botFaqs: {
          create: (Array.isArray(botConfig?.faqs) ? botConfig.faqs : [])
            .filter(
              (faq: { question?: string; answer?: string }) =>
                faq.question?.trim() && faq.answer?.trim()
            )
            .map(
              (faq: {
                question: string;
                answer: string;
                priority?: number;
                enabled?: boolean;
              }) => ({
                question: faq.question.trim(),
                answer: faq.answer.trim(),
                priority: Number(faq.priority || 0),
                enabled: faq.enabled !== false,
              })
            ),
        },
        coverageCountries: {
          create: (countryIds || []).map((countryId: string) => ({
            countryId,
          })),
        },
      },
      include: adminFranchiseInclude,
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
