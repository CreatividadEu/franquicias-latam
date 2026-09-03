"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * `useReducedMotion` devuelve el valor real en el PRIMER render del cliente,
 * distinto del server → hydration mismatch en los árboles que ramifican por
 * él. Arranca en `false` (idéntico al server) y aplica la preferencia tras el
 * mount; <MotionConfig reducedMotion="user"> cubre el primer frame.
 */
export function useReducedMotionSafe(): boolean {
  const preference = useReducedMotion() ?? false;
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(preference);
  }, [preference]);
  return reduce;
}

/**
 * Reloj de 1s para el modo presentador; parado cuando el panel está cerrado.
 * El componente que lo usa se remonta al abrirse (key), así el valor inicial
 * siempre es fresco sin setState síncrono dentro del efecto.
 */
export function useTicker(active: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
