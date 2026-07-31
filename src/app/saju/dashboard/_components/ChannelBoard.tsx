"use client";

import { useState, useTransition } from "react";
import type { SajuChannel, SajuEffortStatus } from "@prisma/client";
import {
  CHANNEL_LABEL,
  EFFORT_STATUSES,
  EFFORT_STATUS_LABEL,
  SAJU_BOARD_CHANNELS,
  countryMeta,
} from "@/lib/saju/command-center";
import { formatShortDate } from "@/lib/saju/format";
import type { SajuEffortDTO } from "@/lib/saju/types";
import { createEffort, updateEffort } from "../actions";
import { useToast } from "./ToastProvider";

/**
 * Tablero de esfuerzos por canal. Cada tarjeta resume su carga de trabajo
 * (en curso / planeados / completados) y permite alta rápida y cambio de
 * estado sin salir de la vista.
 */
export function ChannelBoard({ efforts }: { efforts: SajuEffortDTO[] }) {
  return (
    <div className="cc-grid-4">
      {SAJU_BOARD_CHANNELS.map((channel) => (
        <ChannelCard
          key={channel}
          channel={channel}
          efforts={efforts.filter((effort) => effort.channel === channel)}
        />
      ))}
    </div>
  );
}

function ChannelCard({
  channel,
  efforts,
}: {
  channel: SajuChannel;
  efforts: SajuEffortDTO[];
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [outlet, setOutlet] = useState("");
  const [plannedFor, setPlannedFor] = useState("");
  const [pending, startTransition] = useTransition();
  const { report } = useToast();

  const counts = {
    EN_CURSO: efforts.filter((effort) => effort.status === "EN_CURSO").length,
    PLANEADO: efforts.filter((effort) => effort.status === "PLANEADO").length,
    COMPLETADO: efforts.filter((effort) => effort.status === "COMPLETADO").length,
  };

  function submit() {
    startTransition(async () => {
      const result = await createEffort({
        channel,
        title,
        country: country || null,
        outlet: outlet || null,
        plannedFor: plannedFor || null,
      });
      if (report(result, "Esfuerzo añadido")) {
        setTitle("");
        setCountry("");
        setOutlet("");
        setPlannedFor("");
        setAdding(false);
      }
    });
  }

  function changeStatus(effort: SajuEffortDTO, status: SajuEffortStatus) {
    startTransition(async () => {
      const result = await updateEffort({ id: effort.id, status });
      report(result, `${EFFORT_STATUS_LABEL[status]} · ${effort.title}`);
    });
  }

  return (
    <div className="cc-card cc-card--pad" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <p className="cc-label">{CHANNEL_LABEL[channel]}</p>
        <span className="cc-num" style={{ fontSize: 13 }}>
          {efforts.length}
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        {EFFORT_STATUSES.map((status) => (
          <div key={status}>
            <span className="cc-num cc-num--md">{counts[status]}</span>
            <p className="cc-hint" style={{ fontSize: 11 }}>
              {EFFORT_STATUS_LABEL[status].toLowerCase()}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, flex: 1 }}>
        {efforts.length === 0 && !adding && (
          <p className="cc-empty">
            Sin esfuerzos en este canal —{" "}
            <button
              type="button"
              className="cc-btn cc-btn--ghost cc-btn--sm"
              onClick={() => setAdding(true)}
            >
              añadir el primero
            </button>
          </p>
        )}

        {efforts.map((effort) => (
          <div key={effort.id} className="cc-effort">
            <p className="cc-effort__title">{effort.title}</p>
            <div className="cc-effort__meta">
              {effort.country && (
                <span className="cc-chip">
                  <span aria-hidden="true">{countryMeta(effort.country).flag}</span>
                  {countryMeta(effort.country).code}
                </span>
              )}
              {!effort.country && <span className="cc-chip">Global</span>}
              {effort.outlet && <span className="cc-chip">{effort.outlet}</span>}
              {effort.plannedFor && (
                <span className="cc-num" style={{ fontSize: 11, color: "var(--cc-muted)" }}>
                  {formatShortDate(new Date(effort.plannedFor))}
                </span>
              )}
              <select
                className={`cc-select cc-pill cc-pill--${effort.status}`}
                style={{ width: "auto", height: 22, minHeight: 0, padding: "0 6px" }}
                value={effort.status}
                onChange={(event) => changeStatus(effort, event.target.value as SajuEffortStatus)}
                disabled={pending}
                aria-label={`Estado de ${effort.title}`}
              >
                {EFFORT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {EFFORT_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            className="cc-input"
            value={title}
            placeholder="Título del esfuerzo"
            onChange={(event) => setTitle(event.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="cc-input"
              value={country}
              placeholder="País (PA)"
              maxLength={2}
              onChange={(event) => setCountry(event.target.value.toUpperCase())}
              style={{ flex: "0 1 90px" }}
            />
            <input
              className="cc-input"
              value={outlet}
              placeholder="Medio / soporte"
              onChange={(event) => setOutlet(event.target.value)}
            />
          </div>
          <input
            type="date"
            className="cc-input cc-num"
            value={plannedFor}
            onChange={(event) => setPlannedFor(event.target.value)}
            aria-label="Fecha prevista"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="cc-btn cc-btn--primary cc-btn--sm"
              onClick={submit}
              disabled={pending || title.trim().length === 0}
            >
              Guardar
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
        efforts.length > 0 && (
          <button
            type="button"
            className="cc-btn cc-btn--ghost cc-btn--sm"
            style={{ marginTop: 12, alignSelf: "flex-start" }}
            onClick={() => setAdding(true)}
          >
            + Añadir esfuerzo
          </button>
        )
      )}
    </div>
  );
}
