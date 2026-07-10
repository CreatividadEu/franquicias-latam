"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ── La Evaluación Privada ────────────────────────────────────────────────────
// Espacio inmersivo de calificación: una pregunta por pantalla, matching a
// programa y cierre en llamada de evaluación de 10 minutos. Estética Midnight
// (hereda las variables de fuente de .hdf-root; estilos con prefijo hdx-).

// TODO(negocio): crear en Calendly un evento dedicado de 10 minutos y
// reemplazar esta URL.
const EVAL_CALL_URL =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

type ProgramKey = "bootcamp" | "development" | "ecosystem";

const PROGRAMS: Record<
  ProgramKey,
  { name: string; tagline: string; audience: string; accent: string; glow: string }
> = {
  bootcamp: {
    name: "Franchise Bootcamp",
    tagline: "El sistema esencial para volverte franquiciable, rápido.",
    audience: "Marcas en crecimiento",
    accent: "#37E6C3",
    glow: "rgba(55, 230, 195, 0.35)",
  },
  development: {
    name: "Franchise Development",
    tagline: "Consultoría integral: modelo, manuales, finanzas y expansión.",
    audience: "Empresas medianas y grandes",
    accent: "#6EA8FF",
    glow: "rgba(110, 168, 255, 0.35)",
  },
  ecosystem: {
    name: "Franchise Ecosystem",
    tagline: "Auditoría, ventas, formación y operación de tu red completa.",
    audience: "Grandes compañías y redes",
    accent: "#FFA24F",
    glow: "rgba(255, 162, 79, 0.35)",
  },
};

const UNIDADES = [
  { value: "1", label: "1 unidad" },
  { value: "2-5", label: "2 – 5" },
  { value: "6-20", label: "6 – 20" },
  { value: "20+", label: "Más de 20" },
];

const FACTURACION = [
  { value: "lt300k", label: "Menos de USD $300K" },
  { value: "300k-1m", label: "USD $300K – $1M" },
  { value: "1m-5m", label: "USD $1M – $5M" },
  { value: "5m+", label: "USD $5M+" },
  { value: "reservado", label: "Prefiero decirlo en la llamada" },
];

const OBJETIVOS = [
  { value: "expandir", label: "Expandir con franquicias" },
  { value: "sistematizar", label: "Ordenar y sistematizar" },
  { value: "capital", label: "Levantar capital o socios" },
  { value: "auditoria", label: "Auditoría, ventas y formación de mi red" },
];

const HORIZONTES = [
  { value: "ya", label: "Ya — es prioridad" },
  { value: "1-3m", label: "En 1 a 3 meses" },
  { value: "3-6m", label: "En 3 a 6 meses" },
  { value: "explorando", label: "Explorando" },
];

const ROLES = ["Fundador/a", "CEO", "Socio/a", "Director/a", "Otro"];

function labelOf(list: { value: string; label: string }[], value: string) {
  return list.find((o) => o.value === value)?.label ?? value;
}

type Answers = {
  empresa: string;
  nombre: string;
  rol: string;
  ubicacion: string;
  unidades: string;
  facturacion: string;
  objetivo: string;
  horizonte: string;
  whatsapp: string;
  email: string;
};

const EMPTY_ANSWERS: Answers = {
  empresa: "",
  nombre: "",
  rol: "",
  ubicacion: "",
  unidades: "",
  facturacion: "",
  objetivo: "",
  horizonte: "",
  whatsapp: "",
  email: "",
};

function recommendProgram(a: Answers): ProgramKey {
  const unitTier =
    ({ "1": 0, "2-5": 1, "6-20": 2, "20+": 3 } as Record<string, number>)[
      a.unidades
    ] ?? 0;
  const revTier =
    (
      {
        lt300k: 0,
        "300k-1m": 1,
        "1m-5m": 2,
        "5m+": 3,
        reservado: 1,
      } as Record<string, number>
    )[a.facturacion] ?? 1;
  const size = Math.max(unitTier, revTier);

  if (a.objetivo === "auditoria" || size >= 3) return "ecosystem";
  if (size >= 2) return "development";
  return "bootcamp";
}

// Pasos del formulario (sin contar intro ni reveal).
const TOTAL_STEPS = 8;

type Phase = "intro" | "form" | "computing" | "reveal";

