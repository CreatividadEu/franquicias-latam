"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DashboardPreview } from "@/components/home/DashboardPreview";
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

function MiniDiagnosticForm() {
  return (
    <div
      id="diagnostico"
      className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.55)] sm:p-7"
    >
      <ExpressDiagnosisWidget />
    </div>
  );
}

type HowItWorksProps = {
  hideDiagnosis?: boolean;
};

function HowItWorks({ hideDiagnosis = false }: HowItWorksProps) {
  return (
    <section id="como-funciona" className="bg-[#f8fafc] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`grid grid-cols-1 items-start gap-8 lg:gap-12 ${
            hideDiagnosis ? "lg:grid-cols-1" : "lg:grid-cols-[1.1fr_0.9fr]"
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
              ADMISI&Oacute;N / PROGRAMA PRIVADO
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Aplica a Nuestro Programa
            </h2>
            <p className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">
              Escala con nuestro programa premiado y reconocido a nivel internacional.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2 ring-1 ring-slate-200">
                <span className="text-2xl font-bold text-slate-900">1.200+</span>
                <span className="text-sm font-semibold text-slate-700">negocios evaluados</span>
              </div>
              <span className="text-xs text-slate-500">
                Resultados en 45s + siguiente paso recomendado
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                Aplicaci&oacute;n selectiva
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                Cohortes limitadas
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-white via-white to-slate-50 p-4 ring-1 ring-slate-200 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                  ADMISIONES EN CURSO
                </p>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-800 ring-1 ring-orange-500/20">
                  Cohortes limitadas
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-200/70 shadow-sm shadow-red-900/5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-800">MARZO 2025</span>
                    <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                      AGOTADO
                    </span>
                  </div>
                  <div className="mt-3 flex items-end">
                    <span className="text-3xl font-extrabold leading-none text-red-700 sm:text-4xl">
                      100%
                    </span>
                    <span className="ml-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700/80">
                      COMPLETO
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-600">Cohorte cerrada.</p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200/70 shadow-sm shadow-orange-900/5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-800">ABRIL 2025</span>
                    <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                      ÚLTIMOS CUPOS
                    </span>
                  </div>
                  <div className="mt-3 flex items-end">
                    <span className="text-3xl font-extrabold leading-none text-orange-700 sm:text-4xl">
                      65%
                    </span>
                    <span className="ml-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700/80">
                      COMPLETO
                    </span>
                  </div>
                  <div className="mt-3 h-3 w-full rounded-full bg-orange-200/80">
                    <div className="h-3 rounded-full bg-orange-600" style={{ width: "65%" }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-orange-800">
                      Cierre estimado en 6 días
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Consultar disponibilidad
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs font-semibold text-slate-600">
                Las admisiones cierran cuando se completa la cohorte.
              </p>
            </div>

            <div className="mt-7 space-y-4 sm:space-y-5">
              {programShowcaseCards.map((card, index) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${programBadgeClasses[index]}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-base font-medium text-slate-700">{card.line}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 text-base font-semibold text-slate-900 sm:text-lg">
              Para quienes est&aacute;n listos para escalar a otras ligas.
            </p>
          </div>

          {!hideDiagnosis && (
            <div className="lg:sticky lg:top-24">
              <MiniDiagnosticForm />
            </div>
          )}
        </div>
      </div>
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
  const [showQuiz, setShowQuiz] = useState(false);
  const [isSwitchingPanel, setIsSwitchingPanel] = useState(false);
  const panelSwitchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (panelSwitchTimerRef.current !== null) {
        window.clearTimeout(panelSwitchTimerRef.current);
      }
    };
  }, []);

  const handleShowQuiz = () => {
    if (showQuiz || isSwitchingPanel) {
      return;
    }

    setIsSwitchingPanel(true);
    panelSwitchTimerRef.current = window.setTimeout(() => {
      setShowQuiz(true);
      setIsSwitchingPanel(false);
    }, 260);
  };

  return (
    <>
      <section
        id="proceso"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#f8fbff] to-[#f2f6ff] py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.2),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="relative">
              <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                Convierte tu Negocio en Franquicia.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium text-slate-800 sm:text-xl">
                Sistema premiado por el BID, Naciones Unidas, MinTIC y Propaís para escalar
                negocios en redes de escala.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Estandarizamos operación, optimizamos la unidad económica y estructuramos tu
                expansión comercial con metodología clara, foco financiero y decisiones medibles.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleShowQuiz}
                  aria-controls="diagnostico"
                  disabled={showQuiz || isSwitchingPanel}
                  className="inline-flex items-center justify-center rounded-xl bg-[#2860E7] px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_34px_-20px_rgba(40,96,231,0.7)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#1f52cc] hover:shadow-[0_20px_40px_-22px_rgba(40,96,231,0.75)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Evaluar mi negocio
                </button>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-base font-semibold text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(148,163,184,0.28)]"
                >
                  Ver c&oacute;mo funciona
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Image
                    src="/logos_clientes/logo_bid.svg"
                    alt="BID"
                    width={58}
                    height={16}
                    className="h-3.5 w-auto opacity-80"
                  />
                  Premiado por BID
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2860E7]/75" />
                  Ejecutado junto a Naciones Unidas
                </span>
              </div>

              <div className="mt-8 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  METODOLOG&Iacute;A
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  En 90 d&iacute;as, dejamos listo tu sistema para escalar.
                </p>
                <ul className="mt-4 space-y-3 text-base text-slate-800 sm:text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#2860E7]">
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                        <path
                          d="M4 10.2 8 14l8-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>Sistema replicable (manuales + entrenamiento)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#2860E7]">
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                        <path
                          d="M4 10.2 8 14l8-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>Unidad econ&oacute;mica viable (escenarios + palancas)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#2860E7]">
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                        <path
                          d="M4 10.2 8 14l8-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>Expansi&oacute;n comercial (pipeline + leads)</span>
                  </li>
                </ul>
                <div
                  aria-label="Pilares del programa"
                  className="mt-4 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm"
                >
                  <span className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/85 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-700 sm:text-xs">
                    Estrategia
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/85 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-700 sm:text-xs">
                    Finanzas
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/85 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-700 sm:text-xs">
                    Operaciones
                  </span>
                </div>
              </div>
            </div>
            <DashboardPreview
              className={`mt-8 lg:mt-0 scroll-fade-in transition-all duration-500 ease-out ${
                isSwitchingPanel ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              }`}
              showQuiz={showQuiz}
            />
          </div>
        </div>
      </section>
      <HowItWorks hideDiagnosis={showQuiz} />
      <MethodologyStrip />
    </>
  );
}
