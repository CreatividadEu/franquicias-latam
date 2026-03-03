"use client";

import { useEffect, useRef, useState } from "react";
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

type CountAnimationOptions = {
  from: number;
  to: number;
  duration: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(media.matches);
    handleChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

function useInViewOnce(targetRef: React.RefObject<HTMLElement | null>, threshold = 0.35) {
  const [isInView, setIsInView] = useState(
    () => typeof window !== "undefined" && typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (isInView) {
      return;
    }

    const node = targetRef.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView, targetRef, threshold]);

  return isInView;
}

function animateCount(element: HTMLElement | null, options: CountAnimationOptions) {
  if (!element) {
    return () => {};
  }

  const {
    from,
    to,
    duration,
    decimals = 0,
    prefix = "",
    suffix = "",
  } = options;

  let frameId = 0;
  const start = performance.now();

  const setValue = (value: number) => {
    const formatted =
      decimals > 0 ? value.toFixed(decimals) : `${Math.round(value)}`;
    element.textContent = `${prefix}${formatted}${suffix}`;
  };

  setValue(from);

  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = from + (to - from) * eased;
    setValue(currentValue);

    if (progress < 1) {
      frameId = window.requestAnimationFrame(step);
    }
  };

  frameId = window.requestAnimationFrame(step);
  return () => window.cancelAnimationFrame(frameId);
}

