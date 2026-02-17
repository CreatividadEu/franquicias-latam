npm run dev
import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, GraduationCap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const marqueeText = "✅ Franquicia Desarrollada x Franquicias LATAM";

const valueProps = [
  { icon: GraduationCap, label: "Formacion" },
  { icon: BookOpenCheck, label: "Know-How" },
  { icon: Handshake, label: "Acompanamiento" },
];

type FranchiseMock = {
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

const FRANCHISE_MOCKS: Record<string, FranchiseMock> = {
  subway: {
    name: "Subway",
    heroDescription:
      "Descubre una oportunidad de franquicia con respaldo internacional, procesos claros y acompanamiento para crecer con estructura desde el inicio.",
    chatBubbles: [
      "Hola, soy tu asistente virtual de franquicias.",
      "Subway combina marca global con operacion estandarizada.",
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
        description:
          "Modelo completo para liderar presencia de marca en la ciudad.",
      },
    ],
    commercialTitle: "Impulsa una franquicia con traccion comercial real",
    commercialDescription:
      "Subway ofrece una operacion probada, herramientas de marketing y acompanamiento de equipo experto para acelerar apertura, estandarizar procesos y sostener crecimiento en el tiempo.",
    metrics: [
      { label: "Inversion Total", value: "USD 180K - 260K" },
      { label: "Fee de Entrada", value: "USD 35K" },
      { label: "Regalias", value: "8% mensual" },
      { label: "Payback", value: "24 - 36 meses" },
    ],
    carouselItems: ["Imagen 1", "Imagen 2", "Imagen 3", "Imagen 4"],
  },
  "burger-master": {
    name: "Burger Master",
    heroDescription:
      "Una franquicia de comida rapida con operacion estandarizada, marca en crecimiento y soporte comercial para escalar en ubicaciones estrategicas.",
    chatBubbles: [
      "Hola, te acompano a evaluar Burger Master.",
      "Este modelo se enfoca en alta rotacion y procesos simples.",
      "Puedo ayudarte con inversion, tiempos y operacion.",
    ],
    suggestedQuestions: [
      "Cuantos colaboradores necesito?",
      "Cual es el ticket promedio estimado?",
      "Que soporte de marketing incluye?",
    ],
    models: [
      {
        name: "Express",
        description:
          "Formato para patios de comida y locales de rapida implementacion.",
      },
      {
        name: "Flagship",
        description:
          "Concepto completo para zonas premium de alto trafico peatonal.",
      },
    ],
    commercialTitle: "Acelera ventas con una marca de consumo masivo",
    commercialDescription:
      "Burger Master integra manuales operativos, entrenamiento inicial y acompanamiento para mejorar rentabilidad desde la apertura.",
    metrics: [
      { label: "Inversion Total", value: "USD 150K - 230K" },
      { label: "Fee de Entrada", value: "USD 28K" },
      { label: "Regalias", value: "7% mensual" },
      { label: "Payback", value: "20 - 30 meses" },
    ],
    carouselItems: ["Local 1", "Local 2", "Producto 1", "Producto 2"],
  },
  "coffee-lab": {
    name: "Coffee Lab",
    heroDescription:
      "Franquicia premium de cafe de especialidad con experiencia de marca, foco en calidad y acompanamiento integral para operar con excelencia.",
    chatBubbles: [
      "Bienvenido, revisemos la franquicia Coffee Lab.",
      "Tiene un enfoque premium con experiencia de cliente diferenciada.",
      "Te comparto rangos de inversion y retorno estimado.",
    ],
    suggestedQuestions: [
      "Que perfil de inversionista buscan?",
      "Cuanto dura la capacitacion inicial?",
      "Hay exclusividad territorial?",
    ],
    models: [
      {
        name: "Kiosk",
        description:
          "Modelo compacto para corporativos, universidades y centros comerciales.",
      },
      {
        name: "Signature",
        description:
          "Formato completo con menu ampliado y experiencia de permanencia.",
      },
    ],
    commercialTitle: "Conecta con el mercado premium de cafe",
    commercialDescription:
      "Coffee Lab combina estandarizacion, entrenamiento barista y herramientas de control para sostener calidad y crecimiento operativo.",
    metrics: [
      { label: "Inversion Total", value: "USD 120K - 210K" },
      { label: "Fee de Entrada", value: "USD 22K" },
      { label: "Regalias", value: "6% mensual" },
      { label: "Payback", value: "18 - 28 meses" },
    ],
    carouselItems: ["Barra 1", "Barra 2", "Bebida 1", "Bebida 2"],
  },
  "green-bowl": {
    name: "Green Bowl",
    heroDescription:
      "Concepto de alimentacion saludable con procesos simples, costos controlados y soporte continuo para una expansion eficiente.",
    chatBubbles: [
      "Hola, exploremos Green Bowl juntos.",
      "Es una propuesta saludable con operacion ligera y rapida.",
      "Te muestro un resumen comercial y financiero base.",
    ],
    suggestedQuestions: [
      "Que margen operativo promedio manejan?",
      "Cuanto tarda la apertura del local?",
      "Incluye soporte en seleccion de ubicacion?",
    ],
    models: [
      {
        name: "Express",
        description:
          "Punto de venta agil para food courts y corredores de oficinas.",
      },
      {
        name: "Flagship",
        description:
          "Modelo de experiencia completa con mayor capacidad y menu amplio.",
      },
    ],
    commercialTitle: "Crece en el segmento healthy con una operacion ligera",
    commercialDescription:
      "Green Bowl brinda playbooks de apertura, acompanamiento comercial y soporte operativo para reducir fricciones en cada etapa.",
    metrics: [
      { label: "Inversion Total", value: "USD 95K - 170K" },
      { label: "Fee de Entrada", value: "USD 18K" },
      { label: "Regalias", value: "5% mensual" },
      { label: "Payback", value: "16 - 24 meses" },
    ],
    carouselItems: ["Tienda 1", "Tienda 2", "Menu 1", "Menu 2"],
  },
};

