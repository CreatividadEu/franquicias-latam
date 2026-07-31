"use client";

import { useEffect, useState, useTransition } from "react";
import type { SajuInterest, SajuLeadType, SajuStage } from "@prisma/client";
import {
  INTEREST_LABEL,
  SAJU_COUNTRIES,
  SAJU_INTERESTS,
  SAJU_LEAD_TYPES,
  SAJU_STAGES,
  STAGE_LABEL,
  TYPE_LABEL,
} from "@/lib/saju/command-center";
import { createLead } from "../actions";
import { Portal } from "./Portal";
import { useToast } from "./ToastProvider";

const EMPTY = {
  name: "",
  company: "",
  role: "",
  country: "PA",
  city: "",
  type: "PUNTO_UNICO" as SajuLeadType,
  stage: "PROSPECTO" as SajuStage,
  interest: "MEDIO" as SajuInterest,
  keyInsight: "",
  nextAction: "",
  nextActionDate: "",
  notes: "",
};

/** Alta de lead en línea: modal ligero, sin salir del tablero. */
export function NewLeadButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [pending, startTransition] = useTransition();
  const { report } = useToast();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function submit() {
    startTransition(async () => {
      const result = await createLead({
        ...form,
        company: form.company || null,
        role: form.role || null,
        city: form.city || null,
        keyInsight: form.keyInsight || null,
        nextAction: form.nextAction || null,
        nextActionDate: form.nextActionDate || null,
        notes: form.notes || null,
      });
      if (report(result, `${form.name} añadido al pipeline`)) {
        setForm(EMPTY);
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button type="button" className="cc-btn cc-btn--primary" onClick={() => setOpen(true)}>
        + Nuevo lead
      </button>

      {open && (
        <Portal>
          <div className="cc-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="cc-modal" role="dialog" aria-modal="true" aria-label="Nuevo lead">
            <div className="cc-modal__panel">
              <header className="cc-modal__head">
                <h2 style={{ fontSize: 16 }}>Nuevo lead</h2>
                <button
                  type="button"
                  className="cc-btn cc-btn--ghost cc-btn--sm"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </button>
              </header>

              <div className="cc-modal__body">
                <label className="cc-field">
                  <span className="cc-label">Nombre *</span>
                  <input
                    className="cc-input"
                    autoFocus
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Nombre y apellido, o razón social"
                  />
                </label>

                <div className="cc-modal__row">
                  <label className="cc-field">
                    <span className="cc-label">Empresa / contexto</span>
                    <input
                      className="cc-input"
                      value={form.company}
                      onChange={(event) => setForm({ ...form, company: event.target.value })}
                    />
                  </label>
                  <label className="cc-field">
                    <span className="cc-label">Cargo</span>
                    <input
                      className="cc-input"
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value })}
                    />
                  </label>
                </div>

                <div className="cc-modal__row">
                  <label className="cc-field">
                    <span className="cc-label">País *</span>
                    <select
                      className="cc-select"
                      value={form.country}
                      onChange={(event) => setForm({ ...form, country: event.target.value })}
                    >
                      {SAJU_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="cc-field">
                    <span className="cc-label">Ciudad</span>
                    <input
                      className="cc-input"
                      value={form.city}
                      onChange={(event) => setForm({ ...form, city: event.target.value })}
                    />
                  </label>
                </div>

                <div className="cc-modal__row">
                  <label className="cc-field">
                    <span className="cc-label">Tipo</span>
                    <select
                      className="cc-select"
                      value={form.type}
                      onChange={(event) =>
                        setForm({ ...form, type: event.target.value as SajuLeadType })
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
                    <span className="cc-label">Etapa</span>
                    <select
                      className="cc-select"
                      value={form.stage}
                      onChange={(event) =>
                        setForm({ ...form, stage: event.target.value as SajuStage })
                      }
                    >
                      {SAJU_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {STAGE_LABEL[stage]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="cc-modal__row">
                  <label className="cc-field">
                    <span className="cc-label">Interés</span>
                    <select
                      className="cc-select"
                      value={form.interest}
                      onChange={(event) =>
                        setForm({ ...form, interest: event.target.value as SajuInterest })
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
                    <span className="cc-label">Fecha próxima acción</span>
                    <input
                      type="date"
                      className="cc-input cc-num"
                      value={form.nextActionDate}
                      onChange={(event) =>
                        setForm({ ...form, nextActionDate: event.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="cc-field">
                  <span className="cc-label">Próxima acción</span>
                  <input
                    className="cc-input"
                    value={form.nextAction}
                    onChange={(event) => setForm({ ...form, nextAction: event.target.value })}
                    placeholder="Qué toca hacer"
                  />
                </label>

                <label className="cc-field">
                  <span className="cc-label">Palanca de cierre</span>
                  <input
                    className="cc-input"
                    value={form.keyInsight}
                    onChange={(event) => setForm({ ...form, keyInsight: event.target.value })}
                    placeholder="Qué mueve la decisión"
                  />
                </label>

                <label className="cc-field">
                  <span className="cc-label">Notas</span>
                  <textarea
                    className="cc-textarea"
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  />
                </label>
              </div>

              <div className="cc-modal__foot">
                <button
                  type="button"
                  className="cc-btn cc-btn--ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn--primary"
                  onClick={submit}
                  disabled={pending || form.name.trim().length === 0}
                >
                  {pending ? "Guardando…" : "Crear lead"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
