"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { ExpressDiagnosisWidget } from "@/components/ExpressDiagnosisWidget";

type PerformanceIndicatorsProps = {
  className?: string;
};

type IndicatorKind = "ebitda" | "margin" | "time" | "errors";

type IndicatorItem = {
  id: IndicatorKind;
  label: string;
  value: string;
  supporting: string;
  progress?: number;
};

const timelineSteps = ["Idea", "Modelo", "Manuales", "Legal", "Go-to-market"] as const;

const indicatorItems: IndicatorItem[] = [
  {
    id: "ebitda",
    label: "≥20% EBITDA",
    value: "87%",
    supporting: "de empresas",
    progress: 0.87,
  },
  {
    id: "margin",
    label: "Margen bruto",
    value: "+9.4%",
    supporting: "mejora promedio",
  },
  {
    id: "time",
    label: "Modelo franquiciable",
    value: "90 días",
    supporting: "tiempo promedio",
  },
  {
    id: "errors",
    label: "Proyectos desarrollados",
    value: "750+",
    supporting: "implementados con nuestro método",
  },
];

const easeOutCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EBITDA_RADIUS = 34;
const EBITDA_CIRCUMFERENCE = 2 * Math.PI * EBITDA_RADIUS;

function cardMotion(index: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: {
      duration: 0.75,
      ease: easeOutCurve,
      delay: index * 0.08,
    },
  };
}

function pathAnimation(delay: number, reducedMotion: boolean) {
  return {
    initial: reducedMotion ? { pathLength: 1 } : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.55 },
    transition: reducedMotion
      ? undefined
      : {
          duration: 0.85,
          ease: easeOutCurve,
          delay,
        },
  };
}

type EbitdaRadialProps = {
  progress: number;
};

function EbitdaRadial({ progress }: EbitdaRadialProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [hasEntered, setHasEntered] = useState(
    reducedMotion ||
      (typeof window !== "undefined" && typeof IntersectionObserver === "undefined"),
  );
  const radialRef = useRef<SVGSVGElement | null>(null);
  const gradientId = `ebitdaGradient-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (reducedMotion || hasEntered) {
      return;
    }

    const target = radialRef.current;
    if (!target) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => {
        setHasEntered(true);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.45 },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasEntered, reducedMotion]);

  const finalOffset = EBITDA_CIRCUMFERENCE * (1 - progress);
  const isAnimatedState = reducedMotion || hasEntered;

  return (
    <svg
      ref={radialRef}
      viewBox="0 0 80 80"
      aria-hidden="true"
      className="h-[66px] w-[66px] md:h-[82px] md:w-[82px]"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r={EBITDA_RADIUS} stroke="#E5E7EB" strokeWidth="6" fill="none" />
      <circle
        cx="40"
        cy="40"
        r={EBITDA_RADIUS}
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={EBITDA_CIRCUMFERENCE}
        strokeDashoffset={isAnimatedState ? finalOffset : EBITDA_CIRCUMFERENCE}
        transform="rotate(-90 40 40)"
        style={{
          opacity: isAnimatedState ? 1 : 0,
          transform: isAnimatedState ? "scale(1)" : "scale(0.95)",
          transformOrigin: "40px 40px",
          filter: "drop-shadow(0 0 6px rgba(5,150,105,0.35))",
          transition: reducedMotion
            ? "none"
            : "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1), opacity 900ms ease-out, transform 900ms ease-out",
        }}
      />
    </svg>
  );
}

function renderIndicatorVisual(item: IndicatorItem, reducedMotion: boolean): ReactNode {
  if (item.id === "ebitda") {
    return (
      <div className="mt-2 flex min-w-0 items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="min-w-0 max-w-full text-5xl font-semibold leading-none tracking-tight text-slate-900 md:text-[3.4rem]">
            {item.value}
          </p>
          <p className="mt-1 text-sm text-slate-600">{item.supporting}</p>
        </div>
        <div className="shrink-0">
          <EbitdaRadial progress={item.progress ?? 0.87} />
        </div>
      </div>
    );
  }

  if (item.id === "margin") {
    return (
      <>
        <p className="mt-2 text-4xl font-semibold leading-none tracking-tight text-slate-900 md:text-[2.95rem]">
          {item.value}
        </p>
        <p className="mt-1 text-sm text-slate-600">{item.supporting}</p>
        <svg viewBox="0 0 180 64" className="mt-2 h-10 w-full md:h-14" aria-hidden="true">
          <path
            d="M8 50 C 36 46, 58 44, 84 34 C 104 26, 126 22, 172 12"
            fill="none"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <motion.path
            d="M8 50 C 36 46, 58 44, 84 34 C 104 26, 126 22, 172 12"
            fill="none"
            stroke="#2860E7"
            strokeWidth="3"
            strokeLinecap="round"
            {...pathAnimation(0.1, reducedMotion)}
          />
          <motion.circle
            cx="172"
            cy="12"
            r="4.5"
            fill="#2860E7"
            initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={
              reducedMotion ? undefined : { duration: 0.45, ease: easeOutCurve, delay: 0.45 }
            }
          />
        </svg>
      </>
    );
  }

  if (item.id === "time") {
    return (
      <>
        <p className="mt-2 text-4xl font-semibold leading-none tracking-tight text-slate-900 md:text-[2.95rem]">
          {item.value}
        </p>
        <p className="mt-1 text-sm text-slate-600">{item.supporting}</p>
        <div className="mt-2 rounded-xl border border-slate-200/80 bg-white/70 px-2 py-2 md:px-2.5 md:py-2.5">
          <div className="h-1 rounded-full bg-slate-200">
            <motion.div
              className="h-1 rounded-full bg-[#2860E7]/65"
              initial={reducedMotion ? { width: "100%" } : { width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, amount: 0.65 }}
              transition={
                reducedMotion ? undefined : { duration: 0.8, ease: easeOutCurve, delay: 0.15 }
              }
            />
          </div>
          <ol className="mt-2 grid grid-cols-5 gap-1">
            {timelineSteps.map((step, index) => (
              <motion.li
                key={step}
                className="flex flex-col items-center gap-1 text-center"
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.65 }}
                transition={
                  reducedMotion
                    ? undefined
                    : {
                        duration: 0.45,
                        ease: easeOutCurve,
                        delay: 0.2 + index * 0.06,
                      }
                }
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === timelineSteps.length - 1 ? "bg-[#2860E7]" : "bg-slate-300"
                  }`}
                />
                <span className="text-[0.55rem] font-medium leading-tight text-slate-600 md:text-[0.58rem]">
                  {step}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </>
    );
  }

  return (
    <div className="mt-2 min-w-0">
      <p className="max-w-full whitespace-normal break-words text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[2.95rem]">
        {item.value}
      </p>
      <p className="mt-1 text-sm text-slate-600">{item.supporting}</p>
    </div>
  );
}

