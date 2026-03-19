import type { Prisma } from "@prisma/client";
import { isModuleAllowed, getEntitlements, type PlanTier } from "./plan-entitlements";
import {
  getLeadModuleCopy,
  getLeadSourceType,
  getListingPrimaryCtaLabel,
  getListingPrimaryCtaUrl,
  resolveListingState,
  shouldUseInterestFlow,
  type InterestCtaMode,
  type ListingType,
  type ResolvedListingState,
  type VerificationStatus,
} from "./listing-config";

// ── Prisma include shape ──────────────────────────────────────────────────────

export const franchiseLandingInclude = {
  businessModels: { orderBy: { order: "asc" as const } },
  media: { orderBy: { order: "asc" as const } },
  faqs: { orderBy: { order: "asc" as const } },
  moduleConfig: true,
  automationConfig: true,
  sector: true,
  coverageCountries: { include: { country: true } },
} as const;

export type FranchiseWithLandingData = Prisma.FranchiseGetPayload<{
  include: typeof franchiseLandingInclude;
}>;

// ── Output types ─────────────────────────────────────────────────────────────

export type HeroData = {
  name: string;
  headline: string;
  subheadline: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  credibilityLine: string | null;
  foundingYear: number | null;
  cta1Label: string;
  cta1Url: string;
  cta2Label: string | null;
  cta2Url: string | null;
  planTier: PlanTier;
  showVerifiedBadge: boolean;
  listingType: ListingType;
  verificationStatus: VerificationStatus;
  editorialBadge: string | null;
  availabilityLabel: string;
  statusDisclaimer: string | null;
  publicInterestEnabled: boolean;
  publicInterestCount: number;
  publicInterestLabel: string | null;
  interestCtaMode: InterestCtaMode;
  usesInterestFlow: boolean;
};

export type VideoData = {
  youtubeUrl: string;
};

export type BusinessModelData = {
  id: string;
  name: string;
  size: string | null;
  investmentMin: number | null;
  investmentMax: number | null;
  ebitda: string | null;
  paybackMonths: number | null;
  roiAnnual: number | null;
  imageUrl: string | null;
  description: string | null;
};

export type GalleryImageData = {
  id: string;
  url: string;
  altText: string | null;
  label: string | null;
};

export type FinancialsData = {
  investmentMin: number;
  investmentMax: number;
  canonEntrada: number | null;
  ebitdaReference: string | null;
  paybackMonths: number | null;
  royaltyInfo: string | null;
  operatorProfile: string | null;
};

export type FaqData = {
  id: string;
  question: string;
  answer: string;
};

export type BrochureData = {
  brochureUrl: string;
  name: string;
};

export type BookingData = {
  bookingUrl: string;
  name: string;
};

export type ChatbotData = {
  franchiseName: string;
  logoUrl?: string | null;
};

export type ListingStateData = ResolvedListingState & {
  usesInterestFlow: boolean;
  leadSourceType: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
};

export type LeadModuleData = {
  variant: "apply" | "interest";
  sourceType: string;
  listingType: ListingType;
  editorialBadge: string | null;
  availabilityLabel: string;
  publicInterestEnabled: boolean;
  publicInterestCount: number;
  publicInterestLabel: string | null;
  interestCtaMode: InterestCtaMode;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  showExperienceField: boolean;
};

export type LandingPageData = {
  hero: HeroData | null;
  video: VideoData | null;
  businessModels: BusinessModelData[] | null;
  gallery: GalleryImageData[] | null;
  financials: FinancialsData | null;
  faq: FaqData[] | null;
  brochure: BrochureData | null;
  booking: BookingData | null;
  chatbot: ChatbotData | null;
  listing: ListingStateData;
  leadModule: LeadModuleData | null;
  planTier: PlanTier;
};

// ── Three-gate helper ─────────────────────────────────────────────────────────

function gate(
  plan: PlanTier,
  moduleName: string,
  adminEnabled: boolean | undefined | null,
  hasData: boolean
): boolean {
  return (
    isModuleAllowed(plan, moduleName) &&
    adminEnabled !== false &&
    hasData
  );
}

