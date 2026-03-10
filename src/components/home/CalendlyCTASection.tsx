"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type CalendlyWindow = Window & {
  Calendly?: {
    initInlineWidgets?: () => void;
  };
};

const initCalendly = () => {
  if (typeof window === "undefined") {
    return;
  }

  (window as CalendlyWindow).Calendly?.initInlineWidgets?.();
};

export function CalendlyCTASection() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotionRef = useRef(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statValues, setStatValues] = useState({
    companies: 0,
    ebitda: 0,
    headcount: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const node = statsRef.current;
    if (!node) {
      return;
    }

    prefersReducedMotionRef.current = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (prefersReducedMotionRef.current) {
      const frame = window.requestAnimationFrame(() => {
        setStatsVisible(true);
        setStatValues({
          companies: 750,
          ebitda: 20,
          headcount: 15,
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible || typeof window === "undefined") {
      return;
    }

    if (prefersReducedMotionRef.current) {
      return;
    }

    let frame = 0;
    const startedAt = window.performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setStatValues({
        companies: Math.round(750 * eased),
        ebitda: Math.round(20 * eased),
        headcount: Math.round(15 * eased),
      });

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [statsVisible]);

  return (
    <section
      className="relative overflow-hidden py-14 sm:py-16 lg:py-[4.5rem]"
    >
      <Script
        id="calendly-widget-script"
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onReady={initCalendly}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_2px_32px_rgba(0,0,0,0.08)]">

          <div className="relative grid gap-8 px-5 py-5 sm:px-8 sm:py-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-10 lg:px-10 lg:py-8">
            <div className="relative min-w-0 space-y-5 pl-5 sm:pl-6">

              <span className="block text-sm font-medium uppercase tracking-widest text-[#2563EB]">
                Aplicación Estratégica
              </span>
              <div className="relative max-w-[560px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-4 top-3 h-24 w-64 rounded-full bg-blue-500/15 blur-3xl"
                />
                <h2 className="relative text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
                  <span className="block">Evaluemos tu Potencial en</span>
                  <span className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    15 Minutos
                  </span>
                  .
                </h2>
              </div>

              <p className="max-w-[520px] text-lg text-slate-900">
                En una llamada privada revisamos tu margen actual, el potencial
                de optimización y los próximos pasos concretos.
              </p>

              <div className="space-y-3 rounded-2xl border border-black/8 bg-slate-50 p-6 shadow-sm">
                {[
                  { icon: "$", text: "Margen actual" },
                  { icon: "%", text: "Potencial de optimización" },
                  { icon: ">", text: "Próximos pasos concretos" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 text-[15px] font-medium text-slate-700"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-md">
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div
                ref={statsRef}
                className="grid gap-3 sm:grid-cols-3"
              >
                <div className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-3xl font-bold text-transparent">
                    + {statValues.companies}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-900">
                    Empresas optimizadas
                  </div>
                </div>
                <div className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent">
                    {statValues.ebitda}%+
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-900">
                    EBITDA promedio
                  </div>
                </div>
                <div className="rounded-xl border border-black/8 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                  <div className="bg-gradient-to-r from-pink-500 via-orange-400 to-orange-500 bg-clip-text text-3xl font-bold text-transparent">
                    {statValues.headcount} +
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-900">
                    Años de Experiencia
                  </div>
                </div>
              </div>

            </div>

            <div className="min-w-0">
              <div
                aria-label="Calendly para agendar una llamada del programa"
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_40px_80px_-30px_rgba(15,23,42,0.25)] transition-all duration-500 hover:shadow-[0_50px_100px_-30px_rgba(15,23,42,0.35)]"
              >
                <div
                  className="calendly-inline-widget calendly-cta__widget rounded-[20px]"
                  data-url="https://calendly.com/franquicias_latam/programa_aceleradora_franquicias"
                  style={{ minWidth: "320px", height: "700px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendly-cta__noise {
          background-image:
            linear-gradient(
              120deg,
              rgba(37, 99, 235, 0.65),
              rgba(255, 255, 255, 0) 48%,
              rgba(99, 102, 241, 0.4)
            ),
            repeating-linear-gradient(
              0deg,
              rgba(15, 23, 42, 0.26) 0px,
              rgba(15, 23, 42, 0.26) 1px,
              transparent 1px,
              transparent 3px
            );
          animation: calendlyCtaNoise 18s linear infinite;
        }

        .calendly-cta__ambient {
          animation: calendlyCtaFloat 20s ease-in-out infinite;
        }

        @keyframes calendlyCtaFloat {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes calendlyCtaNoise {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-1.5%, 1%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @media (max-width: 640px) {
          .calendly-cta__widget {
            min-width: 100% !important;
            height: 620px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .calendly-cta__ambient,
          .calendly-cta__noise {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
