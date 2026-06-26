"use client";

import { useState } from "react";
import { Strike } from "./Tachalo";
import { track } from "./track";
import { SAJU } from "../data";

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  investmentRange: string;
  experience: string;
  referral: string;
  message: string;
  consent: boolean;
  company: string; // honeypot
};

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  investmentRange: "",
  experience: "",
  referral: "",
  message: "",
  consent: false,
  company: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: FormState) {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!f.name.trim()) e.name = "Cuéntanos tu nombre.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Necesitamos un email válido.";
  if (f.phone.trim().replace(/\D/g, "").length < 7) e.phone = "Un WhatsApp con código de país.";
  if (!f.country) e.country = "Elige un país.";
  if (!f.investmentRange) e.investmentRange = "Selecciona tu capacidad de inversión.";
  if (f.experience.trim().length < 10) e.experience = "Cuéntanos un poco más.";
  if (!f.consent) e.consent = "Necesitamos tu autorización para contactarte.";
  return e;
}

export function ApplyForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [touchedStart, setTouchedStart] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set =
    (k: keyof FormState) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = ev.target.type === "checkbox" ? (ev.target as HTMLInputElement).checked : ev.target.value;
      setForm((p) => ({ ...p, [k]: value }));
      if (!touchedStart) {
        setTouchedStart(true);
        track("form_start");
      }
    };

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    const eMap = validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;
    if (form.company) return; // honeypot tripped → silently drop

    setLoading(true);
    try {
      const composedMessage = [
        form.referral ? `¿Cómo nos conoció?: ${form.referral}` : "",
        form.message.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/leads/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          franchiseSlug: SAJU.slug,
          listingSlug: SAJU.slug,
          country: form.country,
          city: form.city.trim(),
          cityInterest: form.city.trim(),
          investmentRange: form.investmentRange,
          experience: form.experience.trim(),
          message: composedMessage || null,
          consent: form.consent,
          landingSource: "saju-landing",
          campaign: "saju-franquicias",
          source: "saju",
          type: "form",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No pudimos enviar tu aplicación.");
      }

      track("form_submit_success", { investmentRange: form.investmentRange, country: form.country });
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
      track("form_submit_error", { message: msg });
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="saju-success" role="status" aria-live="polite">
        <div className="saju-success__check">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="saju-success__title">
          ✓ Aplicación <Strike>enviada</Strike>
        </h3>
        <p className="saju-success__sub">
          Ya está en la lista. El equipo de Franquicias LATAM revisará tu perfil y te contactará para
          los siguientes pasos. Mientras tanto, sigue tachando.
        </p>
      </div>
    );
  }

  const invalid = (k: keyof FormState) => (errors[k] ? "true" : undefined);

  return (
    <form className="saju-form" onSubmit={handleSubmit} noValidate>
      <div className="saju-form__grid">
        {/* honeypot */}
        <div className="saju-honey" aria-hidden="true">
          <label>
            Empresa
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.company}
              onChange={set("company")}
            />
          </label>
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-name">
            Nombre completo <span>*</span>
          </label>
          <input
            id="saju-name"
            className="saju-input"
            value={form.name}
            onChange={set("name")}
            aria-invalid={invalid("name")}
            placeholder="Tu nombre"
          />
          {errors.name && <span className="saju-error">{errors.name}</span>}
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-email">
            Email <span>*</span>
          </label>
          <input
            id="saju-email"
            type="email"
            className="saju-input"
            value={form.email}
            onChange={set("email")}
            aria-invalid={invalid("email")}
            placeholder="tu@email.com"
          />
          {errors.email && <span className="saju-error">{errors.email}</span>}
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-phone">
            WhatsApp / teléfono <span>*</span>
          </label>
          <input
            id="saju-phone"
            type="tel"
            className="saju-input"
            value={form.phone}
            onChange={set("phone")}
            aria-invalid={invalid("phone")}
            placeholder="+57 300 000 0000"
          />
          {errors.phone && <span className="saju-error">{errors.phone}</span>}
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-country">
            País de interés <span>*</span>
          </label>
          <select
            id="saju-country"
            className="saju-select"
            value={form.country}
            onChange={set("country")}
            aria-invalid={invalid("country")}
          >
            <option value="">Selecciona…</option>
            {SAJU.countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.country && <span className="saju-error">{errors.country}</span>}
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-city">
            Ciudad
          </label>
          <input
            id="saju-city"
            className="saju-input"
            value={form.city}
            onChange={set("city")}
            placeholder="Opcional"
          />
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-invest">
            Capacidad de inversión <span>*</span>
          </label>
          <select
            id="saju-invest"
            className="saju-select"
            value={form.investmentRange}
            onChange={set("investmentRange")}
            aria-invalid={invalid("investmentRange")}
          >
            <option value="">Selecciona…</option>
            {SAJU.investmentRanges.map((r) => (
              <option key={r} value={r}>
                {r} USD
              </option>
            ))}
          </select>
          {errors.investmentRange && <span className="saju-error">{errors.investmentRange}</span>}
        </div>

        <div className="saju-field saju-field--full">
          <label className="saju-label" htmlFor="saju-exp">
            Experiencia empresarial · cuéntanos qué has <span>tachado</span> *
          </label>
          <textarea
            id="saju-exp"
            className="saju-textarea"
            value={form.experience}
            onChange={set("experience")}
            aria-invalid={invalid("experience")}
            placeholder="Negocios que has construido, sectores, tu red local…"
          />
          {errors.experience && <span className="saju-error">{errors.experience}</span>}
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-ref">
            ¿Cómo nos conociste?
          </label>
          <select id="saju-ref" className="saju-select" value={form.referral} onChange={set("referral")}>
            <option value="">Selecciona…</option>
            {SAJU.referralOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="saju-field">
          <label className="saju-label" htmlFor="saju-msg">
            ¿Por qué Sajú?
          </label>
          <input
            id="saju-msg"
            className="saju-input"
            value={form.message}
            onChange={set("message")}
            placeholder="Opcional"
          />
        </div>

        <label className="saju-consent">
          <input type="checkbox" checked={form.consent} onChange={set("consent")} aria-invalid={invalid("consent")} />
          <span>
            Autorizo a Franquicias LATAM a tratar mis datos para esta solicitud, según su{" "}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer">
              política de privacidad
            </a>
            . <span style={{ color: "var(--yellow)" }}>*</span>
          </span>
        </label>
        {errors.consent && <span className="saju-error" style={{ gridColumn: "1 / -1" }}>{errors.consent}</span>}

        {serverError && <div className="saju-formfail" role="alert">{serverError}</div>}

        <div className="saju-form__submit">
          <button type="submit" className="saju-btn saju-btn--yellow saju-btn--block" disabled={loading}>
            {loading ? "Enviando…" : "Empecemos a tachar →"}
          </button>
        </div>
        <p className="saju-formnote">
          Tu aplicación va directo al equipo de Franquicias LATAM, que la califica y la presenta a Sajú.
        </p>
      </div>
    </form>
  );
}