function HowItWorks() {
  const [showQuiz, setShowQuiz] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const statsGridRef = useRef<HTMLDivElement>(null);
  const ebitdaValueRef = useRef<HTMLSpanElement>(null);
  const marginValueRef = useRef<HTMLSpanElement>(null);
  const daysValueRef = useRef<HTMLSpanElement>(null);
  const projectsValueRef = useRef<HTMLSpanElement>(null);
  const hasStatsAnimatedRef = useRef(false);
  const statsInView = useInViewOnce(statsGridRef);

  useEffect(() => {
    if (!statsInView || showQuiz || hasStatsAnimatedRef.current) {
      return;
    }

    hasStatsAnimatedRef.current = true;
    statsGridRef.current?.classList.add("stats-animate-on");

    const setFinalValues = () => {
      if (ebitdaValueRef.current) {
        ebitdaValueRef.current.textContent = "87%";
      }
      if (marginValueRef.current) {
        marginValueRef.current.textContent = "+9.4%";
      }
      if (daysValueRef.current) {
        daysValueRef.current.textContent = "90 días";
      }
      if (projectsValueRef.current) {
        projectsValueRef.current.textContent = "750+";
      }
    };

    if (prefersReducedMotion) {
      setFinalValues();
      return;
    }

    const stopAnimations = [
      animateCount(ebitdaValueRef.current, { from: 0, to: 87, duration: 700, suffix: "%" }),
      animateCount(marginValueRef.current, {
        from: 0,
        to: 9.4,
        duration: 700,
        decimals: 1,
        prefix: "+",
        suffix: "%",
      }),
      animateCount(daysValueRef.current, { from: 0, to: 90, duration: 700, suffix: " días" }),
      animateCount(projectsValueRef.current, { from: 0, to: 750, duration: 700, suffix: "+" }),
    ];

    return () => {
      stopAnimations.forEach((stop) => stop());
      setFinalValues();
    };
  }, [prefersReducedMotion, showQuiz, statsInView]);

  return (
    <section
      id="proceso"
      className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(96deg, rgba(40,96,231,0.09) 0%, rgba(40,96,231,0.05) 30%, rgba(255,255,255,0) 52%), radial-gradient(920px 560px at 14% 8%, rgba(40,96,231,0.14), transparent 60%), radial-gradient(640px 420px at 12% 78%, rgba(56,189,248,0.07), transparent 68%), linear-gradient(180deg, #ffffff 0%, #f9fbff 58%, #f3f7ff 100%)",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
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


            <div className="mt-7 max-w-2xl space-y-4 sm:space-y-5">
              {programShowcaseCards.map((card, index) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-slate-2040/90 bg-white/85 p-5 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.45)] sm:p-6"
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

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Programa implementado por:
              </p>

              <div
                className="mt-4 flex flex-wrap items-center gap-8 sm:flex-nowrap sm:gap-10"
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

          <aside
            id="resultados-reales"
            className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_38px_80px_-48px_rgba(15,23,42,0.55)] sm:p-5 lg:px-6 lg:py-5"
          >
            <div className="flex min-w-0 flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
                RESULTADOS REALES
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Aplica a Nuestro Programa
              </h2>
              <p className="mt-1 text-base leading-relaxed tracking-[0.015em] text-slate-600 sm:text-lg">
                Indicadores promedio de negocios participantes.
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base lg:whitespace-nowrap">
                Basado en +750 proyectos desarrollados.
              </p>

              <div className="mt-1.5 flex-0">
                <div className="relative overflow-visible sm:h-[468px] sm:overflow-hidden lg:h-[486px]">
                  <div
                    aria-hidden={showQuiz}
                    inert={showQuiz}
                    className={`flex-col transition-all duration-300 ease-out motion-reduce:duration-150 motion-reduce:translate-y-0 sm:absolute sm:inset-0 ${
                      showQuiz
                        ? "pointer-events-none hidden translate-y-2 opacity-0 sm:flex"
                        : "pointer-events-auto flex translate-y-0 opacity-100"
                    }`}
                  >
                    <div
                      ref={statsGridRef}
                      className="flex min-h-0 flex-col justify-center overflow-visible sm:flex-1"
                    >
                      <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2 sm:auto-rows-fr">
                        <article className="stats-card h-full w-full max-w-none min-w-0 overflow-visible rounded-2xl border border-slate-200/90 bg-white/95 p-4 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_14px_24px_-20px_rgba(15,23,42,0.3)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            &ge;20% EBITDA
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-3 overflow-visible">
                            <p className="break-words text-3xl font-extrabold leading-none tabular-nums text-slate-900 sm:text-4xl md:text-5xl">
                              <span ref={ebitdaValueRef}>87%</span>
                            </p>
                            <svg
                              viewBox="0 0 36 36"
                              aria-hidden="true"
                              className="metric-ring block h-11 w-11 shrink-0 text-emerald-500"
                            >
                              <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="currentColor"
                                strokeOpacity="0.2"
                                strokeWidth="4"
                              />
                              <circle
                                className="metric-ring-progress"
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
                          <p className="mt-1 text-[14.4px] font-medium text-slate-600 md:text-xs">
                            de empresas
                          </p>
                        </article>

                        <article className="stats-card h-full w-full max-w-none min-w-0 overflow-visible rounded-2xl border border-slate-200/90 bg-white/95 p-4 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_14px_24px_-20px_rgba(15,23,42,0.3)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            MARGEN BRUTO
                          </p>
                          <p className="mt-2 break-words text-3xl font-extrabold leading-none tabular-nums text-slate-900 sm:text-4xl md:text-5xl">
                            <span ref={marginValueRef}>+9.4%</span>
                          </p>
                          <div className="relative mt-2 w-full overflow-visible">
                            <svg
                              viewBox="0 0 120 26"
                              preserveAspectRatio="none"
                              aria-hidden="true"
                              className="metric-sparkline block h-6 w-full text-[#2860E7]"
                            >
                              <polyline
                                className="metric-sparkline-path"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="4,20 26,18 46,14 68,15 88,9 116,6"
                              />
                            </svg>
                          </div>
                          <p className="mt-1 text-[14.4px] font-medium text-slate-600 md:text-xs">
                            mejora promedio
                          </p>
                        </article>

                        <article className="stats-card h-full w-full max-w-none min-w-0 overflow-visible rounded-2xl border border-slate-200/90 bg-white/95 p-4 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_14px_24px_-20px_rgba(15,23,42,0.3)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            MODELO FRANQUICIABLE
                          </p>
                          <p className="mt-2 break-words text-3xl font-extrabold leading-tight tabular-nums text-slate-900 sm:text-4xl">
                            <span ref={daysValueRef}>90 días</span>
                          </p>
                          <div className="relative mt-2 w-full overflow-visible">
                            <div className="metric-progress-track h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                              <div className="metric-progress-fill h-2.5 w-[72%] rounded-full bg-[linear-gradient(90deg,#2860E7_0%,#3B82F6_100%)]" />
                            </div>
                          </div>
                          <p className="mt-1 text-[14.4px] font-medium text-slate-600 md:text-xs">
                            tiempo promedio
                          </p>
                        </article>

                        <article className="stats-card h-full w-full max-w-none min-w-0 overflow-visible rounded-2xl border border-slate-200/90 bg-white/95 p-4 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_14px_24px_-20px_rgba(15,23,42,0.3)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            PROYECTOS DESARROLLADOS
                          </p>
                          <p className="mt-2 break-words text-3xl font-extrabold leading-none tabular-nums text-slate-900 sm:text-4xl md:text-5xl">
                            <span ref={projectsValueRef}>750+</span>
                          </p>
                          <p className="mt-1 text-[14.4px] font-medium text-slate-600 md:text-xs">
                            implementados con nuestro m&eacute;todo
                          </p>
                        </article>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowQuiz(true)}
                        disabled={showQuiz}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white shadow-[0_16px_32px_-20px_rgba(249,115,22,0.82)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-orange-600 hover:shadow-[0_26px_40px_-20px_rgba(249,115,22,0.9)] active:translate-y-0 active:shadow-[0_14px_22px_-20px_rgba(249,115,22,0.72)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.24)] disabled:pointer-events-none disabled:opacity-70"
                      >
                        Aplicar al Programa
                      </button>
                      <p className="mt-1.5 text-center text-xs text-slate-500">
                        Cupos limitados por cohorte.
                      </p>
                    </div>
                  </div>

                  <div
                    aria-hidden={!showQuiz}
                    inert={!showQuiz}
                    className={`flex-col transition-all duration-300 ease-out motion-reduce:duration-150 motion-reduce:translate-y-0 sm:absolute sm:inset-0 ${
                      showQuiz
                        ? "pointer-events-auto flex translate-y-0 opacity-100"
                        : "pointer-events-none hidden translate-y-2 opacity-0 sm:flex"
                    }`}
                  >
                    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:h-full sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Diagn&oacute;stico Express
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowQuiz(false)}
                          disabled={!showQuiz}
                          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-70"
                        >
                          Cerrar
                        </button>
                      </div>
                      <div className="quiz-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                        <ExpressDiagnosisWidget startDirectly />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <style jsx>{`
        .metric-ring {
          transform-origin: center;
          opacity: 1;
        }

        .stats-card {
          will-change: transform, opacity;
        }

        .metric-ring,
        .metric-sparkline,
        .metric-progress-fill {
          will-change: transform, opacity;
        }

        .metric-ring-progress {
          stroke-dashoffset: 0;
        }

        .metric-sparkline-path {
          stroke-dasharray: 140;
          stroke-dashoffset: 0;
        }

        .metric-progress-fill {
          position: relative;
          transform-origin: left center;
          transform: scaleX(1);
        }

        .metric-progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            110deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.45) 46%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-120%);
        }

        .stats-animate-on .stats-card {
          animation: stat-card-in 650ms ease-out both;
        }

        .stats-animate-on .stats-card:nth-child(2) {
          animation-delay: 60ms;
        }

        .stats-animate-on .stats-card:nth-child(3) {
          animation-delay: 120ms;
        }

        .stats-animate-on .stats-card:nth-child(4) {
          animation-delay: 180ms;
        }

        .stats-animate-on .metric-ring {
          animation: ring-appear 620ms ease-out both;
        }

        .stats-animate-on .metric-ring-progress {
          animation: ring-draw 780ms ease-out 80ms forwards;
        }

        .stats-animate-on .metric-sparkline {
          animation: sparkline-appear 620ms ease-out 60ms both;
        }

        .stats-animate-on .metric-sparkline-path {
          stroke-dashoffset: 140;
          animation: sparkline-draw 760ms ease-out 80ms forwards;
        }

        .stats-animate-on .metric-progress-fill {
          transform: scaleX(0);
          transform-origin: left center;
          animation: progress-fill 720ms ease-out 100ms forwards;
        }

        .stats-animate-on .metric-progress-fill::after {
          animation: progress-shimmer 900ms ease-out 260ms forwards;
        }

        @keyframes stat-card-in {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ring-appear {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sparkline-appear {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ring-draw {
          0% {
            stroke-dashoffset: 65;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes sparkline-draw {
          0% {
            stroke-dashoffset: 140;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes progress-fill {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes progress-shimmer {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stats-card,
          .metric-ring,
          .metric-ring-progress,
          .metric-sparkline,
          .metric-sparkline-path,
          .metric-progress-fill {
            animation: none !important;
          }

          .metric-ring-progress,
          .metric-sparkline-path {
            stroke-dashoffset: 0 !important;
          }

          .metric-progress-fill {
            transform: scaleX(1) !important;
          }

          .metric-progress-fill::after {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

export function MethodologyStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-base">
          HAN ESCRITO SOBRE NOSOTROS
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Image
            src="/fotos_home/logo_semana.png"
            alt="Semana"
            width={160}
            height={40}
            className="h-11 w-auto grayscale opacity-70"
          />
          <Image
            src="/fotos_home/logo_la_republica.png"
            alt="La República"
            width={160}
            height={40}
            className="h-11 w-auto grayscale opacity-70"
          />
          <Image
            src="/fotos_home/finanzas_personales_logo.png"
            alt="Finanzas Personales"
            width={160}
            height={40}
            className="h-11 w-auto grayscale opacity-70"
          />
          <Image
            src="/fotos_home/logo_crunchbase.png"
            alt="Crunchbase"
            width={160}
            height={40}
            className="h-11 w-auto grayscale opacity-70"
          />
        </div>
      </div>
    </section>
  );
}

export function HomeHeroFranchise() {
  return <HowItWorks />;
}
