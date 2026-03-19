"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HeroData } from "@/lib/franchise-mapper";

export function CtaFooterSection({ franchise }: { franchise: HeroData | null }) {
  const name = franchise?.name ?? "esta franquicia";
  const cta1Label = franchise?.cta1Label ?? "Quiero saber más";
  const cta1Url = franchise?.cta1Url ?? "/quiz";
  const isInterestFlow = franchise?.usesInterestFlow ?? false;
  const headline = !franchise
    ? `¿Listo para avanzar con ${name}?`
    : franchise.listingType === "IDENTIFIED_BRAND"
    ? `¿Quieres que exploremos ${name}?`
    : franchise.listingType === "EXTERNAL_FRANCHISE"
    ? `¿Te interesa evaluar ${name}?`
    : `¿Listo para avanzar con ${name}?`;
  const description = !franchise
    ? "Un solo paso para validar tu encaje, resolver tus dudas y activar el proceso con el equipo de franquicia."
    : isInterestFlow
    ? "Comparte tu ciudad, tu rango de inversión y el contexto de interés. Priorizaremos la conversación desde señales reales de demanda."
    : "Un solo paso para validar tu encaje, resolver tus dudas y activar el proceso con el equipo de franquicia.";
  const footnote = isInterestFlow
    ? "Sin ruido comercial · Priorización editorial y comercial en 24-48 h"
    : "Sin compromiso · Respuesta en 24-48 h";

  return (
    <section
      className="section-grid-bg relative overflow-hidden bg-white py-24 md:py-32"
      aria-label="CTA final"
    >
      {/* Subtle top border */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(37,99,235,0.25), transparent)" }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
              Próximo paso
            </p>
            <h2
              className="text-3xl font-bold leading-tight text-[#171717] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
            >
              {headline}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {description}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={cta1Url}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.6)] active:scale-95"
            >
              {cta1Label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">{footnote}</p>
        </motion.div>
      </div>
    </section>
  );
}
