"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

// Animación golf ambiental del cierre: cada ~6.4s una bola entra rodando en un
// pequeño arco, cae en el hoyo y dispara un mini ripple del acento. Loop
// infinito, sutil. Con reduced motion queda la escena estática.
//
// Geometría (contenedor fijo de 280×64 para que los px cuadren):
//   suelo y=44 · hoyo cx=228 · la bola (10px) viaja de x=-6 a x=223.
const DUR = 6.4;

export default function AmbientGolf() {
  const reduce = useReducedMotionSafe();

  return (
    <div aria-hidden className="pointer-events-none relative mx-auto h-16 w-[280px] opacity-80">
      {/* línea de suelo */}
      <div className="absolute inset-x-2 top-[44px] h-px bg-white/10" />

      {/* hoyo + bandera */}
      <svg className="absolute left-[180px] top-0 h-16 w-24 overflow-visible" viewBox="0 0 96 64">
        <ellipse cx="48" cy="44" rx="13" ry="4.2" fill="#040604" stroke="rgba(244,247,240,0.16)" strokeWidth="1" />
        <line x1="48" y1="43" x2="48" y2="10" stroke="rgba(244,247,240,0.55)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M48 10 L65 15 L48 20 Z" fill="var(--pt-acento)" />
        {!reduce && (
          <motion.ellipse
            cx="48"
            cy="44"
            rx="13"
            ry="4.2"
            fill="none"
            stroke="var(--pt-acento)"
            strokeWidth="1.3"
            style={{ transformOrigin: "48px 44px" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0, 0.65, 0], scale: [0.5, 0.5, 1.9, 2.7] }}
            transition={{ duration: DUR, times: [0, 0.37, 0.47, 0.6], repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </svg>

      {/* bola */}
      {reduce ? (
        <div className="absolute left-[70px] top-[36px] h-2.5 w-2.5 rounded-full bg-[var(--pt-blanco)] opacity-80" />
      ) : (
        <motion.div
          className="absolute left-0 top-[36px]"
          initial={{ x: -6, opacity: 0 }}
          animate={{
            x: [-6, 223, 223, 223],
            y: [0, 0, 7, 7],
            scale: [1, 1, 0.4, 0.4],
            opacity: [0, 1, 0, 0],
          }}
          transition={{
            duration: DUR,
            times: [0, 0.34, 0.41, 1],
            repeat: Infinity,
            ease: ["easeOut", "easeIn", "linear"],
          }}
        >
          {/* arco sutil del rodado */}
          <motion.div
            className="h-2.5 w-2.5 rounded-full bg-[var(--pt-blanco)] shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
            animate={{ y: [0, -9, 0, 0] }}
            transition={{ duration: DUR, times: [0, 0.12, 0.26, 1], repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </div>
  );
}
