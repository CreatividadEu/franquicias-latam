"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { EASE_OUT } from "./motion";

type HeroProps = {
  cliente: string;
  industria?: string;
  logoUrl?: string;
  onComenzar: () => void;
};

/**
 * Hero a viewport completo: fondo oscuro con aurora sutil + grano,
 * título personalizado y la puerta de entrada a las 5 fases.
 */
export function Hero({ cliente, industria, logoUrl, onComenzar }: HeroProps) {
  const reduced = useReducedMotion();
  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE_OUT },
        };

  return (
    <section
      id="inicio"
      className="relative flex min-h-dvh snap-start items-center justify-center overflow-hidden"
    >
      {/* Aurora: dos radiales que derivan lento — futuro, contenido. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="prop-aurora absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--acc-rgb) / 0.5), transparent 70%)",
          }}
        />
        <div
          className="prop-aurora absolute -bottom-1/3 right-[-10%] h-[70vh] w-[60vw] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(123, 97, 255, 0.45), transparent 70%)",
            animationDelay: "-8s",
          }}
        />
        <div className="prop-noise absolute inset-0" />
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <motion.div {...enter(0.1)} className="flex items-center gap-3">
          <Image
            src="/saju/fl-monogram.png"
            alt="Franquicias LATAM"
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fl-muted">
            Franquicias LATAM · Propuesta privada
          </span>
        </motion.div>

        {logoUrl ? (
          <motion.div {...enter(0.18)} className="mt-10">
            <Image
              src={logoUrl}
              alt={cliente}
              width={220}
              height={88}
              className="h-16 w-auto object-contain sm:h-20"
              priority
            />
          </motion.div>
        ) : null}

        <motion.h1
          {...enter(0.24)}
          className="mt-8 text-4xl font-bold leading-[1.02] tracking-tight text-fl-text sm:text-6xl"
        >
          Hecho a medida para{" "}
          <span className="text-[var(--acc)]">{cliente}</span>.
        </motion.h1>

        <motion.p
          {...enter(0.34)}
          className="mt-5 max-w-xl text-lg leading-relaxed text-fl-muted sm:text-xl"
        >
          El futuro de su red de franquicias. En 5 fases.
        </motion.p>

        {industria ? (
          <motion.span
            {...enter(0.4)}
            className="mt-6 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted"
          >
            {industria}
          </motion.span>
        ) : null}

        <motion.div {...enter(0.48)} className="mt-10">
          <motion.button
            type="button"
            onClick={onComenzar}
            whileHover={reduced ? undefined : { y: -2 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-fl-base transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]"
            style={{
              background: "var(--acc)",
              boxShadow: "0 8px 32px -8px rgb(var(--acc-rgb) / 0.55)",
            }}
          >
            Comenzar
          </motion.button>
        </motion.div>

        <motion.button
          {...enter(0.6)}
          type="button"
          onClick={onComenzar}
          aria-label="Ir a la Fase 01"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2 text-fl-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]"
        >
          <span className="prop-scroll-hint block">
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </span>
        </motion.button>
      </div>
    </section>
  );
}
