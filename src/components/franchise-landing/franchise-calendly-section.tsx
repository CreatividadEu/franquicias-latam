"use client";

const CALENDLY_URL =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

const PROOF_POINTS = [
  "Revisamos tu perfil de inversión y disponibilidad de capital",
  "Evaluamos encaje de territorio y modelo con tu perfil de operador",
  "Sales con claridad sobre disponibilidad y el siguiente paso concreto",
];

export function FranchiseCalendlySection() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16 lg:py-[4.5rem]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_2px_32px_rgba(0,0,0,0.08)]">
          <div className="relative grid gap-8 px-5 py-5 sm:px-8 sm:py-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-10 lg:px-10 lg:py-8">

            {/* ── Left: conversion copy ───────────────────────────────── */}
            <div className="relative min-w-0 space-y-6 pl-5 sm:pl-6">

              <span className="block text-sm font-medium uppercase tracking-widest text-[#2563EB]">
                Conversación directa
              </span>

              <div className="relative max-w-[520px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-4 top-3 h-24 w-64 rounded-full bg-blue-500/15 blur-3xl"
                />
                <h2 className="relative text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-5xl">
                  <span className="block">Habla con el equipo</span>
                  <span className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    y evalúa tu encaje.
                  </span>
                </h2>
              </div>

              <p className="max-w-[480px] text-[17px] leading-relaxed text-slate-700">
                En 20 minutos revisamos tu perfil, tu mercado y tu capacidad de
                inversión. Sin filtros automáticos — solo una conversación
                directa con alguien del equipo.
              </p>

              {/* Proof points — replaces stat circles */}
              <div className="space-y-3 rounded-2xl border border-black/8 bg-slate-50 p-6 shadow-sm">
                {PROOF_POINTS.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 text-[15px] font-medium text-slate-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
                      ✓
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* ── Right: Calendly embed ────────────────────────────────── */}
            <div className="min-w-0">
              <div
                aria-label="Calendly para agendar llamada con el equipo"
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_40px_80px_-30px_rgba(15,23,42,0.25)] transition-all duration-500 hover:shadow-[0_50px_100px_-30px_rgba(15,23,42,0.35)]"
              >
                <iframe
                  title="Calendly — habla con el equipo"
                  src={`${CALENDLY_URL}?hide_event_type_details=1&hide_landing_page_details=1`}
                  className="franchise-calendly__widget w-full rounded-[20px] border-0"
                  loading="lazy"
                  style={{ minWidth: "320px", height: "700px" }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .franchise-calendly__widget {
          min-width: 320px;
          height: 700px;
        }
        @media (max-width: 640px) {
          .franchise-calendly__widget {
            min-width: 100% !important;
            height: 620px !important;
          }
        }
      `}</style>
    </section>
  );
}
