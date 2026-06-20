import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { buildFranchiseSlug } from "@/lib/franchiseSlug";
import type { MatchedFranchise } from "@/types";

import { LatamDepthBackground } from "@/components/LatamDepthBackground";
import { FranchiseCard } from "@/components/franchise/FranchiseCard";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { ProgramInstitutionalLogosRow } from "@/components/home/ProgramInstitutionalLogosRow";

import { COP_PER_USD, formatCOP } from "./_lib/format";

// ── Metadata / international SEO ───────────────────────────────────────────────
// hreflang is emitted only for pages that exist today (/co and root). Add /es,
// /ec, etc. here as those market sections ship.
export const metadata: Metadata = {
  title: "Franquicias en Colombia | Franquicias LATAM",
  description:
    "Encuentra y desarrolla franquicias en Colombia con Franquicias LATAM. Marcas colombianas consolidadas, modelos validados y acompañamiento experto.",
  alternates: {
    canonical: "https://franquiciaslatam.com/co",
    languages: {
      "es-CO": "https://franquiciaslatam.com/co",
      "es-419": "https://franquiciaslatam.com",
      "x-default": "https://franquiciaslatam.com",
    },
  },
  openGraph: {
    title: "Franquicias en Colombia | Franquicias LATAM",
    description:
      "Marcas colombianas y modelos de franquicia listos para expandir.",
    url: "https://franquiciaslatam.com/co",
    locale: "es_CO",
    type: "website",
  },
};

// Reads from Supabase at request time — keep it out of the static build.
export const dynamic = "force-dynamic";

const COLOMBIA_COUNTRY_CODE = "CO";

// CTA styles mirror the main landing exactly (one accent: the site's blue
// gradient; neutral secondary matching the navbar pill).
const PRIMARY_CTA_CLASS =
  "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-7 sm:px-8 py-4 text-[17px] font-bold tracking-tight text-white shadow-[0_18px_40px_-18px_rgba(59,130,246,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 active:shadow-[0_14px_30px_-20px_rgba(59,130,246,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,0.28)] sm:text-[18px]";

const SECONDARY_CTA_CLASS =
  "inline-flex items-center justify-center rounded-2xl bg-white px-7 sm:px-8 py-4 text-[17px] font-bold tracking-tight text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.18)] sm:text-[18px]";

