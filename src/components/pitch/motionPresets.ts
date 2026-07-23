// Presets compartidos de animación del pitch.

/** Easing suave de entrada (cubic-bezier). */
export const EASE_SUAVE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/** Easing de la transición entre slides. */
export const EASE_SLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** Fade + rise para contenido interno de slides, con retraso escalonado. */
export const aparecer = (retraso: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: retraso, duration: 0.55, ease: EASE_SUAVE },
});
