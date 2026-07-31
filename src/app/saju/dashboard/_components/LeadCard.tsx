"use client";

import { SAJU_STAGES, STAGE_COLOR, STAGE_LABEL } from "@/lib/saju/command-center";
import { formatShortDate, isOverdue } from "@/lib/saju/format";
import type { SajuLeadDTO } from "@/lib/saju/types";
import type { SajuStage } from "@prisma/client";
import { CountryTag, InterestDot, TypeChip } from "./atoms";

/**
 * Tarjeta del kanban. Se arrastra por el contenedor; el `select` «Mover a
 * etapa…» es la alternativa accesible al drag & drop (teclado y táctil) y
 * queda fuera del botón para no anidar controles.
 */
export function LeadCard({
  lead,
  dragging,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  lead: SajuLeadDTO;
  dragging?: boolean;
  onOpen: (lead: SajuLeadDTO) => void;
  onMove: (lead: SajuLeadDTO, stage: SajuStage) => void;
  onDragStart?: (lead: SajuLeadDTO) => void;
  onDragEnd?: () => void;
}) {
  const nextDate = lead.nextActionDate ? new Date(lead.nextActionDate) : null;
  const overdue = isOverdue(nextDate);

  return (
    <div
      className={`cc-leadcard${dragging ? " cc-leadcard--dragging" : ""}`}
      style={{ ["--cc-stage" as string]: STAGE_COLOR[lead.stage].solid }}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", lead.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(lead);
      }}
      onDragEnd={() => onDragEnd?.()}
    >
      <button
        type="button"
        className="cc-leadcard__open"
        onClick={() => onOpen(lead)}
        aria-label={`Abrir ficha de ${lead.name}`}
      >
        <span className="cc-leadcard__top">
          <InterestDot interest={lead.interest} />
          <span className="cc-leadcard__name">{lead.name}</span>
        </span>

        <span className="cc-leadcard__meta">
          <CountryTag code={lead.country} />
          <TypeChip type={lead.type} />
          {lead.status !== "ACTIVO" && <span className="cc-chip">{lead.status.toLowerCase()}</span>}
        </span>

        {lead.company && (
          <span className="cc-leadcard__insight" style={{ color: "var(--cc-ink-2)" }}>
            {lead.company}
          </span>
        )}

        {lead.keyInsight && <span className="cc-leadcard__insight">{lead.keyInsight}</span>}

        {lead.nextAction && (
          <span className="cc-leadcard__action">
            {lead.nextAction}
            {nextDate && (
              <>
                {" · "}
                <span
                  className="cc-num"
                  style={{ fontSize: 11, color: overdue ? "var(--cc-alert)" : "var(--cc-muted)" }}
                >
                  {formatShortDate(nextDate)}
                </span>
                {overdue && <span className="cc-alert-text"> · vencida</span>}
              </>
            )}
          </span>
        )}
      </button>

      <div className="cc-leadcard__move">
        <label className="cc-label" style={{ position: "absolute", left: -9999 }} htmlFor={`move-${lead.id}`}>
          Mover a etapa
        </label>
        <select
          id={`move-${lead.id}`}
          className="cc-select"
          value={lead.stage}
          onChange={(event) => onMove(lead, event.target.value as SajuStage)}
          onDragStart={(event) => event.preventDefault()}
          title="Mover a etapa…"
        >
          {SAJU_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage === lead.stage ? `Mover a etapa…` : STAGE_LABEL[stage]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
