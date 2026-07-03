"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { EASE_OUT } from "./motion";

type FloatingCtaProps = {
  visible: boolean;
  expired: boolean;
  mesObjetivo: string;
  onClick: () => void;
};

/** CTA flotante discreto pero siempre alcanzable → ancla al cierre. */
export function FloatingCta({
  visible,
  expired,
  mesObjetivo,
  onClick,
}: FloatingCtaProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          onClick={onClick}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          whileHover={reduced ? undefined : { y: -2 }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-fl-base shadow-[0_8px_32px_-8px_rgb(var(--acc-rgb)/0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)] sm:bottom-6 sm:right-6 sm:text-sm"
          style={{ background: "var(--acc)" }}
        >
          {expired ? "Solicitar disponibilidad" : `Confirmar cupo · ${mesObjetivo}`}
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
