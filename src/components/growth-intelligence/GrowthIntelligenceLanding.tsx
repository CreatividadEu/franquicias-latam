"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const PRIMARY_CTA_HREF = "/quiz";
const TEAM_CTA_HREF =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0 },
    );
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
    );
    document
      .querySelectorAll(".reveal-hero")
      .forEach((el) => heroObserver.observe(el));
    document
      .querySelectorAll(".reveal")
      .forEach((el) => scrollObserver.observe(el));
    return () => {
      heroObserver.disconnect();
      scrollObserver.disconnect();
    };
  }, []);
}

// ─── Diagnostic Data ──────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    q: "¿Tu flujo de caja acompaña tu nivel de ventas actual?",
    opts: [
      "Sí, están alineados",
      "Hay tensión pero es manejable",
      "No, la caja está constantemente apretada",
    ],
  },
  {
    q: "¿Tu operación puede absorber 2x la demanda actual sin degradar calidad?",
    opts: [
      "Sí, tenemos capacidad",
      "Podría, con ajustes importantes",
      "No, ya operamos al límite",
    ],
  },
  {
    q: "¿Podrías replicar tu modelo en otra ciudad sin que dependa de ti?",
    opts: [
      "Sí, el modelo funciona solo",
      "En parte, pero me necesitan demasiado",
      "No, depende completamente de mí",
    ],
  },
  {
    q: "¿Tienes claridad de en qué parte de tu operación IA te daría ventaja real?",
    opts: [
      "Sí, tengo la secuencia definida",
      "Tengo ideas pero sin secuencia clara",
      "No tengo claridad todavía",
    ],
  },
];

const DIMENSIONS = [
  { label: "Caja", icon: "💰", color: "#00FFB2" },
  { label: "Operación", icon: "⚙️", color: "#00D4FF" },
  { label: "Expansión", icon: "🏗️", color: "#FFB800" },
  { label: "IA Ready", icon: "🤖", color: "#B060FF" },
];

const ROUTE_RESULTS = [
  {
    name: "Liberación de Caja",
    color: "#00FFB2",
    dimension: "Caja",
    desc: "Ordena prioridades para capturar liquidez y crear margen de maniobra antes de seguir escalando.",
  },
  {
    name: "Mejora de Desempeño",
    color: "#00D4FF",
    dimension: "Operación",
    desc: "Enfoca la mejora donde más impacta margen y capacidad operativa, sin añadir complejidad.",
  },
  {
    name: "Franchise Readiness",
    color: "#FFB800",
    dimension: "Expansión",
    desc: "Convierte el modelo en algo replicable y vendible antes de que la expansión se convierta en apuesta.",
  },
  {
    name: "Transformación IA",
    color: "#B060FF",
    dimension: "IA",
    desc: "Define dónde IA genera ventaja real y sobre qué base operativa implementarla con criterio.",
  },
];

// Deterministic scores based on answer index — 0=good, 1=medium, 2=bad
function getDimensionScores(answers: number[]): number[] {
  const table: [number, number, number][] = [
    [88, 54, 22], // Caja
    [85, 51, 20], // Operación
    [87, 53, 21], // Expansión
    [86, 52, 23], // IA
  ];
  return answers.map((a, i) => table[i][a]);
}

function getStatusForScore(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Saludable", color: "#00FFB2" };
  if (score >= 40) return { label: "Bajo presión", color: "#FFB800" };
  return { label: "Restricción activa", color: "#FF5555" };
}

// First question with worst answer drives the primary route
function getRoute(answers: number[]) {
  const max = Math.max(...answers);
  const idx = answers.indexOf(max);
  return ROUTE_RESULTS[idx];
}

