export const PLAN_ENTITLEMENTS = {
  BASIC: {
    label: "Presencia",
    modules: ["hero", "financials"] as const,
    maxGalleryImages: 3,
    maxBusinessModels: 1,
    videoEnabled: false,
    brochureEnabled: false,
    bookingEnabled: false,
    chatbotEnabled: false,
    faqEnabled: false,
    nurturingEnabled: false,
  },
  GROWTH: {
    label: "Conversión",
    modules: [
      "hero",
      "video",
      "gallery",
      "businessModels",
      "financials",
      "faq",
      "booking",
    ] as const,
    maxGalleryImages: 10,
    maxBusinessModels: 5,
    videoEnabled: true,
    brochureEnabled: true,
    bookingEnabled: true,
    chatbotEnabled: false,
    faqEnabled: true,
    nurturingEnabled: false,
  },
  ALL_IN: {
    label: "Aceleración",
    modules: [
      "hero",
      "video",
      "gallery",
      "businessModels",
      "financials",
      "faq",
      "brochure",
      "booking",
      "chatbot",
      "nurturing",
    ] as const,
    maxGalleryImages: 25,
    maxBusinessModels: 10,
    videoEnabled: true,
    brochureEnabled: true,
    bookingEnabled: true,
    chatbotEnabled: true,
    faqEnabled: true,
    nurturingEnabled: true,
  },
} as const;

export type PlanTier = keyof typeof PLAN_ENTITLEMENTS;

export function isModuleAllowed(plan: PlanTier, moduleName: string): boolean {
  return (
    PLAN_ENTITLEMENTS[plan].modules as readonly string[]
  ).includes(moduleName);
}

export function getEntitlements(plan: PlanTier) {
  return PLAN_ENTITLEMENTS[plan];
}
