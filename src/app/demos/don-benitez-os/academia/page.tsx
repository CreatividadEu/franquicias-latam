"use client";

import { useState } from "react";
import { Heatmap } from "../_components/Heatmap";
import { StreamedOutput } from "../_components/StreamedOutput";
import { COMPETENCIES_LIST, COMPETENCY_GAPS, TRAINING_MODULES } from "../_lib/seed";
import { ALL_POINTS, POINT_NAMES } from "../_lib/narrative";
import type { Competency, PointId } from "../_lib/types";

export default function AcademiaPage() {
  const [open, setOpen] = useState<{ competency: Competency; pointId: PointId } | null>(null);

  const rows = COMPETENCIES_LIST.map((comp) =>
    ALL_POINTS.map((pid) => COMPETENCY_GAPS[comp][pid] / 3)
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-fl-text">Academia</h1>
        <p className="mt-1 text-sm text-fl-muted">
          Mapa de brechas competencia × punto · clic en una celda para generar módulo
        </p>
      </header>

      <section className="rounded-xl border border-fl-border bg-fl-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fl-text">Brechas por competencia</h2>
          <div className="flex items-center gap-2 text-[10px] text-fl-muted">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(239,68,68,0.15)" }} />
              sin brecha
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(239,68,68,0.9)" }} />
              crítica
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Heatmap
            rows={rows}
            rowLabels={COMPETENCIES_LIST as unknown as string[]}
            colLabels={ALL_POINTS.map((p) => POINT_NAMES[p].split(" · ").pop() ?? POINT_NAMES[p])}
            intensityColor="red"
            onCellClick={(i, j) => {
              setOpen({ competency: COMPETENCIES_LIST[i], pointId: ALL_POINTS[j] });
            }}
          />
        </div>
        <p className="mt-3 text-[11px] text-fl-muted">
          Tip: Kennedy × Cocina y Cali-Granada × Servicio tienen las brechas más altas.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-fl-text">Módulos generados esta semana · 7</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TRAINING_MODULES.slice(0, 7).map((m) => (
            <div key={m.id} className="rounded-lg border border-fl-border bg-fl-surface p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-fl-muted">
                <span>{m.competency}</span>
                <span>{m.durationMin} min</span>
              </div>
              <p className="mt-1 text-sm font-medium text-fl-text">{m.title}</p>
              <p className="mt-0.5 text-[11px] text-fl-muted">
                {POINT_NAMES[m.pointId]} · {m.generatedAt}
              </p>
            </div>
          ))}
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <aside
            className="flex h-full w-full max-w-xl flex-col border-l border-fl-border bg-fl-base shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-fl-border px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-fl-teal">
                  Generando · Clawdbot academy
                </p>
                <h2 className="mt-1 text-lg font-semibold text-fl-text">
                  {open.competency} · {POINT_NAMES[open.pointId]}
                </h2>
                <p className="mt-0.5 text-xs text-fl-muted">
                  Micro-módulo 15-20 min · listo para ejecutar en turno
                </p>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="text-fl-muted hover:text-fl-text"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <StreamedOutput
                endpoint="/api/demos/don-benitez-os/training"
                payload={{ pointId: open.pointId, competency: open.competency }}
                fallback={FALLBACK_TRAINING(open.competency, POINT_NAMES[open.pointId])}
                triggerKey={`${open.competency}-${open.pointId}`}
              />
            </div>
            <div className="border-t border-fl-border bg-fl-surface px-5 py-3 text-[11px] text-fl-muted">
              Stream en vivo · {"<"}objetivo{"> <"}contenido{"> <"}evaluación{">"} · exportable a PDF
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function FALLBACK_TRAINING(comp: Competency, pointName: string): string {
  return `<objetivo>
Al final del turno, el equipo de ${pointName} reduce su tiempo de atención en estación ${comp.toLowerCase()} y aplica el guion estándar.
</objetivo>

<contenido>
· Role-play 5 min: mesero recibe pedido con queja, repite back order.
· Checklist mise en place antes del rush de 13:00.
· Tres frases-ancla para upsell: "¿quieres hacerlo celebración?".
· Revisión de tiempos de fuego por plato (ticket stopwatch).
</contenido>

<evaluacion>
1. ¿Cuántos role-play completó cada mesero? (meta 3)
2. ¿Checklist firmado antes del rush? (sí/no)
3. Tiempo promedio de fuego vs. estándar.
</evaluacion>`;
}
