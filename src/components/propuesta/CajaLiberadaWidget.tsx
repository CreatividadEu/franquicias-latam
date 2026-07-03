"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useId, useMemo, useRef, useState } from "react";
import { formatCOPMillones, mesInflexionEfectivo } from "@/lib/propuestas/format";
import type { ProposalFinanzas } from "@/lib/propuestas/types";
import { CountUp } from "./CountUp";
import { EASE_OUT } from "./motion";

/* Geometría del chart (viewBox fijo, escala fluida). Labels legibles
   van en HTML para que no se encojan en móvil. */
const W = 640;
const H = 300;
const PAD_T = 22;
const PAD_B = 14;
const PAD_X = 8;

function xDe(mes: number): number {
  return PAD_X + ((mes - 1) / 11) * (W - PAD_X * 2);
}

/** Redondea a múltiplos de $5 M para bounds limpios del slider. */
function a5M(n: number): number {
  return Math.max(5_000_000, Math.round(n / 5_000_000) * 5_000_000);
}

type CajaLiberadaWidgetProps = {
  finanzas: ProposalFinanzas;
};

/**
 * Widget "Caja liberada": dos series (Hoy vs Con Franquicias LATAM),
 * step-up en el mes de inflexión, área acumulada rellena con el acento
 * y slider de ventas que recalcula todo en vivo.
 */
