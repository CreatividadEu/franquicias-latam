"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Heatmap } from "../_components/Heatmap";
import { StreamedOutput } from "../_components/StreamedOutput";
import { POINTS_BY_ID, pointHourHeatmap, VOC_EVENTS } from "../_lib/seed";
import { ALL_POINTS, POINT_NAMES } from "../_lib/narrative";
import type { PointId } from "../_lib/types";

const HOURS = Array.from({ length: 18 }, (_, i) => `${11 + i}:00`);
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function PulsoPage() {
  return (
    <Suspense fallback={<div className="text-sm text-fl-muted">Cargando…</div>}>
      <PulsoInner />
    </Suspense>
  );
}

function PulsoInner() {
  const params = useSearchParams();
  const raw = params.get("point") as PointId | null;
  const selected = raw && POINTS_BY_ID[raw] ? raw : ("kennedy" as PointId);
  const [executed, setExecuted] = useState<Set<number>>(new Set());

  const point = POINTS_BY_ID[selected];
  const heatmap = useMemo(() => pointHourHeatmap(selected), [selected]);
  const voc = useMemo(() => VOC_EVENTS.filter((v) => v.pointId === selected).slice(0, 14), [selected]);

  const sentimentSeries = useMemo(() => {
    // 14 days sentiment score avg
    const byDay: Record<string, { pos: number; neg: number; count: number }> = {};
    for (const v of VOC_EVENTS.filter((e) => e.pointId === selected)) {
      if (!byDay[v.at]) byDay[v.at] = { pos: 0, neg: 0, count: 0 };
      byDay[v.at].count++;
      if (v.sentiment === "positive") byDay[v.at].pos++;
      if (v.sentiment === "negative") byDay[v.at].neg++;
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, d]) => ({
        date,
        score: d.count > 0 ? (d.pos - d.neg) / d.count : 0,
      }));
  }, [selected]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-fl-text">Pulso · {point.name}</h1>
          <p className="mt-1 text-sm text-fl-muted">
            {point.headline} · gerente {point.manager}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-fl-surface px-3 py-1.5 text-[11px] text-fl-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fl-teal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fl-teal" />
          </span>
          Sincronizado con POS · hace 3 min
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {ALL_POINTS.map((p) => (
          <a
            key={p}
            href={`/demos/don-benitez-os/pulso?point=${p}`}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              p === selected
                ? "border-fl-teal bg-fl-teal/10 text-fl-teal"
                : "border-fl-border bg-fl-surface text-fl-muted hover:text-fl-text"
            }`}
          >
            {POINT_NAMES[p].split(" · ").pop() ?? POINT_NAMES[p]}
          </a>
        ))}
      </div>

      <section className="rounded-xl border border-fl-border bg-fl-surface p-5">
        <h2 className="text-sm font-semibold text-fl-text">Ocupación × hora × día</h2>
        <p className="mt-0.5 text-xs text-fl-muted">
          Las celdas más intensas concentran anomalías. Kennedy muestra picos 13-14h y 20-21h.
        </p>
        <div className="mt-4">
          <Heatmap rows={heatmap} rowLabels={DAYS} colLabels={HOURS} intensityColor="teal" />
        </div>
      </section>

      <section className="rounded-xl border border-fl-border bg-fl-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-fl-text">Palancas ejecutables</h2>
            <p className="mt-0.5 text-xs text-fl-muted">
              Tres acciones concretas para hoy — generadas por Clawdbot con los KPIs del punto.
            </p>
          </div>
          <span className="rounded-md bg-fl-teal/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-fl-teal">
            stream
          </span>
        </div>
        <div className="mt-4 rounded-lg border border-fl-border bg-fl-base/40 p-4">
          <StreamedOutput
            endpoint="/api/demos/don-benitez-os/action-plan"
            payload={{ pointId: selected }}
            fallback={FALLBACK_PLAN(point.name)}
            triggerKey={selected}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() =>
                setExecuted((prev) => {
                  const next = new Set(prev);
                  next.add(n);
                  return next;
                })
              }
              disabled={executed.has(n)}
              className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                executed.has(n)
                  ? "border-fl-teal/50 bg-fl-teal/15 text-fl-teal"
                  : "border-fl-border bg-fl-surface text-fl-text hover:border-fl-teal/50"
              }`}
            >
              {executed.has(n)
                ? `✓ Asignado a ${point.manager} · ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
                : `Ejecutar palanca ${n}`}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-fl-border bg-fl-surface p-5">
        <h2 className="text-sm font-semibold text-fl-text">Sentimiento · últimos 14 días</h2>
        <div className="mt-4 flex items-end gap-1">
          {sentimentSeries.map((d) => {
            const pct = Math.max(4, Math.abs(d.score) * 60);
            const pos = d.score >= 0;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-16 items-end">
                  <div
                    className={`w-full rounded-sm ${pos ? "bg-fl-teal/70" : "bg-red-400/70"}`}
                    style={{ height: `${pct}px` }}
                  />
                </div>
                <span className="text-[9px] text-fl-muted">{d.date.slice(-2)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          {voc.slice(0, 5).map((v) => (
            <div key={v.id} className="flex gap-3 text-xs">
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                  v.sentiment === "positive"
                    ? "bg-fl-teal/15 text-fl-teal"
                    : v.sentiment === "negative"
                    ? "bg-red-400/15 text-red-300"
                    : "bg-fl-base text-fl-muted"
                }`}
              >
                {v.topic}
              </span>
              <span className="text-fl-text">"{v.excerpt}"</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FALLBACK_PLAN(name: string): string {
  return `1. **Reasignar anfitrión al turno 13-15h**
   Owner: Líder turno.
   Plazo: hoy.
   Por qué: reduce wait-time pico y libera mesero para ticket.

2. **Role-play 15 min con cocineros sobre sincronización fuego**
   Owner: Chef de ${name}.
   Plazo: mañana antes del turno.
   Por qué: recupera 2-3 min por ticket en rush.

3. **Activar promo "celebración exprés" en mesas de espera**
   Owner: Gerente de punto.
   Plazo: 48h.
   Por qué: convierte frustración de espera en ticket adicional.`;
}
