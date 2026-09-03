// Presets de animación del Sandbox (§5): transición de fase = deslizamiento
// horizontal + fade de 200ms; entradas = fade + rise. Nada rebota.

export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
export const EASE_SLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** Fade + rise para contenido interno, con retraso escalonado. */
export const rise = (delay = 0, distance = 14) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: EASE },
});

/** Variantes de la fase; `custom` es la dirección (1 adelante, -1 atrás). */
export function phaseVariants(reduce: boolean) {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: (direction: 1 | -1) => ({ opacity: 0, x: 56 * direction }),
    animate: { opacity: 1, x: 0 },
    exit: (direction: 1 | -1) => ({ opacity: 0, x: -56 * direction }),
  };
}

export const PHASE_TRANSITION = {
  x: { duration: 0.38, ease: EASE_SLIDE },
  opacity: { duration: 0.2 },
};
