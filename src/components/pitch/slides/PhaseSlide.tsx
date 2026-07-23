"use client";

import { motion } from "framer-motion";
import type { Fase } from "@/config/clients";
import { aparecer } from "../motionPresets";

function BanderaIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
      <path d="M2 13.2V1.2" stroke="var(--pt-acento)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2.8 1.6L10.5 3.9L2.8 6.2Z" fill="var(--pt-acento)" />
    </svg>
  );
}

// Una fase = un hoyo. Solo nombre + misión + beneficio: cero metodología,
// cero entregables — nada reverse-engineerable.
export default function PhaseSlide({
  fase,
  indice,
  total,
}: {
  fase: Fase;
  indice: number;
  total: number;
}) {
  const num = String(indice + 1).padStart(2, "0");
  const tot = String(total).padStart(2, "0");

  return (
    <div className="pt-scroll relative flex h-full flex-col justify-center overflow-y-auto px-7 pb-36 pt-20">
      {/* numeral fantasma de fondo */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 top-[8%] select-none text-[min(44vw,300px)] font-extrabold leading-none tracking-tighter text-white/[0.04]"
      >
        {num}
      </span>

      <div className="relative mx-auto w-full max-w-xl">
        <motion.div
          {...aparecer(0.08)}
          className="mb-6 inline-flex items-center gap-2.5 self-start rounded-full border border-[var(--pt-acento)]/25 bg-[var(--pt-acento)]/[0.06] px-4 py-1.5"
        >
          <BanderaIcon />
          <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--pt-acento)]">
            Hoyo {num}/{tot}
          </span>
        </motion.div>

        <motion.h2
          {...aparecer(0.16)}
          className="text-[clamp(2.5rem,12vw,4.6rem)] font-extrabold uppercase leading-[0.96] tracking-tight"
        >
          {fase.nombre}
        </motion.h2>

        <div className="mt-9 space-y-7">
          <motion.div {...aparecer(0.28)}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--pt-muted)]">
              Misión
            </p>
            <p className="text-pretty text-[clamp(1.05rem,4.6vw,1.35rem)] font-medium leading-snug">
              {fase.mision}
            </p>
          </motion.div>

          <motion.div {...aparecer(0.4)} className="border-l-2 border-[var(--pt-acento)] pl-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--pt-acento)]">
              Lo que ganas
            </p>
            <p className="text-pretty text-[clamp(1rem,4.2vw,1.25rem)] leading-snug text-[var(--pt-blanco)]/90">
              {fase.beneficio}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
