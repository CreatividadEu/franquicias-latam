"use client";

import { useEffect, useRef, useState } from "react";

const CALENDLY_URL =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

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

  const stats = [
    { value: `+${statValues.companies}`, label: "Empresas optimizadas" },
    { value: `${statValues.ebitda}%+`, label: "EBITDA promedio" },
    { value: `${statValues.headcount}+`, label: "Años de Experiencia" },
  ];

  return (
    <section
      className="relative overflow-hidden py-14 sm:py-16 lg:py-[4.5rem]"
    >
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
                className="grid max-w-[700px] grid-cols-1 justify-items-center gap-5 sm:grid-cols-3 sm:gap-4"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex w-full max-w-[210px] flex-col items-center text-center"
                  >
                    <div className="calendly-cta__stat-disc flex aspect-square w-full items-center justify-center rounded-full border border-black/[0.03] px-5">
                      <div className="bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] bg-clip-text text-[2.35rem] font-semibold leading-none tracking-[-0.02em] text-transparent sm:text-[2.7rem]">
                        {stat.value}
                      </div>
                    </div>
                    <div className="mt-3 max-w-[185px] text-[0.72rem] font-semibold uppercase leading-[1.3] tracking-[0.2em] text-[#14213D] [text-wrap:balance] sm:text-[0.76rem]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <div className="min-w-0">
              <div
                aria-label="Calendly para agendar una llamada del programa"
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_40px_80px_-30px_rgba(15,23,42,0.25)] transition-all duration-500 hover:shadow-[0_50px_100px_-30px_rgba(15,23,42,0.35)]"
              >
                <iframe
                  title="Calendly para agendar llamada"
                  src={`${CALENDLY_URL}?hide_event_type_details=1&hide_landing_page_details=1`}
                  className="calendly-cta__widget w-full rounded-[20px] border-0"
                  loading="lazy"
                  style={{ minWidth: "320px", height: "700px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendly-cta__stat-disc {
          background: #f5f5f5;
          box-shadow:
            rgba(0, 0, 0, 0.08) 0px 0.706592px 0.706592px -0.666667px,
            rgba(0, 0, 0, 0.08) 0px 1.80656px 1.80656px -1.33333px,
            rgba(0, 0, 0, 0.07) 0px 3.62176px 3.62176px -2px,
            rgba(0, 0, 0, 0.07) 0px 6.8656px 6.8656px -2.66667px,
            rgba(0, 0, 0, 0.05) 0px 13.6468px 13.6468px -3.33333px,
            rgba(0, 0, 0, 0.02) 0px 30px 30px -4px,
            rgb(255, 255, 255) 0px 3px 1px 0px inset;
        }

        @media (max-width: 640px) {
          .calendly-cta__widget {
            min-width: 100% !important;
            height: 620px !important;
          }
        }
      `}</style>
    </section>
  );
}
