"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Movimiento del microsite, sin librerías: IntersectionObserver para los
 * reveals, requestAnimationFrame para contadores y barra de progreso.
 * Todo lo de aquí consulta `prefers-reduced-motion` y degrada a estado final.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** `true` si el sistema pide menos movimiento. Reactivo al cambio de ajuste. */
export function useReducedMotion(): boolean {
  // El servidor no conoce la preferencia: entrega `false` y el cliente corrige
  // en la hidratación, antes de que nada se haya animado.
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Media query reactiva. En el servidor responde `false`, así que el HTML sale
 * siempre con la variante ancha y el cliente la corrige al hidratar.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type InViewOptions = {
  /** Fracción visible que dispara el reveal. */
  threshold?: number;
  /** Margen del observador, para adelantar o atrasar la entrada. */
  rootMargin?: string;
  /** Si es `false`, vuelve a ocultarse al salir del viewport. */
  once?: boolean;
};

/** Marca un elemento como visto cuando entra al viewport. */
export function useInView<T extends HTMLElement>(
  { threshold = 0.18, rootMargin = "0px 0px -8% 0px", once = true }: InViewOptions = {},
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Sin IntersectionObserver no hay reveal posible: se muestra todo. La
    // revelación va diferida para no encadenar un render sincrónico extra.
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Contador con easing. Solo corre cuando `active` es `true`; con
 * `prefers-reduced-motion` entrega el valor final de una vez.
 */
export function useCountUp(target: number, active: boolean, duration = 1800): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  // Sin animación no hay estado que sincronizar: el valor se deriva del render.
  const jump = reduced || duration <= 0;

  useEffect(() => {
    if (!active || jump) return;

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo: arranca rápido y aterriza sin rebote.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, jump]);

  if (!active) return 0;
  return jump ? target : value;
}

/**
 * Progreso de lectura (0–1) aplicado directamente al nodo, sin re-render:
 * el scroll es el evento más caliente de la página.
 */
export function useScrollProgress(): React.RefObject<HTMLDivElement | null> {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      if (barRef.current) barRef.current.style.width = `${ratio * 100}%`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return barRef;
}

/**
 * Acto visible. Observa todo `[data-act]` dentro del contenedor y se queda con
 * el que más arriba esté cruzando la franja de lectura.
 */
export function useActiveAct<K extends string>(fallback: K): K {
  const [act, setAct] = useState<K>(fallback);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-act]"));
    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") return;

    const visible = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(node);
          else visible.delete(node);
        }
        // El acto vigente es el primero en orden de documento que sigue a la vista.
        const current = nodes.find((node) => visible.has(node));
        const id = current?.dataset.act as K | undefined;
        if (id) setAct(id);
      },
      // Franja de lectura ancha: en móvil las secciones cortas del final —el
      // cierre— también tienen que alcanzar a marcar su acto.
      { rootMargin: "-32% 0px -32% 0px", threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return act;
}

/**
 * Tipeo del terminal. Devuelve cuántas líneas ya se imprimieron y si terminó.
 * Con `prefers-reduced-motion` imprime todo de una.
 */
export function useTypedLines(total: number, active: boolean, msPerLine = 180) {
  const reduced = useReducedMotion();
  const [printed, setPrinted] = useState(0);

  useEffect(() => {
    if (!active || reduced) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const next = (n: number) => {
      if (cancelled) return;
      setPrinted(n);
      if (n >= total) return;
      // Ritmo irregular: las líneas de resultado caen más rápido que las de
      // arranque, como en una terminal real.
      const jitter = n % 3 === 0 ? msPerLine : msPerLine * 0.55;
      timer = setTimeout(() => next(n + 1), jitter);
    };

    timer = setTimeout(() => next(1), 260);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [total, active, msPerLine, reduced]);

  // Sin movimiento el terminal ya está impreso; sin consola a la vista, vacío.
  const shown = !active ? 0 : reduced ? total : printed;
  return { printed: shown, done: shown >= total };
}

/** Ancla suave que respeta `prefers-reduced-motion`. */
export function useAnchorScroll() {
  const reduced = useReducedMotion();

  return useCallback(
    (selector: string) => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduced],
  );
}
