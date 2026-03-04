import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  Circle,
  GraduationCap,
  Handshake,
  Headphones,
  Megaphone,
  Play,
  Quote,
  ShieldCheck,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatItem = {
  label: string;
  value: string;
};

type FeatureItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

type StepItem = {
  step: string;
  title: string;
  description: string;
};

type SupportItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

type InvestmentItem = {
  label: string;
  value: string;
};

type QuoteItem = {
  title: string;
  body: string;
};

type CoverageItem = {
  flag: string;
  code: string;
};

type ValuePointItem = {
  icon: ReactNode;
  title: string;
  description: string;
  iconClassName: string;
  surfaceClassName: string;
  borderClassName: string;
};

function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "glass-card gap-0 border border-slate-200/70 bg-white/80 py-0 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-3">
      {badge ? <p className="section-label">{badge}</p> : null}
      <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.85rem] lg:leading-[1.02]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SectionContainer({
  badge,
  title,
  description,
  children,
  className,
}: {
  badge?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-6", className)}>
      <SectionHeader badge={badge} title={title} description={description} />
      {children}
    </section>
  );
}

function MediaAsset({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
}) {
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}

function buildEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }

  if (url.includes("vimeo.com/")) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : url;
  }

  return url;
}

function StatCard({ item }: { item: StatItem }) {
  return (
    <div className="glass-card rounded-2xl border border-slate-200/70 bg-white/72 px-4 py-4 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.22)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {item.label}
      </p>
      <p className="mt-2 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
        {item.value}
      </p>
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <SurfaceCard className="rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-34px_rgba(15,23,42,0.24)]">
      <CardContent className="space-y-4 p-6">
        <div className="inline-flex rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50 to-cyan-50 p-3 text-blue-700 shadow-[0_12px_28px_-22px_rgba(59,130,246,0.5)]">
          {item.icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
            {item.description}
          </p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}

function StepCard({ item }: { item: StepItem }) {
  return (
    <SurfaceCard className="rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-34px_rgba(15,23,42,0.24)]">
      <CardContent className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute right-4 top-2 text-6xl font-semibold leading-none text-blue-100">
          {item.step}
        </div>
        <div className="relative space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600">{item.description}</p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}

function SupportCard({ item }: { item: SupportItem }) {
  return (
    <SurfaceCard className="rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-34px_rgba(15,23,42,0.24)]">
      <CardContent className="space-y-3 p-5">
        <div className="inline-flex rounded-2xl border border-slate-200/80 bg-white/80 p-3 text-slate-700 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
          {item.icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm text-slate-600">{item.description}</p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}

function QuoteCard({ item }: { item: QuoteItem }) {
  return (
    <div className="glass-card rounded-2xl border border-slate-200/70 bg-white/78 p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-34px_rgba(15,23,42,0.24)]">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-blue-100/80 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
          <Quote className="mr-2 size-3.5" />
          Señal
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
      </div>
    </div>
  );
}

function ValuePointCard({ item }: { item: ValuePointItem }) {
  return (
    <div
      className={cn(
        "group rounded-2xl border px-4 py-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md",
        item.surfaceClassName,
        item.borderClassName,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.35)]",
            item.iconClassName,
          )}
        >
          {item.icon}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            {item.title}
          </p>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroVisual({
  imageUrl,
  videoUrl,
  showVideo,
  name,
  galleryUrls,
}: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  showVideo: boolean;
  name: string;
  galleryUrls: string[];
}) {
  const previewImages = galleryUrls.filter(Boolean).slice(0, 2);
  const shouldUseVideo = !imageUrl && showVideo && Boolean(videoUrl);

  return (
    <SurfaceCard className="overflow-hidden rounded-3xl">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          {shouldUseVideo && videoUrl ? (
            videoUrl.endsWith(".mp4") ? (
              <video
                controls
                playsInline
                className="h-full min-h-[320px] w-full object-cover"
                src={videoUrl}
              />
            ) : (
              <iframe
                className="h-full min-h-[320px] w-full"
                src={buildEmbedUrl(videoUrl)}
                title={`Visual de ${name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : imageUrl ? (
            <MediaAsset
              src={imageUrl}
              alt={name}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="h-full min-h-[320px] w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-slate-100 text-slate-700">
              <div className="text-center">
                <Play className="mx-auto size-10" />
                <p className="mt-3 text-sm font-medium">Visual principal pendiente</p>
              </div>
            </div>
          )}
        </div>

        {previewImages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {previewImages.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="relative h-20 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-[0_14px_36px_-28px_rgba(0,0,0,0.16)]"
              >
                <MediaAsset
                  src={imageUrl}
                  alt={`${name} vista ${index + 1}`}
                  sizes="(min-width: 640px) 18vw, 40vw"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </SurfaceCard>
  );
}

function VideoPlayer({
  title,
  imageUrl,
  videoUrl,
  showVideo,
}: {
  title: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  showVideo: boolean;
}) {
  const canEmbed = showVideo && Boolean(videoUrl);

  return (
    <div className="group relative aspect-video overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:rounded-[34px]">
      {canEmbed && videoUrl ? (
        videoUrl.endsWith(".mp4") ? (
          <video controls playsInline className="h-full w-full object-cover" src={videoUrl} />
        ) : (
          <iframe
            className="h-full w-full"
            src={buildEmbedUrl(videoUrl)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      ) : imageUrl ? (
        <>
          <MediaAsset
            src={imageUrl}
            alt={title}
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.38))]" />
        </>
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-slate-100">
          <Play className="size-10 text-slate-500" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
          <Play className="ml-1 size-6 fill-current" />
        </span>
      </div>
    </div>
  );
}

function ChatbotPanel({
  assistant,
  enabled,
  contactEmail,
}: {
  assistant: ReactNode;
  enabled: boolean;
  contactEmail?: string | null;
}) {
  if (enabled) {
    return <div className="min-h-[420px]">{assistant}</div>;
  }

  return (
    <SurfaceCard className="h-full rounded-3xl">
      <CardContent className="flex min-h-[420px] flex-col justify-between p-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <Circle className="size-2 fill-current text-slate-400" />
            Asistente disponible
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
              Activa el acompañamiento consultivo.
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Esta marca responde preguntas de forma guiada cuando el proceso consultivo está habilitado.
            </p>
          </div>
        </div>

        {contactEmail ? (
          <Button asChild size="lg" variant="outline" className="h-auto">
            <a href={`mailto:${contactEmail}`}>Hablar con el equipo</a>
          </Button>
        ) : (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
            Solicita el dossier para continuar con soporte consultivo.
          </div>
        )}
      </CardContent>
    </SurfaceCard>
  );
}

export function HeroFranchise({
  title,
  description,
  stats,
  primaryHref,
  secondaryHref,
  secondaryLabel,
  secondaryExternal = false,
  imageUrl,
  videoUrl,
  showVideo,
  name,
  galleryUrls,
}: {
  title: string;
  description: string;
  stats: StatItem[];
  primaryHref: string;
  secondaryHref: string;
  secondaryLabel: string;
  secondaryExternal?: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  showVideo: boolean;
  name: string;
  galleryUrls: string[];
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="section-label">Franquicia validada</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[0.96] tracking-tight text-slate-950 sm:text-5xl lg:text-[4.4rem]">
            {title}
          </h1>
          <p className="max-w-[42ch] text-base leading-relaxed text-slate-600 sm:text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-auto"
          >
            <Link href={primaryHref}>
              Aplicar ahora
              <ArrowRight className="size-5" />
            </Link>
          </Button>

          {secondaryExternal ? (
            <Button asChild size="lg" variant="outline" className="h-auto">
              <a href={secondaryHref} target="_blank" rel="noreferrer">
                {secondaryLabel}
                <ChevronRight className="size-5" />
              </a>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="h-auto">
              <Link href={secondaryHref}>
                {secondaryLabel}
                <ChevronRight className="size-5" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.slice(0, 3).map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </div>
      </div>

      <HeroVisual
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        showVideo={showVideo}
        name={name}
        galleryUrls={galleryUrls}
      />
    </section>
  );
}

export function ValueProposition({
  items,
}: {
  items: FeatureItem[];
}) {
  return (
    <SectionContainer
      badge="Ventajas"
      title="Por qué elegir este modelo."
      description="Una lectura corta del valor operativo y la claridad con la que se transfiere el sistema."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}

export function VideoSection({
  imageUrl,
  videoUrl,
  showVideo,
  title,
  applyHref = "/quiz",
  systemHref = "#support",
}: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  showVideo: boolean;
  title: string;
  applyHref?: string;
  systemHref?: string;
}) {
  const valuePoints: ValuePointItem[] = [
    {
      icon: <Store className="size-4" />,
      title: "Experiencia en tienda",
      description: "Observa cómo se vive el formato y su lectura comercial.",
      iconClassName: "bg-gradient-to-br from-blue-600 to-cyan-500",
      surfaceClassName: "bg-blue-500/5",
      borderClassName: "border-blue-200/80",
    },
    {
      icon: <ShieldCheck className="size-4" />,
      title: "Tecnología aplicada",
      description: "Identifica el nivel de orden, control y trazabilidad.",
      iconClassName: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
      surfaceClassName: "bg-fuchsia-500/5",
      borderClassName: "border-fuchsia-200/80",
    },
    {
      icon: <TrendingUp className="size-4" />,
      title: "Modelo replicable",
      description: "Valida qué tan transferible se siente la expansión.",
      iconClassName: "bg-gradient-to-br from-emerald-500 to-teal-500",
      surfaceClassName: "bg-emerald-500/5",
      borderClassName: "border-emerald-200/80",
    },
  ];

  return (
    <SectionContainer
      badge="Video / Tour"
      title="Descubre cómo funciona esta franquicia."
      description="Una lectura visual rápida para entender el modelo, la experiencia y la lógica de expansión."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 shadow-[0_12px_24px_-20px_rgba(59,130,246,0.4)]">
              <Circle className="size-2 fill-current" />
              Lectura guiada
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
              Revisa los puntos que más influyen en fit, ejecución y claridad operativa antes de avanzar.
            </p>
          </div>

          <div className="space-y-3">
            {valuePoints.map((item) => (
              <ValuePointCard key={item.title} item={item} />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-auto">
              <Link href={applyHref}>
                Aplicar ahora
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-auto">
              <Link href={systemHref}>
                Ver sistema
                <ChevronRight className="size-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Revisión 1:1 en 15 minutos.
          </p>
        </div>

        <VideoPlayer
          title={`Video de ${title}`}
          imageUrl={imageUrl}
          videoUrl={videoUrl}
          showVideo={showVideo}
        />
      </div>
    </SectionContainer>
  );
}

export function CoverageMarkets({
  items,
}: {
  items: CoverageItem[];
}) {
  return (
    <SectionContainer
      badge="Mercados"
      title="Cobertura / Mercados."
      description={items.length > 0 ? `+${items.length} países activos` : "Cobertura en actualización"}
    >
      <SurfaceCard className="rounded-3xl">
        <CardContent className="flex flex-wrap gap-3 p-5 sm:p-6">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={`${item.code}-${item.flag}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2.5"
              >
                <span className="text-lg leading-none">{item.flag}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  {item.code}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Mercados activos pendientes de carga.</p>
          )}
        </CardContent>
      </SurfaceCard>
    </SectionContainer>
  );
}

export function HowItWorks3Steps({
  items,
}: {
  items: StepItem[];
}) {
  return (
    <SectionContainer
      badge="Proceso"
      title="Cómo funciona."
      description="Tres pasos claros para revisar el modelo, validar encaje y activar la siguiente fase."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <StepCard key={item.step} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}

const supportItems: SupportItem[] = [
  {
    icon: <BookOpenCheck className="size-5" />,
    title: "Manuales",
    description: "Procesos listos para operar con consistencia.",
  },
  {
    icon: <GraduationCap className="size-5" />,
    title: "Capacitación",
    description: "Transferencia clara del método comercial y operativo.",
  },
  {
    icon: <Megaphone className="size-5" />,
    title: "Marketing",
    description: "Lineamientos para lanzamiento y activación local.",
  },
  {
    icon: <Store className="size-5" />,
    title: "Apertura",
    description: "Checklist de despliegue para abrir con orden.",
  },
  {
    icon: <Handshake className="size-5" />,
    title: "Proveedores",
    description: "Base homologada para abastecimiento más simple.",
  },
  {
    icon: <Headphones className="size-5" />,
    title: "Soporte",
    description: "Acompañamiento continuo para decisiones clave.",
  },
];

export function SupportSystem() {
  return (
    <SectionContainer
      badge="Sistema"
      title="Sistema de soporte."
      description="Seis capas de acompañamiento para operar con menos fricción y más consistencia."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {supportItems.map((item) => (
          <SupportCard key={item.title} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}

export function Investment({
  items,
}: {
  items: InvestmentItem[];
}) {
  return (
    <SectionContainer
      badge="Finanzas"
      title="Inversión."
      description="Una sola banda para leer ticket base, rango y huella de expansión."
    >
      <SurfaceCard className="rounded-3xl">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.label}
              className="space-y-2 rounded-2xl border border-slate-200/70 bg-white/50 p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {item.label}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {item.value}
              </p>
            </div>
          ))}
        </CardContent>
      </SurfaceCard>
    </SectionContainer>
  );
}

const fallbackQuotes: QuoteItem[] = [
  {
    title: "Entrada estructurada",
    body: "El operador recibe una ruta clara para iniciar con menor fricción.",
  },
  {
    title: "Know-how listo",
    body: "La operación se entrega con criterio, orden y repetibilidad.",
  },
  {
    title: "Acompañamiento real",
    body: "Hay soporte durante apertura y primeros ciclos de operación.",
  },
];

export function TrustSignals({
  items,
}: {
  items: QuoteItem[];
}) {
  const quotes = items.length > 0 ? items : fallbackQuotes;

  return (
    <SectionContainer
      badge="Confianza"
      title="Señales de confianza."
      description="Indicadores que reducen incertidumbre y ayudan a leer el sistema con más criterio."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {quotes.slice(0, 3).map((item) => (
          <QuoteCard key={item.title} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}

export function ChatbotSection({
  assistant,
  enabled,
  contactEmail,
}: {
  assistant: ReactNode;
  enabled: boolean;
  contactEmail?: string | null;
}) {
  const bullets = [
    "Preguntas sobre inversión",
    "Requisitos para aplicar",
    "Territorios disponibles",
    "Cómo funciona el modelo",
  ];

  return (
    <SectionContainer
      badge="Asistente"
      title="Habla con el asistente de esta franquicia."
      description="Una interfaz consultiva para resolver encaje, territorio y operación antes de tomar la siguiente decisión."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.25)]">
            <Circle className="size-2 fill-current text-emerald-500" />
            Asistente activo
          </div>
          <div className="space-y-3">
            {bullets.map((item, index) => (
              <div
                key={item}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md sm:text-base",
                  index % 2 === 0
                    ? "border-blue-200/70 bg-blue-500/5"
                    : "border-emerald-200/70 bg-emerald-500/5",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.28)]",
                    index % 2 === 0
                      ? "bg-gradient-to-br from-blue-600 to-cyan-500"
                      : "bg-gradient-to-br from-emerald-500 to-teal-500",
                  )}
                >
                  <Circle className="size-2 fill-current" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <ChatbotPanel
          assistant={assistant}
          enabled={enabled}
          contactEmail={contactEmail}
        />
      </div>
    </SectionContainer>
  );
}

export function CTASection({
  headline,
  description,
  applyHref,
  spotsFilled = 10,
  spotsTotal = 12,
}: {
  headline: string;
  description: string;
  applyHref: string;
  spotsFilled?: number;
  spotsTotal?: number;
}) {
  const safeTotal = Math.max(spotsTotal, 1);
  const filled = Math.min(spotsFilled, safeTotal);
  const available = Math.max(safeTotal - filled, 0);
  const progress = (filled / safeTotal) * 100;

  return (
    <section id="apply" className="flex justify-center">
      <SurfaceCard className="w-full max-w-4xl rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(248,250,252,0.92)_100%)] shadow-[0_24px_64px_-38px_rgba(15,23,42,0.22)]">
        <CardContent className="space-y-6 p-6 text-center sm:p-8">
          <div className="space-y-3">
            <p className="section-label text-center">Aplicación</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {headline}
            </h2>
            <p className="mx-auto max-w-[44ch] text-sm leading-relaxed text-slate-600 sm:text-base">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">
              Esta semana revisamos {safeTotal} perfiles
            </p>
            <p className="text-sm text-slate-500">
              {filled} ya reservados · {available} disponibles
            </p>
            <div className="mx-auto h-2.5 w-full max-w-xl overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            asChild
            size="lg"
            className="h-auto"
          >
            <Link href={applyHref}>
              Aplicar para recibir el dossier
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </CardContent>
      </SurfaceCard>
    </section>
  );
}

export const franchiseFeatureCardIcons = {
  Wallet: <Wallet className="size-5" />,
  TrendingUp: <TrendingUp className="size-5" />,
  ShieldCheck: <ShieldCheck className="size-5" />,
};
