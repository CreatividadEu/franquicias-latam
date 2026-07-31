"use client";

import { useEffect, useRef, useState } from "react";
import type { SajuInterest, SajuLeadStatus, SajuLeadType, SajuStage } from "@prisma/client";
import {
  EVENT_LABEL,
  INTEREST_LABEL,
  SAJU_INTERESTS,
  SAJU_LEAD_STATUSES,
  SAJU_LEAD_TYPES,
  SAJU_STAGES,
  STAGE_COLOR,
  STAGE_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  countryMeta,
} from "@/lib/saju/command-center";
import { formatDateTime, isOverdue, toDateInputValue } from "@/lib/saju/format";
import type { SajuLeadDTO, SajuLeadDetailDTO } from "@/lib/saju/types";
import { addLeadEvent, moveLeadStage, setLeadStatus, updateLead } from "../actions";
import { Portal } from "./Portal";
import { Skeleton, StageChip } from "./atoms";
import { useToast } from "./ToastProvider";

/**
 * Ficha lateral del lead: edición en línea, histórico y acciones rápidas.
 *
 * Los `select` guardan al cambiar; los campos de texto van sin control (React
 * no los re-escribe) y guardan al salir del campo, comparando contra el valor
 * del servidor para no lanzar escrituras vacías. El provider remonta el drawer
 * al cambiar de lead, así que los `defaultValue` siempre son los correctos.
 */
