import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { matchesFranchiseSlug } from "@/lib/franchiseSlug";
import { ensureFranchiseLandingConfig } from "@/lib/franchiseLanding";
import { formatCurrency } from "@/lib/utils";
import { FranchiseAssist } from "@/components/franchise/FranchiseAssist";
import {
  CTASection,
  ChatbotSection,
  CoverageMarkets,
  HeroFranchise,
  HowItWorks3Steps,
  Investment,
  SupportSystem,
  TrustSignals,
  ValueProposition,
  VideoSection,
  franchiseFeatureCardIcons,
} from "@/components/franchise/FranchiseLandingSystem";
import { Button } from "@/components/ui/button";

async function getFranchiseBySlug(slug: string) {
  const candidates = await prisma.franchise.findMany({
    where: { active: true },
    include: {
      sector: true,
      coverageCountries: {
        include: {
          country: true,
        },
      },
      profile: true,
      featureFlags: true,
      botConfig: true,
      botFaqs: {
        where: { enabled: true },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  const franchise = candidates.find((candidate) =>
    matchesFranchiseSlug(candidate, slug),
  );

  if (!franchise) {
    return null;
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

  return prisma.franchise.findUnique({
    where: { id: franchise.id },
    include: {
      sector: true,
      coverageCountries: {
        include: {
          country: true,
        },
      },
      profile: true,
      featureFlags: true,
      botConfig: true,
      botFaqs: {
        where: { enabled: true },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });
}

export default async function FranchiseLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const franchise = await getFranchiseBySlug(slug.toLowerCase());

  if (!franchise) {
    return (
      <main className="min-h-screen px-4 py-8 text-[#171717] sm:px-6 sm:py-10">
        <div className="glass-card mx-auto max-w-3xl rounded-3xl border border-slate-200/60 bg-white/80 p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)]">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Franquicia no encontrada
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              No encontramos información para la franquicia solicitada.
            </p>
            <Button
              asChild
              size="lg"
              className="h-auto"
            >
              <Link href="/quiz">Volver al quiz</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const profile = franchise.profile;
  const featureFlags = franchise.featureFlags;
  const botConfig = franchise.botConfig;

  const headline = profile?.headline || franchise.name;
  const rawSubheadline = profile?.subheadline || franchise.description;
  const subheadline =
    rawSubheadline.length > 145
      ? `${rawSubheadline.slice(0, 142).trimEnd()}...`
      : rawSubheadline;
  const heroImageUrl = profile?.heroImageUrl || franchise.logo;
  const heroVideoUrl = profile?.heroVideoUrl || franchise.video;
  const galleryUrls = profile?.galleryUrls || [];
  const investmentMin = profile?.investmentMin ?? franchise.investmentMin;
  const investmentMax = profile?.investmentMax ?? franchise.investmentMax;
  const coverageItems = franchise.coverageCountries.map((item) => ({
    flag: item.country.flag,
    code: item.country.code,
  }));
  const countriesCount = coverageItems.length;
  const coverageSummary =
    countriesCount > 0 ? `+${countriesCount} países activos` : "Cobertura LATAM";

  const stats = [
    {
      label: "Inversión",
      value: `${formatCurrency(investmentMin)} - ${formatCurrency(investmentMax)}`,
    },
    {
      label: "Cobertura",
      value: coverageSummary,
    },
    {
      label: "Sector",
      value: `${franchise.sector.emoji} ${franchise.sector.name}`,
    },
  ];

  const valueItems = [
    {
      icon: franchiseFeatureCardIcons.Wallet,
      title: "Decisión clara",
      description: "Ticket, lectura financiera y encaje en una sola vista.",
    },
    {
      icon: franchiseFeatureCardIcons.TrendingUp,
      title: "Apertura guiada",
      description: "Menos fricción para activar el siguiente paso.",
    },
    {
      icon: franchiseFeatureCardIcons.ShieldCheck,
      title: "Sistema transferible",
      description: profile?.brochureUrl
        ? "Dossier listo para validar con criterio."
        : "Modelo consultivo para avanzar con orden.",
    },
  ];

  const stepItems = [
    {
      step: "01",
      title: "Revisa el modelo",
      description: "Confirma encaje, ticket y alcance antes de aplicar.",
    },
    {
      step: "02",
      title: "Validamos fit",
      description: "Alineamos territorio, operación y expectativas reales.",
    },
    {
      step: "03",
      title: "Activas la siguiente fase",
      description: "Si hay match, avanzas con dossier y siguientes pasos.",
    },
  ];

  const investmentItems = [
    {
      label: "CAPEX",
      value: formatCurrency(investmentMin),
    },
    {
      label: "RANGO",
      value: `${formatCurrency(investmentMin)} - ${formatCurrency(investmentMax)}`,
    },
    {
      label: "EXPANSIÓN",
      value: coverageSummary,
    },
  ];

  const trustItems = franchise.botFaqs.slice(0, 3).map((faq) => ({
    title: faq.question,
    body:
      faq.answer.length > 120
        ? `${faq.answer.slice(0, 117).trimEnd()}...`
        : faq.answer,
  }));

  const chatbotEnabled = Boolean(featureFlags?.showBot && botConfig?.enabled);
  const chatbotPanel = chatbotEnabled ? (
    <FranchiseAssist
      franchiseId={franchise.id}
      initialQuestions={franchise.botFaqs.slice(0, 3).map((faq) => faq.question)}
      fallbackMessage={
        botConfig?.fallbackMessage ||
        "No encontré una respuesta específica para esa pregunta."
      }
    />
  ) : (
    <></>
  );

  return (
    <main className="min-h-screen overflow-x-clip px-4 py-8 text-[#171717] sm:px-6 sm:py-10 lg:py-14">
      {/* Back navigation */}
      <div className="mx-auto mb-8 w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700"
        >
          <ChevronLeft className="size-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-16 sm:space-y-20">
        <HeroFranchise
          title={headline}
          description={subheadline}
          stats={stats}
          primaryHref="/quiz"
          secondaryHref={
            featureFlags?.showDownloads && profile?.brochureUrl
              ? profile.brochureUrl
              : "#support"
          }
          secondaryLabel={
            featureFlags?.showDownloads && profile?.brochureUrl
              ? "Ver dossier"
              : "Ver sistema"
          }
          secondaryExternal={Boolean(
            featureFlags?.showDownloads && profile?.brochureUrl,
          )}
          imageUrl={heroImageUrl}
          videoUrl={heroVideoUrl}
          showVideo={Boolean(featureFlags?.showVideo)}
          name={franchise.name}
          galleryUrls={featureFlags?.showGallery ? galleryUrls : []}
          logoUrl={franchise.logo}
        />

        <ValueProposition items={valueItems} />

        <VideoSection
          imageUrl={heroImageUrl}
          videoUrl={heroVideoUrl}
          showVideo={Boolean(featureFlags?.showVideo)}
          title={franchise.name}
        />

        <CoverageMarkets items={coverageItems} />

        <HowItWorks3Steps items={stepItems} />

        <SupportSystem />

        <Investment items={investmentItems} />

        <TrustSignals items={trustItems} />

        <ChatbotSection
          assistant={chatbotPanel}
          enabled={chatbotEnabled}
          contactEmail={franchise.contactEmail}
        />

        <CTASection
          headline={`Recibe el dossier de ${franchise.name} y valida tu fit.`}
          description="Un solo paso para revisar el dossier, validar encaje y avanzar con criterio."
          applyHref="/quiz"
        />
      </div>
    </main>
  );
}
