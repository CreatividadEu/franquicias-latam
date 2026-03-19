import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import {
  isInterestCtaMode,
  isListingType,
  isVerificationStatus,
} from "@/lib/listing-config";

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
      coverageCountries: { include: { country: true } },
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
    "bookingUrl", "credibilityLine", "foundingYear", "cta1Label", "cta1Url", "cta2Label",
    "cta2Url", "ebitdaReference", "paybackMonths", "royaltyInfo",
    "operatorProfile", "canonEntrada", "name", "slug", "investmentMin", "investmentMax",
    "listingType", "verificationStatus", "editorialBadge", "publicInterestCount",
    "publicInterestEnabled", "publicInterestLabel", "interestCtaMode", "availabilityLabel",
    "statusDisclaimer", "showApplicationForm", "showFinancialData", "showVerifiedBadge",
    // Base config fields (legacy + new)
    "sectorId", "active", "featured", "contactEmail", "logo", "video",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field] === "" ? null : body[field];
    }
  }

  if (data.investmentMin !== undefined) data.investmentMin = Number(data.investmentMin);
  if (data.investmentMax !== undefined) data.investmentMax = Number(data.investmentMax);
  if (data.canonEntrada !== undefined)
    data.canonEntrada = data.canonEntrada ? Number(data.canonEntrada) : null;
  if (data.paybackMonths !== undefined)
    data.paybackMonths = data.paybackMonths ? Number(data.paybackMonths) : null;
  if (data.foundingYear !== undefined)
    data.foundingYear = data.foundingYear ? Number(data.foundingYear) : null;
  if (data.active !== undefined) data.active = Boolean(data.active);
  if (data.featured !== undefined) data.featured = Boolean(data.featured);
  if (data.publicInterestCount !== undefined) {
    data.publicInterestCount = Math.max(
      0,
      Number.isFinite(Number(data.publicInterestCount))
        ? Number(data.publicInterestCount)
        : 0,
    );
  }
  if (data.publicInterestEnabled !== undefined) {
    data.publicInterestEnabled = Boolean(data.publicInterestEnabled);
  }
  if (data.showApplicationForm !== undefined) {
    data.showApplicationForm = Boolean(data.showApplicationForm);
  }
  if (data.showFinancialData !== undefined) {
    data.showFinancialData = Boolean(data.showFinancialData);
  }
  if (data.showVerifiedBadge !== undefined) {
    data.showVerifiedBadge = Boolean(data.showVerifiedBadge);
  }
  if (data.listingType !== undefined && !isListingType(data.listingType)) {
    return NextResponse.json({ error: "listingType inválido" }, { status: 400 });
  }
  if (
    data.verificationStatus !== undefined &&
    !isVerificationStatus(data.verificationStatus)
  ) {
    return NextResponse.json(
      { error: "verificationStatus inválido" },
      { status: 400 },
    );
  }
  if (data.interestCtaMode !== undefined && !isInterestCtaMode(data.interestCtaMode)) {
    return NextResponse.json(
      { error: "interestCtaMode inválido" },
      { status: 400 },
    );
  }

  // Handle coverageCountryIds: delete old and create new
  if (Array.isArray(body.coverageCountryIds)) {
    await prisma.franchiseCoverage.deleteMany({ where: { franchiseId: id } });
    if (body.coverageCountryIds.length > 0) {
      await prisma.franchiseCoverage.createMany({
        data: (body.coverageCountryIds as string[]).map((countryId) => ({
          franchiseId: id,
          countryId,
        })),
      });
    }
  }

  const franchise = await prisma.franchise.update({
    where: { id },
    data: {
      ...data,
      ...(data.showVerifiedBadge !== undefined
        ? {
            moduleConfig: {
              upsert: {
                create: {
                  showVerifiedBadge: Boolean(data.showVerifiedBadge),
                },
                update: {
                  showVerifiedBadge: Boolean(data.showVerifiedBadge),
                },
              },
            },
          }
        : {}),
    },
  });
  return NextResponse.json(franchise);
}

// DELETE — delete a franchise + storage cleanup
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const franchise = await prisma.franchise.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!franchise) {
    return NextResponse.json({ error: "Franquicia no encontrada" }, { status: 404 });
  }

  // Non-blocking storage cleanup
  const slug = franchise.slug;
  if (slug) {
    try {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        const { data: files } = await supabase.storage
          .from("franchise-assets")
          .list(slug);
        if (files && files.length > 0) {
          const paths = files.map((f) => `${slug}/${f.name}`);
          await supabase.storage.from("franchise-assets").remove(paths);
        }
      }
    } catch (err) {
      console.error("Storage cleanup failed (non-blocking):", err);
    }
  }

  await prisma.franchise.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
