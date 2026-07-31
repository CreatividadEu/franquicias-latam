import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchesFranchiseSlug } from "@/lib/franchiseSlug";
import { sendFormLeadNotification } from "@/lib/resend";
import { isSajuListing, mirrorLandingLeadToSaju } from "@/lib/saju/landing-lead";
import {
  getLeadSourceType,
  resolveListingState,
  shouldUseInterestFlow,
} from "@/lib/listing-config";

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

async function findListingBySlug(slug: string) {
  const candidates = await prisma.franchise.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      listingType: true,
      verificationStatus: true,
      editorialBadge: true,
      publicInterestCount: true,
      publicInterestEnabled: true,
      publicInterestLabel: true,
      interestCtaMode: true,
      availabilityLabel: true,
      statusDisclaimer: true,
      showApplicationForm: true,
      showFinancialData: true,
      showVerifiedBadge: true,
    },
  });

  return candidates.find((candidate) => matchesFranchiseSlug(candidate, slug)) ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = normalizeText(body.name);
    const email = normalizeText(body.email).toLowerCase();
    const phone = normalizeText(body.phone);
    const rawSlug =
      normalizeText(body.listingSlug) || normalizeText(body.franchiseSlug);
    const investmentRange = normalizeText(body.investmentRange);
    const experience = normalizeText(body.experience);
    const cityInterest =
      normalizeText(body.cityInterest) || normalizeText(body.city);
    const country = normalizeText(body.country);
    const message = normalizeText(body.message);

    if (!name || !email || !phone || !rawSlug) {
      return NextResponse.json(
        { error: "Nombre, email, teléfono y listing son requeridos" },
        { status: 400 },
      );
    }

    const matchedListing = await findListingBySlug(rawSlug);
    const resolvedListing = resolveListingState({
      listingType: matchedListing?.listingType ?? body.listingType,
      verificationStatus:
        matchedListing?.verificationStatus ?? body.verificationStatus,
      editorialBadge: matchedListing?.editorialBadge ?? body.editorialBadge,
      publicInterestCount:
        matchedListing?.publicInterestCount ?? body.publicInterestCount,
      publicInterestEnabled:
        matchedListing?.publicInterestEnabled ?? body.publicInterestEnabled,
      publicInterestLabel:
        matchedListing?.publicInterestLabel ?? body.publicInterestLabel,
      interestCtaMode: matchedListing?.interestCtaMode ?? body.interestCtaMode,
      availabilityLabel:
        matchedListing?.availabilityLabel ?? body.availabilityLabel,
      statusDisclaimer:
        matchedListing?.statusDisclaimer ?? body.statusDisclaimer,
      showApplicationForm:
        matchedListing?.showApplicationForm ?? body.showApplicationForm,
      showFinancialData:
        matchedListing?.showFinancialData ?? body.showFinancialData,
      showVerifiedBadge:
        matchedListing?.showVerifiedBadge ?? body.showVerifiedBadge,
    });

    const sourceType =
      normalizeText(body.sourceType) || getLeadSourceType(resolvedListing);
    const isInterestFlow = shouldUseInterestFlow(resolvedListing);
    const landingSource =
      normalizeText(body.landingSource) ||
      (isInterestFlow ? "listing-interest" : "landing-form");
    const leadType =
      normalizeText(body.type) || (isInterestFlow ? "interest" : "form");
    const listingSlug = matchedListing?.slug ?? rawSlug;

    const created = await prisma.$transaction(async (tx) => {
      const lead = await tx.formLead.create({
        data: {
          name,
          email,
          phone,
          investmentRange,
          city: cityInterest || null,
          experience: experience || null,
          franchiseSlug: listingSlug,
          listingSlug,
          listingType: resolvedListing.listingType,
          sourceType,
          editorialBadge: (
            matchedListing?.editorialBadge ??
            normalizeText(body.editorialBadge)
          ) || null,
          cityInterest: cityInterest || null,
          country: country || null,
          message: message || null,
          landingSource,
          type: leadType,
        },
      });

      let publicInterestCount = matchedListing?.publicInterestCount ?? 0;

      if (isInterestFlow && matchedListing?.publicInterestEnabled) {
        const updated = await tx.franchise.update({
          where: { id: matchedListing.id },
          data: { publicInterestCount: { increment: 1 } },
          select: { publicInterestCount: true },
        });
        publicInterestCount = updated.publicInterestCount;
      }

      return { lead, publicInterestCount };
    });

    console.log("[form-leads/POST] Created form lead", {
      id: created.lead.id,
      listingSlug,
      sourceType,
      listingType: resolvedListing.listingType,
    });

    // SAJÚ: replicate the application into the expansion pipeline as PROSPECTO
    // / LANDING_FORM. Fire-and-forget — never blocks or fails the form.
    if (isSajuListing(listingSlug) || isSajuListing(rawSlug)) {
      mirrorLandingLeadToSaju({
        name: created.lead.name,
        country: created.lead.country,
        city: created.lead.cityInterest ?? created.lead.city,
        email: created.lead.email,
        phone: created.lead.phone,
        investmentRange: created.lead.investmentRange,
        message: created.lead.message,
      }).catch(console.error);
    }

    // Notify the sales inbox (async, don't block the response).
    sendFormLeadNotification({
      name: created.lead.name,
      email: created.lead.email,
      phone: created.lead.phone,
      sourceType: created.lead.sourceType,
      franchiseSlug: created.lead.franchiseSlug,
      investmentRange: created.lead.investmentRange,
      city: created.lead.city,
      country: created.lead.country,
      message: created.lead.message,
    }).catch(console.error);

    return NextResponse.json(
      { id: created.lead.id, publicInterestCount: created.publicInterestCount },
      { status: 201 },
    );
  } catch (error) {
    console.error("[form-leads/POST] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
