import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, GraduationCap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { matchesFranchiseSlug } from "@/lib/franchiseSlug";

const marqueeText = "✅ Franquicia Desarrollada x Franquicias LATAM";

const valueProps = [
  { icon: GraduationCap, label: "Formacion" },
  { icon: BookOpenCheck, label: "Know-How" },
  { icon: Handshake, label: "Acompanamiento" },
];

type FranchiseViewData = {
  name: string;
  heroDescription: string;
  chatBubbles: string[];
  suggestedQuestions: string[];
  models: { name: string; description: string }[];
  commercialTitle: string;
  commercialDescription: string;
  metrics: { label: string; value: string }[];
  carouselItems: string[];
};

const DEFAULT_FRANCHISE_VIEW: FranchiseViewData = {
  name: "Franquicia",
  heroDescription:
    "Descubre una oportunidad de franquicia con respaldo internacional, procesos claros y acompanamiento para crecer con estructura desde el inicio.",
  chatBubbles: [
    "Hola, soy tu asistente virtual de franquicias.",
    "Esta franquicia combina marca y operacion estandarizada.",
    "Cuando quieras, te guio con la inversion y los siguientes pasos.",
  ],
  suggestedQuestions: [
    "Cual es la inversion inicial?",
    "Que incluye el soporte de apertura?",
    "Cual es el tiempo estimado de retorno?",
  ],
  models: [
    {
      name: "Express",
      description: "Formato agil para zonas de alto flujo con huella compacta.",
    },
    {
      name: "Flagship",
      description: "Modelo completo para liderar presencia de marca en la ciudad.",
    },
  ],
  commercialTitle: "Impulsa una franquicia con traccion comercial real",
  commercialDescription:
    "Esta franquicia ofrece una operacion probada, herramientas de marketing y acompanamiento de equipo experto para acelerar apertura, estandarizar procesos y sostener crecimiento en el tiempo.",
  metrics: [
    { label: "Inversion Total", value: "Por confirmar" },
    { label: "Fee de Entrada", value: "Por confirmar" },
    { label: "Regalias", value: "Por confirmar" },
    { label: "Payback", value: "Por confirmar" },
  ],
  carouselItems: ["Imagen 1", "Imagen 2", "Imagen 3", "Imagen 4"],
};

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function asModelArray(value: unknown): { name: string; description: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const name = asString(entry.name);
      const description = asString(entry.description);

      if (!name || !description) {
        return null;
      }

      return { name, description };
    })
    .filter(
      (item): item is { name: string; description: string } => item !== null
    );
}

