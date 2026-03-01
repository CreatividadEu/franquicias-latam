import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, Download, GraduationCap, Handshake, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { matchesFranchiseSlug } from "@/lib/franchiseSlug";
import { ensureFranchiseLandingConfig } from "@/lib/franchiseLanding";
import { formatCurrency } from "@/lib/utils";
import { FranchiseAssist } from "@/components/franchise/FranchiseAssist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const marqueeText = "✅ Franquicia Desarrollada x Franquicias LATAM";

const valueProps = [
  { icon: GraduationCap, label: "Formacion" },
  { icon: BookOpenCheck, label: "Know-How" },
  { icon: Handshake, label: "Acompanamiento" },
];

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

function buildEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }

  return url;
}

function HeroMedia({
  imageUrl,
  videoUrl,
  showVideo,
  name,
}: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  showVideo: boolean;
  name: string;
}) {
  if (showVideo && videoUrl) {
    if (videoUrl.endsWith(".mp4")) {
      return (
        <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl">
          <video
            controls
            playsInline
            className="h-full w-full object-cover"
            src={videoUrl}
          />
        </div>
      );
    }

    return (
      <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl">
        <iframe
          className="h-full w-full"
          src={buildEmbedUrl(videoUrl)}
          title={`Video de ${name}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-emerald-200/75 via-white to-sky-200/75">
      <div className="text-center">
        <PlayCircle className="mx-auto size-12 text-slate-700" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          Media principal pendiente
        </p>
      </div>
    </div>
  );
}

function ContactPanel({
  name,
  contactEmail,
}: {
  name: string;
  contactEmail?: string | null;
}) {
  return (
    <GlassPanel className="h-full">
      <CardContent className="flex h-full min-h-[360px] flex-col justify-between gap-5 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Contacto directo
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Conecta con el equipo de {name}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Activa una conversacion comercial y recibe detalles de inversion,
            soporte, ubicaciones y siguientes pasos.
          </p>
        </div>

        <div className="space-y-3">
          {contactEmail ? (
            <p className="text-sm text-slate-600">
              Correo de contacto:{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-blue-700 underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Nuestro equipo te ayudara a validar fit, inversion y tiempos de
              apertura.
            </p>
          )}

          <Button asChild className="w-full rounded-xl bg-[#2860E7] hover:bg-[#1F52CC]">
            <Link href="/quiz">Quiero esta franquicia</Link>
          </Button>
        </div>
      </CardContent>
    </GlassPanel>
  );
}

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
    matchesFranchiseSlug(candidate, slug)
  );

  if (!franchise) {
    return null;
  }

  await ensureFranchiseLandingConfig(prisma, {
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
              <Button asChild>
                <Link href="/quiz">Volver al quiz</Link>
              </Button>
            </CardContent>
          </GlassPanel>
        </div>
      </main>
    );
  }

  const marqueeLoop: string[] = Array.from({ length: 8 }, () => marqueeText);
  const profile = franchise.profile;
  const featureFlags = franchise.featureFlags;
  const botConfig = franchise.botConfig;

  const headline = profile?.headline || `Bienvenidos a ${franchise.name}`;
  const subheadline = profile?.subheadline || franchise.description;
  const heroImageUrl = profile?.heroImageUrl || franchise.logo;
  const heroVideoUrl = profile?.heroVideoUrl || franchise.video;
  const galleryUrls = profile?.galleryUrls || [];
  const coverageLabel =
    profile?.countryCoverage ||
    franchise.coverageCountries.map((item) => item.country.name).join(", ");
  const metrics = [
    {
      label: "Inversion minima",
      value: formatCurrency(
        profile?.investmentMin ?? franchise.investmentMin
      ),
    },
    {
      label: "Inversion maxima",
      value: formatCurrency(
        profile?.investmentMax ?? franchise.investmentMax
      ),
    },
    {
      label: "Cobertura",
      value: coverageLabel || "LATAM",
    },
    {
      label: "Sector",
      value: `${franchise.sector.emoji} ${franchise.sector.name}`,
    },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top_left,#def7ec_0%,#edf6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <section>
          <GlassPanel>
            <CardContent className="space-y-3 p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Landing editable
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {headline}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {subheadline}
              </p>
            </CardContent>
          </GlassPanel>
        </section>

        <section className="grid gap-4 md:grid-cols-2 md:items-stretch">
          <GlassPanel className="h-full">
            <CardContent className="h-full min-h-[360px] p-5 sm:p-6">
              <HeroMedia
                imageUrl={heroImageUrl}
                videoUrl={heroVideoUrl}
                showVideo={Boolean(featureFlags?.showVideo)}
                name={franchise.name}
              />
            </CardContent>
          </GlassPanel>

          {featureFlags?.showBot && botConfig?.enabled ? (
            <FranchiseAssist
              franchiseId={franchise.id}
              initialQuestions={franchise.botFaqs.slice(0, 3).map((faq) => faq.question)}
              fallbackMessage={
                botConfig.fallbackMessage ||
                "No encontre una respuesta especifica para esa pregunta."
              }
            />
          ) : (
            <ContactPanel name={franchise.name} contactEmail={franchise.contactEmail} />
          )}
        </section>
      </div>

      <section className="relative left-1/2 mt-6 w-screen -translate-x-1/2 overflow-hidden border-y border-white/70 bg-white/65 py-3 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:mt-8">
        <div className="flex w-max animate-[latam-marquee_24s_linear_infinite] gap-3">
          {[...marqueeLoop, ...marqueeLoop].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="whitespace-nowrap rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white sm:text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-6 w-full max-w-6xl space-y-6 sm:mt-8 sm:space-y-8">
        {featureFlags?.showKpis && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <GlassPanel key={metric.label}>
                <CardContent className="space-y-2 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                    {metric.value}
                  </p>
                </CardContent>
              </GlassPanel>
            ))}
          </section>
        )}

        {featureFlags?.showGallery && galleryUrls.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Galeria de la franquicia
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryUrls.map((imageUrl, index) => (
                <GlassPanel key={`${imageUrl}-${index}`}>
                  <CardContent className="p-3">
                    <div className="overflow-hidden rounded-xl bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={`${franchise.name} galeria ${index + 1}`}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  </CardContent>
                </GlassPanel>
              ))}
            </div>
          </section>
        )}

        {featureFlags?.showTestimonials && (
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
        )}

        {(featureFlags?.showDownloads && profile?.brochureUrl) ||
        featureFlags?.showContactForm ? (
          <section className="grid gap-4 md:grid-cols-2">
            {featureFlags?.showDownloads && profile?.brochureUrl && (
              <GlassPanel>
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5 sm:p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Descargables
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      Material comercial
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Descarga el brochure oficial y comparte el material con tu
                      equipo comercial o socios.
                    </p>
                  </div>
                  <Button asChild className="w-full rounded-xl bg-[#2860E7] hover:bg-[#1F52CC]">
                    <a href={profile.brochureUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 size-4" />
                      Descargar brochure
                    </a>
                  </Button>
                </CardContent>
              </GlassPanel>
            )}

            {featureFlags?.showContactForm && (
              <ContactPanel name={franchise.name} contactEmail={franchise.contactEmail} />
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
