"use client";

import { motion } from "framer-motion";
import type { ClientConfig } from "@/config/clients";
import { hexAlpha, track } from "@/lib/pitch";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

// Botón de pago que pulsa en loop (scale 1 → 1.06 → 1 + glow que respira).
// Elegante, ciclo lento — sexy, no epiléptico.
export default function PayButton({ client }: { client: ClientConfig }) {
  const reduce = useReducedMotionSafe();
  const glowBaja = `0 0 26px -8px ${hexAlpha(client.acento, 0.45)}`;
  const glowAlta = `0 10px 48px -6px ${hexAlpha(client.acento, 0.7)}`;

  return (
    <motion.a
      href={client.checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
        track("pay_click", client.slug);
      }}
      className="relative z-10 inline-flex items-center gap-2.5 rounded-full bg-[var(--pt-acento)] px-9 py-4 text-[15px] font-bold tracking-tight text-[var(--pt-bg)]"
      style={reduce ? { boxShadow: glowBaja } : undefined}
      animate={reduce ? undefined : { scale: [1, 1.06, 1], boxShadow: [glowBaja, glowAlta, glowBaja] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      whileTap={{ scale: 0.97 }}
    >
      Separar mi cupo · {client.precioLabel}
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
        <path d="M2.5 7.5h9M8 4l3.5 3.5L8 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.a>
  );
}
