"use client";

import { useState, useTransition } from "react";
import type { SajuMilestoneStatus } from "@prisma/client";
import {
  MILESTONE_STATUSES,
  MILESTONE_STATUS_LABEL,
  countryMeta,
} from "@/lib/saju/command-center";
import {
  daysFromToday,
  formatRelativeDay,
  formatShortDate,
  formatWeekday,
} from "@/lib/saju/format";
import type { SajuMilestoneDTO } from "@/lib/saju/types";
import { createMilestone, updateMilestone } from "../actions";
import { useToast } from "./ToastProvider";

/**
 * Agenda institucional de los próximos 60 días. Lo que cae dentro de 7 días
 * se realza con el amarillo de marca; lo tentativo se marca «por confirmar».
 */
export function MilestoneTimeline({ milestones }: { milestones: SajuMilestoneDTO[] }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    counterpart: "",
    org: "",
    country: "",
    date: "",
    tentative: false,
  });
  const [pending, startTransition] = useTransition();
  const { report } = useToast();

  function submit() {
    startTransition(async () => {
      const result = await createMilestone({
        title: form.title,
        counterpart: form.counterpart,
        org: form.org || null,
        country: form.country || null,
        date: form.date,
        tentative: form.tentative,
      });
      if (report(result, "Hito añadido a la agenda")) {
        setForm({ title: "", counterpart: "", org: "", country: "", date: "", tentative: false });
        setAdding(false);
      }
    });
  }

  function changeStatus(milestone: SajuMilestoneDTO, status: SajuMilestoneStatus) {
    startTransition(async () => {
      const result = await updateMilestone({ id: milestone.id, status });
      report(result, `${MILESTONE_STATUS_LABEL[status]} · ${milestone.title}`);
    });
  }

  return (
    <div className="cc-card cc-card--pad">
      {milestones.length === 0 && !adding && (
        <p className="cc-hint">
          Sin hitos en los próximos 60 días —{" "}
          <button
            type="button"
            className="cc-btn cc-btn--ghost cc-btn--sm"
            onClick={() => setAdding(true)}
          >
            añadir el primero
          </button>
        </p>
      )}

      <div className="cc-timeline">
        {milestones.map((milestone) => {
          const date = new Date(milestone.date);
          const days = daysFromToday(date);
          const soon = days <= 7;
          const meta = milestone.country ? countryMeta(milestone.country) : null;

          return (
            <article
              key={milestone.id}
              className={`cc-tl-item${soon ? " cc-tl-item--soon" : ""}`}
            >
              <div className="cc-tl-item__date">
                <span className="cc-num cc-num--sm">{formatShortDate(date)}</span>
                <span className="cc-hint">{formatWeekday(date)}</span>
                <span
                  className="cc-hint"
                  style={soon ? { color: "var(--cc-ink)", fontWeight: 600 } : undefined}
                >
                  {formatRelativeDay(date)}
                </span>
              </div>

              <div className="cc-tl-item__body">
                <h3 className="cc-tl-item__title">{milestone.title}</h3>
                <p className="cc-hint" style={{ fontSize: 13, color: "var(--cc-ink-2)" }}>
                  {milestone.counterpart}
                  {milestone.org ? ` · ${milestone.org}` : ""}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {meta && (
                    <span className="cc-chip">
                      <span aria-hidden="true">{meta.flag}</span>
                      {meta.name}
                    </span>
                  )}
                  {milestone.tentative && (
                    <span className="cc-chip" style={{ borderStyle: "dashed" }}>
                      Por confirmar
                    </span>
                  )}
                  <select
                    className="cc-select"
                    style={{ width: "auto", height: 24, minHeight: 0, padding: "0 6px", fontSize: 11 }}
                    value={milestone.status}
                    onChange={(event) =>
                      changeStatus(milestone, event.target.value as SajuMilestoneStatus)
                    }
                    disabled={pending}
                    aria-label={`Estado de ${milestone.title}`}
                  >
                    {MILESTONE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {MILESTONE_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </div>

                {milestone.notes && <p className="cc-hint">{milestone.notes}</p>}
              </div>
            </article>
          );
        })}
      </div>

      {adding ? (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--cc-line)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            className="cc-input"
            value={form.title}
            placeholder="Título del hito"
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input
              className="cc-input"
              style={{ flex: "1 1 200px" }}
              value={form.counterpart}
              placeholder="Persona + cargo"
              onChange={(event) => setForm({ ...form, counterpart: event.target.value })}
            />
            <input
              className="cc-input"
              style={{ flex: "1 1 160px" }}
              value={form.org}
              placeholder="Organización"
              onChange={(event) => setForm({ ...form, org: event.target.value })}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <input
              className="cc-input"
              style={{ flex: "0 1 90px" }}
              value={form.country}
              placeholder="País (ES)"
              maxLength={2}
              onChange={(event) => setForm({ ...form, country: event.target.value.toUpperCase() })}
            />
            <input
              type="date"
              className="cc-input cc-num"
              style={{ flex: "0 1 170px" }}
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              aria-label="Fecha del hito"
            />
            <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.tentative}
                onChange={(event) => setForm({ ...form, tentative: event.target.checked })}
              />
              Por confirmar
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="cc-btn cc-btn--primary cc-btn--sm"
              onClick={submit}
              disabled={pending || !form.title.trim() || !form.counterpart.trim() || !form.date}
            >
              Guardar hito
            </button>
            <button
              type="button"
              className="cc-btn cc-btn--ghost cc-btn--sm"
              onClick={() => setAdding(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        milestones.length > 0 && (
          <button
            type="button"
            className="cc-btn cc-btn--ghost cc-btn--sm"
            style={{ marginTop: 16 }}
            onClick={() => setAdding(true)}
          >
            + Añadir hito
          </button>
        )
      )}
    </div>
  );
}