const FRANCHISE_MOCK_ALIASES: Record<string, FranchiseMock> = {
  "mood-heladeria": FRANCHISE_MOCKS["green-bowl"],
  "techhub-academy": FRANCHISE_MOCKS["coffee-lab"],
  "bella-vita-spa": FRANCHISE_MOCKS["green-bowl"],
  "fashion-box": FRANCHISE_MOCKS["burger-master"],
  "cleanpro-services": FRANCHISE_MOCKS["green-bowl"],
};

const FRANCHISE_MOCKS_BY_SLUG: Record<string, FranchiseMock> = {
  ...FRANCHISE_MOCKS,
  ...FRANCHISE_MOCK_ALIASES,
};

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

function MiniChatMock({ data }: { data?: any }) {
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
          {chatBubbles.map((message) => (
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
          {suggestedQuestions.map((question) => (
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const slugWithoutGeneratedSuffix = normalizedSlug
    .replace(/-[a-z0-9]{8}$/, "")
    .replace(/-\d+$/, "");
  const franchise =
    FRANCHISE_MOCKS_BY_SLUG[normalizedSlug] ??
    FRANCHISE_MOCKS_BY_SLUG[slugWithoutGeneratedSuffix];

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
                No encontramos informacion mock para la franquicia solicitada.
              </p>
              <Button asChild>
                <Link href="/quiz">Volver al quiz</Link>
              </Button>
            </CardContent>
          </GlassPanel>
        </div>
      </main>
    );
  }

  const marqueeLoop = [...Array.from({ length: 8 }).fill(marqueeText)];

  return (
    <main className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,#def7ec_0%,#edf6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <section>
          <GlassPanel>
            <CardContent className="space-y-3 p-5 sm:p-7">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Bienvenidos a {franchise.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {franchise.heroDescription}
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
          <MiniChatMock data={franchise} />
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
            {franchise.models.map((model) => (
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
                {franchise.commercialTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                {franchise.commercialDescription}
              </p>
            </CardContent>
          </GlassPanel>

          <GlassPanel className="h-full">
            <CardContent className="p-5 sm:p-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                Metricas Comerciales y Financieras
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {franchise.metrics.map((metric) => (
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
                {franchise.carouselItems.map((item) => (
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