// ── Data ───────────────────────────────────────────────────────────────────────
// Same query pattern as lib/matching.ts: load active franchises with sector +
// coverage, filtered to Colombia via the FranchiseCoverage→Country relation,
// then map to the shared MatchedFranchise shape the card already consumes.
async function getColombiaFranchises(): Promise<MatchedFranchise[]> {
  const franchises = await prisma.franchise.findMany({
    where: {
      active: true,
      coverageCountries: {
        some: { country: { code: COLOMBIA_COUNTRY_CODE } },
      },
    },
    include: { sector: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return franchises.map((f) => ({
    id: f.id,
    slug: buildFranchiseSlug(f.name, f.id),
    name: f.name,
    description: f.description,
    logo: f.logo ?? f.logoUrl ?? null,
    investmentMin: f.investmentMin,
    investmentMax: f.investmentMax,
    sectorName: f.sector.name,
    sectorEmoji: f.sector.emoji,
    // No quiz input here, so there is no match score to show — 0 keeps the
    // card's match/top-match badges hidden (they render only at >= 60 / >= 80).
    score: 0,
  }));
}

const TRUST_ITEMS = [
  {
    title: "Operación local en Colombia",
    body: "Latinoamericana de Franquicias SAS, con sede en Bogotá: contratos, expansión y acompañamiento bajo marco colombiano.",
  },
  {
    title: "Red LATAM + Iberia",
    body: "Oficinas en España y Latinoamérica, y una red de más de 750 franquicias desarrolladas con metodología propia.",
  },
  {
    title: "Respaldo institucional",
    body: "Programa validado y reconocido por el BID, Naciones Unidas y MinTIC por su impacto empresarial.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function ColombiaPage() {
  const franchises = await getColombiaFranchises();

  // Approximate local-currency entry ticket, derived from the real minimum USD
  // investment across Colombian franchises (shown as an estimate, never a quote).
  const entryTicketUsd = franchises.length
    ? Math.min(...franchises.map((f) => f.investmentMin))
    : null;

  return (
    <>
      {/* ─── Hero ─── */}
      <LatamDepthBackground
        intensity="normal"
        className="min-h-[60vh] pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
      >
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-block sm:mb-6">
              <span className="section-pill">Franquicias LATAM · Colombia</span>
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-[0.97] sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
              Franquicias en Colombia,
              <br className="hidden sm:block" /> con alcance regional.
            </h1>

            <p className="mx-auto mb-6 max-w-3xl px-2 text-lg leading-relaxed text-gray-900 sm:mb-8 sm:text-xl md:text-2xl">
              Marcas colombianas consolidadas y modelos validados. Operamos desde
              Bogotá con la red de Franquicias LATAM en toda Latinoamérica e
              Iberia.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-3 px-2 sm:mb-12 sm:flex-row sm:gap-4">
              <Link href="/quiz" className={PRIMARY_CTA_CLASS}>
                Encontrar mi franquicia
              </Link>
              <a href="#franquicias-co" className={SECONDARY_CTA_CLASS}>
                Ver franquicias en Colombia
              </a>
            </div>

            <p className="mb-6 text-base font-extrabold text-gray-900 sm:mb-8 sm:text-lg">
              Más de 750 franquicias líderes desarrolladas.
            </p>

            <ClientLogoMarquee className="mb-2" />
          </div>
        </section>
      </LatamDepthBackground>

      {/* ─── Franquicias destacadas en Colombia ─── */}
      <section
        id="franquicias-co"
        className="scroll-mt-28 bg-transparent py-16 sm:py-20 lg:py-24 sm:scroll-mt-36"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="section-label mb-3 block sm:mb-4">Colombia</span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              Franquicias destacadas en Colombia
            </h2>
            <p className="px-2 text-base text-gray-900 sm:text-lg">
              Marcas con operación y cobertura en Colombia, listas para evaluar
              según tu perfil de inversión.
            </p>
            {entryTicketUsd !== null && (
              <p className="mt-4 text-sm font-semibold text-gray-900">
                Inversión desde ≈ {formatCOP(entryTicketUsd * COP_PER_USD)}
                <span className="align-super text-[0.65em]">*</span>
              </p>
            )}
          </div>

          {franchises.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                {franchises.map((franchise) => (
                  <FranchiseCard key={franchise.id} franchise={franchise} />
                ))}
              </div>
              <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-gray-500">
                * Equivalencia aproximada en COP a una TRM indicativa; las cifras
                de cada marca se confirman en su ficha.
              </p>
            </>
          ) : (
            <div className="glass-card mx-auto max-w-2xl rounded-2xl p-8 text-center sm:p-10">
              <span className="section-label mb-3 block">Próximamente</span>
              <h3 className="mb-3 text-2xl font-bold sm:text-3xl">
                Nuevas franquicias para Colombia, en camino
              </h3>
              <p className="mb-6 text-sm text-gray-900 sm:text-base">
                Estamos sumando marcas con cobertura en Colombia. Completa el quiz
                y te conectamos con las opciones que mejor encajen con tu perfil.
              </p>
              <Link href="/quiz" className={PRIMARY_CTA_CLASS}>
                Encontrar mi franquicia
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Operación local, alcance regional ─── */}
      <section className="bg-transparent py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              Operación local, alcance regional
            </h2>
            <p className="px-2 text-base text-gray-900 sm:text-lg">
              Una entidad colombiana respaldada por la red de Franquicias LATAM en
              Latinoamérica e Iberia.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-xl p-6 transition-all hover:shadow-lg sm:rounded-2xl sm:p-8"
              >
                <h3 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-900 sm:text-base">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center sm:mt-14">
            <ProgramInstitutionalLogosRow className="justify-center" />
          </div>
        </div>
      </section>

      {/* ─── Closing CTA band ─── */}
      <section className="relative overflow-hidden py-16 text-white sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 inset-y-5 rounded-[28px] bg-[#111111] shadow-[0_8px_40px_rgba(0,0,0,0.25)] sm:inset-x-6 sm:inset-y-6 lg:inset-x-8"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            ¿Listo para tu franquicia
            <br className="hidden sm:block" /> en Colombia?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-300 sm:mb-12 sm:text-lg lg:text-xl">
            Ya sea que busques invertir o franquiciar tu negocio, nuestra
            plataforma te conecta con las mejores opciones para tu perfil.
          </p>
          <Link
            href="/quiz"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-4 text-[15px] font-semibold tracking-tight text-white shadow-[0_18px_40px_-18px_rgba(59,130,246,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 active:shadow-[0_14px_30px_-20px_rgba(59,130,246,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,0.28)] sm:w-auto sm:px-10 sm:py-5 sm:text-base"
          >
            Comenzar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
