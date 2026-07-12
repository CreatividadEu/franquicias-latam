"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { homeClientLogos, type BrandLogo } from "./homeBrandData";

// ── La Evaluación Privada ────────────────────────────────────────────────────
// Espacio inmersivo de calificación: una pregunta por pantalla, matching a
// programa y cierre en llamada de evaluación de 10 minutos. Estética Midnight
// (hereda las variables de fuente de .hdf-root; estilos con prefijo hdx-).

// TODO(negocio): crear en Calendly un evento dedicado de 10 minutos y
// reemplazar esta URL.
const EVAL_CALL_URL =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

// Franquicias.ai — cohorte fundacional (agosto 2026, hora Bogotá). Los cupos
// comparten la variable de entorno del home para mostrar el mismo número.
const FIA_URL = "https://franquicias.ai";
const FIA_OPENS_AT = Date.parse("2026-08-01T00:00:00-05:00");
const FIA_CUPOS_TOTAL = 14;
const FIA_CUPOS_RESTANTES = Math.min(
  Math.max(
    Number.parseInt(process.env.NEXT_PUBLIC_FIA_CUPOS ?? "5", 10) || 5,
    1,
  ),
  FIA_CUPOS_TOTAL,
);
const FIA_CUPOS_TOMADOS = FIA_CUPOS_TOTAL - FIA_CUPOS_RESTANTES;

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

// Glifo de identidad por programa: rayo (velocidad), capas (estructura),
// órbita (red completa).
function ProgramGlyph({ k }: { k: ProgramKey }) {
  if (k === "bootcamp") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M13 2 4.5 13.5H11L9.5 22 19.5 9.5H12.5L13 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (k === "development") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3 21 8 12 13 3 8 12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M3 12.5 12 17.5 21 12.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 17 12 22 21 17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle
        cx="12"
        cy="12"
        r="8.8"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".55"
      />
      <circle cx="19.5" cy="7.5" r="1.7" fill="currentColor" />
      <circle cx="4.4" cy="16.4" r="1.7" fill="currentColor" />
      <circle cx="14.5" cy="20.2" r="1.7" fill="currentColor" />
    </svg>
  );
}

// Marquee de clientes en el intro (duplicado para el loop continuo).
const INTRO_LOGOS = [...homeClientLogos, ...homeClientLogos];

function logosBy(...alts: string[]): BrandLogo[] {
  return alts
    .map((alt) => homeClientLogos.find((l) => l.alt === alt))
    .filter((l): l is BrandLogo => Boolean(l));
}

// Referencias de éxito por programa (paso de contacto): que el último paso no
// se sienta vacío y ancle la decisión con casos reales.
const PROGRAM_PROOF: Record<ProgramKey, { line: string; logos: BrandLogo[] }> =
  {
    bootcamp: {
      line: "Totto también empezó con una tienda en Bogotá. Hoy: 450 tiendas en más de 40 países.",
      logos: logosBy("Totto", "Andrés"),
    },
    development: {
      line: "Sodexo, Nutresa y más de 750 marcas estructuraron su expansión con esta metodología.",
      logos: logosBy("Sodexo", "Nutresa"),
    },
    ecosystem: {
      line: "Las redes más grandes de la región auditan, venden y forman su franquicia con nuestro equipo.",
      logos: logosBy("Subway", "Mercado Libre", "BID"),
    },
  };