const cellDividerClasses = [
  "md:border-b md:border-r md:border-slate-200/70",
  "md:border-b md:border-slate-200/70",
  "md:border-r md:border-slate-200/70",
  "",
];

export function PerformanceIndicators({ className = "" }: PerformanceIndicatorsProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [panelView, setPanelView] = useState<"metrics" | "quiz">("metrics");
  const quizLayerRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousViewRef = useRef<"metrics" | "quiz">("metrics");
  const isQuizView = panelView === "quiz";

  const handlePanelToggle = () => {
    setPanelView((currentView) => (currentView === "metrics" ? "quiz" : "metrics"));
  };

  useEffect(() => {
    const previousView = previousViewRef.current;

    if (panelView === "quiz") {
      const timer = window.setTimeout(() => {
        quizLayerRef.current?.focus();
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          quizLayerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 180);

      previousViewRef.current = panelView;
      return () => {
        window.clearTimeout(timer);
      };
    }

    if (panelView === "metrics" && previousView === "quiz") {
      const timer = window.setTimeout(() => {
        toggleButtonRef.current?.focus();
      }, 120);

      previousViewRef.current = panelView;
      return () => {
        window.clearTimeout(timer);
      };
    }

    previousViewRef.current = panelView;
  }, [panelView]);

  return (
    <section
      className={`rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/55 p-4 shadow-md sm:p-6 ${className}`.trim()}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Resultados reales
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
        Aplica a Nuestro Programa
      </h2>
  

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {isQuizView ? (
            <motion.div
              key="quiz-view"
              id="hero-embedded-diagnostico"
              ref={quizLayerRef}
              tabIndex={-1}
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5"
            >
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPanelView("metrics")}
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(148,163,184,0.35)]"
                >
                  Cerrar
                </button>
              </div>
              <ExpressDiagnosisWidget startDirectly />
            </motion.div>
          ) : (
            <motion.div
              key="metrics-view"
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <div className="grid grid-cols-2 gap-4 md:gap-0">
                {indicatorItems.map((item, index) => (
                  <motion.article
                    key={item.id}
                    {...cardMotion(index, reducedMotion)}
                    className={`min-w-0 overflow-x-hidden rounded-xl border border-slate-200/80 bg-white/75 p-4 md:rounded-none md:border-0 md:bg-transparent md:p-5 ${cellDividerClasses[index]}`}
                  >
                    <div className="min-w-0">
                      <p className="max-w-full whitespace-normal break-words hyphens-auto text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-slate-500 line-clamp-2 md:line-clamp-none">
                        {item.label}
                      </p>
                    </div>
                    {renderIndicatorVisual(item, reducedMotion)}
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        ref={toggleButtonRef}
        type="button"
        onClick={handlePanelToggle}
        aria-pressed={isQuizView}
        aria-expanded={isQuizView}
        aria-controls="hero-embedded-diagnostico"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#FF6A2B] px-5 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 ease-out hover:-translate-y-[1px] hover:bg-[#E85C20] hover:shadow-xl active:bg-[#CC4F17] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/40"
      >
        {isQuizView ? "Volver a resultados" : "Quiero estos resultados →"}
      </button>
      <p className="mt-2 text-center text-[12px] text-slate-500">
        Evaluaci&oacute;n confidencial · Respuesta en 24&ndash;48h
      </p>
    </section>
  );
}