export function LeadDrawer({
  seed,
  detail,
  loading,
  onClose,
  onChanged,
}: {
  leadId: string;
  seed: SajuLeadDTO | null;
  detail: SajuLeadDetailDTO | null;
  loading: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const lead: SajuLeadDTO | null = detail ?? seed;
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { report, notify } = useToast();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function persist(patch: Parameters<typeof updateLead>[0], successMessage?: string) {
    setSaving(true);
    const result = await updateLead(patch);
    setSaving(false);
    if (report(result, successMessage)) onChanged();
  }

  /** Guarda un campo de texto sólo si cambió respecto al valor del servidor. */
  function commitText(
    field: "nextAction" | "nextActionDate" | "keyInsight" | "notes",
    value: string,
    current: string,
  ) {
    if (!lead || value === current) return;
    void persist({ id: lead.id, [field]: value });
  }

  async function changeStage(stage: SajuStage) {
    if (!lead || lead.stage === stage) return;
    setSaving(true);
    const result = await moveLeadStage(lead.id, stage);
    setSaving(false);
    if (report(result, `Etapa: ${STAGE_LABEL[stage]}`)) onChanged();
  }

  async function changeStatus(status: SajuLeadStatus) {
    if (!lead || lead.status === status) return;
    setSaving(true);
    const result = await setLeadStatus(lead.id, status);
    setSaving(false);
    if (report(result, `Estado: ${STATUS_LABEL[status]}`)) onChanged();
  }

  async function addEvent(type: "NOTA" | "TOUCHPOINT") {
    if (!lead) return;
    const description = note.trim() || (type === "TOUCHPOINT" ? "Contacto registrado" : "");
    if (!description) {
      notify("Escribe la nota antes de guardarla.", "error");
      return;
    }
    setSaving(true);
    const result = await addLeadEvent({ leadId: lead.id, type, description });
    setSaving(false);
    if (report(result, type === "TOUCHPOINT" ? "Touchpoint registrado" : "Nota añadida")) {
      setNote("");
      onChanged();
    }
  }

  const country = lead ? countryMeta(lead.country) : null;
  const nextDate = lead?.nextActionDate ? new Date(lead.nextActionDate) : null;
  const nextDateValue = toDateInputValue(nextDate);

  return (
    <Portal>
      <div className="cc-scrim" onClick={onClose} aria-hidden="true" />
      <aside
        className="cc-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={lead ? `Ficha de ${lead.name}` : "Ficha de lead"}
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="cc-drawer__head">
          <div style={{ minWidth: 0 }}>
            {lead ? (
              <>
                <h2 style={{ fontSize: 18, lineHeight: 1.25 }}>{lead.name}</h2>
                <p className="cc-hint" style={{ marginTop: 4 }}>
                  {[lead.role, lead.company].filter(Boolean).join(" · ") ||
                    "Sin empresa registrada"}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <StageChip stage={lead.stage} />
                  <span className="cc-chip">
                    <span aria-hidden="true">{country?.flag}</span>
                    {[country?.name, lead.city].filter(Boolean).join(" · ")}
                  </span>
                </div>
              </>
            ) : (
              <Skeleton height={24} width={220} />
            )}
          </div>
          <button type="button" className="cc-btn cc-btn--ghost cc-btn--sm" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <div className="cc-drawer__body">
          {!lead && loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton height={64} />
              <Skeleton height={120} />
              <Skeleton height={160} />
            </div>
          )}

          {!lead && !loading && (
            <p className="cc-hint">No encontramos este lead. Puede haberse archivado o eliminado.</p>
          )}

          {lead && (
            <>
              <section>
                <p className="cc-label" style={{ marginBottom: 12 }}>
                  Ficha{" "}
                  {saving && <span style={{ color: "var(--cc-brand)" }}>· guardando…</span>}
                </p>

                <div className="cc-drawer__grid">
                  <label className="cc-field">
                    <span className="cc-label">Etapa</span>
                    <select
                      className="cc-select"
                      value={lead.stage}
                      onChange={(event) => changeStage(event.target.value as SajuStage)}
                      style={{ borderColor: STAGE_COLOR[lead.stage].border }}
                    >
                      {SAJU_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {STAGE_LABEL[stage]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cc-field">
                    <span className="cc-label">Tipo</span>
                    <select
                      className="cc-select"
                      value={lead.type}
                      onChange={(event) =>
                        persist({ id: lead.id, type: event.target.value as SajuLeadType })
                      }
                    >
                      {SAJU_LEAD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {TYPE_LABEL[type]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cc-field">
                    <span className="cc-label">Interés</span>
                    <select
                      className="cc-select"
                      value={lead.interest}
                      onChange={(event) =>
                        persist({ id: lead.id, interest: event.target.value as SajuInterest })
                      }
                    >
                      {SAJU_INTERESTS.map((interest) => (
                        <option key={interest} value={interest}>
                          {INTEREST_LABEL[interest]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cc-field">
                    <span className="cc-label">Estado</span>
                    <select
                      className="cc-select"
                      value={lead.status}
                      onChange={(event) => changeStatus(event.target.value as SajuLeadStatus)}
                    >
                      {SAJU_LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cc-field" style={{ gridColumn: "1 / -1" }}>
                    <span className="cc-label">Próxima acción</span>
                    <input
                      className="cc-input"
                      defaultValue={lead.nextAction ?? ""}
                      placeholder="Qué toca hacer"
                      onBlur={(event) =>
                        commitText("nextAction", event.target.value, lead.nextAction ?? "")
                      }
                    />
                  </label>

                  <label className="cc-field">
                    <span className="cc-label">Fecha</span>
                    <input
                      type="date"
                      className="cc-input cc-num"
                      defaultValue={nextDateValue}
                      onBlur={(event) =>
                        commitText("nextActionDate", event.target.value, nextDateValue)
                      }
                      style={isOverdue(nextDate) ? { borderColor: "var(--cc-alert)" } : undefined}
                    />
                  </label>

                  <div className="cc-field" style={{ justifyContent: "flex-end" }}>
                    <span className="cc-label">Registrar</span>
                    <button
                      type="button"
                      className="cc-btn"
                      onClick={() => addEvent("TOUCHPOINT")}
                      disabled={saving}
                    >
                      Registrar touchpoint
                    </button>
                  </div>

                  <label className="cc-field" style={{ gridColumn: "1 / -1" }}>
                    <span className="cc-label">Palanca de cierre</span>
                    <textarea
                      className="cc-textarea"
                      defaultValue={lead.keyInsight ?? ""}
                      placeholder="Qué mueve la decisión"
                      onBlur={(event) =>
                        commitText("keyInsight", event.target.value, lead.keyInsight ?? "")
                      }
                    />
                  </label>

                  <label className="cc-field" style={{ gridColumn: "1 / -1" }}>
                    <span className="cc-label">Notas</span>
                    <textarea
                      className="cc-textarea"
                      defaultValue={lead.notes ?? ""}
                      placeholder="Contexto, historia, señales"
                      onBlur={(event) => commitText("notes", event.target.value, lead.notes ?? "")}
                    />
                  </label>
                </div>
              </section>

              <section>
                <p className="cc-label" style={{ marginBottom: 8 }}>
                  Añadir al histórico
                </p>
                <textarea
                  className="cc-textarea"
                  value={note}
                  placeholder="Qué pasó en este contacto"
                  onChange={(event) => setNote(event.target.value)}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="cc-btn cc-btn--primary"
                    onClick={() => addEvent("NOTA")}
                    disabled={saving}
                  >
                    Añadir nota
                  </button>
                  <button
                    type="button"
                    className="cc-btn"
                    onClick={() => addEvent("TOUCHPOINT")}
                    disabled={saving}
                  >
                    Como touchpoint
                  </button>
                </div>
              </section>

              <section>
                <p className="cc-label" style={{ marginBottom: 8 }}>
                  Histórico
                </p>

                {loading && !detail && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                  </div>
                )}

                {detail && detail.events.length === 0 && (
                  <p className="cc-hint">Sin eventos todavía — empieza con una nota.</p>
                )}

                {detail?.events.map((event) => (
                  <article key={event.id} className="cc-event">
                    <span className="cc-event__rail" aria-hidden="true">
                      <span className="cc-event__dot" />
                    </span>
                    <div>
                      <p style={{ fontSize: 13, lineHeight: 1.4 }}>{event.description}</p>
                      <p className="cc-hint" style={{ marginTop: 2 }}>
                        {EVENT_LABEL[event.type]} ·{" "}
                        <span className="cc-num" style={{ fontSize: 12 }}>
                          {formatDateTime(new Date(event.occurredAt))}
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </aside>
    </Portal>
  );
}