// ─── Diagnostic Widget ────────────────────────────────────────────────────────
function DiagnosticWidget() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [route, setRoute] = useState<(typeof ROUTE_RESULTS)[number] | null>(null);
  const [dimScores, setDimScores] = useState<number[]>([]);
  const [animatedWidths, setAnimatedWidths] = useState<number[]>([0, 0, 0, 0]);
  const [displayScore, setDisplayScore] = useState(0);

  const overallScore =
    dimScores.length === 4
      ? Math.round(dimScores.reduce((a, b) => a + b, 0) / 4)
      : 0;

  // Count-up animation for overall score
  useEffect(() => {
    if (!done || overallScore === 0) return;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * overallScore));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [done, overallScore]);

  // Staggered bar animation after result mounts
  useEffect(() => {
    if (!done || dimScores.length !== 4) return;
    const timer = setTimeout(() => setAnimatedWidths(dimScores), 120);
    return () => clearTimeout(timer);
  }, [done, dimScores]);

  const handleNext = () => {
    if (selected === null) return;
    const next = [...answers, selected];
    if (step === QUESTIONS.length - 1) {
      setAnswers(next);
      setLoading(true);
      setTimeout(() => {
        const scores = getDimensionScores(next);
        setDimScores(scores);
        setRoute(getRoute(next));
        setLoading(false);
        setDone(true);
      }, 1900);
    } else {
      setTransitioning(true);
      setTimeout(() => {
        setAnswers(next);
        setStep(step + 1);
        setSelected(null);
        setTransitioning(false);
      }, 260);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setTransitioning(false);
    setLoading(false);
    setDone(false);
    setRoute(null);
    setDimScores([]);
    setAnimatedWidths([0, 0, 0, 0]);
    setDisplayScore(0);
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "320px",
        }}
      >
        {/* ── Loading / Analyzing ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#5A5F68",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Procesando señales
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "36px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="analyzing-dot"
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#00FFB2",
                    animationDelay: `${i * 0.16}s`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Leyendo flujo de caja...",
                "Evaluando capacidad operativa...",
                "Verificando readiness de expansión...",
                "Analizando madurez tecnológica...",
              ].map((line, i) => (
                <div
                  key={line}
                  className="analysis-line"
                  style={{
                    fontSize: "13px",
                    color: "#3A3F48",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                    animationDelay: `${i * 0.38}s`,
                  }}
                >
                  <span style={{ color: "#00FFB2", fontSize: "10px" }}>▶</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Active Question ── */}
        {!loading && !done && (
          <div className={transitioning ? "q-exit" : "q-enter"}>
            {/* Progress */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "32px",
              }}
            >
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "3px",
                    borderRadius: "999px",
                    flex: i === step ? 2 : 1,
                    background:
                      i < step
                        ? "#00FFB2"
                        : i === step
                          ? "#00FFB2"
                          : "rgba(255,255,255,0.08)",
                    opacity: i < step ? 0.45 : 1,
                    transition: "all 0.35s ease",
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: "11px",
                  color: "#5A5F68",
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {step + 1} / {QUESTIONS.length}
              </span>
            </div>

            {/* Dimension label */}
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  background: `${DIMENSIONS[step].color}18`,
                  border: `1px solid ${DIMENSIONS[step].color}30`,
                  borderRadius: "999px",
                  padding: "3px 10px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: DIMENSIONS[step].color,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {DIMENSIONS[step].icon} {DIMENSIONS[step].label}
              </span>
            </div>

            {/* Question */}
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#FAFAFA",
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
                marginBottom: "24px",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              {QUESTIONS[step].q}
            </h3>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {QUESTIONS[step].opts.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelected(i)}
                  style={{
                    background:
                      selected === i
                        ? "rgba(0,255,178,0.09)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected === i ? "#00FFB2" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "12px",
                    padding: "13px 18px",
                    textAlign: "left",
                    color: selected === i ? "#00FFB2" : "#FAFAFA",
                    fontSize: "14px",
                    fontWeight: selected === i ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `1.5px solid ${selected === i ? "#00FFB2" : "rgba(255,255,255,0.2)"}`,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      color: "#00FFB2",
                    }}
                  >
                    {selected === i ? "✓" : ""}
                  </span>
                  {opt}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={selected === null}
              style={{
                marginTop: "20px",
                width: "100%",
                background:
                  selected !== null ? "#00FFB2" : "rgba(255,255,255,0.04)",
                color: selected !== null ? "#050505" : "#5A5F68",
                border: "none",
                borderRadius: "999px",
                padding: "14px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: selected !== null ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              {step === QUESTIONS.length - 1 ? "Ver mi Growth Score →" : "Siguiente →"}
            </button>
          </div>
        )}

        {/* ── Result Screen ── */}
        {!loading && done && route && (
          <div>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "28px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#5A5F68",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Tu Growth Score
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "56px",
                      fontWeight: 800,
                      color: "#FAFAFA",
                      lineHeight: 1,
                      fontFamily: "'Instrument Sans', sans-serif",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {displayScore}
                  </span>
                  <span style={{ fontSize: "20px", color: "#5A5F68", fontWeight: 400 }}>
                    / 100
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: `${route.color}12`,
                  border: `1px solid ${route.color}30`,
                  borderRadius: "12px",
                  padding: "12px 16px",
                  textAlign: "right",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "#5A5F68",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  Restricción dominante
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: route.color,
                    fontFamily: "'Instrument Sans', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {route.name}
                </p>
              </div>
            </div>

            {/* Dimension breakdown */}
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#3A3F48",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Diagnóstico por dimensión
              </p>
              {DIMENSIONS.map((dim, i) => {
                const score = dimScores[i] ?? 0;
                const status = getStatusForScore(score);
                return (
                  <div key={dim.label} style={{ marginBottom: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "#8A8F98", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{dim.icon}</span>
                        {dim.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: status.color, fontWeight: 600 }}>
                          {status.label}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: dim.color,
                            minWidth: "36px",
                            textAlign: "right",
                          }}
                        >
                          {score}%
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${animatedWidths[i]}%`,
                          height: "100%",
                          background: dim.color,
                          borderRadius: "999px",
                          transition: `width 1.1s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.15}s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Route description */}
            <div
              style={{
                background: `${route.color}08`,
                border: `1px solid ${route.color}20`,
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "13px", color: "#8A8F98", lineHeight: 1.65 }}>
                {route.desc}
              </p>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href={PRIMARY_CTA_HREF}
                style={{
                  background: "#00FFB2",
                  color: "#050505",
                  padding: "14px 24px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                Solicitar diagnóstico completo →
              </Link>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#5A5F68",
                  padding: "11px 24px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Reiniciar evaluación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        marginBottom: "8px",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: open ? "rgba(0,255,178,0.04)" : "#0f0f0f",
          border: "none",
          padding: "20px 24px",
          textAlign: "left",
          color: "#FAFAFA",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          transition: "background 0.2s",
          fontFamily: "'Instrument Sans', sans-serif",
        }}
      >
        {q}
        <span
          aria-hidden="true"
          style={{
            color: "#00FFB2",
            fontSize: "22px",
            lineHeight: 1,
            flexShrink: 0,
            transition: "transform 0.22s ease",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            background: "#0a0a0a",
            padding: "8px 24px 20px",
            color: "#8A8F98",
            fontSize: "15px",
            lineHeight: 1.7,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────────
export function GrowthIntelligenceLanding() {
  useScrollReveal();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        html { scroll-behavior: smooth; }

        .gi-page { font-family: 'Inter', sans-serif; }
        .gi-display { font-family: 'Instrument Sans', sans-serif; }

        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        .reveal.d1 { transition-delay: 0.1s; }
        .reveal.d2 { transition-delay: 0.18s; }
        .reveal.d3 { transition-delay: 0.26s; }
        .reveal.d4 { transition-delay: 0.34s; }
        .reveal.d5 { transition-delay: 0.42s; }

        .reveal-hero {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .reveal-hero.is-visible { opacity: 1; transform: translateY(0); }
        .reveal-hero.d1 { transition-delay: 0.05s; }
        .reveal-hero.d2 { transition-delay: 0.12s; }
        .reveal-hero.d3 { transition-delay: 0.2s; }
        .reveal-hero.d4 { transition-delay: 0.28s; }

        /* Widget question transitions */
        @keyframes q-enter {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes q-exit {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-20px); }
        }
        .q-enter { animation: q-enter 0.28s ease forwards; }
        .q-exit  { animation: q-exit  0.22s ease forwards; }

        /* Analyzing dots */
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .analyzing-dot { animation: dot-bounce 1.4s ease-in-out infinite; }

        /* Analysis scan lines */
        @keyframes fade-in-line {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .analysis-line {
          opacity: 0;
          animation: fade-in-line 0.4s ease forwards;
        }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 32s linear infinite; }

        @keyframes badge-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,255,178,0.25); }
          50%      { box-shadow: 0 0 24px 4px rgba(0,255,178,0.12); }
        }
        .badge-pulse { animation: badge-pulse 3.5s ease-in-out infinite; }

        .gi-card {
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .gi-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0,255,178,0.28) !important;
          box-shadow: 0 0 32px rgba(0,255,178,0.07);
        }
        .gi-route-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0,212,255,0.3) !important;
          box-shadow: 0 0 32px rgba(0,212,255,0.08);
        }
        .gi-cost-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,85,85,0.25) !important;
          box-shadow: 0 0 28px rgba(255,85,85,0.06);
        }

        .gi-grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .two-col-grid { grid-template-columns: 1fr; gap: 48px; }
        }

        .gi-nav {
          display: none;
          align-items: center;
          gap: 28px;
          flex: 1;
          justify-content: center;
        }
        @media (min-width: 768px) { .gi-nav { display: flex; } }

        .nav-link {
          color: #8A8F98; font-size: 14px; font-weight: 500;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #FAFAFA; }

        :focus-visible {
          outline: 2px solid #00FFB2;
          outline-offset: 3px;
          border-radius: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal, .reveal-hero {
            opacity: 1 !important; transform: none !important; transition: none !important;
          }
          .marquee-track { animation: none; }
          .badge-pulse    { animation: none; }
          .analyzing-dot  { animation: none; }
          .analysis-line  { opacity: 1; animation: none; }
          .q-enter, .q-exit { animation: none; }
          .gi-card, .gi-route-card, .gi-cost-card { transition: none; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      <div
        className="gi-page"
        style={{ background: "#050505", color: "#FAFAFA", minHeight: "100vh" }}
      >
        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            background: "rgba(5,5,5,0.88)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo_latam/franquicias_latam_logo.png"
                alt="Franquicias LATAM"
                width={320}
                height={80}
                className="h-8 w-auto brightness-0 invert"
                priority
              />
              <span
                style={{
                  background: "rgba(0,255,178,0.1)",
                  border: "1px solid rgba(0,255,178,0.22)",
                  borderRadius: "999px",
                  padding: "3px 10px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#00FFB2",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Growth Intelligence
              </span>
            </Link>

            <nav className="gi-nav" aria-label="Navegación principal">
              <a href="#como-funciona" className="nav-link">Cómo funciona</a>
              <a href="#rutas" className="nav-link">Rutas</a>
              <a href="#growth-score" className="nav-link">Growth Score</a>
            </nav>

            <Link
              href={PRIMARY_CTA_HREF}
              style={{
                background: "#00FFB2",
                color: "#050505",
                borderRadius: "999px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Ver mi Growth Score →
            </Link>
          </div>
        </header>

        <main>
          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section
            style={{
              padding: "100px 24px 80px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="gi-grid-bg"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.45,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-80px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "900px",
                height: "500px",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(0,255,178,0.11) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                maxWidth: "840px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              {/* Badge */}
              <div
                className="badge-pulse reveal-hero"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0,255,178,0.08)",
                  border: "1px solid rgba(0,255,178,0.2)",
                  borderRadius: "999px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#00FFB2",
                  marginBottom: "36px",
                }}
              >
                🎯 Growth Intelligence System
              </div>

              {/* H1 — idea-martillo */}
              <h1
                className="gi-display reveal-hero d1"
                style={{
                  fontSize: "clamp(38px, 6.5vw, 70px)",
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: "-0.045em",
                  color: "#FAFAFA",
                  marginBottom: "24px",
                }}
              >
                No todos los negocios
                <br />
                deben crecer más.
                <br />
                <span style={{ color: "#00FFB2" }}>
                  Muchos primero deben crecer mejor.
                </span>
              </h1>

              {/* Subheadline — economic pain + diagnosis */}
              <p
                className="reveal-hero d2"
                style={{
                  fontSize: "19px",
                  color: "#8A8F98",
                  lineHeight: 1.65,
                  maxWidth: "560px",
                  margin: "0 auto 40px",
                }}
              >
                Detectamos si tu restricción dominante hoy es caja, operación,
                expansión o automatización — y definimos qué corregir primero.
              </p>

              {/* CTAs */}
              <div
                className="reveal-hero d3"
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: "56px",
                }}
              >
                <Link
                  href={PRIMARY_CTA_HREF}
                  style={{
                    background: "#00FFB2",
                    color: "#050505",
                    borderRadius: "999px",
                    padding: "14px 32px",
                    fontSize: "16px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 0 48px rgba(0,255,178,0.28)",
                  }}
                >
                  Ver mi Growth Score →
                </Link>
                <a
                  href="#como-funciona"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#FAFAFA",
                    borderRadius: "999px",
                    padding: "14px 32px",
                    fontSize: "16px",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Cómo lo evaluamos ↓
                </a>
              </div>

              {/* Micro-stats */}
              <div
                className="reveal-hero d4"
                style={{
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  maxWidth: "440px",
                  margin: "0 auto",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {[
                  { val: "4", label: "Rutas diagnósticas" },
                  { val: "6+", label: "Industrias" },
                  { val: "72h", label: "Primer diagnóstico" },
                ].map(({ val, label }, i) => (
                  <div
                    key={val}
                    style={{
                      flex: 1,
                      padding: "20px 8px",
                      textAlign: "center",
                      borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    }}
                  >
                    <div
                      className="gi-display"
                      style={{
                        fontSize: "30px",
                        fontWeight: 800,
                        color: "#00FFB2",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {val}
                    </div>
                    <div style={{ fontSize: "11px", color: "#5A5F68", marginTop: "4px" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── LOGO STRIP ────────────────────────────────────────────────── */}
          <section style={{ padding: "24px 0 72px", overflow: "hidden" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "#3A3F48",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Este enfoque ha sido aplicado con
            </p>
            <div style={{ overflow: "hidden" }}>
              <div
                className="marquee-track"
                style={{
                  display: "flex",
                  gap: "72px",
                  width: "max-content",
                  alignItems: "center",
                  padding: "0 36px",
                }}
              >
                {[
                  "BID",
                  "Naciones Unidas",
                  "MinTIC",
                  "Propaís",
                  "Gobierno de Corea del Sur",
                  "BID",
                  "Naciones Unidas",
                  "MinTIC",
                  "Propaís",
                  "Gobierno de Corea del Sur",
                ].map((name, i) => (
                  <span
                    key={i}
                    className="gi-display"
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#2E3238",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#3A3F48",
                marginTop: "20px",
                maxWidth: "480px",
                margin: "20px auto 0",
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              No hablamos desde teoría. Hablamos desde intervención real sobre
              negocios, expansión, operación y estructuración.
            </p>
          </section>

          {/* ── COST SECTION (new) ────────────────────────────────────────── */}
          <section
            style={{ padding: "120px 24px", background: "#080808" }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div className="reveal" style={{ marginBottom: "64px", maxWidth: "680px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#FF5555",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  El costo real
                </p>
                <h2
                  className="gi-display"
                  style={{
                    fontSize: "clamp(26px, 4vw, 46px)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: "#FAFAFA",
                    lineHeight: 1.1,
                    marginBottom: "16px",
                  }}
                >
                  Crecer con la restricción equivocada cuesta más que crecer lento.
                </h2>
                <p style={{ fontSize: "17px", color: "#8A8F98", lineHeight: 1.65 }}>
                  El error más costoso no es crecer poco. Es crecer en el orden
                  equivocado.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "14px",
                }}
              >
                {[
                  {
                    icon: "💸",
                    title: "Más ventas sobre caja apretada",
                    desc: "Incrementar ingresos cuando la liquidez ya está tensionada no libera el negocio. Lo presiona más. El dinero entra pero no queda.",
                    d: "d1",
                  },
                  {
                    icon: "🏗️",
                    title: "Expansión antes de estandarizar",
                    desc: "Abrir una nueva ubicación sin un modelo replicable solo multiplica el caos. No la escala. Cada sede nueva hereda los mismos problemas.",
                    d: "d2",
                  },
                  {
                    icon: "🤖",
                    title: "IA sobre procesos rotos",
                    desc: "Automatizar lo que no está bien definido solo acelera los errores. Digitalizar desorden produce más desorden — a mayor velocidad.",
                    d: "d3",
                  },
                  {
                    icon: "⚡",
                    title: "Demanda sin capacidad operativa",
                    desc: "Cuando el mercado responde pero la operación no aguanta, erosionas margen, consistencia y reputación al mismo tiempo.",
                    d: "d4",
                  },
                ].map(({ icon, title, desc, d }) => (
                  <div
                    key={title}
                    className={`gi-card gi-cost-card reveal ${d}`}
                    style={{
                      background: "#0f0f0f",
                      border: "1px solid rgba(255,85,85,0.1)",
                      borderRadius: "16px",
                      padding: "28px",
                      cursor: "default",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "16px" }}>{icon}</div>
                    <h3
                      className="gi-display"
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#FAFAFA",
                        marginBottom: "10px",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.25,
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#8A8F98", lineHeight: 1.65 }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SIGNAL DETECTION (6 signals) ─────────────────────────────── */}
          <section
            id="senales"
            style={{
              padding: "120px 24px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div className="reveal" style={{ marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#00FFB2",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Señales
              </p>
              <h2
                className="gi-display"
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  color: "#FAFAFA",
                  maxWidth: "560px",
                  lineHeight: 1.08,
                  marginBottom: "16px",
                }}
              >
                Tu negocio ya muestra estas señales.
                <br />¿Las estás leyendo bien?
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "#8A8F98",
                  maxWidth: "480px",
                  lineHeight: 1.65,
                }}
              >
                La mayoría no se frena por falta de oportunidad. Se frena por
                leer mal la secuencia.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                {
                  icon: "💸",
                  title: "Caja atrapada pese a ventas",
                  desc: "Ingresos suben, liquidez no acompaña. El dinero está en el negocio, pero no disponible.",
                  d: "d1",
                },
                {
                  icon: "⚡",
                  title: "Demanda que la operación no absorbe",
                  desc: "El mercado responde, pero la ejecución se tensa. Margen y consistencia bajo presión.",
                  d: "d2",
                },
                {
                  icon: "🏗️",
                  title: "Expansión deseada, modelo aún no listo",
                  desc: "La oportunidad existe. La estructura para replicarla sin depender de ti, todavía no.",
                  d: "d3",
                },
                {
                  icon: "🤖",
                  title: "IA pensada como parche",
                  desc: "Automatizar sobre procesos mal definidos amplifica el desorden. No lo resuelve.",
                  d: "d4",
                },
                {
                  icon: "👤",
                  title: "Dependencia excesiva del fundador",
                  desc: "El negocio funciona porque tú estás. Eso no es escalabilidad — es un cuello de botella humano.",
                  d: "d5",
                },
                {
                  icon: "📉",
                  title: "Margen debilitado por fricción invisible",
                  desc: "La rentabilidad se erosiona en puntos que no son obvios hasta que se leen las señales correctas.",
                  d: "d1",
                },
              ].map(({ icon, title, desc, d }) => (
                <div
                  key={title}
                  className={`gi-card reveal ${d}`}
                  style={{
                    background: "#0f0f0f",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "16px",
                    padding: "28px",
                    cursor: "default",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "16px" }}>{icon}</div>
                  <h3
                    className="gi-display"
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#FAFAFA",
                      marginBottom: "8px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.25,
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#8A8F98", lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <section
            id="como-funciona"
            style={{ padding: "120px 24px", background: "#080808" }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div className="reveal" style={{ marginBottom: "80px", maxWidth: "560px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#00FFB2",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  Método
                </p>
                <h2
                  className="gi-display"
                  style={{
                    fontSize: "clamp(28px, 4vw, 48px)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    color: "#FAFAFA",
                    marginBottom: "16px",
                    lineHeight: 1.08,
                  }}
                >
                  No operamos con intuición.
                  <br />
                  Operamos con señales.
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#8A8F98",
                    lineHeight: 1.7,
                    borderLeft: "2px solid rgba(0,255,178,0.3)",
                    paddingLeft: "16px",
                  }}
                >
                  No todos necesitan más ventas. No todos necesitan IA. No todos
                  están listos para expandirse. Primero hay que entender qué va
                  primero.
                </p>
              </div>

              <div className="two-col-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                  {[
                    {
                      num: "01",
                      title: "Leemos las señales del negocio",
                      desc: "Identificamos patrones en caja, operación, escalabilidad y madurez tecnológica. No síntomas — patrones.",
                      d: "d1",
                    },
                    {
                      num: "02",
                      title: "Diagnosticamos la restricción real",
                      desc: "Separamos síntomas de causas. Ubicamos qué está limitando realmente el crecimiento, el margen o la expansión.",
                      d: "d2",
                    },
                    {
                      num: "03",
                      title: "Definimos la secuencia correcta",
                      desc: "No un listado de mejoras. Una dirección específica: qué va primero, qué espera, y por qué el orden importa más que la velocidad.",
                      d: "d3",
                    },
                  ].map(({ num, title, desc, d }) => (
                    <div
                      key={num}
                      className={`reveal ${d}`}
                      style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}
                    >
                      <span
                        className="gi-display"
                        style={{
                          fontSize: "52px",
                          fontWeight: 800,
                          color: "rgba(0,255,178,0.18)",
                          lineHeight: 1,
                          flexShrink: 0,
                          width: "68px",
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {num}
                      </span>
                      <div>
                        <h3
                          className="gi-display"
                          style={{
                            fontSize: "19px",
                            fontWeight: 700,
                            color: "#FAFAFA",
                            marginBottom: "8px",
                            letterSpacing: "-0.025em",
                          }}
                        >
                          {title}
                        </h3>
                        <p style={{ fontSize: "15px", color: "#8A8F98", lineHeight: 1.7 }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dashboard mockup */}
                <div
                  className="reveal d2"
                  style={{
                    background: "#0f0f0f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    padding: "32px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "240px",
                      height: "240px",
                      background:
                        "radial-gradient(circle at 80% 20%, rgba(0,255,178,0.07) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#3A3F48",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      marginBottom: "24px",
                    }}
                  >
                    Muestra de diagnóstico
                  </p>
                  {[
                    { label: "Flujo de caja", val: 22, color: "#00FFB2", status: "Restricción activa" },
                    { label: "Capacidad operativa", val: 54, color: "#00D4FF", status: "Bajo presión" },
                    { label: "Readiness de expansión", val: 53, color: "#FFB800", status: "Bajo presión" },
                    { label: "Madurez para IA", val: 86, color: "#B060FF", status: "Saludable" },
                  ].map(({ label, val, color, status }) => (
                    <div key={label} style={{ marginBottom: "18px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "7px",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#8A8F98" }}>{label}</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", color: val < 40 ? "#FF5555" : val < 70 ? "#FFB800" : "#00FFB2" }}>
                            {status}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color }}>{val}%</span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: "3px",
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${val}%`,
                            height: "100%",
                            background: color,
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: "12px",
                      background: "rgba(0,255,178,0.07)",
                      border: "1px solid rgba(0,255,178,0.18)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#5A5F68",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          marginBottom: "4px",
                        }}
                      >
                        Restricción dominante
                      </p>
                      <p
                        className="gi-display"
                        style={{ fontSize: "15px", fontWeight: 700, color: "#00FFB2" }}
                      >
                        Liberación de Caja
                      </p>
                    </div>
                    <span style={{ color: "#00FFB2", fontSize: "22px" }}>→</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOUR ROUTES (reframed as diagnostic outcomes) ─────────────── */}
          <section
            id="rutas"
            style={{
              padding: "120px 24px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div className="reveal" style={{ marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#00FFB2",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Rutas
              </p>
              <h2
                className="gi-display"
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  color: "#FAFAFA",
                  lineHeight: 1.08,
                  marginBottom: "16px",
                }}
              >
                Tu ruta no se elige.
                <br />Se diagnostica.
              </h2>
              <p style={{ fontSize: "17px", color: "#8A8F98", maxWidth: "480px", lineHeight: 1.65 }}>
                Cada ruta corrige una restricción específica. Elegir la incorrecta
                no solo no ayuda — distrae y consume recursos que el negocio no tiene de sobra.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(265px, 1fr))",
                gap: "14px",
              }}
            >
              {[
                {
                  name: "Liberación de Caja",
                  color: "#00FFB2",
                  when: "Ventas avanzando, liquidez apretada o capital atrapado en operación.",
                  corrects: "Libera caja, ordena prioridades financieras y crea margen de maniobra real.",
                  note: "Si la restricción es operativa, liberar caja sin ordenar ejecución no sostiene.",
                  d: "d1",
                },
                {
                  name: "Mejora de Desempeño",
                  color: "#00D4FF",
                  when: "Demanda real pero frenos en productividad, consistencia o margen operativo.",
                  corrects: "Reduce fricción donde más impacta. Recupera margen y capacidad de respuesta.",
                  note: "Si primero hay que liberar caja o estabilizar el modelo, el desempeño espera.",
                  d: "d2",
                },
                {
                  name: "Franchise Readiness",
                  color: "#FFB800",
                  when: "Señales claras de expansión, pero el modelo todavía depende del fundador.",
                  corrects: "Estructura repetibilidad. Convierte el modelo en algo que puede operar sin ti.",
                  note: "Expandirse con un modelo no listo solo replica los problemas en más ubicaciones.",
                  d: "d3",
                },
                {
                  name: "Transformación IA",
                  color: "#B060FF",
                  when: "Base operativa ordenada, procesos definidos y oportunidad clara de automatización.",
                  corrects: "Define dónde IA genera ventaja real y en qué secuencia implementarla.",
                  note: "IA sobre base desordenada solo digitaliza el desorden. La secuencia importa.",
                  d: "d4",
                },
              ].map(({ name, color, when, corrects, note, d }) => (
                <div
                  key={name}
                  className={`gi-card gi-route-card reveal ${d}`}
                  style={{
                    background: "#0f0f0f",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "16px",
                    padding: "28px",
                    cursor: "default",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0",
                  }}
                >
                  <span
                    style={{
                      background: `${color}18`,
                      borderRadius: "999px",
                      padding: "4px 12px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      alignSelf: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    {name}
                  </span>

                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#5A5F68", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>
                      Cuándo aplica
                    </p>
                    <p style={{ fontSize: "13px", color: "#8A8F98", lineHeight: 1.55 }}>{when}</p>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#5A5F68", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "5px" }}>
                      Qué corrige
                    </p>
                    <p style={{ fontSize: "13px", color: "#FAFAFA", fontWeight: 500, lineHeight: 1.55 }}>{corrects}</p>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p style={{ fontSize: "11px", color: "#5A5F68", lineHeight: 1.55, fontStyle: "italic" }}>
                      ⚠ {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── GROWTH SCORE WIDGET ───────────────────────────────────────── */}
          <section
            id="growth-score"
            style={{ padding: "120px 24px", background: "#080808" }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div
                className="reveal"
                style={{ textAlign: "center", marginBottom: "16px" }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#00FFB2",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  ⚡ Growth Score
                </p>
                <h2
                  className="gi-display"
                  style={{
                    fontSize: "clamp(28px, 4vw, 48px)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    color: "#FAFAFA",
                    marginBottom: "16px",
                    lineHeight: 1.08,
                  }}
                >
                  ¿Qué está frenando realmente tu negocio?
                </h2>
                <p
                  style={{
                    fontSize: "17px",
                    color: "#8A8F98",
                    maxWidth: "440px",
                    margin: "0 auto 12px",
                    lineHeight: 1.65,
                  }}
                >
                  4 preguntas. 60 segundos. Descubre tu restricción dominante.
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#5A5F68",
                    maxWidth: "360px",
                    margin: "0 auto 48px",
                    lineHeight: 1.6,
                  }}
                >
                  Verás un desglose por dimensión — caja, operación, expansión e IA
                  — con la ruta que debería ir primero.
                </p>
              </div>
              <DiagnosticWidget />
            </div>
          </section>

          {/* ── FIT SECTION — "Esto es para ti si..." ────────────────────── */}
          <section
            style={{
              padding: "100px 24px",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <div className="reveal">
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#00FFB2",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: "24px",
                }}
              >
                Para quién aplica
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "40px",
                }}
                className="two-col-grid"
              >
                {/* Fits */}
                <div>
                  <h3
                    className="gi-display"
                    style={{
                      fontSize: "clamp(20px, 3vw, 28px)",
                      fontWeight: 800,
                      color: "#FAFAFA",
                      letterSpacing: "-0.03em",
                      marginBottom: "20px",
                    }}
                  >
                    Esto es para ti si…
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      "Estás vendiendo pero tu caja no acompaña el crecimiento",
                      "Tu operación depende demasiado de ti para funcionar bien",
                      "Sientes potencial de expansión pero no tienes la estructura",
                      "Quieres implementar IA, pero no sobre una base desordenada",
                      "Ya hay señales y no quieres perder otro trimestre interpretándolas mal",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            color: "#00FFB2",
                            fontSize: "14px",
                            marginTop: "1px",
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </span>
                        <p style={{ fontSize: "15px", color: "#8A8F98", lineHeight: 1.6 }}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doesn't fit */}
                <div>
                  <h3
                    className="gi-display"
                    style={{
                      fontSize: "clamp(20px, 3vw, 28px)",
                      fontWeight: 800,
                      color: "#5A5F68",
                      letterSpacing: "-0.03em",
                      marginBottom: "20px",
                    }}
                  >
                    No es para ti si…
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      "No tienes operación real o estás en etapa de idea",
                      "No hay voluntad real de ejecutar decisiones con criterio",
                      "Buscas validación de lo que ya decidiste hacer",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            color: "#FF5555",
                            fontSize: "14px",
                            marginTop: "1px",
                            flexShrink: 0,
                          }}
                        >
                          ✕
                        </span>
                        <p style={{ fontSize: "15px", color: "#5A5F68", lineHeight: 1.6 }}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "32px",
                      background: "#0f0f0f",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <p style={{ fontSize: "14px", color: "#8A8F98", lineHeight: 1.65 }}>
                      Para operadores con algo valioso en marcha que necesitan
                      claridad para escalar bien — no más actividad, sino la
                      actividad correcta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── EXCLUSIVITY STATEMENT ─────────────────────────────────────── */}
          <section style={{ padding: "80px 24px", background: "#080808" }}>
            <div
              className="reveal"
              style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "2px",
                  background: "#00FFB2",
                  margin: "0 auto 32px",
                  borderRadius: "999px",
                }}
              />
              <blockquote
                className="gi-display"
                style={{
                  fontSize: "clamp(21px, 3.5vw, 34px)",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                  margin: "0 0 28px",
                }}
              >
                "No trabajamos con cualquier negocio. Trabajamos con operadores
                que quieren una ruta más precisa — no más actividad."
              </blockquote>
              <div
                style={{
                  width: "48px",
                  height: "2px",
                  background: "#00FFB2",
                  margin: "0 auto 20px",
                  borderRadius: "999px",
                }}
              />
              <p style={{ fontSize: "15px", color: "#5A5F68" }}>
                Si no hay operación real, señales claras y voluntad de ejecutar,
                no hay fit.
              </p>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section
            id="faq"
            style={{ padding: "120px 24px", maxWidth: "760px", margin: "0 auto" }}
          >
            <div className="reveal" style={{ marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#00FFB2",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                FAQ
              </p>
              <h2
                className="gi-display"
                style={{
                  fontSize: "clamp(24px, 3.5vw, 42px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#FAFAFA",
                  lineHeight: 1.1,
                }}
              >
                Preguntas frecuentes
              </h2>
            </div>
            <div className="reveal d1">
              {[
                {
                  q: "¿Esto es consultoría tradicional?",
                  a: "No. Es un sistema de lectura estratégica para identificar la restricción real y ordenar la siguiente decisión con mayor precisión. No horas facturables — diagnóstico con dirección.",
                },
                {
                  q: "¿Es un producto de software?",
                  a: "No. Puede activar una ruta tecnológica cuando aplica, pero el punto de partida es siempre el diagnóstico del negocio, no la herramienta.",
                },
                {
                  q: "¿Qué recibo al solicitar el diagnóstico completo?",
                  a: "Una lectura de señales, una hipótesis clara sobre el cuello de botella dominante, y la ruta estratégica que debería ir primero. Sin ambigüedad.",
                },
                {
                  q: "¿El Growth Score es el diagnóstico completo?",
                  a: "No. El Growth Score es una evaluación inicial que apunta a tu restricción dominante. El diagnóstico completo va más profundo, con análisis específico del negocio.",
                },
                {
                  q: "¿Aplica para cualquier empresa?",
                  a: "No. Está pensado para negocios con operación real, señales de crecimiento y voluntad de ejecutar decisiones con criterio. No para negocios en etapa de idea.",
                },
              ].map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
          <section
            style={{
              padding: "120px 24px",
              background: "#080808",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(0,255,178,0.09) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "600px",
                height: "100px",
                background: "linear-gradient(to top, rgba(0,255,178,0.04), transparent)",
                borderTop: "1px solid rgba(0,255,178,0.05)",
                borderRadius: "20px 20px 0 0",
                pointerEvents: "none",
              }}
            />

            <div
              style={{ position: "relative", maxWidth: "680px", margin: "0 auto" }}
            >
              <div className="reveal">
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#00FFB2",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    marginBottom: "24px",
                  }}
                >
                  Siguiente paso
                </p>
                <h2
                  className="gi-display"
                  style={{
                    fontSize: "clamp(28px, 4.5vw, 54px)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    color: "#FAFAFA",
                    lineHeight: 1.08,
                    marginBottom: "20px",
                  }}
                >
                  Tu negocio ya está enviando señales.
                  <br />
                  <span style={{ color: "#00FFB2" }}>
                    Lo costoso es seguir ignorándolas.
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#8A8F98",
                    lineHeight: 1.65,
                    marginBottom: "12px",
                    maxWidth: "520px",
                    margin: "0 auto 12px",
                  }}
                >
                  Antes de invertir más tiempo, dinero o esfuerzo en la dirección
                  equivocada, identifica la restricción correcta.
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#5A5F68",
                    marginBottom: "40px",
                    fontStyle: "italic",
                  }}
                >
                  El diagnóstico completo toma menos de lo que cuesta un mal trimestre.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={PRIMARY_CTA_HREF}
                    style={{
                      background: "#00FFB2",
                      color: "#050505",
                      borderRadius: "999px",
                      padding: "16px 36px",
                      fontSize: "16px",
                      fontWeight: 700,
                      textDecoration: "none",
                      boxShadow: "0 0 60px rgba(0,255,178,0.22)",
                    }}
                  >
                    Ver mi Growth Score →
                  </Link>
                  <a
                    href={TEAM_CTA_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#8A8F98",
                      borderRadius: "999px",
                      padding: "16px 36px",
                      fontSize: "15px",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Hablar con el equipo
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "36px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <p style={{ fontSize: "13px", color: "#5A5F68", fontWeight: 500 }}>
              Growth Intelligence System — Franquicias LATAM
            </p>
            <div style={{ display: "flex", gap: "24px" }}>
              {[
                { href: "/", label: "Inicio" },
                { href: PRIMARY_CTA_HREF, label: "Diagnóstico" },
                { href: TEAM_CTA_HREF, label: "Contacto" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  style={{
                    fontSize: "13px",
                    color: "#5A5F68",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8A8F98")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5F68")}
                >
                  {label}
                </a>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#3A3F48" }}>© 2026</p>
          </div>
        </footer>
      </div>
    </>
  );
}
