import type { PrismaClient } from "@prisma/client";

type FranchiseSeedShape = {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  video: string | null;
  investmentMin: number;
  investmentMax: number;
};

type BotFaqInput = {
  question: string;
  answer: string;
  priority?: number;
  enabled?: boolean;
};

const DEFAULT_BOT_INSTRUCTIONS =
  "Responde unicamente con la informacion cargada para esta franquicia. Si no existe una respuesta clara en FAQs o configuracion, usa el mensaje de fallback.";

const DEFAULT_BOT_FALLBACK =
  "Puedo ayudarte con informacion general de esta franquicia. Si quieres detalles especificos, deja tus datos y un asesor te contacta.";

export function normalizeBotText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeBotText(value: string) {
  return normalizeBotText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

export function scoreFaqMatch(
  message: string,
  question: string,
  answer: string,
  priority = 0
) {
  const normalizedMessage = normalizeBotText(message);
  const messageTokens = tokenizeBotText(message);
  if (messageTokens.length === 0) return 0;

  const corpus = new Set([...tokenizeBotText(question), ...tokenizeBotText(answer)]);
  const overlap = messageTokens.filter((token) => corpus.has(token)).length;

  let score = overlap * 10;

  const normalizedQuestion = normalizeBotText(question);
  if (
    normalizedQuestion.includes(normalizedMessage) ||
    normalizedMessage.includes(normalizedQuestion)
  ) {
    score += 18;
  }

  if (overlap > 0) {
    score += Math.min(priority, 50);
  }

  return score;
}

export function toGalleryUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function buildDefaultFranchiseProfile(franchise: FranchiseSeedShape) {
  return {
    headline: franchise.name,
    subheadline: franchise.description,
    heroImageUrl: franchise.logo,
    heroVideoUrl: franchise.video,
    galleryUrls: franchise.logo ? [franchise.logo] : [],
    brochureUrl: null,
    investmentMin: franchise.investmentMin,
    investmentMax: franchise.investmentMax,
    countryCoverage: null,
  };
}

export function buildDefaultFranchiseFeatureFlags(franchise: FranchiseSeedShape) {
  return {
    showVideo: Boolean(franchise.video),
    showGallery: true,
    showTestimonials: false,
    showKpis: true,
    showBot: false,
    showDownloads: false,
    showContactForm: true,
    planTier: "BASIC" as const,
  };
}

export function buildDefaultFranchiseBotConfig() {
  return {
    enabled: false,
    systemInstructions: DEFAULT_BOT_INSTRUCTIONS,
    fallbackMessage: DEFAULT_BOT_FALLBACK,
    tone: "consultivo",
  };
}

export async function ensureFranchiseLandingConfig(
  prisma: PrismaClient,
  franchise: FranchiseSeedShape
) {
  await prisma.franchiseProfile.upsert({
    where: { franchiseId: franchise.id },
    update: {},
    create: {
      franchiseId: franchise.id,
      ...buildDefaultFranchiseProfile(franchise),
    },
  });

  await prisma.franchiseFeatureFlags.upsert({
    where: { franchiseId: franchise.id },
    update: {},
    create: {
      franchiseId: franchise.id,
      ...buildDefaultFranchiseFeatureFlags(franchise),
    },
  });

  await prisma.franchiseBotConfig.upsert({
    where: { franchiseId: franchise.id },
    update: {},
    create: {
      franchiseId: franchise.id,
      ...buildDefaultFranchiseBotConfig(),
    },
  });
}

export async function syncFranchiseBotFaqs(
  prisma: PrismaClient,
  franchiseId: string,
  faqs: BotFaqInput[]
) {
  await prisma.franchiseBotFaq.deleteMany({
    where: { franchiseId },
  });

  const cleanFaqs = faqs
    .map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer.trim(),
      priority: Number.isFinite(faq.priority) ? Number(faq.priority) : 0,
      enabled: faq.enabled !== false,
    }))
    .filter((faq) => faq.question && faq.answer);

  for (const faq of cleanFaqs) {
    await prisma.franchiseBotFaq.create({
      data: {
        franchiseId,
        ...faq,
      },
    });
  }
}
