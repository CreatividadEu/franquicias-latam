"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HeroData } from "@/lib/franchise-mapper";

export function CtaFooterSection({ franchise }: { franchise: HeroData | null }) {
  const name = franchise?.name ?? "esta franquicia";
  const cta1Label = franchise?.cta1Label ?? "Quiero saber más";
  const cta1Url = franchise?.cta1Url ?? "/quiz";

  return (
    <section
      className="relative overflow-hidden bg-[#0A0F1E] py-24 md:py-32"
      aria-label="CTA final"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "rgba(0,240,255,0.05)", filter: "blur(140px)" }}
      />
      {/* Subtle top border gradient */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(0,240,255,0.2), transparent)" }}
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
            <p className="text-xs font-medium uppercase tracking-widest text-[#00F0FF]">
              Próximo paso
            </p>
            <h2
              className="text-3xl font-bold leading-tight text-[#F0F0F5] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
            >
              ¿Listo para avanzar con {name}?
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#8A8F9E] sm:text-base">
              Un solo paso para validar tu encaje, resolver tus dudas y activar el proceso con el equipo de franquicia.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={cta1Url}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[#00F0FF] px-8 py-4 text-sm font-semibold text-[#0A0F1E] transition-all hover:brightness-110 active:scale-95"
            >
              {cta1Label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs text-[#8A8F9E]">
            Sin compromiso · Respuesta en 24–48 h
          </p>
        </motion.div>
      </div>
    </section>
  );
}