function asMetricArray(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const label = asString(entry.label);
      const metricValue = asString(entry.value);

      if (!label || !metricValue) {
        return null;
      }

      return { label, value: metricValue };
    })
    .filter((item): item is { label: string; value: string } => item !== null);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildFranchiseView(franchise: Record<string, unknown>): FranchiseViewData {
  const name = asString(franchise.name) ?? DEFAULT_FRANCHISE_VIEW.name;
  const heroDescription =
    asString(franchise.hero_description) ??
    asString(franchise.heroDescription) ??
    asString(franchise.description) ??
    DEFAULT_FRANCHISE_VIEW.heroDescription;

  const chatBubbles =
    asStringArray(franchise.chat_bubbles).length > 0
      ? asStringArray(franchise.chat_bubbles)
      : asStringArray(franchise.chatBubbles).length > 0
        ? asStringArray(franchise.chatBubbles)
        : DEFAULT_FRANCHISE_VIEW.chatBubbles;

  const suggestedQuestions =
    asStringArray(franchise.suggested_questions).length > 0
      ? asStringArray(franchise.suggested_questions)
      : asStringArray(franchise.suggestedQuestions).length > 0
        ? asStringArray(franchise.suggestedQuestions)
        : DEFAULT_FRANCHISE_VIEW.suggestedQuestions;

  const models =
    asModelArray(franchise.models).length > 0
      ? asModelArray(franchise.models)
      : DEFAULT_FRANCHISE_VIEW.models;

  const investmentMin =
    asNumber(franchise.investment_min) ?? asNumber(franchise.investmentMin);
  const investmentMax =
    asNumber(franchise.investment_max) ?? asNumber(franchise.investmentMax);

  const investmentTotalValue =
    investmentMin !== null && investmentMax !== null
      ? `${formatUsd(investmentMin)} - ${formatUsd(investmentMax)}`
      : DEFAULT_FRANCHISE_VIEW.metrics[0].value;

  const derivedMetrics = [
    { label: "Inversion Total", value: investmentTotalValue },
    {
      label: "Fee de Entrada",
      value:
        asString(franchise.entry_fee) ??
        asString(franchise.fee_de_entrada) ??
        asString(franchise.entryFee) ??
        DEFAULT_FRANCHISE_VIEW.metrics[1].value,
    },
    {
      label: "Regalias",
      value:
        asString(franchise.royalties) ??
        asString(franchise.regalias) ??
        DEFAULT_FRANCHISE_VIEW.metrics[2].value,
    },
    {
      label: "Payback",
      value:
        asString(franchise.payback) ??
        asString(franchise.payback_months) ??
        DEFAULT_FRANCHISE_VIEW.metrics[3].value,
    },
  ];

  const metrics =
    asMetricArray(franchise.metrics).length > 0
      ? asMetricArray(franchise.metrics)
      : derivedMetrics;

  const carouselItems =
    asStringArray(franchise.carousel_items).length > 0
      ? asStringArray(franchise.carousel_items)
      : asStringArray(franchise.carouselItems).length > 0
        ? asStringArray(franchise.carouselItems)
        : DEFAULT_FRANCHISE_VIEW.carouselItems;

  return {
    name,
    heroDescription,
    chatBubbles,
    suggestedQuestions,
    models,
    commercialTitle:
      asString(franchise.commercial_title) ??
      asString(franchise.commercialTitle) ??
      DEFAULT_FRANCHISE_VIEW.commercialTitle,
    commercialDescription:
      asString(franchise.commercial_description) ??
      asString(franchise.commercialDescription) ??
      asString(franchise.description) ??
      DEFAULT_FRANCHISE_VIEW.commercialDescription,
    metrics,
    carouselItems,
  };
}

function GlassPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "gap-0 border-white/70 bg-white/65 py-0 shadow-[0_24px_65px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </Card>
  );
}

function PlaceholderBlock({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-white/80 bg-gradient-to-br from-emerald-200/75 via-white to-sky-200/75 p-4 text-center text-sm font-medium text-slate-700",
        className
      )}
    >
      {label}
    </div>
  );
}

function MiniChatMock({
  data,
}: {
  data?: Pick<FranchiseViewData, "chatBubbles" | "suggestedQuestions">;
}) {
  const { chatBubbles = [], suggestedQuestions = [] } = data || {};
  return (
    <GlassPanel className="h-full">
      <CardContent className="flex h-full min-h-[360px] flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Chat embebido
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Mini Asistente de Franquicia
          </h2>
        </div>

        <div className="flex flex-1 flex-col gap-2 rounded-xl border border-white/80 bg-white/80 p-3">
          {chatBubbles.map((message: string) => (
            <div
              key={message}
              className="max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm"
            >
              {message}
            </div>
          ))}
        </div>

        <Input
          disabled
          placeholder="Escribe tu mensaje..."
          className="border-slate-200 bg-white/85 text-slate-500 disabled:opacity-100"
        />

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question: string) => (
            <Button
              key={question}
              disabled
              size="sm"
              variant="outline"
              className="h-auto rounded-full border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-600 disabled:opacity-100"
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </GlassPanel>
  );
}