export function CajaLiberadaWidget({ finanzas }: CajaLiberadaWidgetProps) {
  const gradId = useId();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const revealed = reduced || inView;

  const [ventas, setVentas] = useState(finanzas.ventasMensuales);
  const min = a5M(finanzas.ventasMensuales * 0.3);
  const max = a5M(finanzas.ventasMensuales * 2.5);

  const {
    mesInflexion,
    utilidadActualPct,
    utilidadOptimizadaPct,
    paybackMeses,
  } = finanzas;

  const modelo = useMemo(() => {
    const vHoy = (ventas * utilidadActualPct) / 100;
    const vOpt = (ventas * utilidadOptimizadaPct) / 100;
    // Mismo clamp que usa el headline de la fase — chart, cifra y copy
    // cuentan la misma historia (mi=1 → optimizado desde el mes 1).
    const mi = mesInflexionEfectivo(mesInflexion);
    const yMax = vOpt * 1.35;
    const yDe = (v: number) => PAD_T + (1 - v / yMax) * (H - PAD_T - PAD_B);

    const yHoy = yDe(vHoy);
    const yOpt = yDe(vOpt);
    const pathHoy = `M ${xDe(1)} ${yHoy} L ${xDe(12)} ${yHoy}`;
    const pathFlatam =
      mi === 1
        ? `M ${xDe(1)} ${yOpt} L ${xDe(12)} ${yOpt}`
        : `M ${xDe(1)} ${yHoy} L ${xDe(mi - 1)} ${yHoy} L ${xDe(mi)} ${yOpt} L ${xDe(12)} ${yOpt}`;
    const areaCaja =
      mi === 1
        ? `M ${xDe(1)} ${yHoy} L ${xDe(1)} ${yOpt} L ${xDe(12)} ${yOpt} L ${xDe(12)} ${yHoy} Z`
        : `M ${xDe(mi - 1)} ${yHoy} L ${xDe(mi)} ${yOpt} L ${xDe(12)} ${yOpt} L ${xDe(12)} ${yHoy} Z`;
    // Meses completos a nivel optimizado dentro de la ventana de 12.
    const cajaLiberada = (vOpt - vHoy) * (13 - mi);

    return { vHoy, vOpt, yHoy, yOpt, pathHoy, pathFlatam, areaCaja, cajaLiberada, mi };
  }, [ventas, utilidadActualPct, utilidadOptimizadaPct, mesInflexion]);

  const payback =
    paybackMeses && paybackMeses >= 1 && paybackMeses <= 12
      ? paybackMeses
      : null;

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
    >
      {/* Leyenda viva: se actualiza con el slider */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-2 text-xs text-fl-muted">
          <span className="h-0.5 w-5 rounded-full bg-white/30" aria-hidden="true" />
          Hoy · <span className="font-semibold tabular-nums text-fl-text">{formatCOPMillones(modelo.vHoy)}/mes</span>
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-fl-muted">
          <span className="h-0.5 w-5 rounded-full" style={{ background: "var(--acc)" }} aria-hidden="true" />
          Con Franquicias LATAM ·{" "}
          <span className="font-semibold tabular-nums" style={{ color: "var(--acc)" }}>
            {formatCOPMillones(modelo.vOpt)}/mes
          </span>
        </span>
      </div>

      {/* Chart */}
      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Utilidad mensual para los dueños: hoy ${formatCOPMillones(modelo.vHoy)}, con Franquicias LATAM ${formatCOPMillones(modelo.vOpt)} desde el mes ${modelo.mi}.`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`rgb(var(--acc-rgb) / 0.30)`} />
              <stop offset="100%" stopColor={`rgb(var(--acc-rgb) / 0.03)`} />
            </linearGradient>
          </defs>

          {/* Gridlines sutiles */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_T + f * (H - PAD_T - PAD_B)}
              y2={PAD_T + f * (H - PAD_T - PAD_B)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* La caja liberada: el área entre ambas series */}
          <motion.path
            d={modelo.areaCaja}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : undefined}
            transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
          />

          {/* Serie "Hoy" */}
          <motion.path
            d={modelo.pathHoy}
            fill="none"
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="2"
            strokeDasharray="2 6"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.15 }}
          />

          {/* Serie "Con Franquicias LATAM": se dibuja y hace el escalón */}
          <motion.path
            d={modelo.pathFlatam}
            fill="none"
            stroke="var(--acc)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={revealed ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.3, delay: 0.35, ease: EASE_OUT }}
          />

          {/* Marcador de payback */}
          {payback ? (
            <motion.line
              x1={xDe(payback)}
              x2={xDe(payback)}
              y1={PAD_T - 6}
              y2={H - PAD_B}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1"
              strokeDasharray="3 5"
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: 1.3 }}
            />
          ) : null}
        </svg>

        {/* Label del payback en HTML para que no se encoja en móvil.
           Abajo del chart: arriba chocaría con la leyenda y el rail. */}
        {payback ? (
          <motion.span
            className="absolute bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-fl-base px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-fl-muted"
            style={{ left: `${(xDe(payback) / W) * 100}%` }}
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            Payback · mes {payback}
          </motion.span>
        ) : null}
      </div>

      {/* Eje X en HTML, cada label anclado a su posición real */}
      <div
        className="relative mt-1 h-4 text-[10px] font-medium uppercase tracking-[0.12em] text-fl-muted"
        aria-hidden="true"
      >
        {[1, 4, 8, 12].map((m) => (
          <span
            key={m}
            className="absolute whitespace-nowrap"
            style={
              m === 1
                ? { left: 0 }
                : m === 12
                  ? { right: 0 }
                  : {
                      left: `${(xDe(m) / W) * 100}%`,
                      transform: "translateX(-50%)",
                    }
            }
          >
            Mes {m}
          </span>
        ))}
      </div>

      {/* Slider: recalcula todo en vivo */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-4">
          <label
            htmlFor="ventas-mensuales"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted"
          >
            Ventas mensuales
          </label>
          <span className="text-sm font-bold tabular-nums text-fl-text">
            {formatCOPMillones(ventas)}
          </span>
        </div>
        <input
          id="ventas-mensuales"
          type="range"
          className="prop-range mt-3"
          min={min}
          max={max}
          step={5_000_000}
          value={ventas}
          onChange={(e) => setVentas(Number(e.target.value))}
          aria-valuetext={formatCOPMillones(ventas)}
        />
      </div>

      {/* Contador acumulado + texto ancla */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
            Caja liberada acumulada (12 meses)
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--acc)" }}>
            <CountUp
              value={modelo.cajaLiberada}
              format={formatCOPMillones}
              duration={1.2}
              className="tabular-nums"
            />
          </p>
        </div>
        <p className="max-w-[220px] text-sm leading-snug text-fl-muted sm:text-right">
          La diferencia es dinero que se queda con usted.
        </p>
      </div>
    </div>
  );
}
