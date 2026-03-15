import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Prisma } from "@prisma/client";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

// GET — full legacy data for one franchise (profile, featureFlags, botConfig, botFaqs)
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
      profile: true,
      featureFlags: true,
      botConfig: true,
      botFaqs: {
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!franchise) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  return NextResponse.json(franchise);
}

// PUT — upsert profile, featureFlags, botConfig
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { profile, featureFlags, botConfig } = body as {
    profile?: Record<string, unknown>;
    featureFlags?: Record<string, unknown>;
    botConfig?: Record<string, unknown>;
  };

  // Check franchise exists
  const existing = await prisma.franchise.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  if (profile !== undefined) {
    await prisma.franchiseProfile.upsert({
      where: { franchiseId: id },
      create: {
        franchiseId: id,
        headline: String(profile.headline ?? ""),
        subheadline: String(profile.subheadline ?? ""),
        heroImageUrl: (profile.heroImageUrl as string | null) ?? null,
        heroVideoUrl: (profile.heroVideoUrl as string | null) ?? null,
        galleryUrls: Array.isArray(profile.galleryUrls) ? (profile.galleryUrls as string[]) : [],
        brochureUrl: (profile.brochureUrl as string | null) ?? null,
        investmentMin: profile.investmentMin != null ? Number(profile.investmentMin) : null,
        investmentMax: profile.investmentMax != null ? Number(profile.investmentMax) : null,
        countryCoverage: (profile.countryCoverage as string | null) ?? null,
        heroTitle: (profile.heroTitle as string | null) ?? null,
        heroSubtitle: (profile.heroSubtitle as string | null) ?? null,
        heroCtaLabel: (profile.heroCtaLabel as string | null) ?? null,
        heroStats: profile.heroStats != null ? (profile.heroStats as Prisma.InputJsonValue) : Prisma.JsonNull,
        showReviewsBadge: Boolean(profile.showReviewsBadge ?? false),
        reviewRating: profile.reviewRating != null ? Number(profile.reviewRating) : null,
        reviewBadgeLabel: (profile.reviewBadgeLabel as string | null) ?? null,
        reviewAvatarUrls: Array.isArray(profile.reviewAvatarUrls) ? (profile.reviewAvatarUrls as Prisma.InputJsonValue) : Prisma.JsonNull,
        showFranchiseLogo: Boolean(profile.showFranchiseLogo ?? false),
        franchiseLogoUrl: (profile.franchiseLogoUrl as string | null) ?? null,
      },
      update: {
        ...(profile.headline !== undefined && { headline: String(profile.headline) }),
        ...(profile.subheadline !== undefined && { subheadline: String(profile.subheadline) }),
        ...(profile.heroImageUrl !== undefined && { heroImageUrl: (profile.heroImageUrl as string | null) || null }),
        ...(profile.heroVideoUrl !== undefined && { heroVideoUrl: (profile.heroVideoUrl as string | null) || null }),
        ...(profile.galleryUrls !== undefined && { galleryUrls: Array.isArray(profile.galleryUrls) ? (profile.galleryUrls as string[]) : [] }),
        ...(profile.brochureUrl !== undefined && { brochureUrl: (profile.brochureUrl as string | null) || null }),
        ...(profile.investmentMin !== undefined && { investmentMin: profile.investmentMin != null ? Number(profile.investmentMin) : null }),
        ...(profile.investmentMax !== undefined && { investmentMax: profile.investmentMax != null ? Number(profile.investmentMax) : null }),
        ...(profile.countryCoverage !== undefined && { countryCoverage: (profile.countryCoverage as string | null) || null }),
        ...(profile.heroTitle !== undefined && { heroTitle: (profile.heroTitle as string | null) || null }),
        ...(profile.heroSubtitle !== undefined && { heroSubtitle: (profile.heroSubtitle as string | null) || null }),
        ...(profile.heroCtaLabel !== undefined && { heroCtaLabel: (profile.heroCtaLabel as string | null) || null }),
        ...(profile.heroStats !== undefined && { heroStats: profile.heroStats != null ? (profile.heroStats as Prisma.InputJsonValue) : Prisma.JsonNull }),
        ...(profile.showReviewsBadge !== undefined && { showReviewsBadge: Boolean(profile.showReviewsBadge) }),
        ...(profile.reviewRating !== undefined && { reviewRating: profile.reviewRating != null ? Number(profile.reviewRating) : null }),
        ...(profile.reviewBadgeLabel !== undefined && { reviewBadgeLabel: (profile.reviewBadgeLabel as string | null) || null }),
        ...(profile.reviewAvatarUrls !== undefined && { reviewAvatarUrls: Array.isArray(profile.reviewAvatarUrls) ? (profile.reviewAvatarUrls as Prisma.InputJsonValue) : Prisma.JsonNull }),
        ...(profile.showFranchiseLogo !== undefined && { showFranchiseLogo: Boolean(profile.showFranchiseLogo) }),
        ...(profile.franchiseLogoUrl !== undefined && { franchiseLogoUrl: (profile.franchiseLogoUrl as string | null) || null }),
      },
    });
  }

  if (featureFlags !== undefined) {
    await prisma.franchiseFeatureFlags.upsert({
      where: { franchiseId: id },
      create: {
        franchiseId: id,
        showBot: Boolean(featureFlags.showBot ?? false),
        showVideo: Boolean(featureFlags.showVideo ?? false),
        showGallery: Boolean(featureFlags.showGallery ?? true),
        showTestimonials: Boolean(featureFlags.showTestimonials ?? false),
        showKpis: Boolean(featureFlags.showKpis ?? true),
        showDownloads: Boolean(featureFlags.showDownloads ?? false),
        showContactForm: Boolean(featureFlags.showContactForm ?? true),
      },
      update: {
        ...(featureFlags.showBot !== undefined && { showBot: Boolean(featureFlags.showBot) }),
        ...(featureFlags.showVideo !== undefined && { showVideo: Boolean(featureFlags.showVideo) }),
        ...(featureFlags.showGallery !== undefined && { showGallery: Boolean(featureFlags.showGallery) }),
        ...(featureFlags.showTestimonials !== undefined && { showTestimonials: Boolean(featureFlags.showTestimonials) }),
        ...(featureFlags.showKpis !== undefined && { showKpis: Boolean(featureFlags.showKpis) }),
        ...(featureFlags.showDownloads !== undefined && { showDownloads: Boolean(featureFlags.showDownloads) }),
        ...(featureFlags.showContactForm !== undefined && { showContactForm: Boolean(featureFlags.showContactForm) }),
      },
    });
  }

  if (botConfig !== undefined) {
    await prisma.franchiseBotConfig.upsert({
      where: { franchiseId: id },
      create: {
        franchiseId: id,
        enabled: Boolean(botConfig.enabled ?? false),
        systemInstructions: String(botConfig.systemInstructions ?? ""),
        fallbackMessage: String(botConfig.fallbackMessage ?? ""),
        tone: (botConfig.tone as string | null) ?? null,
      },
      update: {
        ...(botConfig.enabled !== undefined && { enabled: Boolean(botConfig.enabled) }),
        ...(botConfig.systemInstructions !== undefined && { systemInstructions: String(botConfig.systemInstructions) }),
        ...(botConfig.fallbackMessage !== undefined && { fallbackMessage: String(botConfig.fallbackMessage) }),
        ...(botConfig.tone !== undefined && { tone: (botConfig.tone as string | null) || null }),
      },
    });
  }

  const updated = await prisma.franchise.findUnique({
    where: { id },
    include: {
      profile: true,
      featureFlags: true,
      botConfig: true,
      botFaqs: {
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  return NextResponse.json(updated);
}
