"use client";

import { useEffect, useRef, useState } from "react";
import { HERO } from "@/lib/intel/copy";
import { copPrecise, mShort, num } from "@/lib/intel/format";
import { useReducedMotion } from "./hooks";

const SECONDS_PER_YEAR = 31_536_000;
const TICK_MS = 120;

/**
 * Contador de la hemorragia: reparte el daño anual del escenario de inacción
 * segundo a segundo y acumula desde que la página se abrió. Arranca en 0 tanto
 * en el servidor como en el cliente, así que no hay desajuste de hidratación.
 */
export default function HeroTicker({ danoPL }: { danoPL: number }) {
  // danoPL viene en COP M; el ticker cuenta pesos nominales.
  const perSecond = (danoPL * 1e6) / SECONDS_PER_YEAR;
  const perDay = (danoPL * 1e6 * 86_400) / SECONDS_PER_YEAR;

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    startRef.current = performance.now();
    const id = window.setInterval(() => {
      if (startRef.current === null) return;
      setElapsed((performance.now() - startRef.current) / 1000);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const accrued = perSecond * elapsed;

  return (
    <section className="intel-card intel-rule-bleed intel-card-pad" aria-labelledby="hero-ticker">
      <p className="intel-eyebrow flex items-center gap-2.5" id="hero-ticker">
        <span className="intel-dot" aria-hidden style={reduced ? { animation: "none" } : undefined} />
        {HERO.eyebrow}
      </p>

      <p
        className="mono mt-4 leading-[1.02]"
        style={{
          color: "var(--bleed)",
          fontSize: "clamp(44px, 8.2vw, 72px)",
          letterSpacing: "-0.03em",
          fontWeight: 500,
        }}
      >
        <span className="sr-only">{HERO.label}: </span>
        <span aria-live="off">{copPrecise(accrued)}</span>
      </p>

      <p className="intel-body mt-4 max-w-[62ch]">
        Equivale a{" "}
        <span className="mono" style={{ color: "var(--text)" }}>
          {copPrecise(perSecond)}
        </span>
        /segundo,{" "}
        <span className="mono" style={{ color: "var(--text)" }}>
          COP {num(perDay / 1e6)} M
        </span>
        /día contra el P&amp;L de la marca en Colombia.
      </p>

      <p className="intel-hint mt-2">
        {HERO.hint} Base anual: <span className="mono">COP {mShort(danoPL)}</span>.
      </p>
    </section>
  );
}
