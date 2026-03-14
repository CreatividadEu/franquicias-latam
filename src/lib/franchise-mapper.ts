import type { Prisma } from "@prisma/client";
import { isModuleAllowed, getEntitlements, type PlanTier } from "./plan-entitlements";

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
  cta1Label: string;
  cta1Url: string;
  cta2Label: string | null;
  cta2Url: string | null;
  planTier: PlanTier;
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
        cta1Label: franchise.cta1Label ?? "Quiero saber más",
        cta1Url: franchise.cta1Url ?? "/quiz",
        cta2Label: franchise.cta2Label,
        cta2Url: franchise.cta2Url,
        planTier: plan,
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
    cfg?.financialsEnabled ?? true,
    true
  )
    ? {
        investmentMin: franchise.investmentMin,
        investmentMax: franchise.investmentMax,
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
    ? { franchiseName: franchise.name }
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
    planTier: plan,
  };
}
