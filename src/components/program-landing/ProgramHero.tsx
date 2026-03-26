import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LatamDepthBackground } from "@/components/LatamDepthBackground";
import { Button } from "@/components/ui/button";
import { ClientLogoMarquee } from "@/components/home/ClientLogoMarquee";
import { ProgramInstitutionalLogosRow } from "@/components/home/ProgramInstitutionalLogosRow";
import { cohortSpots, programApplicationHref, programHeroMetrics } from "@/components/program-landing/programLandingData";

export function ProgramHero() {
  return (
    <LatamDepthBackground
      intensity="normal"
      className="section-grid-bg overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20"
    >
      <section
        id="diagnostico"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 sm:px-6 sm:scroll-mt-36"
      >
        <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <div className="inline-block">
              <span className="section-pill">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Programa Aceleración de Franquicias
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[0.96] tracking-tight text-slate-900 sm:text-5xl lg:text-[4.35rem]">
              Convierte tu negocio en una franquicia vendible, replicable y
              escalable.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-900 sm:text-xl lg:text-[1.4rem]">
              El mismo sistema implementado con BID, Naciones Unidas, MinTIC,
              Propaís y Gobierno de Corea del Sur; ahora disponible para una
              selección limitada de empresas por cohorte.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={programApplicationHref}>
                  Aplicar al Programa
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#video-hero">Ver Diagnóstico en Vivo</a>
              </Button>
            </div>

            <div className="mt-8 rounded-[26px] border border-black/8 bg-white/88 p-5 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.16)] backdrop-blur-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
                    Validación institucional
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                    Metodología aplicada en programas de desarrollo empresarial,
                    escalamiento y estructuración junto a instituciones
                    nacionales e internacionales.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
                  <span className="text-xl leading-none">{cohortSpots}</span>
                  cupos por cohorte
                </div>
              </div>

              <ProgramInstitutionalLogosRow className="mt-5" />

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="rounded-full border border-black/8 bg-slate-50 px-3 py-1.5 text-slate-700">
                  Propaís
                </span>
                <span className="rounded-full border border-black/8 bg-slate-50 px-3 py-1.5 text-slate-700">
                  Gobierno de Corea del Sur
                </span>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-900">
                Marcas y proyectos desarrollados con nuestra metodología
              </p>
              <ClientLogoMarquee />
            </div>
          </div>

          <aside className="relative min-w-0">
            <div
              aria-hidden="true"
              className="absolute inset-x-8 top-10 h-48 rounded-full bg-blue-500/15 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-[32px] border border-black/8 bg-white p-5 shadow-[0_28px_80px_-34px_rgba(15,23,42,0.22)] sm:p-6">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#38bdf8_100%)] p-5 text-white sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Admisión Selectiva
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Próxima cohorte abierta.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                  No cotizas horas. Aplicas a un programa con método,
                  implementación, filtro de admisión y resultados esperados.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {programHeroMetrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="rounded-2xl border border-black/8 bg-slate-50 p-4 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.22)]"
                  >
                    <p className="text-[1.85rem] font-bold leading-none tracking-tight text-slate-900 sm:text-[2.15rem]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {metric.label}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  Cohorte vigente
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-bold leading-none tracking-tight text-slate-900">
                      {cohortSpots}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      cupos limitados para empresas con verdadero fit.
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 ring-1 ring-black/8">
                    Aplicación abierta
                  </div>
                </div>
              </div>

              <a
                href={programApplicationHref}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_16px_32px_-20px_rgba(249,115,22,0.82)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-orange-600 hover:shadow-[0_26px_40px_-20px_rgba(249,115,22,0.9)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.24)]"
              >
                Aplicar al Programa
              </a>
              <p className="mt-2 text-center text-xs text-slate-600">
                Cupos limitados por cohorte y revisión real de fit.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </LatamDepthBackground>
  );
}
