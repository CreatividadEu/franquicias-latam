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
  Globe2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────

type StatItem = { label: string; value: string };
type FeatureItem = { icon: ReactNode; title: string; description: string };
type StepItem = { step: string; title: string; description: string };
type SupportItem = { icon: ReactNode; title: string; description: string };
type InvestmentItem = { label: string; value: string };
type QuoteItem = { title: string; body: string };
type CoverageItem = { flag: string; code: string };
type ValuePointItem = {
  icon: ReactNode;
  title: string;
  description: string;
  iconClassName: string;
  surfaceClassName: string;
  borderClassName: string;
};

// ── Internal primitives ──────────────────────────────────────────────

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
      {badge ? (
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          <span className="inline-block h-px w-4 bg-slate-300" />
          {badge}
        </p>
      ) : null}
      <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.04]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
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
  id,
}: {
  badge?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("space-y-8", className)}>
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
    return (
      <Image src={src} alt={alt} fill sizes={sizes} className={className} />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
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

// ── Feature card ─────────────────────────────────────────────────────

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <SurfaceCard className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-32px_rgba(15,23,42,0.22)]">
      <CardContent className="space-y-5 p-6">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 shadow-[0_10px_24px_-18px_rgba(59,130,246,0.45)]">
          {item.icon}
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            {item.description}
          </p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}

// ── Step card ────────────────────────────────────────────────────────

function StepCard({ item }: { item: StepItem }) {
  return (
    <SurfaceCard className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-32px_rgba(15,23,42,0.22)]">
      <CardContent className="relative overflow-hidden p-6">
        <span className="pointer-events-none absolute right-5 top-3 text-7xl font-bold leading-none tracking-tighter text-slate-100 select-none">
          {item.step}
        </span>
        <div className="relative space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
            Paso {item.step}
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            {item.description}
          </p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}

// ── Support card ─────────────────────────────────────────────────────

function SupportCard({ item }: { item: SupportItem }) {
  return (
    <SurfaceCard className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-32px_rgba(15,23,42,0.22)]">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.2)]">
          {item.icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            {item.description}
          </p>
        </div>
      </CardContent>
    </SurfaceCard>
  );
}

// ── Quote / FAQ card ─────────────────────────────────────────────────

function QuoteCard({ item }: { item: QuoteItem }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,0.2)]">
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 border border-blue-100/80">
        <Quote className="size-4" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-500">{item.body}</p>
      </div>
    </div>
  );
}

// ── Value point card (Video section) ────────────────────────────────

function ValuePointCard({ item }: { item: ValuePointItem }) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md",
        item.surfaceClassName,
        item.borderClassName,
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.3)]",
          item.iconClassName,
        )}
      >
        {item.icon}
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold tracking-tight text-slate-900">
          {item.title}
        </p>
        <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
          {item.description}
        </p>
      </div>
    </div>
  );
}

// ── Video player ─────────────────────────────────────────────────────

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
    <div className="group relative aspect-video overflow-hidden rounded-[24px] border border-slate-200/70 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      {canEmbed && videoUrl ? (
        videoUrl.endsWith(".mp4") ? (
          <video
            controls
            playsInline
            className="h-full w-full object-cover"
            src={videoUrl}
          />
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
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06),rgba(2,6,23,0.4))]" />
        </>
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100">
          <Play className="size-10 text-slate-400" />
        </div>
      )}

      {(canEmbed || !videoUrl) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <Play className="ml-1 size-5 fill-current" />
          </span>
        </div>
      )}
    </div>
  );
}

// ── Chatbot panel ────────────────────────────────────────────────────

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
      <CardContent className="flex min-h-[380px] flex-col justify-between p-6">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <Circle className="size-2 fill-current text-slate-300" />
            Asistente disponible
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
              Consultivo guiado para esta franquicia.
            </h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Cuando el proceso consultivo está habilitado, el asistente responde
              preguntas sobre inversión, territorios y modelo.
            </p>
          </div>
        </div>

        {contactEmail ? (
          <Button asChild size="lg" variant="outline" className="h-auto">
            <a href={`mailto:${contactEmail}`}>Hablar con el equipo</a>
          </Button>
        ) : (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-500">
            Solicita el dossier para continuar con soporte consultivo.
          </div>
        )}
      </CardContent>
    </SurfaceCard>
  );
}

// ── Exports ──────────────────────────────────────────────────────────

// ── HeroFranchise ─────────────────────────────────────────────────────

export type HeroStatItem = { value: string; label: string };

