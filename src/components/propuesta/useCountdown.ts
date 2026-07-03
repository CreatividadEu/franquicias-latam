"use client";

import { useEffect, useState } from "react";

export type CountdownState = {
  /** false hasta el primer tick en cliente (SSR-safe, sin hydration mismatch) */
  ready: boolean;
  expired: boolean;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  /** Fracción restante de la ventana total (para anillos de progreso), 0..1 */
  fraccion: number;
};

const INITIAL: CountdownState = {
  ready: false,
  expired: false,
  dias: 0,
  horas: 0,
  minutos: 0,
  segundos: 0,
  fraccion: 1,
};

/**
 * Countdown anclado a un deadline FIJO por cliente (ISO). Se calcula el
 * restante contra ese timestamp → no se reinicia al refrescar.
 * `createdAtIso` define la ventana total para el anillo de progreso.
 */
export function useCountdown(
  deadlineIso: string,
  createdAtIso?: string,
): CountdownState {
  const [state, setState] = useState<CountdownState>(INITIAL);

  useEffect(() => {
    const deadline = new Date(deadlineIso).getTime();
    const inicio = createdAtIso ? new Date(createdAtIso).getTime() : NaN;
    const ventana = Number.isFinite(inicio) ? deadline - inicio : NaN;

    const tick = () => {
      const restante = deadline - Date.now();
      if (restante <= 0) {
        setState({ ...INITIAL, ready: true, expired: true, fraccion: 0 });
        return;
      }
      setState({
        ready: true,
        expired: false,
        dias: Math.floor(restante / 86_400_000),
        horas: Math.floor(restante / 3_600_000) % 24,
        minutos: Math.floor(restante / 60_000) % 60,
        segundos: Math.floor(restante / 1_000) % 60,
        fraccion:
          Number.isFinite(ventana) && ventana > 0
            ? Math.min(1, Math.max(0, restante / ventana))
            : 1,
      });
    };

    tick();
    const id = window.setInterval(tick, 1_000);
    return () => window.clearInterval(id);
  }, [deadlineIso, createdAtIso]);

  return state;
}

/** "6d 23h 12m" — con padding para no saltar de ancho. */
export function formatRestante(c: CountdownState): string {
  if (!c.ready) {
    return "—";
  }
  if (c.expired) {
    return "0d 00h 00m";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${c.dias}d ${pad(c.horas)}h ${pad(c.minutos)}m`;
}
