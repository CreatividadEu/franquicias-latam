"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { ClientConfig } from "@/config/clients";

// ── Intro: putt de minigolf 100% SVG/CSS + Framer Motion ─────────────────────
// Línea de tiempo (s):
//   0.00–0.55  entra el putter por la izquierda
//   0.55–0.95  backswing
//   0.95–1.10  golpe
//   1.06–2.66  la bola cruza hasta el hoyo (centro) con trail de motion blur
//   2.66–3.06  cae al hoyo
//   2.95–3.95  ripples concéntricos del acento
//   3.05–      del hoyo emerge el logo del cliente (spring, scale + fade)
//   4.60       fin → auto-avance (skippeable con tap en cualquier momento)

const EASE_RODAR: [number, number, number, number] = [0.1, 0.65, 0.3, 1];

export default function IntroSlide({
  client,
  reduce,
  onFin,
}: {
  client: ClientConfig;
  reduce: boolean;
  onFin: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onFin, reduce ? 2600 : 4600);
    return () => window.clearTimeout(t);
  }, [onFin, reduce]);

  if (reduce) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-8">
        <motion.img
          src={client.logoSrc}
          alt={client.nombre}
          className="h-20 w-auto max-w-[76vw] object-contain"
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.p
          className="text-center text-[11px] uppercase tracking-[0.4em] text-[var(--pt-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {client.tagline}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* “green”: brillo mínimo bajo la línea de suelo */}
      <div
        className="absolute inset-x-0 bottom-0 top-[64%]"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--pt-acento) 6%, transparent), transparent 55%)",
        }}
      />
      <div className="absolute inset-x-0 top-[64%] h-px bg-white/10" />

      {/* hoyo (centro de pantalla) */}
      <svg
        className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2"
        width="104"
        height="36"
        viewBox="0 0 104 36"
        aria-hidden
      >
        <ellipse cx="52" cy="18" rx="36" ry="10.5" fill="#040604" />
        <ellipse cx="52" cy="18" rx="36" ry="10.5" fill="none" stroke="rgba(244,247,240,0.16)" strokeWidth="1.2" />
        <ellipse cx="52" cy="15" rx="29" ry="7" fill="rgba(0,0,0,0.85)" />
      </svg>

      {/* ripples concéntricos al embocar */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-[64%] h-5 w-5 rounded-full border"
          style={{ borderColor: "var(--pt-acento)", x: "-50%", y: "-50%" }}
          initial={{ opacity: 0, scaleX: 0.5, scaleY: 0.2 }}
          animate={{
            opacity: [0, 0.75 - i * 0.15, 0],
            scaleX: [0.5, 2.3 + i * 1.4, 4 + i * 2],
            scaleY: [0.2, (2.3 + i * 1.4) * 0.4, (4 + i * 2) * 0.4],
          }}
          transition={{ delay: 2.95 + i * 0.17, duration: 0.95, times: [0, 0.4, 1], ease: "easeOut" }}
        />
      ))}

      {/* putter: entra, backswing, golpe, se esfuma */}
      <motion.div
        className="absolute left-1/2 top-[64%]"
        style={{ originX: 0.5, originY: 0 }}
        initial={{ x: "-64vw", y: -176, rotate: 0, opacity: 0 }}
        animate={{
          x: ["-64vw", "-47vw", "-47vw", "-47vw", "-47vw"],
          rotate: [0, 0, -32, 14, 9],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{ duration: 1.9, times: [0, 0.29, 0.5, 0.58, 1], ease: "easeInOut" }}
      >
        <svg width="44" height="180" viewBox="0 0 44 180" className="-translate-x-1/2" aria-hidden>
          <rect x="17" y="0" width="10" height="34" rx="5" fill="#5c665a" />
          <line x1="22" y1="30" x2="22" y2="150" stroke="#aeb9a8" strokeWidth="4" strokeLinecap="round" />
          <rect x="4" y="149" width="36" height="15" rx="7" fill="var(--pt-acento)" />
          <rect x="8" y="152" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
        </svg>
      </motion.div>

      {/* bola: rueda hasta el hoyo con trail sutil, y cae */}
      <motion.div
        className="absolute left-1/2 top-[64%]"
        initial={{ x: "-42vw" }}
        animate={{
          x: ["-42vw", "0vw", "0vw"],
          y: [0, 0, 15],
          scale: [1, 1, 0.4],
          opacity: [1, 1, 0],
        }}
        transition={{ delay: 1.06, duration: 2.0, times: [0, 0.8, 1], ease: [EASE_RODAR, "easeIn"] }}
      >
        {/* trail: motion blur sutil detrás de la bola */}
        <motion.div
          className="absolute right-[2px] top-[-14px] h-[8px] w-24 rounded-full"
          style={{
            background: "linear-gradient(to left, rgba(244,247,240,0.55), transparent)",
            filter: "blur(5px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.3, 0] }}
          transition={{ delay: 1.06, duration: 1.7, times: [0, 0.12, 0.55, 1] }}
        />
        {/* la bola gira mientras rueda (hoyuelos) */}
        <motion.div
          className="relative -ml-[9px] -mt-[18px] h-[18px] w-[18px] rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #ffffff, #dde3d8 62%, #b3bcac)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
          }}
          animate={{ rotate: [0, 680, 700] }}
          transition={{ delay: 1.06, duration: 2.0, times: [0, 0.8, 1], ease: ["easeOut", "easeIn"] }}
        >
          <span className="absolute left-[4px] top-[8px] h-[2.5px] w-[2.5px] rounded-full bg-black/20" />
          <span className="absolute left-[10px] top-[5px] h-[2px] w-[2px] rounded-full bg-black/15" />
          <span className="absolute left-[9px] top-[11px] h-[2px] w-[2px] rounded-full bg-black/15" />
        </motion.div>
      </motion.div>

      {/* del hoyo emerge el logo del cliente */}
      <div className="absolute left-1/2 top-[31%] z-10 w-[min(78vw,360px)] -translate-x-1/2 -translate-y-1/2">
        <motion.img
          src={client.logoSrc}
          alt={client.nombre}
          className="mx-auto h-auto w-full object-contain"
          draggable={false}
          initial={{ opacity: 0, y: "36vh", scale: 0.35 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 3.05, type: "spring", stiffness: 120, damping: 16, mass: 0.9 }}
        />
        <motion.p
          className="mt-5 text-center text-[11px] uppercase tracking-[0.4em] text-[var(--pt-muted)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.65, duration: 0.5 }}
        >
          {client.tagline}
        </motion.p>
      </div>

      {/* hint para saltar */}
      <motion.p
        className="absolute inset-x-0 bottom-9 text-center text-[10px] uppercase tracking-[0.3em] text-[var(--pt-blanco)]/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        toca para saltar
      </motion.p>
    </div>
  );
}
