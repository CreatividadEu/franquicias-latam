import test from "node:test";
import assert from "node:assert/strict";
import { mapFranchiseToLandingPageData } from "../src/lib/franchise-mapper";

function buildFranchise(overrides: Record<string, unknown> = {}) {
  return {
    id: "frq_1",
    name: "Casano",
    description: "Marca premium con tracción regional.",
    logo: null,
    video: null,
    investmentMin: 50000,
    investmentMax: 120000,
    sectorId: "sector_food",
    sector: {
      id: "sector_food",
      name: "Comida",
      slug: "comida",
      emoji: "🍔",
      createdAt: new Date(),
    },
    slug: "casano",
    contactEmail: "hola@casano.co",
    featured: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    planTier: "ALL_IN",
    published: true,
    headline: null,
    subheadline: null,
    shortDescription: null,
    longDescription: null,
    logoUrl: null,
    heroImageUrl: null,
    youtubeUrl: null,
    brochureUrl: null,
    bookingUrl: null,
    credibilityLine: null,
    foundingYear: 2019,
    cta1Label: null,
    cta1Url: null,
    cta2Label: null,
    cta2Url: null,
    ebitdaReference: "18%-22%",
    paybackMonths: 18,
    royaltyInfo: "5% sobre ventas",
    operatorProfile: "Operador con foco comercial y ejecución local.",
    canonEntrada: 15000,
    listingType: "ACTIVE_FRANCHISE",
    verificationStatus: "VERIFIED_BY_FL",
    editorialBadge: null,
    publicInterestCount: 0,
    publicInterestEnabled: false,
    publicInterestLabel: null,
    interestCtaMode: "APPLY",
    availabilityLabel: null,
    statusDisclaimer: null,
    showApplicationForm: true,
    showFinancialData: true,
    showVerifiedBadge: true,
    businessModels: [],
    media: [],
    faqs: [],
    moduleConfig: {
      heroEnabled: true,
      videoEnabled: false,
      galleryEnabled: false,
      businessModelsEnabled: false,
      financialsEnabled: true,
      faqEnabled: false,
      brochureEnabled: false,
      bookingEnabled: false,
      chatbotEnabled: false,
      nurturingEnabled: false,
      showVerifiedBadge: true,
    },
    automationConfig: null,
    coverageCountries: [],
    ...overrides,
  } as never;
}

test("legacy/active listings fallback to active franchise behavior", () => {
  const legacy = buildFranchise({
    listingType: undefined,
    verificationStatus: undefined,
    availabilityLabel: undefined,
    showApplicationForm: undefined,
    showFinancialData: undefined,
    showVerifiedBadge: undefined,
  });

  const page = mapFranchiseToLandingPageData(legacy);

  assert.equal(page.listing.listingType, "ACTIVE_FRANCHISE");
  assert.equal(page.hero?.availabilityLabel, "Franquicia disponible");
  assert.equal(page.hero?.showVerifiedBadge, true);
  assert.equal(page.leadModule?.variant, "apply");
  assert.notEqual(page.financials, null);
});

test("external franchise listings switch to request-info flow", () => {
  const external = buildFranchise({
    listingType: "EXTERNAL_FRANCHISE",
    verificationStatus: "NOT_VERIFIED",
    interestCtaMode: "REQUEST_INFO",
    showApplicationForm: false,
    showFinancialData: false,
    showVerifiedBadge: false,
    moduleConfig: {
      heroEnabled: true,
      videoEnabled: false,
      galleryEnabled: false,
      businessModelsEnabled: false,
      financialsEnabled: true,
      faqEnabled: false,
      brochureEnabled: false,
      bookingEnabled: false,
      chatbotEnabled: false,
      nurturingEnabled: false,
      showVerifiedBadge: false,
    },
  });

  const page = mapFranchiseToLandingPageData(external);

  assert.equal(page.listing.listingType, "EXTERNAL_FRANCHISE");
  assert.equal(page.financials, null);
  assert.equal(page.leadModule?.variant, "interest");
  assert.equal(page.leadModule?.sourceType, "external_franchise_interest");
  assert.equal(page.hero?.cta1Url, "#listing-lead-module");
  assert.equal(page.hero?.showVerifiedBadge, false);
});

test("identified brands expose editorial framing and public-interest lead flow", () => {
  const identifiedBrand = buildFranchise({
    listingType: "IDENTIFIED_BRAND",
    verificationStatus: "NOT_VERIFIED",
    editorialBadge: "FL Spotted",
    publicInterestEnabled: true,
    publicInterestCount: 37,
    publicInterestLabel: "Señales de interés",
    interestCtaMode: "EXPLORE_BRAND",
    showApplicationForm: false,
    showFinancialData: false,
    showVerifiedBadge: false,
  });

  const page = mapFranchiseToLandingPageData(identifiedBrand);

  assert.equal(
    page.hero?.availabilityLabel,
    "Marca identificada por Franquicias LATAM",
  );
  assert.equal(page.hero?.editorialBadge, "FL Spotted");
  assert.match(
    page.hero?.statusDisclaimer ?? "",
    /no ha sido verificado/i,
  );
  assert.equal(page.leadModule?.variant, "interest");
  assert.equal(page.leadModule?.sourceType, "identified_brand_interest");
  assert.equal(page.leadModule?.publicInterestCount, 37);
  assert.equal(page.hero?.cta1Url, "#listing-lead-module");
});
