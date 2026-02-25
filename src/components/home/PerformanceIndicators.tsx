"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

type PerformanceIndicatorsProps = {
  className?: string;
};

type IndicatorKind = "ebitda" | "margin" | "time" | "errors";

type IndicatorItem = {
  id: IndicatorKind;
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
};

const timelineSteps = ["Idea", "Modelo", "Manuales", "Legal", "Go-to-market"] as const;

const indicatorItems: IndicatorItem[] = [
  {
    id: "ebitda",
    title: "Proyectos que alcanzan ≥20% EBITDA",
    value: "87%",
    progress: 0.87,
  },
  {
    id: "margin",
    title: "Mejora promedio en margen bruto",
    value: "+9.4%",
  },
  {
    id: "time",
    title: "Tiempo promedio hasta franquiciabilidad",
    value: "90 días",
  },
  {
    id: "errors",
    title: "Reducción de errores estructurales críticos",
    value: "Hasta 100%*",
    subtitle: "*según auditoría del método",
    progress: 1,
  },
];

const easeOutCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ringRadius = 30;
const ringCircumference = 2 * Math.PI * ringRadius;
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

function ringAnimation(targetProgress: number, reducedMotion: boolean) {
  const targetOffset = ringCircumference * (1 - targetProgress);

  return {
    style: {
      strokeDasharray: ringCircumference,
      strokeDashoffset: reducedMotion ? targetOffset : ringCircumference,
    },
    whileInView: reducedMotion ? undefined : { strokeDashoffset: targetOffset },
    viewport: { once: true, amount: 0.6 },
    transition: reducedMotion
      ? undefined
      : {
          duration: 0.85,
          ease: easeOutCurve,
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
    <svg ref={radialRef} width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
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
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[2.7rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[3.1rem]">
          {item.value}
        </p>
        <EbitdaRadial progress={item.progress ?? 0.87} />
      </div>
    );
  }

  if (item.id === "margin") {
    return (
      <>
        <p className="mt-3 text-[2.7rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[3.1rem]">
          {item.value}
        </p>
        <svg viewBox="0 0 180 64" className="mt-3 h-14 w-full" aria-hidden="true">
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
        <p className="mt-3 text-[2.7rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[3.1rem]">
          {item.value}
        </p>
        <div className="mt-3 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 py-2.5">
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
                <span className="text-[0.58rem] font-medium leading-tight text-slate-600">
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
    <div className="mt-3 flex items-end justify-between gap-3">
      <div>
        <p className="whitespace-nowrap text-[2.1rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[2.4rem]">
          {item.value}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-600">{item.subtitle}</p>
      </div>
      <svg viewBox="0 0 80 80" className="h-[78px] w-[78px]" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r={ringRadius}
          fill="none"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="7"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={ringRadius}
          fill="none"
          stroke="#2860E7"
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          {...ringAnimation(item.progress ?? 1, reducedMotion)}
        />
        <motion.path
          d="M27 41.5 36 50 54 32"
          fill="none"
          stroke="#0f172a"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 0.45,
                  ease: easeOutCurve,
                  delay: 0.35,
                }
          }
        />
      </svg>
    </div>
  );
}

const cellDividerClasses = [
  "border-b border-slate-200/70 sm:border-r sm:border-b",
  "border-b border-slate-200/70 sm:border-b",
  "border-b border-slate-200/70 sm:border-b-0 sm:border-r",
  "",
];

export function PerformanceIndicators({ className = "" }: PerformanceIndicatorsProps) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section
      className={`rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/55 p-5 shadow-[0_24px_55px_-44px_rgba(15,23,42,0.45)] sm:p-6 ${className}`.trim()}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Prueba de resultado
      </p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        Performance del M&eacute;todo
      </h3>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Indicadores clave observados en empresas que implementan el sistema completo.
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2">
        {indicatorItems.map((item, index) => (
          <motion.article
            key={item.id}
            {...cardMotion(index, reducedMotion)}
            className={`p-4 sm:p-5 ${cellDividerClasses[index]}`}
          >
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {item.title}
            </p>
            {renderIndicatorVisual(item, reducedMotion)}
          </motion.article>
        ))}
      </div>

      <p className="mt-4 text-xs font-medium text-slate-600 sm:text-sm">
        Resultados promedio observados en empresas que implementan el sistema completo.
      </p>
    </section>
  );
}
