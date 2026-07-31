"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { SajuStage } from "@prisma/client";
import { SAJU_STAGES, STAGE_COLOR, STAGE_LABEL, STAGE_SHORT } from "@/lib/saju/command-center";
import { groupByStage } from "@/lib/saju/metrics";
import type { SajuLeadDTO } from "@/lib/saju/types";
import { moveLeadStage } from "../actions";
import { LeadCard } from "./LeadCard";
import { useLeadDrawer } from "./LeadDrawerProvider";
import { useToast } from "./ToastProvider";

/**
 * Tablero por etapas. El movimiento es optimista: la tarjeta salta de columna
 * al soltarla y sólo vuelve atrás si la server action falla. Cada movimiento
 * registra un evento CAMBIO_ETAPA en el servidor.
 *
 * En móvil el tablero se convierte en acordeón por etapa; el arrastre HTML5 no
 * existe allí, así que el control «Mover a etapa…» de cada tarjeta es la vía
 * principal (y la alternativa de teclado en escritorio).
 */
export function KanbanBoard({ leads }: { leads: SajuLeadDTO[] }) {
  // `useOptimistic` pinta el movimiento al instante y revierte solo si la
  // transición termina sin que el servidor confirme el cambio.
  const [items, applyMove] = useOptimistic(
    leads,
    (current: SajuLeadDTO[], move: { id: string; stage: SajuStage }) =>
      current.map((item) => (item.id === move.id ? { ...item, stage: move.stage } : item)),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<SajuStage | null>(null);
  const [openStages, setOpenStages] = useState<SajuStage[]>(["NEGOCIACION", "EVALUACION_INTERNA"]);
  const [, startTransition] = useTransition();
  const { report } = useToast();
  const { open } = useLeadDrawer();

  const byStage = groupByStage(items);

  function move(lead: SajuLeadDTO, stage: SajuStage) {
    if (lead.stage === stage) return;
    startTransition(async () => {
      applyMove({ id: lead.id, stage });
      const result = await moveLeadStage(lead.id, stage);
      report(result, `${lead.name} → ${STAGE_LABEL[stage]}`);
    });
  }

  function handleDrop(stage: SajuStage) {
    setOverStage(null);
    const lead = items.find((item) => item.id === draggingId);
    setDraggingId(null);
    if (lead) move(lead, stage);
  }

  function toggleStage(stage: SajuStage) {
    setOpenStages((current) =>
      current.includes(stage) ? current.filter((s) => s !== stage) : [...current, stage],
    );
  }

  const cardProps = (lead: SajuLeadDTO) => ({
    lead,
    dragging: draggingId === lead.id,
    onOpen: open,
    onMove: move,
    onDragStart: (dragged: SajuLeadDTO) => setDraggingId(dragged.id),
    onDragEnd: () => {
      setDraggingId(null);
      setOverStage(null);
    },
  });

  return (
    <>
      <p className="cc-hint cc-kanban-hint">
        Arrastra una tarjeta entre columnas o usa «Mover a etapa…» en la tarjeta. Cada cambio
        queda registrado en el histórico del lead.
      </p>

      {/* escritorio: columnas */}
      <div className="cc-kanban">
        {SAJU_STAGES.map((stage) => {
          const stageLeads = byStage[stage];
          return (
            <div
              key={stage}
              className={`cc-col${overStage === stage ? " cc-col--over" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (overStage !== stage) setOverStage(stage);
              }}
              onDragLeave={() => setOverStage((current) => (current === stage ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(stage);
              }}
            >
              <div className="cc-col__head">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span
                    className="cc-col__dot"
                    style={{ background: STAGE_COLOR[stage].solid }}
                    aria-hidden="true"
                  />
                  <span className="cc-col__name">{STAGE_SHORT[stage]}</span>
                </span>
                <span className="cc-num cc-num--sm" style={{ fontSize: 13 }}>
                  {stageLeads.length}
                </span>
              </div>

              <div className="cc-col__body">
                {stageLeads.length === 0 ? (
                  <p className="cc-col__empty">Sin leads en esta etapa.</p>
                ) : (
                  stageLeads.map((lead) => <LeadCard key={lead.id} {...cardProps(lead)} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* móvil: acordeón por etapa */}
      <div className="cc-kanban-mobile">
        {SAJU_STAGES.map((stage) => {
          const stageLeads = byStage[stage];
          const isOpen = openStages.includes(stage);
          return (
            <div key={stage}>
              <button
                type="button"
                className="cc-accordion__head"
                onClick={() => toggleStage(stage)}
                aria-expanded={isOpen}
                aria-controls={`stage-panel-${stage}`}
              >
                <span
                  className="cc-col__dot"
                  style={{ background: STAGE_COLOR[stage].solid }}
                  aria-hidden="true"
                />
                <span className="cc-col__name" style={{ flex: 1, textAlign: "left" }}>
                  {STAGE_LABEL[stage]}
                </span>
                <span className="cc-num" style={{ fontSize: 13 }}>
                  {stageLeads.length}
                </span>
                <span className="cc-hint" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="cc-accordion__body" id={`stage-panel-${stage}`}>
                  {stageLeads.length === 0 ? (
                    <p className="cc-col__empty">Sin leads en esta etapa.</p>
                  ) : (
                    stageLeads.map((lead) => <LeadCard key={lead.id} {...cardProps(lead)} />)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
