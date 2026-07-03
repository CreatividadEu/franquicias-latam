"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, phaseReveal, VIEWPORT_ONCE } from "./motion";

type PhaseSectionProps = {
  id: string;
  /** "01".."05" */
  fase: string;
  nombre: string;
  headline: string;
  subcopy: string;
  /** Métrica destacada opcional (valor + label ya compuestos) */
  metric?: ReactNode;
  /** "split": texto + widget lado a lado (default) · "stack": widget ancho debajo */
  layout?: "split" | "stack";
  children: ReactNode;
};

/**
 * Anatomía compartida de cada fase: eyebrow · headline · subcopy ·
 * widget · métrica. Ocupa el viewport (snap-start) y se revela con
 * fade + slide + scale al entrar.
 */
export function PhaseSection({
  id,
  fase,
  nombre,
  headline,
  subcopy,
  metric,
  layout = "split",
  children,
}: PhaseSectionProps) {
  const reduced = useReducedMotion();
  const noMotion = reduced
    ? { initial: "visible" as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: VIEWPORT_ONCE };

  return (
    <section
      id={id}
      className="relative flex min-h-dvh snap-start items-center overflow-hidden"
    >
      <div
        className={
          layout === "split"
            ? "mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-20 pt-24 sm:px-8 md:gap-14 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            : "mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-20 pt-24 sm:px-8 md:py-24"
        }
      >
        <motion.header {...noMotion} variants={fadeUp} className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fl-muted">
            <span className="text-[var(--acc)]">Fase {fase}</span>
            <span aria-hidden="true"> — </span>
            {nombre}
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-tight text-fl-text sm:text-4xl lg:text-5xl">
            {headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fl-muted sm:text-lg">
            {subcopy}
          </p>
          {metric ? <div className="mt-6">{metric}</div> : null}
        </motion.header>

        <motion.div {...noMotion} variants={phaseReveal} className="min-w-0">
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/** Métrica destacada estándar para el slot `metric`. */
export function PhaseMetric({
  valor,
  label,
}: {
  valor: ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-baseline gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-2xl font-bold tracking-tight text-[var(--acc)] sm:text-3xl">
        {valor}
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-fl-muted">
        {label}
      </span>
    </div>
  );
}