export function EvaluationExperience({
  open,
  initialCompany,
  onClose,
}: {
  open: boolean;
  initialCompany?: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const everOpenedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (open) everOpenedRef.current = true;

  // Semilla de empresa desde la tarjeta.
  useEffect(() => {
    if (open && initialCompany) {
      setAnswers((prev) =>
        prev.empresa ? prev : { ...prev, empresa: initialCompany },
      );
    }
  }, [open, initialCompany]);

  // Bloquear scroll + Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Autofocus del input visible en cada paso.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 420);
    return () => window.clearTimeout(id);
  }, [open, phase, step]);

  const set = (patch: Partial<Answers>) =>
    setAnswers((prev) => ({ ...prev, ...patch }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const pickAndNext = (patch: Partial<Answers>) => {
    set(patch);
    window.setTimeout(next, 170);
  };

  const program = useMemo(() => recommendProgram(answers), [answers]);
  const rec = PROGRAMS[program];

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim());
  const phoneOk = answers.whatsapp.replace(/\D/g, "").length >= 8;

  const submit = async () => {
    if (submitting || !emailOk || !phoneOk) return;
    setSubmitting(true);
    setSubmitError(null);
    const message = [
      "── EVALUACIÓN PRIVADA ──",
      `Programa: ${rec.name}`,
      `Empresa: ${answers.empresa || "—"}`,
      `Rol: ${answers.rol || "—"}`,
      `Operación: ${answers.ubicacion || "—"}`,
      `Unidades: ${labelOf(UNIDADES, answers.unidades)}`,
      `Facturación: ${labelOf(FACTURACION, answers.facturacion)}`,
      `Objetivo: ${labelOf(OBJETIVOS, answers.objetivo)}`,
      `Horizonte: ${labelOf(HORIZONTES, answers.horizonte)}`,
    ].join("\n");

    try {
      const res = await fetch("/api/leads/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: answers.nombre,
          email: answers.email.trim(),
          phone: answers.whatsapp,
          franchiseSlug: "evaluacion-privada",
          sourceType: "evaluacion_privada",
          landingSource: "home_evaluacion",
          type: "evaluacion",
          investmentRange: answers.facturacion,
          city: answers.ubicacion,
          message,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setPhase("computing");
      window.setTimeout(() => setPhase("reveal"), 1900);
    } catch {
      setSubmitError(
        "No pudimos guardar tus datos. Intenta de nuevo o escríbenos por WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!everOpenedRef.current) return null;

  const progress =
    phase === "intro" ? 0 : phase === "form" ? (step + 1) / (TOTAL_STEPS + 1) : 1;

  return (
    <div
      className={`hdx-root${open ? " hdx-root--open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Evaluación Privada"
      inert={!open}
    >
      {/* Fondo */}
      <div aria-hidden className="hdx-bg">
        <div className="hdx-aurora" />
        <div className="hdx-grid" />
      </div>

      {/* Barra superior */}
      <div className="hdx-top">
        <span className="hdx-brand">
          Evaluación <em>Privada</em>
        </span>
        <div className="hdx-progress">
          <span className="hdx-progress-fill" style={{ width: `${Math.max(6, progress * 100)}%` }} />
        </div>
        <button type="button" className="hdx-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
      </div>

      {/* Contenido */}
      <div className="hdx-stage">
        {phase === "intro" && (
          <div className="hdx-screen" key="intro">
            <em className="hdx-eyebrow">Confidencial · Sin costo · 2 minutos</em>
            <h2 className="hdx-title">
              El punto de partida <em className="hdx-serif">de los grandes.</em>
            </h2>
            <p className="hdx-sub">
              Totto, Sodexo y más de 750 marcas empezaron igual: con un
              diagnóstico honesto. Ocho preguntas y sabrás exactamente cuál es
              tu ruta — y si calificas a una llamada de evaluación de 10
              minutos con nuestro equipo.
            </p>
            <button
              type="button"
              className="hdx-cta"
              onClick={() => setPhase("form")}
            >
              Comenzar <span aria-hidden>→</span>
            </button>
          </div>
        )}

        {phase === "form" && (
          <div className="hdx-screen" key={`step-${step}`}>
            <em className="hdx-eyebrow">
              {String(step + 1).padStart(2, "0")} / {TOTAL_STEPS}
            </em>

            {step === 0 && (
              <>
                <h2 className="hdx-title">
                  ¿Cómo se llama <em className="hdx-serif">tu marca?</em>
                </h2>
                <input
                  ref={inputRef}
                  className="hdx-input"
                  placeholder="Nombre de la empresa"
                  value={answers.empresa}
                  onChange={(e) => set({ empresa: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answers.empresa.trim()) next();
                  }}
                />
                <StepNav
                  canNext={answers.empresa.trim().length > 1}
                  onNext={next}
                />
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="hdx-title">
                  ¿Quién lidera <em className="hdx-serif">esta conversación?</em>
                </h2>
                <input
                  ref={inputRef}
                  className="hdx-input"
                  placeholder="Tu nombre"
                  value={answers.nombre}
                  onChange={(e) => set({ nombre: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answers.nombre.trim() && answers.rol)
                      next();
                  }}
                />
                <div className="hdx-chips">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`hdx-chip${answers.rol === r ? " hdx-chip--on" : ""}`}
                      onClick={() => set({ rol: r })}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <StepNav
                  canNext={answers.nombre.trim().length > 1 && !!answers.rol}
                  onNext={next}
                  onBack={back}
                />
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="hdx-title">
                  ¿Dónde está tu <em className="hdx-serif">operación principal?</em>
                </h2>
                <input
                  ref={inputRef}
                  className="hdx-input"
                  placeholder="Ciudad, país — ej. Bogotá, Colombia"
                  value={answers.ubicacion}
                  onChange={(e) => set({ ubicacion: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answers.ubicacion.trim()) next();
                  }}
                />
                <StepNav
                  canNext={answers.ubicacion.trim().length > 1}
                  onNext={next}
                  onBack={back}
                />
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="hdx-title">
                  ¿Cuántas unidades <em className="hdx-serif">operan hoy?</em>
                </h2>
                <div className="hdx-chips hdx-chips--grid">
                  {UNIDADES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={`hdx-chip${answers.unidades === o.value ? " hdx-chip--on" : ""}`}
                      onClick={() => pickAndNext({ unidades: o.value })}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <StepNav onBack={back} />
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="hdx-title">
                  ¿Facturación anual <em className="hdx-serif">aproximada?</em>
                </h2>
                <div className="hdx-chips hdx-chips--grid">
                  {FACTURACION.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={`hdx-chip${answers.facturacion === o.value ? " hdx-chip--on" : ""}`}
                      onClick={() => pickAndNext({ facturacion: o.value })}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <StepNav onBack={back} />
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="hdx-title">
                  ¿Tu objetivo <em className="hdx-serif">número uno?</em>
                </h2>
                <div className="hdx-chips hdx-chips--grid">
                  {OBJETIVOS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={`hdx-chip${answers.objetivo === o.value ? " hdx-chip--on" : ""}`}
                      onClick={() => pickAndNext({ objetivo: o.value })}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <StepNav onBack={back} />
              </>
            )}

            {step === 6 && (
              <>
                <h2 className="hdx-title">
                  ¿Cuándo quieres <em className="hdx-serif">empezar?</em>
                </h2>
                <div className="hdx-chips hdx-chips--grid">
                  {HORIZONTES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={`hdx-chip${answers.horizonte === o.value ? " hdx-chip--on" : ""}`}
                      onClick={() => pickAndNext({ horizonte: o.value })}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <StepNav onBack={back} />
              </>
            )}

            {step === 7 && (
              <>
                <h2 className="hdx-title">
                  ¿A dónde enviamos <em className="hdx-serif">tu evaluación?</em>
                </h2>
                <input
                  ref={inputRef}
                  className="hdx-input"
                  type="tel"
                  placeholder="WhatsApp — con código de país"
                  value={answers.whatsapp}
                  onChange={(e) => set({ whatsapp: e.target.value })}
                />
                <input
                  className="hdx-input"
                  type="email"
                  placeholder="Email"
                  value={answers.email}
                  onChange={(e) => set({ email: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                />
                {submitError && <p className="hdx-error">{submitError}</p>}
                <div className="hdx-nav">
                  <button type="button" className="hdx-back" onClick={back}>
                    ← Atrás
                  </button>
                  <button
                    type="button"
                    className="hdx-cta"
                    disabled={!emailOk || !phoneOk || submitting}
                    onClick={submit}
                  >
                    {submitting ? "Enviando…" : "Ver mi ruta"}{" "}
                    <span aria-hidden>→</span>
                  </button>
                </div>
                <p className="hdx-fine">
                  Tus datos son confidenciales. Los usamos solo para preparar tu
                  evaluación.
                </p>
              </>
            )}
          </div>
        )}

        {phase === "computing" && (
          <div className="hdx-screen hdx-screen--center" key="computing">
            <div className="hdx-nodes" aria-hidden>
              <span className="hdx-node" />
              <span className="hdx-node" />
              <span className="hdx-node" />
            </div>
            <em className="hdx-serif hdx-computing-text">
              Analizando tu perfil…
            </em>
          </div>
        )}

        {phase === "reveal" && (
          <div className="hdx-screen" key="reveal">
            <em className="hdx-eyebrow">
              {answers.empresa || "Tu marca"} · Evaluación completada
            </em>
            <h2 className="hdx-title hdx-title--sm">
              Tu ruta recomendada <em className="hdx-serif">existe.</em>
            </h2>

            <div
              className="hdx-program"
              style={{
                borderColor: rec.accent,
                boxShadow: `0 30px 90px -30px ${rec.glow}`,
              }}
            >
              <span className="hdx-program-aud" style={{ color: rec.accent }}>
                {rec.audience}
              </span>
              <span className="hdx-program-name">{rec.name}</span>
              <span className="hdx-program-tag">{rec.tagline}</span>
            </div>

            {program === "bootcamp" && (
              <div className="hdx-ia">
                <span className="hdx-ia-dot" aria-hidden />
                <span>
                  También calificas a <strong>Franquicias.ia</strong> — abre el
                  1 de agosto · <strong>4 cupos</strong>. Pregúntanos en la
                  llamada.
                </span>
              </div>
            )}

            <div className="hdx-others">
              {(Object.keys(PROGRAMS) as ProgramKey[])
                .filter((k) => k !== program)
                .map((k) => (
                  <span key={k} className="hdx-other">
                    {PROGRAMS[k].name}
                    <em> · {PROGRAMS[k].audience}</em>
                  </span>
                ))}
            </div>

            <a
              href={EVAL_CALL_URL}
              target="_blank"
              rel="noreferrer"
              className="hdx-cta hdx-cta--big"
            >
              Reservar mi llamada de evaluación (10 min){" "}
              <span aria-hidden>→</span>
            </a>
            <p className="hdx-fine">
              Sin costo · Te confirmamos por WhatsApp al{" "}
              {answers.whatsapp || "número que nos diste"}.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hdx-root {
          position: fixed;
          inset: 0;
          z-index: 70;
          display: none;
          flex-direction: column;
          background: #05080f;
          color: #f2f5fc;
          font-family: var(--font-space-grotesk), system-ui, sans-serif;
        }
        .hdx-root--open {
          display: flex;
          animation: hdx-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .hdx-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .hdx-aurora {
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          width: min(1100px, 94vw);
          height: 440px;
          background: radial-gradient(
            closest-side,
            rgba(110, 168, 255, 0.16),
            rgba(55, 230, 195, 0.06) 55%,
            transparent 75%
          );
          filter: blur(44px);
          animation: hdx-breath 9s ease-in-out infinite;
        }
        .hdx-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 30%, transparent 78%);
          mask-image: radial-gradient(ellipse 70% 60% at 50% 42%, #000 30%, transparent 78%);
        }

        .hdx-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px 20px;
        }
        @media (min-width: 640px) {
          .hdx-top {
            padding: 22px 32px;
          }
        }
        .hdx-brand {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .hdx-brand em {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          color: #8fdcec;
        }
        .hdx-progress {
          flex: 1;
          height: 2px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .hdx-progress-fill {
          display: block;
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #6ea8ff, #37e6c3, #ffa24f);
          transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .hdx-close {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          color: #c9d6ee;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hdx-close:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }

        .hdx-stage {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 20px 48px;
          overflow-y: auto;
        }
        .hdx-screen {
          width: 100%;
          max-width: 640px;
          animation: hdx-step 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .hdx-screen--center {
          text-align: center;
        }
        .hdx-eyebrow {
          display: block;
          font-style: normal;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #5e6f8f;
          margin-bottom: 16px;
        }
        .hdx-title {
          margin: 0 0 26px;
          font-size: clamp(30px, 5vw, 46px);
          line-height: 1.08;
          letter-spacing: -0.025em;
          font-weight: 600;
        }
        .hdx-title--sm {
          font-size: clamp(26px, 4vw, 38px);
        }
        .hdx-serif {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(100deg, #6ea8ff, #37e6c3, #6ea8ff);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: hdx-drift 7s ease-in-out infinite;
        }
        .hdx-sub {
          margin: 0 0 34px;
          font-size: 17px;
          line-height: 1.65;
          color: #8e9fbe;
          max-width: 560px;
        }

        .hdx-input {
          display: block;
          width: 100%;
          margin-bottom: 14px;
          padding: 18px 20px;
          font-size: 18px;
          font-family: inherit;
          color: #f2f5fc;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 14px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        }
        .hdx-input::placeholder {
          color: #5e6f8f;
        }
        .hdx-input:focus {
          border-color: rgba(110, 168, 255, 0.65);
          box-shadow: 0 0 0 4px rgba(110, 168, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
        }

        .hdx-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 6px;
        }
        .hdx-chips--grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 560px) {
          .hdx-chips--grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .hdx-chip {
          padding: 15px 18px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: #d7e1f5;
          font-family: inherit;
          font-size: 15.5px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .hdx-chip:hover {
          transform: translateY(-2px);
          border-color: rgba(110, 168, 255, 0.55);
          background: rgba(110, 168, 255, 0.08);
        }
        .hdx-chip--on {
          border-color: #37e6c3;
          background: rgba(55, 230, 195, 0.1);
          color: #fff;
          box-shadow: 0 8px 28px -12px rgba(55, 230, 195, 0.5);
        }

        .hdx-nav {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 22px;
        }
        .hdx-back {
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: #8e9fbe;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hdx-back:hover {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .hdx-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(90deg, #ff7a29, #ffa24f);
          color: #160900;
          font-family: inherit;
          font-size: 16.5px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 14px 40px -12px rgba(255, 122, 41, 0.55);
          transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .hdx-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 52px -12px rgba(255, 122, 41, 0.7);
        }
        .hdx-cta:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }
        .hdx-cta--big {
          margin-top: 26px;
          padding: 18px 34px;
          font-size: 17.5px;
        }
        .hdx-error {
          margin: 4px 0 0;
          font-size: 14px;
          color: #ff8a8a;
        }
        .hdx-fine {
          margin-top: 14px;
          font-size: 13px;
          color: #5e6f8f;
        }

        /* Computing */
        .hdx-nodes {
          display: flex;
          justify-content: center;
          gap: 26px;
          margin-bottom: 26px;
        }
        .hdx-node {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0a1020;
          border: 2px solid #6ea8ff;
          animation: hdx-node 1.1s ease-in-out infinite;
        }
        .hdx-node:nth-child(2) {
          border-color: #37e6c3;
          animation-delay: 0.18s;
        }
        .hdx-node:nth-child(3) {
          border-color: #ffa24f;
          animation-delay: 0.36s;
        }
        .hdx-computing-text {
          font-size: 28px;
        }

        /* Reveal */
        .hdx-program {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
          padding: 28px 30px;
          border-radius: 20px;
          border: 1px solid;
          background: rgba(10, 16, 32, 0.8);
          animation: hdx-step 0.5s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .hdx-program-aud {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .hdx-program-name {
          font-size: clamp(28px, 4.4vw, 40px);
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.05;
        }
        .hdx-program-tag {
          font-size: 16px;
          line-height: 1.55;
          color: #a9b8d6;
        }
        .hdx-ia {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
          padding: 13px 18px;
          border-radius: 14px;
          border: 1px solid rgba(55, 230, 195, 0.3);
          background: rgba(55, 230, 195, 0.06);
          font-size: 14.5px;
          color: #c9ede2;
        }
        .hdx-ia strong {
          color: #37e6c3;
        }
        .hdx-ia-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #37e6c3;
          box-shadow: 0 0 10px rgba(55, 230, 195, 0.9);
          animation: hdx-node 2s ease-in-out infinite;
        }
        .hdx-others {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 22px;
          margin-top: 18px;
        }
        .hdx-other {
          font-size: 13.5px;
          font-weight: 600;
          color: #5e6f8f;
        }
        .hdx-other em {
          font-style: normal;
          font-weight: 500;
          color: #44536f;
        }

        @keyframes hdx-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes hdx-step {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes hdx-breath {
          0%,
          100% {
            opacity: 0.8;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.06);
          }
        }
        @keyframes hdx-drift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes hdx-node {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.7;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hdx-root--open,
          .hdx-screen,
          .hdx-program,
          .hdx-aurora,
          .hdx-serif,
          .hdx-node,
          .hdx-ia-dot {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function StepNav({
  canNext,
  onNext,
  onBack,
}: {
  canNext?: boolean;
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="hdx-nav">
      {onBack && (
        <button type="button" className="hdx-back" onClick={onBack}>
          ← Atrás
        </button>
      )}
      {onNext && (
        <button
          type="button"
          className="hdx-cta"
          disabled={canNext === false}
          onClick={onNext}
        >
          Continuar <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}
