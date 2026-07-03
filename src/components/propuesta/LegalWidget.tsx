"use client";

import { motion, type Variants } from "framer-motion";
import { Scale } from "lucide-react";
import { CountUp } from "@/components/propuesta/CountUp";
import { EASE_OUT, fadeUp, VIEWPORT_ONCE } from "@/components/propuesta/motion";

/** Vértices de un hexágono regular como string para <polygon points>. */
function hexPoints(cx: number, cy: number, r: number, rotationDeg = 0): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((rotationDeg + i * 60 - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/** Fade + scale-in escalonado para cada anillo del perímetro. */
const ringReveal: Variants = {
  hidden: { opacity: 0, scale: 0.86 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: i * 0.14, ease: EASE_OUT },
  }),
};

const RING_STYLE = {
  transformBox: "fill-box",
  transformOrigin: "center",
} as const;

const formatMarcas = (n: number) =>
  "+" + new Intl.NumberFormat("es-CO").format(Math.round(n));

export function LegalWidget() {

  return (
    <motion.section
      aria-label="Blindaje legal de su marca"
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
      className="w-full"
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          {/* Perímetro de protección */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="relative aspect-square w-full max-w-[300px] shrink-0 sm:max-w-[340px]"
          >
            <svg
              viewBox="0 0 320 320"
              className="h-full w-full"
              aria-hidden="true"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Halo interior, casi imperceptible */}
              <motion.circle
                cx="160"
                cy="160"
                r="92"
                style={{ ...RING_STYLE, fill: "rgb(var(--acc-rgb) / 0.05)" }}
                variants={ringReveal}
                custom={2}
              />
              {/* Anillo exterior */}
              <motion.polygon
                points={hexPoints(160, 160, 148)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                style={RING_STYLE}
                variants={ringReveal}
                custom={0}
              />
              {/* Anillo medio, rotado a mano */}
              <motion.polygon
                points={hexPoints(160, 160, 121, 30)}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1"
                style={RING_STYLE}
                variants={ringReveal}
                custom={1}
              />
              {/* Perímetro activo */}
              <motion.circle
                cx="160"
                cy="160"
                r="94"
                stroke="var(--acc)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
                className="prop-flow"
                opacity="0.9"
                style={RING_STYLE}
                variants={ringReveal}
                custom={2}
              />
            </svg>

            {/* Centro: evidencia */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <CountUp
                value={6000}
                duration={1.4}
                format={formatMarcas}
                className="text-4xl font-bold tracking-tight text-fl-text tabular-nums sm:text-5xl"
              />
              <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
                marcas protegidas
              </span>
            </motion.div>
          </motion.div>

          {/* Indicadores */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="flex w-full flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--acc)]"
            >
              Blindaje de marca
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="max-w-md text-sm leading-relaxed text-fl-muted sm:text-base"
            >
              Su marca queda registrada, vigilada y defendida por el mismo
              equipo jurídico que estructura su franquicia.
            </motion.p>

            {/* Disponibilidad */}
            <motion.div variants={fadeUp} custom={2} className="w-full max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="prop-pulse-dot h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                  />
                  <span className="text-sm font-semibold tracking-tight text-fl-text">
                    Equipo legal en tiempo real
                  </span>
                </div>
                <p className="mt-1.5 pl-[18px] text-sm leading-relaxed text-fl-muted">
                  consultas de alta complejidad, sin las esperas de siempre
                </p>
              </div>
            </motion.div>

            {/* Sello */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2"
            >
              <Scale
                aria-hidden="true"
                className="h-3.5 w-3.5 text-fl-muted"
                strokeWidth={1.5}
              />
              <span className="text-xs font-semibold tracking-tight text-fl-text">
                Seneor Lawyers
              </span>
              <span className="text-xs text-fl-muted">· parte del grupo</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
