import type { Variants } from "framer-motion";

/**
 * Lenguaje de movimiento del sandbox de propuesta.
 * Solo transform/opacity (60fps). Todo componente que anime debe
 * degradar a estado final con useReducedMotion().
 */

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;

/** Entrada estándar: fade + slide. `custom` = índice de stagger. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: EASE_OUT },
  }),
};

/** Revelación de fase: fade + slide + scale suave (el "momento wow"). */
export const phaseReveal: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const SPRING_SNAPPY = {
  type: "spring",
  stiffness: 380,
  damping: 32,
} as const;