// ── Mapper ────────────────────────────────────────────────────────────────────

export function mapFranchiseToLandingPageData(
  franchise: FranchiseWithLandingData
): LandingPageData {
  const plan = (franchise.planTier as PlanTier) ?? "BASIC";
  const entitlements = getEntitlements(plan);
  const cfg = franchise.moduleConfig;
  const listingState = resolveListingState({
    listingType: franchise.listingType,
    verificationStatus: franchise.verificationStatus,
    editorialBadge: franchise.editorialBadge,
    publicInterestCount: franchise.publicInterestCount,
    publicInterestEnabled: franchise.publicInterestEnabled,
    publicInterestLabel: franchise.publicInterestLabel,
    interestCtaMode: franchise.interestCtaMode,
    availabilityLabel: franchise.availabilityLabel,
    statusDisclaimer: franchise.statusDisclaimer,
    showApplicationForm: franchise.showApplicationForm,
    showFinancialData:
      typeof franchise.showFinancialData === "boolean"
        ? franchise.showFinancialData
        : cfg?.financialsEnabled,
    showVerifiedBadge:
      typeof franchise.showVerifiedBadge === "boolean"
        ? franchise.showVerifiedBadge
        : cfg?.showVerifiedBadge,
  });
  const usesInterestFlow = shouldUseInterestFlow(listingState);
  const primaryCtaLabel = getListingPrimaryCtaLabel(
    listingState,
    franchise.cta1Label,
  );
  const primaryCtaUrl = getListingPrimaryCtaUrl(
    listingState,
    franchise.cta1Url,
  );
  const leadSourceType = getLeadSourceType(listingState);
  const listingData: ListingStateData = {
    ...listingState,
    usesInterestFlow,
    leadSourceType,
    primaryCtaLabel,
    primaryCtaUrl,
  };

  // ── Hero (always allowed on all plans, but gated by moduleConfig) ────────
  const heroData: HeroData | null = gate(
    plan,
    "hero",
    cfg?.heroEnabled ?? true,
    true
  )
    ? {
        name: franchise.name,
        headline: franchise.headline ?? franchise.name,
        subheadline: franchise.subheadline ?? franchise.description,
        logoUrl: franchise.logoUrl ?? franchise.logo,
        heroImageUrl: franchise.heroImageUrl,
        credibilityLine: franchise.credibilityLine,
        foundingYear: franchise.foundingYear ?? null,
        cta1Label: primaryCtaLabel,
        cta1Url: primaryCtaUrl,
        cta2Label: franchise.cta2Label,
        cta2Url: franchise.cta2Url,
        planTier: plan,
        showVerifiedBadge:
          (listingState.showVerifiedBadge || cfg?.showVerifiedBadge === true) &&
          listingState.verificationStatus === "VERIFIED_BY_FL",
        listingType: listingState.listingType,
        verificationStatus: listingState.verificationStatus,
        editorialBadge: listingState.editorialBadge,
        availabilityLabel: listingState.availabilityLabel,
        statusDisclaimer: listingState.statusDisclaimer,
        publicInterestEnabled: listingState.publicInterestEnabled,
        publicInterestCount: listingState.publicInterestCount,
        publicInterestLabel: listingState.publicInterestLabel,
        interestCtaMode: listingState.interestCtaMode,
        usesInterestFlow,
      }
    : null;

  // ── Video ────────────────────────────────────────────────────────────────
  const youtubeUrl = franchise.youtubeUrl ?? franchise.video;
  const videoData: VideoData | null = gate(
    plan,
    "video",
    cfg?.videoEnabled,
    Boolean(youtubeUrl)
  )
    ? { youtubeUrl: youtubeUrl! }
    : null;

  // ── Business Models ───────────────────────────────────────────────────────
  const rawModels = franchise.businessModels.slice(
    0,
    entitlements.maxBusinessModels
  );
  const businessModelsData: BusinessModelData[] | null = gate(
    plan,
    "businessModels",
    cfg?.businessModelsEnabled,
    rawModels.length > 0
  )
    ? rawModels.map((m) => ({
        id: m.id,
        name: m.name,
        size: m.size,
        investmentMin: m.investmentMin,
        investmentMax: m.investmentMax,
        ebitda: m.ebitda,
        paybackMonths: m.paybackMonths,
        roiAnnual: m.roiAnnual,
        imageUrl: m.imageUrl,
        description: m.description,
      }))
    : null;

  // ── Gallery ───────────────────────────────────────────────────────────────
  const imageMedia = franchise.media
    .filter((m) => m.type === "image")
    .slice(0, entitlements.maxGalleryImages);
  const galleryData: GalleryImageData[] | null = gate(
    plan,
    "gallery",
    cfg?.galleryEnabled,
    imageMedia.length > 0
  )
    ? imageMedia.map((m) => ({
        id: m.id,
        url: m.url,
        altText: m.altText,
        label: m.label,
      }))
    : null;

  // ── Financials ────────────────────────────────────────────────────────────
  const financialsData: FinancialsData | null = gate(
    plan,
    "financials",
    (cfg?.financialsEnabled ?? true) && listingState.showFinancialData,
    true
  )
    ? {
        investmentMin: franchise.investmentMin,
        investmentMax: franchise.investmentMax,
        canonEntrada: franchise.canonEntrada ?? null,
        ebitdaReference: franchise.ebitdaReference,
        paybackMonths: franchise.paybackMonths,
        royaltyInfo: franchise.royaltyInfo,
        operatorProfile: franchise.operatorProfile,
      }
    : null;

  // ── FAQ ───────────────────────────────────────────────────────────────────
  const faqItems = franchise.faqs;
  const faqData: FaqData[] | null = gate(
    plan,
    "faq",
    cfg?.faqEnabled,
    faqItems.length > 0
  )
    ? faqItems.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }))
    : null;

  // ── Brochure ──────────────────────────────────────────────────────────────
  const brochureUrl = franchise.brochureUrl;
  const brochureData: BrochureData | null = gate(
    plan,
    "brochure",
    cfg?.brochureEnabled,
    Boolean(brochureUrl)
  )
    ? { brochureUrl: brochureUrl!, name: franchise.name }
    : null;

  // ── Booking ───────────────────────────────────────────────────────────────
  const bookingUrl = franchise.bookingUrl ?? franchise.automationConfig?.bookingUrl;
  const bookingData: BookingData | null = gate(
    plan,
    "booking",
    cfg?.bookingEnabled,
    Boolean(bookingUrl)
  )
    ? { bookingUrl: bookingUrl!, name: franchise.name }
    : null;

  // ── Chatbot ───────────────────────────────────────────────────────────────
  const chatbotData: ChatbotData | null = gate(
    plan,
    "chatbot",
    cfg?.chatbotEnabled,
    true
  )
    ? { franchiseName: franchise.name, logoUrl: franchise.logoUrl ?? franchise.logo ?? null }
    : null;

  const leadModuleCopy = getLeadModuleCopy(
    listingState,
    franchise.name,
    franchise.cta1Label,
  );
  const leadModuleData: LeadModuleData | null =
    listingState.showApplicationForm || usesInterestFlow
      ? {
          ...leadModuleCopy,
          sourceType: leadSourceType,
          listingType: listingState.listingType,
          editorialBadge: listingState.editorialBadge,
          availabilityLabel: listingState.availabilityLabel,
          publicInterestEnabled: listingState.publicInterestEnabled,
          publicInterestCount: listingState.publicInterestCount,
          publicInterestLabel: listingState.publicInterestLabel,
          interestCtaMode: listingState.interestCtaMode,
        }
      : null;

  return {
    hero: heroData,
    video: videoData,
    businessModels: businessModelsData,
    gallery: galleryData,
    financials: financialsData,
    faq: faqData,
    brochure: brochureData,
    booking: bookingData,
    chatbot: chatbotData,
    listing: listingData,
    leadModule: leadModuleData,
    planTier: plan,
  };
}
