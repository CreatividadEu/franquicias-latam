"use client";

import { CHART_LEGEND, SECTIONS } from "@/lib/intel/copy";
import { mShort, num } from "@/lib/intel/format";
import type { ModelResult } from "@/lib/intel/totto-model";
import { useElementWidth } from "./hooks";
import Section from "./Section";

const PAD = { top: 18, right: 14, bottom: 30, left: 58 };
const FALLBACK_WIDTH = 760;

/**
 * Techo "redondo" para el eje Y, con 4 intervalos legibles. La escala de pasos
 * es fina a propósito: con solo 1/2/5 el gráfico desperdiciaba hasta un 30 % de
 * alto en aire por encima de la curva.
 */
function niceCeil(value: number, intervals = 4): number {
  if (value <= 0) return intervals;
  const raw = value / intervals;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const candidates = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const factor = candidates.find((c) => c * magnitude >= raw) ?? 10;
  return factor * magnitude * intervals;
}

export default function SimulationChart({ result }: { result: ModelResult }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(FALLBACK_WIDTH);
  const { sim, plan } = result;
  const compact = width < 560;
  const height = compact ? 240 : 300;

  const months = sim.months;
  const hasPlan = plan.id > 0;

  const yMax = niceCeil(Math.max(sim.cumBase, sim.cumPlan));
  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = Math.max(1, height - PAD.top - PAD.bottom);

  const x = (month: number) => PAD.left + ((month - 1) / (months.length - 1)) * innerW;
  const y = (value: number) => PAD.top + innerH - (value / yMax) * innerH;

  const line = (pick: (index: number) => number) =>
    months.map((m, i) => `${i === 0 ? "M" : "L"}${x(m.month).toFixed(1)} ${y(pick(i)).toFixed(1)}`).join(" ");

  const basePath = line((i) => months[i].cumBase);
  const planPath = line((i) => months[i].cumPlan);

  // Área entre las dos curvas = beneficio neto acumulado.
  const areaPath = `${basePath} ${months
    .slice()
    .reverse()
    .map((m) => `L${x(m.month).toFixed(1)} ${y(m.cumPlan).toFixed(1)}`)
    .join(" ")} Z`;

  const ticks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const xLabels = compact ? months.filter((m) => m.month % 3 === 0 || m.month === 1) : months;

  const summary = hasPlan
    ? `Daño acumulado a 12 meses: ${mShort(sim.cumBase)} COP M sin protección frente a ${mShort(sim.cumPlan)} COP M con ${plan.name}.`
    : `Daño acumulado a 12 meses sin protección: ${mShort(sim.cumBase)} COP M.`;

  return (
    <Section title={SECTIONS.simulation} note={SECTIONS.simulationNote}>
      <div ref={ref} className="w-full" style={{ height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={summary}
          // El ancho medido manda (así las etiquetas no escalan), pero el
          // max-width garantiza que nunca desborde la página aunque la medición
          // llegue tarde: en el peor caso el SVG se reduce en proporción.
          style={{ maxWidth: "100%", height: "auto" }}
        >
          {/* Rejilla y eje Y */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                className="mono"
                x={PAD.left - 10}
                y={y(tick) + 3.5}
                textAnchor="end"
                fontSize={10.5}
                fill="var(--text-3)"
              >
                {num(tick)}
              </text>
            </g>
          ))}

          {/* Eje X */}
          {xLabels.map((m) => (
            <text
              key={m.month}
              className="mono"
              x={x(m.month)}
              y={height - 10}
              textAnchor="middle"
              fontSize={10.5}
              fill="var(--text-3)"
            >
              M{m.month}
            </text>
          ))}

          {hasPlan ? (
            <>
              <path d={areaPath} fill="var(--accent)" fillOpacity={0.14} />
              {sim.payback !== null ? (
                <g>
                  <line
                    x1={x(sim.payback)}
                    x2={x(sim.payback)}
                    y1={PAD.top}
                    y2={PAD.top + innerH}
                    stroke="var(--pos)"
                    strokeWidth={1.25}
                    strokeDasharray="4 4"
                  />
                  <text
                    className="mono"
                    x={x(sim.payback) + 6}
                    y={PAD.top + 10}
                    fontSize={10.5}
                    fill="var(--pos)"
                  >
                    payback M{sim.payback}
                  </text>
                </g>
              ) : null}
            </>
          ) : null}

          <path
            d={basePath}
            fill="none"
            stroke="var(--bleed)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {hasPlan ? (
            <path
              d={planPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {!compact
            ? months.map((m) => (
                <g key={m.month}>
                  <circle cx={x(m.month)} cy={y(m.cumBase)} r={2.5} fill="var(--bleed)" />
                  {hasPlan ? (
                    <circle cx={x(m.month)} cy={y(m.cumPlan)} r={2.5} fill="var(--accent)" />
                  ) : null}
                </g>
              ))
            : null}
        </svg>
      </div>

      {/* Leyenda */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <LegendItem color="var(--bleed)" label={CHART_LEGEND.base} />
        {hasPlan ? (
          <>
            <LegendItem color="var(--accent)" label={CHART_LEGEND.plan} />
            <LegendItem color="var(--accent)" label={CHART_LEGEND.benefit} swatch="area" />
            {sim.payback !== null ? (
              <LegendItem color="var(--pos)" label={CHART_LEGEND.payback} swatch="dash" />
            ) : null}
          </>
        ) : null}
      </ul>

      {/* Misma serie en tabla, para lectores de pantalla. */}
      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Inacción (COP M acumulados)</th>
            <th scope="col">Escenario (COP M acumulados)</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <th scope="row">M{m.month}</th>
              <td>{mShort(m.cumBase)}</td>
              <td>{mShort(m.cumPlan)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function LegendItem({
  color,
  label,
  swatch = "line",
}: {
  color: string;
  label: string;
  swatch?: "line" | "area" | "dash";
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block flex-none"
        style={
          swatch === "area"
            ? { width: 14, height: 8, borderRadius: 2, background: color, opacity: 0.28 }
            : swatch === "dash"
              ? {
                  width: 18,
                  height: 0,
                  borderTop: `1.5px dashed ${color}`,
                }
              : { width: 14, height: 2, borderRadius: 2, background: color }
        }
      />
      <span className="intel-hint">{label}</span>
    </li>
  );
}
