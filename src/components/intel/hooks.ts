"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** useLayoutEffect en el cliente, useEffect en el servidor (evita el warning). */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ── prefers-reduced-motion ───────────────────────────────────────────────────
// La media query es un store externo: useSyncExternalStore la lee en el mismo
// render (sin efecto ni cascada) y devuelve false en el servidor, así que la
// hidratación coincide.

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(REDUCED_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedMotionSnapshot(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(REDUCED_QUERY).matches
    : false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, reducedMotionSnapshot, () => false);
}

/**
 * Interpola hacia `target` en ~250 ms (ease-out cúbico). Con reduced-motion el
 * número salta al valor final sin animar.
 */
export function useAnimatedNumber(target: number, duration = 250): number {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Sin animación no hay estado que sincronizar: el valor devuelto ya salta
    // directo al objetivo, así que basta con dejar la referencia al día.
    if (reduced || duration <= 0) {
      currentRef.current = target;
      return;
    }

    const from = currentRef.current;
    if (Math.abs(from - target) < 1e-9) return;

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      currentRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return reduced || duration <= 0 ? target : value;
}

/**
 * Ancho real del contenedor. El gráfico se dibuja en píxeles y no escalado por
 * viewBox, para que las etiquetas del eje conserven su tamaño en cualquier
 * pantalla. `fallback` es el ancho con el que renderiza el servidor.
 */
export function useElementWidth<T extends HTMLElement>(
  fallback: number,
): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);

  // Antes del primer pintado: así el gráfico no aparece nunca con el ancho de
  // reserva y luego salta al real.
  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => setWidth(node.clientWidth || fallback);
    measure();

    // ResizeObserver cubre los cambios de layout (rail que colapsa, columna que
    // cambia de ancho); resize/orientationchange son la red de seguridad para
    // entornos donde el observer no dispara.
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [fallback]);

  return [ref, width];
}
