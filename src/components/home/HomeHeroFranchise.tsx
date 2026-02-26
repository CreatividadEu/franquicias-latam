"use client";

import { useState } from "react";
import Image from "next/image";
import { ExpressDiagnosisWidget } from "@/components/ExpressDiagnosisWidget";

const programShowcaseCards = [
  {
    title: "Diagn\u00f3stico & Roadmap",
    line: "Validaci\u00f3n real + plan accionable.",
  },
  {
    title: "Sistema Replicable",
    line: "Procesos y control para crecer sin caos.",
  },
  {
    title: "Expansi\u00f3n & Colocaci\u00f3n",
    line: "Activaci\u00f3n comercial y operadores listos.",
  },
];

const programBadgeClasses = [
  "bg-[#2860E7]/15 text-[#2860E7] ring-1 ring-[#2860E7]/20",
  "bg-orange-500/15 text-orange-600 ring-1 ring-orange-500/20",
  "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20",
];

function HowItWorks() {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <section
      id="proceso"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f8fbff] to-[#f2f6ff] py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.2),transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:mb-4 sm:text-xs">
              PROGRAMA ACELERACI&Oacute;N DE FRANQUICIAS
            </p>
            <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
              Convierte tu Negocio
              <span className="block">en Franquicia.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-slate-800 sm:text-xl">
              Sistema premiado por el BID, Naciones Unidas, MinTIC y Propa&iacute;s.
            </p>


            <div className="mt-8 max-w-2xl space-y-4 sm:space-y-5">
              {programShowcaseCards.map((card, index) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.45)] sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${programBadgeClasses[index]}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{card.title}</h3>
                    </div>
                  </div>
                </article>
              ))}

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
                Programa implementado por:
              </p>

              <div
                className="mt-5 flex flex-wrap items-center gap-8 sm:flex-nowrap sm:gap-10"
                aria-label="Organizaciones aliadas"
              >
                <figure className="flex h-12 min-w-0 items-center justify-center">
                  <Image
                    src="/logo_bid_3.png"
                    alt="Banco Interamericano de Desarrollo (BID)"
                    width={800}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-auto object-contain sm:h-11 md:h-12"
                  />
                </figure>
                <figure className="flex h-12 min-w-0 items-center justify-center">
                  <Image
                    src="/logo_onu_1.png"
                    alt="Naciones Unidas"
                    width={800}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-auto object-contain sm:h-11 md:h-12"
                  />
                </figure>
                <figure className="flex h-12 min-w-0 items-center justify-center">
                  <Image
                    src="/logo_mintic_1.png"
                    alt="MinTIC — Ministerio de Tecnologías de la Información y las Comunicaciones"
                    width={800}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-auto object-contain sm:h-11 md:h-12"
                  />
                </figure>
              </div>
            </div>
          </div>

          <aside className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6 lg:p-8">
            <div className="flex min-w-0 flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
                RESULTADOS REALES
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Aplica a Nuestro Programa
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Indicadores promedio observados en negocios participantes.
              </p>

              <div className="mt-6 flex-0">
                <div
                  className={`transition-all duration-300 ease-out ${
                    showQuiz
                      ? "pointer-events-none max-h-0 -translate-y-2 overflow-hidden opacity-0"
                      : "max-h-[1400px] translate-y-0 opacity-100"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr">
                    <article className="h-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        &ge;20% EBITDA
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="break-words text-3xl font-extrabold leading-none text-slate-900 sm:text-4xl md:text-5xl">
                          87%
                        </p>
                        <svg
                          viewBox="0 0 36 36"
                          aria-hidden="true"
                          className="metric-ring h-11 w-11 shrink-0 text-emerald-500"
                        >
                          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="65 88"
                            transform="rotate(-90 18 18)"
                          />
                        </svg>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-600">de empresas</p>
                    </article>

                    <article className="h-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        MARGEN BRUTO
                      </p>
                      <p className="mt-2 break-words text-3xl font-extrabold leading-none text-slate-900 sm:text-4xl md:text-5xl">
                        +9.4%
                      </p>
                      <svg
                        viewBox="0 0 120 26"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className="metric-sparkline mt-2 h-6 w-full text-[#2860E7]"
                      >
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="4,20 26,18 46,14 68,15 88,9 116,6"
                        />
                      </svg>
                      <p className="mt-1 text-xs font-medium text-slate-600">mejora promedio</p>
                    </article>

                    <article className="h-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        MODELO FRANQUICIABLE
                      </p>
                      <p className="mt-2 break-words text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                        90 d&iacute;as
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="metric-progress-fill h-1.5 w-[72%] rounded-full bg-[#2860E7]" />
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-600">tiempo promedio</p>
                    </article>

                    <article className="h-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        PROYECTOS DESARROLLADOS
                      </p>
                      <p className="mt-2 break-words text-3xl font-extrabold leading-none text-slate-900 sm:text-4xl md:text-5xl">
                        750+
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        implementados con nuestro m&eacute;todo
                      </p>
                    </article>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuiz(true)}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white shadow-[0_16px_32px_-20px_rgba(249,115,22,0.85)] transition hover:bg-orange-600"
                  >
                    Quiero estos resultados &rarr;
                  </button>
                
                </div>

                <div
                  className={`transition-all duration-300 ease-out ${
                    showQuiz
                      ? "max-h-[2200px] translate-y-0 opacity-100"
                      : "pointer-events-none max-h-0 translate-y-2 overflow-hidden opacity-0"
                  }`}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Diagn&oacute;stico Express
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowQuiz(false)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                      >
                        Cerrar
                      </button>
                    </div>
                    <ExpressDiagnosisWidget />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <style jsx>{`
        .metric-ring {
          animation: ring-float 4.8s ease-in-out infinite;
          transform-origin: center;
        }

        .metric-sparkline {
          animation: sparkline-slide 3.8s ease-in-out infinite;
        }

        .metric-progress-fill {
          animation: progress-breath 3.4s ease-in-out infinite;
          transform-origin: left center;
        }

        @keyframes ring-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes sparkline-slide {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
        }

        @keyframes progress-breath {
          0%,
          100% {
            transform: scaleX(0.94);
          }
          50% {
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .metric-ring,
          .metric-sparkline,
          .metric-progress-fill {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function MethodologyStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm">
          METODOLOG&Iacute;A VALIDADA INTERNACIONALMENTE
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-2">
            <Image
              src="/logos_clientes/logo_bid.svg"
              alt="BID"
              width={104}
              height={28}
              className="h-5 w-auto grayscale opacity-70"
            />
          </span>
          {["Naciones Unidas", "Naciones Unidas"].map((logo, index) => (
            <span
              key={`${logo}-${index}`}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 sm:text-sm"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeHeroFranchise() {
  return (
    <>
      <HowItWorks />
      <MethodologyStrip />
    </>
  );
}
