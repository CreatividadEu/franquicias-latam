"use client";

import { formatRestante, type CountdownState } from "./useCountdown";

type CountdownPillProps = {
  countdown: CountdownState;
  mesObjetivo: string;
  descuentoPct: number;
};

/**
 * Pill fija (esquina superior derecha), siempre visible.
 * Al expirar, degrada con gracia: sin descuento, sin estado roto.
 */
export function CountdownPill({
  countdown,
  mesObjetivo,
  descuentoPct,
}: CountdownPillProps) {
  return (
    <div
      className="fixed right-3 top-3 z-40 rounded-full border border-white/10 bg-fl-base/85 px-3.5 py-1.5 text-[11px] font-medium text-fl-muted shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md sm:right-5 sm:top-4 sm:text-xs"
      role="status"
    >
      {countdown.expired ? (
        <span>
          Cupo {mesObjetivo} · <span className="text-fl-text">consultar disponibilidad</span>
        </span>
      ) : (
        <span>
          Cupo {mesObjetivo} ·{" "}
          <span style={{ color: "var(--acc)" }}>{descuentoPct}% dcto</span>
          {" · "}
          {/* formatRestante devuelve placeholder del mismo ancho antes
             del primer tick — la pill no salta al hidratar */}
          <span className="tabular-nums text-fl-text">
            termina en {formatRestante(countdown)}
          </span>
        </span>
      )}
    </div>
  );
}