export function HeroFranchise({
  title,
  description,
  stats,
  primaryHref: _primaryHref,
  imageUrl,
  name,
  slug,
  heroTitle,
  heroSubtitle,
  heroStats,
  // Legacy / unused props kept for compat
  heroCtaLabel: _heroCtaLabel,
  showReviewsBadge: _showReviewsBadge,
  reviewRating: _reviewRating,
  reviewBadgeLabel: _reviewBadgeLabel,
  reviewAvatarUrls: _reviewAvatarUrls,
  secondaryHref: _secondaryHref,
  secondaryLabel: _secondaryLabel,
  secondaryExternal: _secondaryExternal,
  videoUrl: _videoUrl,
  showVideo: _showVideo,
  galleryUrls: _galleryUrls,
}: {
  title: string;
  description: string;
  stats: StatItem[];
  primaryHref: string;
  slug: string;
  secondaryHref: string;
  secondaryLabel: string;
  secondaryExternal?: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  showVideo: boolean;
  name: string;
  galleryUrls: string[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroCtaLabel?: string | null;
  heroStats?: HeroStatItem[] | null;
  showReviewsBadge?: boolean;
  reviewRating?: number | null;
  reviewBadgeLabel?: string | null;
  reviewAvatarUrls?: string[] | null;
}) {
  const displayTitle = heroTitle || title;
  const displaySubtitle = heroSubtitle || description;
  const displayStats =
    heroStats && heroStats.length > 0 ? heroStats : stats.slice(0, 3);
  const calendlyHref = `https://calendly.com/franquicias-latam/${slug}`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#ede8e0]">
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center gap-12 px-6 pb-16 pt-28 sm:px-10 lg:flex-row lg:gap-16 lg:pt-0">
        {/* Left: content */}
        <div className="flex flex-1 flex-col justify-center space-y-8 lg:flex-[3] lg:max-w-[820px]">
          {/* System trust mark */}
          <div className="inline-flex w-fit items-center gap-4 rounded-full border border-neutral-300 bg-neutral-50/70 px-8 py-3">
            <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#1E1E1E]/75 leading-none">
              Franquicia desarrollada por
            </span>
            <div className="h-5 w-px bg-neutral-300" />
            <Image
              src="/fotos_home/icon_latam.png"
              alt="Franquicias Latam"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* Headline */}
          <h1
            className="text-[3rem] font-bold leading-[1.05] tracking-tight text-stone-950 sm:text-5xl lg:text-[3.5rem]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {displayTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg font-semibold leading-relaxed text-stone-700">
            {displaySubtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-auto rounded-full bg-[#2860E7] font-semibold text-white shadow-none hover:bg-blue-700"
            >
              <a
                href={calendlyHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reservar llamada
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-auto rounded-full border-stone-300 bg-transparent font-semibold text-stone-700 shadow-none hover:bg-stone-100"
            >
              <a href="#apply">Ver más</a>
            </Button>
          </div>

          {/* Stats */}
          {displayStats.length > 0 && (
            <div className="flex flex-wrap gap-8 border-t border-stone-200 pt-6">
              {displayStats.map((item) => (
                <div key={item.label}>
                  <p className="text-xl font-bold text-stone-950">
                    {item.value}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: portrait image */}
        <div className="flex flex-1 items-center justify-center lg:flex-[2] lg:justify-end">
          <div
            className="relative w-full max-w-[340px] overflow-hidden rounded-[2rem] border border-stone-300/60 bg-stone-200 shadow-[0_40px_80px_-20px_rgba(100,80,60,0.28),0_0_0_1px_rgba(255,255,255,0.65)_inset] lg:max-w-[400px]"
            style={{ aspectRatio: "3/4" }}
          >
            {imageUrl ? (
              <MediaAsset
                src={imageUrl}
                alt={name}
                sizes="(max-width: 768px) 90vw, 400px"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-stone-300 to-stone-400" />
            )}
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/25" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ValueProposition({ items }: { items: FeatureItem[] }) {
  return (
    <SectionContainer
      id="ventajas"
      badge="Ventajas"
      title="Por qué elegir este modelo."
      description="Una lectura rápida del valor operativo y la claridad con la que se transfiere el sistema."
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
      badge="Video · Tour"
      title="Descubre cómo funciona."
      description="Una lectura visual rápida para entender el modelo, la experiencia y la lógica de expansión."
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
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

export function CoverageMarkets({ items }: { items: CoverageItem[] }) {
  return (
    <SectionContainer
      id="cobertura"
      badge="Mercados"
      title="Cobertura activa."
      description={
        items.length > 0
          ? `Presencia validada en ${items.length} mercado${items.length !== 1 ? "s" : ""} de la región.`
          : "Cobertura en actualización."
      }
    >
      <SurfaceCard className="rounded-3xl">
        <CardContent className="p-6">
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <div
                  key={`${item.code}-${item.flag}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-[0_4px_12px_-8px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_8px_20px_-10px_rgba(15,23,42,0.16)]"
                >
                  <span className="text-xl leading-none">{item.flag}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {item.code}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-400">
              <Globe2 className="size-5" />
              <p className="text-sm">Mercados activos pendientes de carga.</p>
            </div>
          )}
        </CardContent>
      </SurfaceCard>
    </SectionContainer>
  );
}

export function HowItWorks3Steps({ items }: { items: StepItem[] }) {
  return (
    <SectionContainer
      id="proceso"
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
    title: "Manuales operativos",
    description: "Procesos listos para operar con consistencia desde el día uno.",
  },
  {
    icon: <GraduationCap className="size-5" />,
    title: "Capacitación",
    description: "Transferencia clara del método comercial y operativo.",
  },
  {
    icon: <Megaphone className="size-5" />,
    title: "Marketing local",
    description: "Lineamientos para lanzamiento y activación en tu mercado.",
  },
  {
    icon: <Store className="size-5" />,
    title: "Apertura guiada",
    description: "Checklist de despliegue para abrir con orden y criterio.",
  },
  {
    icon: <Handshake className="size-5" />,
    title: "Red de proveedores",
    description: "Base homologada para abastecimiento más simple y rentable.",
  },
  {
    icon: <Headphones className="size-5" />,
    title: "Soporte continuo",
    description: "Acompañamiento real para decisiones clave en operación.",
  },
];

export function SupportSystem() {
  return (
    <SectionContainer
      id="support"
      badge="Sistema"
      title="Sistema de soporte."
      description="Seis capas de acompañamiento para operar con menos fricción y más consistencia."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {supportItems.map((item) => (
          <SupportCard key={item.title} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}

export function Investment({ items }: { items: InvestmentItem[] }) {
  const primary = items[0];
  const secondaryItems = items.slice(1, 3);

  return (
    <section id="inversion" className="space-y-8">
      <SectionHeader
        badge="Inversión"
        title="Ticket de entrada."
        description="Una sola banda para leer el capital requerido, el rango total y la huella de expansión."
      />

      {/* Dark investment card */}
      <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.5)]">
        <div className="p-8 sm:p-10">
          <div className="space-y-8">
            {/* Primary metric — big */}
            {primary && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {primary.label}
                </p>
                <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  {primary.value}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-slate-800" />

            {/* Secondary metrics + CTA */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap gap-6">
                {secondaryItems.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-slate-200 sm:text-2xl">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="h-auto shrink-0 bg-white text-slate-950 hover:bg-slate-100"
              >
                <Link href="/quiz">
                  Solicitar dossier
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
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

export function TrustSignals({ items }: { items: QuoteItem[] }) {
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
    { label: "Inversión y capital requerido", icon: <Wallet className="size-4" /> },
    { label: "Requisitos para aplicar", icon: <CheckCircle2 className="size-4" /> },
    { label: "Territorios disponibles", icon: <Globe2 className="size-4" /> },
    { label: "Cómo funciona el modelo", icon: <TrendingUp className="size-4" /> },
  ];

  return (
    <SectionContainer
      badge="Asistente"
      title="Habla con el asistente."
      description="Una interfaz consultiva para resolver encaje, territorio y operación antes de tomar la siguiente decisión."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Circle className="size-2 fill-current" />
            Asistente activo
          </div>
          <div className="space-y-2.5">
            {bullets.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md",
                  index % 2 === 0
                    ? "border-blue-200/70 bg-blue-500/5"
                    : "border-emerald-200/70 bg-emerald-500/5",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-[0_8px_18px_-12px_rgba(15,23,42,0.28)]",
                    index % 2 === 0
                      ? "bg-gradient-to-br from-blue-600 to-cyan-500"
                      : "bg-gradient-to-br from-emerald-500 to-teal-500",
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
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
}: {
  headline: string;
  description: string;
  applyHref: string;
  // Legacy props kept for compat
  spotsFilled?: number;
  spotsTotal?: number;
}) {
  return (
    <section id="apply" className="flex justify-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-950 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.5)]">
        <div className="p-8 text-center sm:p-12">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <span className="inline-block h-px w-4 bg-slate-600" />
                Aplicación
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {headline}
              </h2>
              <p className="mx-auto max-w-[44ch] text-base leading-relaxed text-slate-400">
                {description}
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="h-auto bg-orange-500 font-bold text-white shadow-[0_12px_30px_-22px_rgba(249,115,22,0.42)] hover:bg-orange-600"
            >
              <Link href={applyHref}>
                Aplicar para recibir el dossier
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export const franchiseFeatureCardIcons = {
  Wallet: <Wallet className="size-5" />,
  TrendingUp: <TrendingUp className="size-5" />,
  ShieldCheck: <ShieldCheck className="size-5" />,
};
