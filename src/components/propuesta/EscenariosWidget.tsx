"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useId, useMemo, useState } from "react";
import type { Escenario } from "@/lib/propuestas/types";
import { CountUp } from "./CountUp";
import { EASE_OUT, SPRING_SNAPPY } from "./motion";

const W = 640;
const H = 260;
const PAD_T = 30;
const PAD_B = 16;
const PAD_X = 14;

/** Curva suave (bezier con controles horizontales) por los puntos. */
function pathSuave(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) {
    return "";
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const p = pts[i];
    const dx = (p.x - prev.x) / 2;
    d += ` C ${prev.x + dx} ${prev.y}, ${p.x - dx} ${p.y}, ${p.x} ${p.y}`;
  }
  return d;
}

type EscenariosWidgetProps = {
  escenarios: Escenario[];
};

/**
 * Fase 02 — hasta 3 rutas de expansión. Segmented control que
 * re-anima la curva de unidades y actualiza las métricas.
 */
export function EscenariosWidget({ escenarios }: EscenariosWidgetProps) {
  const gradId = useId();
  const reduced = useReducedMotion();
  const [selId, setSelId] = useState(
    () => escenarios.find((e) => e.destacado)?.id ?? escenarios[0]?.id ?? "",
  );
  const sel = escenarios.find((e) => e.id === selId) ?? escenarios[0];

  const anos = useMemo(
    () => Math.max(...escenarios.map((e) => e.unidadesPorAno.length), 1),
    [escenarios],
  );
  // Escala estable entre escenarios para que la comparación sea honesta.
  const uMax = useMemo(
    () => Math.max(...escenarios.flatMap((e) => e.unidadesPorAno), 1) * 1.2,
    [escenarios],
  );

  const geo = useMemo(() => {
    if (!sel) {
      return null;
    }
    const xDe = (ano: number) => PAD_X + (ano / anos) * (W - PAD_X * 2);
    const yDe = (u: number) => PAD_T + (1 - u / uMax) * (H - PAD_T - PAD_B);
    const pts = [{ x: xDe(0), y: yDe(0) }].concat(
      sel.unidadesPorAno.map((u, i) => ({ x: xDe(i + 1), y: yDe(u) })),
    );
    const linea = pathSuave(pts);
    const area = `${linea} L ${pts[pts.length - 1].x} ${H - PAD_B} L ${pts[0].x} ${H - PAD_B} Z`;
    return { pts, linea, area };
  }, [sel, anos, uMax]);

  if (!sel || !geo) {
    return null;
  }

  const unidadesFinal = sel.unidadesPorAno[sel.unidadesPorAno.length - 1] ?? 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      {/* Segmented control */}
      <div
        role="radiogroup"
        aria-label="Ruta de expansión"
        className="flex w-full gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
      >
        {escenarios.map((e) => {
          const activo = e.id === sel.id;
          return (
            <button
              key={e.id}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => setSelId(e.id)}
              className="relative flex-1 rounded-full px-2 py-2 text-xs font-semibold tracking-tight text-fl-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)] sm:text-sm"
              style={activo ? { color: "var(--acc)" } : undefined}
            >
              {activo ? (
                <motion.span
                  layoutId={reduced ? undefined : "esc-thumb"}
                  className="absolute inset-0 rounded-full border bg-white/[0.06]"
                  style={{ borderColor: "rgb(var(--acc-rgb) / 0.4)" }}
                  transition={SPRING_SNAPPY}
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative inline-flex items-center justify-center gap-1.5">
                {e.nombre}
                {e.destacado ? (
                  <Sparkles
                    className="h-3 w-3"
                    style={{ color: "var(--acc)" }}
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 min-h-10 text-sm leading-relaxed text-fl-muted">
        {sel.descripcion}
        {sel.destacado ? (
          <span
            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{
              color: "var(--acc)",
              background: "rgb(var(--acc-rgb) / 0.12)",
            }}
          >
            Recomendado
          </span>
        ) : null}
      </p>

      {/* Curva de crecimiento de unidades */}
      <div className="mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Escenario ${sel.nombre}: ${sel.unidadesPorAno.join(", ")} unidades acumuladas por año.`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`rgb(var(--acc-rgb) / 0.22)`} />
              <stop offset="100%" stopColor={`rgb(var(--acc-rgb) / 0.02)`} />
            </linearGradient>
          </defs>

          {[0.33, 0.66].map((f) => (
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

          {/* key={sel.id} re-monta y re-anima al cambiar de escenario */}
          <g key={sel.id}>
            <motion.path
              d={geo.area}
              fill={`url(#${gradId})`}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            />
            <motion.path
              d={geo.linea}
              fill="none"
              stroke="var(--acc)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            />
            {geo.pts.slice(1).map((p, i) => (
              <motion.g
                key={i}
                initial={reduced ? false : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.25 + i * 0.18 }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              >
                <circle cx={p.x} cy={p.y} r="5" fill="#0A0F1E" stroke="var(--acc)" strokeWidth="2" />
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fill="#F0F0F5"
                  fontSize="17"
                  fontWeight="700"
                >
                  {sel.unidadesPorAno[i]}
                </text>
              </motion.g>
            ))}
          </g>
        </svg>
        <div
          className="mt-1 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-fl-muted/70"
          aria-hidden="true"
        >
          <span>Hoy</span>
          {Array.from({ length: anos }, (_, i) => (
            <span key={i}>Año {i + 1}</span>
          ))}
        </div>
      </div>

      {/* Métricas del escenario */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-center">
          <p className="text-xl font-bold tabular-nums tracking-tight text-fl-text sm:text-2xl">
            <CountUp value={unidadesFinal} duration={0.7} />
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fl-muted">
            Unidades año {sel.unidadesPorAno.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-center">
          <p className="text-xl font-bold tabular-nums tracking-tight text-fl-text sm:text-2xl">
            {sel.paybackMeses ? `${sel.paybackMeses}` : "—"}
            {sel.paybackMeses ? (
              <span className="text-sm font-semibold text-fl-muted"> meses</span>
            ) : null}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fl-muted">
            Payback franquiciado
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-center">
          <p className="text-xl font-bold tabular-nums tracking-tight text-fl-text sm:text-2xl">
            {sel.regaliaPct ? `${sel.regaliaPct}%` : "—"}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fl-muted">
            Regalía
          </p>
        </div>
      </div>
    </div>
  );
}