export default async function FranchiseLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ backTo?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const requestedSlug = resolvedParams.slug.trim().toLowerCase();
  const rawBackTo =
    typeof resolvedSearchParams.backTo === "string"
      ? resolvedSearchParams.backTo
      : "";
  const backToResults =
    rawBackTo.startsWith("/results?") || rawBackTo === "/results"
      ? rawBackTo
      : null;

  const franchises = await prisma.franchise.findMany({
    where: { active: true },
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

  const franchise =
    franchises.find((item) => matchesFranchiseSlug(item, requestedSlug)) ?? null;

  if (!franchise) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#def7ec_0%,#edf6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <GlassPanel>
            <CardContent className="space-y-4 p-6 text-center sm:p-8">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Franquicia no encontrada
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                No encontramos informacion para la franquicia solicitada.
              </p>
              {backToResults ? (
                <Button asChild>
                  <Link href={backToResults}>Volver a resultados</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/quiz">Volver al quiz</Link>
                </Button>
              )}
            </CardContent>
          </GlassPanel>
        </div>
      </main>
    );
  }

  const franchiseData = buildFranchiseView(franchise as Record<string, unknown>);
  const marqueeLoop: string[] = Array.from({ length: 8 }, () => marqueeText);

  return (
    <main className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,#def7ec_0%,#edf6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <section>
          <GlassPanel>
            <CardContent className="space-y-3 p-5 sm:p-7">
              {backToResults && (
                <Button asChild size="sm" variant="outline" className="w-fit">
                  <Link href={backToResults}>← Volver a resultados</Link>
                </Button>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Bienvenidos a {franchiseData.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {franchiseData.heroDescription}
              </p>
            </CardContent>
          </GlassPanel>
        </section>

        <section className="grid gap-4 md:grid-cols-2 md:items-stretch">
          <GlassPanel className="h-full">
            <CardContent className="h-full min-h-[360px] p-5 sm:p-6">
              <PlaceholderBlock
                label="Imagen principal de franquicia (placeholder)"
                className="h-full min-h-[300px]"
              />
            </CardContent>
          </GlassPanel>
          <MiniChatMock data={franchiseData} />
        </section>
      </div>

      <section className="relative left-1/2 mt-6 w-screen -translate-x-1/2 overflow-hidden border-y border-white/70 bg-white/65 py-3 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:mt-8">
        <div className="flex w-max animate-[latam-marquee_24s_linear_infinite] gap-3">
          {[...marqueeLoop, ...marqueeLoop].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium whitespace-nowrap text-white sm:text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-6 w-full max-w-6xl space-y-6 sm:mt-8 sm:space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Nuestros modelos de franquicia son los siguientes:
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {franchiseData.models.map((model) => (
              <GlassPanel
                key={model.name}
                className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_-32px_rgba(15,23,42,0.55)]"
              >
                <CardContent className="space-y-3 p-5">
                  <PlaceholderBlock
                    label={`Imagen ${model.name}`}
                    className="h-40"
                  />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {model.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {model.description}
                  </p>
                </CardContent>
              </GlassPanel>
            ))}
          </div>
        </section>

        <section>
          <div className="grid gap-3 sm:grid-cols-3">
            {valueProps.map((item) => {
              const Icon = item.icon;
              return (
                <GlassPanel key={item.label}>
                  <CardContent className="flex flex-col items-center justify-center gap-2 p-5 text-center">
                    <div className="rounded-xl border border-white/80 bg-emerald-100/75 p-2.5 text-emerald-700">
                      <Icon className="size-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.label}
                    </p>
                  </CardContent>
                </GlassPanel>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 md:items-stretch">
          <GlassPanel className="h-full">
            <CardContent className="flex h-full flex-col justify-center p-5 sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {franchiseData.commercialTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                {franchiseData.commercialDescription}
              </p>
            </CardContent>
          </GlassPanel>

          <GlassPanel className="h-full">
            <CardContent className="p-5 sm:p-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                Metricas Comerciales y Financieras
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {franchiseData.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/80 bg-white/85 p-3"
                  >
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-700 sm:text-xl">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassPanel>
        </section>

        <section>
          <GlassPanel>
            <CardContent className="space-y-3 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Video de presentacion
              </h2>
              <div className="aspect-video w-full rounded-xl border border-white/80 bg-gradient-to-br from-slate-900/85 to-slate-700/85 p-4">
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/45 text-center text-sm text-white/90">
                  Placeholder para embed de YouTube
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        </section>

        <section>
          <GlassPanel>
            <CardContent className="space-y-3 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Carousel de imagenes (placeholder)
              </h2>
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                {franchiseData.carouselItems.map((item) => (
                  <div
                    key={item}
                    className="min-w-[72%] snap-start sm:min-w-[46%] lg:min-w-[24%]"
                  >
                    <PlaceholderBlock label={item} className="h-44" />
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassPanel>
        </section>
      </div>

      <style>{`
        @keyframes latam-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}