// Chispas del cierre (celebración al revelar el programa). Valores
// deterministas derivados del índice: nada de aleatoriedad en render.
const BURST_SPARKS = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2;
  const dist = 110 + ((i * 53) % 80);
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist * 0.72) - 36,
    color: ["#37E6C3", "#6EA8FF", "#FFA24F", "#FFD9B8"][i % 4],
    delay: (i % 5) * 0.06,
    size: 5 + ((i * 37) % 5),
  };
});

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
  const calRef = useRef<HTMLDivElement | null>(null);

  const scrollToCal = () => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    calRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

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

  // Cuenta regresiva de Franquicias.ai: solo corre mientras el reveal está
  // en pantalla (este subárbol nunca se renderiza en servidor).
  const [fiaNow, setFiaNow] = useState(() => Date.now());
  useEffect(() => {
    if (!open || phase !== "reveal") return;
    setFiaNow(Date.now());
    const id = window.setInterval(() => setFiaNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open, phase]);

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
  const proof = PROGRAM_PROOF[program];
  const firstName = answers.nombre.trim().split(/\s+/)[0] ?? "";

  // Reveal: evidencia personalizada (las respuestas que calibraron el match)
  // y cuenta regresiva a la apertura de Franquicias.ai.
  const whyChips = [
    answers.unidades && labelOf(UNIDADES, answers.unidades),
    answers.facturacion && labelOf(FACTURACION, answers.facturacion),
    answers.objetivo && labelOf(OBJETIVOS, answers.objetivo),
    answers.horizonte && labelOf(HORIZONTES, answers.horizonte),
  ].filter((c): c is string => Boolean(c));

  const fiaMsLeft = Math.max(0, FIA_OPENS_AT - fiaNow);
  const fiaCountdown = [
    ["días", Math.floor(fiaMsLeft / 86_400_000)],
    ["hrs", Math.floor(fiaMsLeft / 3_600_000) % 24],
    ["min", Math.floor(fiaMsLeft / 60_000) % 60],
    ["seg", Math.floor(fiaMsLeft / 1_000) % 60],
  ] as const;

  // Rastro de respuestas: mini-chips que se van acumulando bajo el contador
  // de paso — refuerzo visible de avance.
  const crumbs = [
    step > 0 && answers.empresa.trim(),
    step > 1 &&
      firstName &&
      `${firstName}${answers.rol ? ` · ${answers.rol}` : ""}`,
    step > 2 && answers.ubicacion.trim(),
    step > 3 && answers.unidades && labelOf(UNIDADES, answers.unidades),
    step > 4 &&
      answers.facturacion &&
      labelOf(FACTURACION, answers.facturacion),
    step > 5 && answers.objetivo && labelOf(OBJETIVOS, answers.objetivo),
    step > 6 && answers.horizonte && labelOf(HORIZONTES, answers.horizonte),
  ].filter((c): c is string => Boolean(c));

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
            <div className="hdx-intro-proof">
              <span className="hdx-intro-caption">
                Confiaron en este proceso
              </span>
              <div className="hdx-intro-logos" aria-hidden>
                <div className="hdx-intro-track">
                  {INTRO_LOGOS.map((logo, i) => (
                    <Image
                      key={`${logo.alt}-${i}`}
                      src={logo.src}
                      alt=""
                      width={120}
                      height={44}
                      className="hdx-intro-logo"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "form" && (
          <div className="hdx-screen" key={`step-${step}`}>
            <em className="hdx-eyebrow">
              {String(step + 1).padStart(2, "0")} /{" "}
              {String(TOTAL_STEPS).padStart(2, "0")}
              {step === TOTAL_STEPS - 1 ? " · Último paso" : ""}
            </em>

            {crumbs.length > 0 && (
              <div className="hdx-crumbs" aria-hidden>
                {crumbs.map((c, i) => (
                  <span key={`${i}-${c}`} className="hdx-crumb">
                    <i>✓</i>
                    {c}
                  </span>
                ))}
              </div>
            )}

            {step === 0 && (
              <>
                <h2 className="hdx-title">
                  ¿Cómo se llama <em className="hdx-serif">tu marca?</em>
                </h2>
                <input
                  ref={inputRef}
                  className="hdx-input"
                  placeholder="Nombre de tu Negocio"
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
                  {firstName ? (
                    <>
                      {firstName}, ¿dónde está{" "}
                      <em className="hdx-serif">tu operación principal?</em>
                    </>
                  ) : (
                    <>
                      ¿Dónde está tu{" "}
                      <em className="hdx-serif">operación principal?</em>
                    </>
                  )}
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
                  {firstName ? `${firstName}, ¿a` : "¿A"} dónde enviamos{" "}
                  <em className="hdx-serif">tu evaluación?</em>
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
                    {submitting ? "Enviando…" : "Ver mi programa"}{" "}
                    <span aria-hidden>→</span>
                  </button>
                </div>
                <p className="hdx-fine">
                  Tus datos son confidenciales. Los usamos solo para preparar tu
                  evaluación.
                </p>
                <div className="hdx-proof">
                  <div className="hdx-proof-logos">
                    {proof.logos.map((logo) => (
                      <Image
                        key={logo.alt}
                        src={logo.src}
                        alt={logo.alt}
                        width={120}
                        height={44}
                        className="hdx-proof-logo"
                      />
                    ))}
                  </div>
                  <p className="hdx-proof-line">{proof.line}</p>
                </div>
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
              {answers.empresa.trim()
                ? `Analizando el perfil de ${answers.empresa.trim()}…`
                : "Analizando tu perfil…"}
            </em>
          </div>
        )}

        {phase === "reveal" && (
          <div className="hdx-screen hdx-screen--wide" key="reveal">
            <div className="hdx-burst" aria-hidden>
              {BURST_SPARKS.map((s, i) => (
                <span
                  key={i}
                  className="hdx-spark"
                  style={
                    {
                      "--dx": `${s.dx}px`,
                      "--dy": `${s.dy}px`,
                      "--dl": `${s.delay}s`,
                      width: s.size,
                      height: s.size,
                      background: s.color,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <div className="hdx-seal">
              <span className="hdx-seal-check" aria-hidden>
                ✓
              </span>
              Evaluación completada
            </div>
            <h2 className="hdx-title hdx-title--sm">
              <strong className="hdx-name">{firstName || "Listo"}</strong>, el
              programa ideal para{" "}
              <em className="hdx-serif">
                {answers.empresa.trim() || "tu negocio"}
              </em>{" "}
              es el siguiente:
            </h2>

            {/* Dossier del programa recomendado: protagonista absoluto */}
            <div
              className="hdxr-hero"
              style={
                { "--pc": rec.accent, "--pg": rec.glow } as React.CSSProperties
              }
            >
              <div className="hdxr-hero-body">
                <div className="hdxr-hero-head">
                  <span className="hdxr-hero-icon" aria-hidden>
                    <ProgramGlyph k={program} />
                  </span>
                  <span className="hdxr-hero-id">
                    <span className="hdxr-hero-aud">{rec.audience}</span>
                    <span className="hdxr-hero-name">{rec.name}</span>
                  </span>
                  <span className="hdxr-hero-flag">✓ Tu programa</span>
                </div>
                <p className="hdxr-hero-tagline">{rec.tagline}</p>
                <div className="hdxr-why">
                  <span className="hdxr-why-caption">
                    Calibrado con tus respuestas
                  </span>
                  <div className="hdxr-why-chips">
                    {whyChips.map((c) => (
                      <span key={c} className="hdxr-why-chip">
                        <i aria-hidden>✓</i>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hdxr-hero-foot">
                  <button type="button" className="hdx-cta" onClick={scrollToCal}>
                    Agendar mi llamada <span aria-hidden>↓</span>
                  </button>
                  <div className="hdxr-hero-proof">
                    {proof.logos.map((logo) => (
                      <Image
                        key={logo.alt}
                        src={logo.src}
                        alt={logo.alt}
                        width={110}
                        height={40}
                        className="hdxr-hero-logo"
                      />
                    ))}
                    <p>{proof.line}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Los otros dos programas quedan en segundo plano */}
            <div className="hdxr-alt">
              {(Object.keys(PROGRAMS) as ProgramKey[])
                .filter((k) => k !== program)
                .map((k) => {
                  const p = PROGRAMS[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      className="hdxr-alt-card"
                      style={{ "--pc": p.accent } as React.CSSProperties}
                      onClick={scrollToCal}
                    >
                      <span className="hdxr-alt-icon" aria-hidden>
                        <ProgramGlyph k={k} />
                      </span>
                      <span className="hdxr-alt-text">
                        <b>{p.name}</b>
                        <i>{p.audience}</i>
                      </span>
                      <span className="hdxr-alt-cta">
                        Compáralo en la llamada →
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Franquicias.ai — el futuro, protagonista del cierre */}
            <section
              className="hdxr-ai"
              aria-label="Franquicias.ai — cohorte fundacional"
            >
              <span className="hdxr-ai-halo" aria-hidden />
              <span className="hdxr-ai-beam" aria-hidden />
              <em className="hdxr-ai-eyebrow">
                Acceso anticipado · Cohorte fundacional · Agosto 2026
              </em>
              <p className="hdxr-ai-mark">
                franquicias<span>.ai</span>
              </p>
              <p className="hdxr-ai-lede">
                La nueva era de franquiciar, potenciada por inteligencia
                artificial. Esta evaluación deja a{" "}
                <strong>{answers.empresa.trim() || "tu negocio"}</strong> en la
                lista de pre-calificados — asegura tu cupo en la llamada.
              </p>
              <div className="hdxr-ai-live">
                {fiaMsLeft > 0 ? (
                  <div
                    className="hdxr-count"
                    role="timer"
                    aria-label="Tiempo restante para la apertura de Franquicias.ai"
                  >
                    {fiaCountdown.map(([label, value]) => (
                      <span key={label} className="hdxr-count-cell">
                        <b>{String(value).padStart(2, "0")}</b>
                        <i>{label}</i>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="hdxr-count-open">Cohorte abierta</span>
                )}
                <div className="hdxr-cupos">
                  <span className="hdxr-cupos-bar" aria-hidden>
                    {Array.from({ length: FIA_CUPOS_TOTAL }, (_, i) => (
                      <span
                        key={i}
                        className={`hdxr-seg${
                          i < FIA_CUPOS_TOMADOS ? " hdxr-seg--taken" : ""
                        }`}
                      />
                    ))}
                  </span>
                  <span className="hdxr-cupos-label">
                    Quedan{" "}
                    <strong>
                      {FIA_CUPOS_RESTANTES} de {FIA_CUPOS_TOTAL}
                    </strong>{" "}
                    cupos
                  </span>
                </div>
              </div>
              <div className="hdxr-ai-actions">
                <button type="button" className="hdx-cta" onClick={scrollToCal}>
                  Reservar mi cupo en la llamada <span aria-hidden>↓</span>
                </button>
                <a
                  className="hdxr-ai-link"
                  href={FIA_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Conocer franquicias.ai ↗
                </a>
              </div>
            </section>

            <div className="hdx-cal" ref={calRef}>
              <div className="hdx-cal-head">
                <span className="hdx-cal-title">
                  Último paso: reserva tu llamada de evaluación{" "}
                  <em>— 10 minutos, sin costo</em>
                </span>
                <a
                  href={EVAL_CALL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hdx-cal-ext"
                >
                  Abrir en otra pestaña ↗
                </a>
              </div>
              <iframe
                src={`${EVAL_CALL_URL}?hide_landing_page_details=1&hide_event_type_details=1&hide_gdpr_banner=1&background_color=0a1020&text_color=f2f5fc&primary_color=ff7a29`}
                title="Reserva tu llamada de evaluación (10 minutos)"
                loading="lazy"
                className="hdx-cal-frame"
              />
            </div>
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
          justify-content: center;
          padding: 24px 20px 48px;
          overflow-y: auto;
        }
        .hdx-screen {
          position: relative;
          width: 100%;
          max-width: 640px;
          /* auto vertical: centrado cuando cabe, scroll natural cuando no
             (el reveal con Calendly embebido es más alto que el viewport). */
          margin: auto 0;
          animation: hdx-in 0.4s ease both;
        }
        /* Cascada: cada bloque del paso entra con un pequeño desfase. */
        .hdx-screen > * {
          animation: hdx-step 0.48s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .hdx-screen > *:nth-child(2) {
          animation-delay: 0.06s;
        }
        .hdx-screen > *:nth-child(3) {
          animation-delay: 0.12s;
        }
        .hdx-screen > *:nth-child(4) {
          animation-delay: 0.18s;
        }
        .hdx-screen > *:nth-child(5) {
          animation-delay: 0.24s;
        }
        .hdx-screen > *:nth-child(n + 6) {
          animation-delay: 0.3s;
        }
        .hdx-screen--wide {
          max-width: 760px;
        }
        .hdx-screen--center {
          text-align: center;
        }
        /* En desktop el paso vive dentro de un panel de vidrio: le da cuerpo
           al formulario en pantallas grandes (en móvil sigue a sangre). */
        @media (min-width: 860px) {
          /* Dentro del panel el ancho útil es menor: un título algo más
             contenido evita que las frases se partan a 3 líneas. */
          .hdx-screen .hdx-title {
            font-size: clamp(28px, 4.2vw, 41px);
          }
          .hdx-screen .hdx-title--sm {
            font-size: clamp(26px, 3.6vw, 36px);
          }
          .hdx-stage .hdx-screen--wide {
            max-width: 900px;
          }
          .hdx-screen {
            padding: 44px 52px 40px;
            border-radius: 26px;
            border: 1px solid rgba(255, 255, 255, 0.09);
            background: linear-gradient(180deg, rgba(16, 24, 44, 0.72), rgba(8, 12, 24, 0.58));
            box-shadow: 0 60px 140px -60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
          }
          .hdx-screen::before {
            content: "";
            position: absolute;
            top: 0;
            left: 44px;
            right: 44px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(110, 168, 255, 0.45), rgba(55, 230, 195, 0.45), transparent);
          }
          .hdx-screen--center {
            padding: 0;
            border: none;
            background: none;
            box-shadow: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
          .hdx-screen--center::before {
            content: none;
          }
        }
        .hdx-eyebrow {
          display: block;
          font-style: normal;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8fa1c4;
          margin-bottom: 16px;
        }
        .hdx-title {
          margin: 0 0 26px;
          font-size: clamp(30px, 5vw, 46px);
          line-height: 1.08;
          letter-spacing: -0.025em;
          font-weight: 600;
          /* Sin huérfanos ni cortes raros: líneas equilibradas. */
          text-wrap: balance;
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
          font-size: 17.5px;
          line-height: 1.65;
          color: #b9c6e3;
          max-width: 560px;
          text-wrap: pretty;
        }
        .hdx-name {
          font-weight: 800;
          color: #ffffff;
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
          color: #7d8fb0;
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
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.045);
          color: #e8eefb;
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
          color: #a8b7d4;
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
          font-size: 13.5px;
          color: #8296b8;
        }
        .hdx-kbd {
          display: none;
          font-size: 12.5px;
          color: #7d8fb0;
        }
        .hdx-kbd b {
          font-weight: 700;
          color: #a8b7d4;
        }
        @media (min-width: 860px) {
          .hdx-kbd {
            display: inline;
          }
        }
        .hdx-crumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: -4px 0 20px;
        }
        .hdx-crumb {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          font-size: 12px;
          font-weight: 600;
          color: #a8b7d4;
          animation: hdx-crumb-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .hdx-crumb i {
          font-style: normal;
          font-size: 10.5px;
          color: #37e6c3;
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

        /* ── Reveal 2.0 ─────────────────────────────────────────────────
           Jerarquía de cierre: dossier del programa recomendado (borde de
           luz giratorio + evidencia personalizada), programas alternos en
           segundo plano y monumento Franquicias.ai con FOMO en vivo. */
        @property --hdxr-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        .hdxr-hero {
          --hdxr-angle: 0deg;
          position: relative;
          margin-top: 14px;
          border-radius: 22px;
          padding: 1.5px;
          /* Fallback para navegadores sin @property: anillo estático. */
          background: rgba(255, 255, 255, 0.13);
          background:
            conic-gradient(
              from var(--hdxr-angle),
              transparent,
              var(--pc) 14%,
              transparent 30%,
              transparent 52%,
              rgba(255, 255, 255, 0.4) 60%,
              transparent 74%
            ),
            rgba(255, 255, 255, 0.13);
          box-shadow: 0 40px 110px -38px var(--pg);
          animation:
            hdxr-spin 6s linear infinite,
            hdx-step 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.18s both;
        }
        .hdxr-hero-body {
          position: relative;
          border-radius: 20.5px;
          padding: 26px 22px 22px;
          background: linear-gradient(180deg, rgba(13, 20, 38, 0.97), rgba(7, 11, 22, 0.98));
          background:
            radial-gradient(120% 90% at 12% 0%, color-mix(in srgb, var(--pc) 13%, transparent), transparent 55%),
            linear-gradient(180deg, rgba(13, 20, 38, 0.97), rgba(7, 11, 22, 0.98));
        }
        @media (min-width: 860px) {
          .hdxr-hero-body {
            padding: 30px 32px 26px;
          }
        }
        .hdxr-hero-head {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .hdxr-hero-icon {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          border-radius: 15px;
          color: var(--pc);
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          border-color: color-mix(in srgb, var(--pc) 40%, transparent);
          background: color-mix(in srgb, var(--pc) 12%, transparent);
          box-shadow: 0 0 28px -8px var(--pg);
          flex-shrink: 0;
        }
        .hdxr-hero-icon svg {
          width: 26px;
          height: 26px;
        }
        .hdxr-hero-id {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .hdxr-hero-aud {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--pc);
        }
        .hdxr-hero-name {
          font-size: clamp(24px, 3.4vw, 34px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.05;
        }
        .hdxr-hero-flag {
          margin-left: auto;
          padding: 6px 14px;
          border-radius: 999px;
          background: var(--pc);
          color: #06121c;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          box-shadow: 0 10px 30px -10px var(--pg);
        }
        .hdxr-hero-tagline {
          margin: 14px 0 0;
          font-size: 16px;
          line-height: 1.6;
          color: #c3d0ea;
          max-width: 560px;
          text-wrap: pretty;
        }
        .hdxr-why {
          margin-top: 18px;
        }
        .hdxr-why-caption {
          display: block;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8fa1c4;
        }
        .hdxr-why-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hdxr-why-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
          border-color: color-mix(in srgb, var(--pc) 30%, transparent);
          background: color-mix(in srgb, var(--pc) 7%, transparent);
          font-size: 13px;
          font-weight: 600;
          color: #e8eefb;
          animation: hdx-crumb-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .hdxr-why-chip:nth-child(2) {
          animation-delay: 0.07s;
        }
        .hdxr-why-chip:nth-child(3) {
          animation-delay: 0.14s;
        }
        .hdxr-why-chip:nth-child(4) {
          animation-delay: 0.21s;
        }
        .hdxr-why-chip i {
          font-style: normal;
          font-size: 10.5px;
          color: var(--pc);
        }
        .hdxr-hero-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px 24px;
          margin-top: 22px;
        }
        .hdxr-hero-proof {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 240px;
        }
        .hdxr-hero-logo {
          height: 22px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.7;
          flex-shrink: 0;
        }
        .hdxr-hero-proof p {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: #97a8c9;
          text-wrap: pretty;
        }

        .hdxr-alt {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }
        @media (min-width: 560px) {
          .hdxr-alt {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
        .hdxr-alt-card {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 12px;
          padding: 14px 16px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 16, 32, 0.6);
          color: #e8eefb;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .hdxr-alt-card:hover {
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--pc) 55%, transparent);
          background: color-mix(in srgb, var(--pc) 6%, rgba(10, 16, 32, 0.6));
        }
        .hdxr-alt-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: var(--pc);
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          border-color: color-mix(in srgb, var(--pc) 32%, transparent);
          background: color-mix(in srgb, var(--pc) 9%, transparent);
          flex-shrink: 0;
        }
        .hdxr-alt-icon svg {
          width: 17px;
          height: 17px;
        }
        .hdxr-alt-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .hdxr-alt-text b {
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .hdxr-alt-text i {
          font-style: normal;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8fa1c4;
        }
        .hdxr-alt-cta {
          margin-left: auto;
          font-size: 12px;
          font-weight: 700;
          color: var(--pc);
          white-space: nowrap;
        }

        /* Monumento Franquicias.ai */
        .hdxr-ai {
          position: relative;
          overflow: hidden;
          margin-top: 26px;
          padding: 40px 20px 36px;
          border-radius: 24px;
          border: 1px solid rgba(55, 230, 195, 0.22);
          background:
            radial-gradient(120% 130% at 50% -10%, rgba(55, 230, 195, 0.13), transparent 55%),
            radial-gradient(90% 100% at 85% 110%, rgba(110, 168, 255, 0.12), transparent 60%),
            linear-gradient(180deg, #070d1c, #05080f);
          text-align: center;
        }
        @media (min-width: 860px) {
          .hdxr-ai {
            padding: 52px 48px 46px;
          }
        }
        .hdxr-ai-halo {
          position: absolute;
          left: 50%;
          top: 10%;
          transform: translateX(-50%);
          width: min(480px, 90%);
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(55, 230, 195, 0.2), transparent 70%);
          filter: blur(30px);
          pointer-events: none;
          animation: hdxr-halo 6s ease-in-out infinite;
        }
        .hdxr-ai-beam {
          position: absolute;
          top: 0;
          left: -30%;
          width: 55%;
          height: 100%;
          pointer-events: none;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255, 255, 255, 0.05) 45%,
            rgba(55, 230, 195, 0.08) 52%,
            transparent 62%
          );
          animation: hdxr-beam 5.5s ease-in-out infinite;
        }
        .hdxr-ai-eyebrow {
          position: relative;
          display: block;
          font-style: normal;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #7ee7cf;
          margin-bottom: 18px;
        }
        .hdxr-ai-mark {
          position: relative;
          margin: 0;
          font-size: clamp(38px, 9vw, 84px);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1;
          color: #ffffff;
        }
        .hdxr-ai-mark span {
          background: linear-gradient(100deg, #37e6c3, #6ea8ff, #37e6c3);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 0 22px rgba(55, 230, 195, 0.45));
          animation: hdx-drift 5s ease-in-out infinite;
        }
        .hdxr-ai-lede {
          position: relative;
          margin: 16px auto 0;
          max-width: 560px;
          font-size: 15.5px;
          line-height: 1.65;
          color: #b9c6e3;
          text-wrap: pretty;
        }
        .hdxr-ai-lede strong {
          color: #ffffff;
        }
        .hdxr-ai-live {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          margin-top: 26px;
        }
        @media (min-width: 720px) {
          .hdxr-ai-live {
            flex-direction: row;
            justify-content: center;
            gap: 36px;
          }
        }
        .hdxr-count {
          display: flex;
          gap: 8px;
        }
        .hdxr-count-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          min-width: 56px;
          padding: 10px 8px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
        }
        .hdxr-count-cell b {
          font-size: 24px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          color: #ffffff;
        }
        .hdxr-count-cell i {
          font-style: normal;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7d8fb0;
        }
        .hdxr-count-open {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #37e6c3;
        }
        .hdxr-cupos {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
        }
        .hdxr-cupos-bar {
          display: flex;
          gap: 4px;
        }
        .hdxr-seg {
          width: 13px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid rgba(55, 230, 195, 0.55);
          background: rgba(55, 230, 195, 0.14);
          box-shadow: 0 0 12px -2px rgba(55, 230, 195, 0.5);
          animation: hdxr-seg 2.4s ease-in-out infinite;
        }
        .hdxr-seg--taken {
          border-color: rgba(255, 255, 255, 0.13);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: none;
          animation: none;
        }
        .hdxr-cupos-label {
          font-size: 13px;
          color: #a8b7d4;
        }
        .hdxr-cupos-label strong {
          color: #37e6c3;
          font-weight: 800;
        }
        .hdxr-ai-actions {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 14px 24px;
          margin-top: 28px;
        }
        .hdxr-ai-link {
          font-size: 14px;
          font-weight: 600;
          color: #8fdcec;
          text-decoration: none;
          transition: color 0.2s;
        }
        .hdxr-ai-link:hover {
          color: #d6f3fb;
        }
        /* Intro: marquee de clientes */
        .hdx-intro-proof {
          margin-top: 40px;
        }
        .hdx-intro-caption {
          display: block;
          margin-bottom: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7d8fb0;
        }
        .hdx-intro-logos {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
        }
        .hdx-intro-track {
          display: flex;
          align-items: center;
          gap: 44px;
          width: max-content;
          padding-right: 44px;
          animation: hdx-marquee 26s linear infinite;
        }
        .hdx-intro-logo {
          height: 30px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.65;
        }

        /* Paso de contacto: referencias del programa tentativo */
        .hdx-proof {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 26px;
          padding: 18px 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(255, 255, 255, 0.03);
        }
        @media (min-width: 640px) {
          .hdx-proof {
            flex-direction: row;
            align-items: center;
            gap: 22px;
          }
        }
        .hdx-proof-logos {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }
        .hdx-proof-logo {
          height: 26px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.75;
        }
        .hdx-proof-line {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.55;
          color: #b0bfdd;
          text-wrap: pretty;
        }

        /* Reveal: sello + chispas + Calendly embebido */
        .hdx-seal {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(55, 230, 195, 0.35);
          background: rgba(55, 230, 195, 0.08);
          color: #37e6c3;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .hdx-screen > .hdx-seal {
          animation: hdx-seal-pop 0.55s cubic-bezier(0.2, 1.4, 0.3, 1) both;
        }
        .hdx-seal-check {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #37e6c3;
          color: #05221b;
          font-size: 11px;
          font-weight: 800;
        }
        .hdx-burst {
          position: absolute;
          inset: 0;
          overflow: visible;
          pointer-events: none;
          z-index: 2;
        }
        .hdx-screen > .hdx-burst {
          animation: none;
        }
        .hdx-spark {
          position: absolute;
          left: 50%;
          top: 110px;
          border-radius: 2px;
          opacity: 0;
          animation: hdx-spark 1.15s cubic-bezier(0.16, 0.8, 0.3, 1) var(--dl, 0s) both;
        }
        .hdx-cal {
          margin-top: 28px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 16, 32, 0.8);
          overflow: hidden;
        }
        .hdx-cal-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px 16px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hdx-cal-title {
          font-size: 15px;
          font-weight: 700;
        }
        .hdx-cal-title em {
          font-style: normal;
          font-weight: 500;
          color: #8fa1c4;
        }
        .hdx-cal-ext {
          font-size: 12.5px;
          font-weight: 600;
          color: #8fdcec;
          text-decoration: none;
          white-space: nowrap;
        }
        .hdx-cal-ext:hover {
          color: #d6f3fb;
        }
        .hdx-cal-frame {
          display: block;
          width: 100%;
          height: 620px;
          border: 0;
          background: #0a1020;
        }
        @media (max-width: 639px) {
          .hdx-cal-frame {
            height: 560px;
          }
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
        @keyframes hdx-marquee {
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes hdx-crumb-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes hdx-seal-pop {
          from {
            opacity: 0;
            transform: scale(0.55);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes hdxr-spin {
          to {
            --hdxr-angle: 360deg;
          }
        }
        @keyframes hdxr-halo {
          0%,
          100% {
            opacity: 0.75;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.08);
          }
        }
        @keyframes hdxr-beam {
          0% {
            transform: translateX(-70%);
          }
          55%,
          100% {
            transform: translateX(280%);
          }
        }
        @keyframes hdxr-seg {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes hdx-spark {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4) rotate(0deg);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(1) rotate(300deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hdx-root--open,
          .hdx-screen,
          .hdx-screen > *,
          .hdx-aurora,
          .hdx-serif,
          .hdx-node,
          .hdx-intro-track,
          .hdx-crumb,
          .hdx-screen > .hdx-seal,
          .hdxr-hero,
          .hdxr-why-chip,
          .hdxr-ai-halo,
          .hdxr-ai-beam,
          .hdxr-ai-mark span,
          .hdxr-seg {
            animation: none !important;
          }
          .hdxr-alt-card,
          .hdxr-alt-card:hover {
            transform: none;
            transition: none;
          }
          .hdx-spark {
            display: none;
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
        <>
          <button
            type="button"
            className="hdx-cta"
            disabled={canNext === false}
            onClick={onNext}
          >
            Continuar <span aria-hidden>→</span>
          </button>
          <span className="hdx-kbd" aria-hidden>
            presiona <b>Enter ↵</b>
          </span>
        </>
      )}
    </div>
  );
}
