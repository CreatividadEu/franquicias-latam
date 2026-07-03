"use client";

import { useState, useEffect } from "react";

export type CountdownState = {
  /** false hasta el primer tick en cliente (SSR-safe, sin hydration mismatch) */
  ready: boolean;
  expired: boolean;
  dias: number;
  horas: number;
  minutos: number;
  /** Fracción restante de la ventana total (para anillos de progreso), 0..1 */
  fraccion: number;
};

const INITIAL: CountdownState = {
  ready: false,
  expired: false,
  dias: 0,
  horas: 0,
  minutos: 0,
  fraccion: 1,
};

const EXPIRED: CountdownState = {
  ready: true,
  expired: true,
  dias: 0,
  horas: 0,
  minutos: 0,
  fraccion: 0,
};

/**
 * Countdown anclado a un deadline FIJO por cliente (ISO). Se calcula el
 * restante contra ese timestamp → no se reinicia al refrescar.
 * `initialExpired` viene resuelto del server para que una propuesta ya
 * vencida renderice el estado expirado desde el primer frame (sin flash
 * de oferta activa). Solo setea estado cuando cambia algo visible
 * (minutos), no en cada tick.
 */
export function useCountdown(
  deadlineIso: string,
  createdAtIso?: string,
  initialExpired = false,
): CountdownState {
  const [state, setState] = useState<CountdownState>(
    initialExpired ? EXPIRED : INITIAL,
  );

  useEffect(() => {
    const deadline = new Date(deadlineIso).getTime();
    const inicio = createdAtIso ? new Date(createdAtIso).getTime() : NaN;
    const ventana = Number.isFinite(inicio) ? deadline - inicio : NaN;

    const tick = () => {
      const restante = deadline - Date.now();
      if (restante <= 0) {
        setState(EXPIRED);
        // Deadline fijo: expirado es terminal, no hay nada más que contar.
        window.clearInterval(id);
        return;
      }
      const next: CountdownState = {
        ready: true,
        expired: false,
        dias: Math.floor(restante / 86_400_000),
        horas: Math.floor(restante / 3_600_000) % 24,
        minutos: Math.floor(restante / 60_000) % 60,
        fraccion:
          Number.isFinite(ventana) && ventana > 0
            ? Math.min(1, Math.max(0, restante / ventana))
            : 1,
      };
      // Nada visible cambia dentro del mismo minuto: devolver prev hace
      // que React se salte el re-render (el tick corre cada segundo solo
      // para no atrasarse hasta 59s en el cambio de minuto).
      setState((prev) =>
        prev.ready === next.ready &&
        prev.expired === next.expired &&
        prev.dias === next.dias &&
        prev.horas === next.horas &&
        prev.minutos === next.minutos
          ? prev
          : next,
      );
    };

    // El interval se crea antes del tick inicial para que `id` exista
    // cuando tick necesite cancelarlo (expiración inmediata).
    const id = window.setInterval(tick, 1_000);
    tick();
    return () => window.clearInterval(id);
  }, [deadlineIso, createdAtIso]);

  return state;
}

/** "6d 23h 12m" — placeholder del mismo ancho antes del primer tick. */
export function formatRestante(c: CountdownState): string {
  if (!c.ready) {
    return "–d ––h ––m";
  }
  if (c.expired) {
    return "0d 00h 00m";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${c.dias}d ${pad(c.horas)}h ${pad(c.minutos)}m`;
}
