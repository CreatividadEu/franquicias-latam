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
    // Hero elements use no rootMargin offset so they fire immediately on mount
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0 },
    );
    // Below-fold elements wait until 48px into the viewport
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

// ─── Diagnostic Widget ────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    q: "¿Tu caja acompaña tu crecimiento?",
    opts: ["Sí, va bien", "No del todo", "Definitivamente no"],
  },
  {
    q: "¿Tu operación puede absorber 2x la demanda actual?",
    opts: ["Sí", "Con ajustes", "No"],
  },
  {
    q: "¿Podrías replicar tu modelo en otra ciudad mañana?",
    opts: ["Sí", "Parcialmente", "No"],
  },
  {
    q: "¿Tienes claridad de dónde IA te daría ventaja real?",
    opts: ["Sí, tengo claridad", "Algo", "No"],
  },
];

const ROUTE_RESULTS = [
  {
    name: "Liberación de Caja",
    color: "#00FFB2",
    desc: "Ordena prioridades para capturar liquidez y reducir fricción financiera antes de seguir escalando.",
  },
  {
    name: "Performance Improvement",
    color: "#00D4FF",
    desc: "Enfoca la mejora donde más impacta margen y capacidad de respuesta sin añadir complejidad.",
  },
  {
    name: "Franchise Readiness",
    color: "#FFB800",
    desc: "Convierte la expansión en un sistema replicable antes de que se convierta en una apuesta improvisada.",
  },
  {
    name: "Transformación IA",
    color: "#B060FF",
    desc: "Define dónde IA genera ventaja real y sobre qué base operativa implementarla con criterio.",
  },
];

// First question with the worst answer wins — earlier restrictions take priority
function getRoute(answers: number[]) {
  const max = Math.max(...answers);
  const idx = answers.indexOf(max);
  return ROUTE_RESULTS[idx];
}

function DiagnosticWidget() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [route, setRoute] = useState<(typeof ROUTE_RESULTS)[number] | null>(
    null,
  );

  const handleNext = () => {
    if (selected === null) return;
    const next = [...answers, selected];
    if (step === QUESTIONS.length - 1) {
      setAnswers(next);
      setRoute(getRoute(next));
      setDone(true);
    } else {
      setAnswers(next);
      setStep(step + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setDone(false);
    setRoute(null);
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "40px",
        }}
      >
        {!done ? (
          <>
            {/* Progress */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "36px",
              }}
            >
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "4px",
                    borderRadius: "999px",
                    flex: i === step ? 2 : 1,
                    background:
                      i < step
                        ? "#00FFB2"
                        : i === step
                          ? "#00FFB2"
                          : "rgba(255,255,255,0.1)",
                    opacity: i < step ? 0.4 : 1,
                    transition: "all 0.35s ease",
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: "12px",
                  color: "#5A5F68",
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {step + 1} / {QUESTIONS.length}
              </span>
            </div>

            {/* Question */}
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#FAFAFA",
                letterSpacing: "-0.03em",
                lineHeight: 1.25,
                marginBottom: "28px",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              {QUESTIONS[step].q}
            </h3>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {QUESTIONS[step].opts.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSelected(i)}
                  style={{
                    background:
                      selected === i
                        ? "rgba(0,255,178,0.1)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected === i ? "#00FFB2" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px",
                    padding: "14px 20px",
                    textAlign: "left",
                    color: selected === i ? "#00FFB2" : "#FAFAFA",
                    fontSize: "15px",
                    fontWeight: selected === i ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleNext}
              disabled={selected === null}
              style={{
                marginTop: "24px",
                width: "100%",
                background:
                  selected !== null ? "#00FFB2" : "rgba(255,255,255,0.05)",
                color: selected !== null ? "#050505" : "#5A5F68",
                border: "none",
                borderRadius: "999px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: selected !== null ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
            >
              {step === QUESTIONS.length - 1 ? "Ver mi ruta →" : "Siguiente →"}
            </button>
          </>
        ) : (
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#5A5F68",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Tu señal dominante apunta a
            </p>
            <h3
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: route!.color,
                letterSpacing: "-0.04em",
                marginBottom: "12px",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              {route!.name}
            </h3>
            <p
              style={{
                fontSize: "16px",
                color: "#8A8F98",
                lineHeight: 1.65,
                marginBottom: "32px",
              }}
            >
              {route!.desc}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Link
                href={PRIMARY_CTA_HREF}
                style={{
                  background: "#00FFB2",
                  color: "#050505",
                  padding: "14px 24px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "15px",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Solicitar diagnóstico completo →
              </Link>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8A8F98",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Reintentar
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
      {/* Font loading — link tags are more performant than @import */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
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

        /* Reveal animation — starts hidden, fires when element enters viewport */
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        /* Stagger delays only apply once visible */
        .reveal.d1 { transition-delay: 0.1s; }
        .reveal.d2 { transition-delay: 0.18s; }
        .reveal.d3 { transition-delay: 0.26s; }
        .reveal.d4 { transition-delay: 0.34s; }
        .reveal.d5 { transition-delay: 0.42s; }

        /* Hero elements are already in viewport — reveal them immediately */
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
        /* Route cards override to cyan glow */
        .gi-route-card:hover {
          border-color: rgba(0,212,255,0.3) !important;
          box-shadow: 0 0 32px rgba(0,212,255,0.08);
        }

        .gi-grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* Responsive grid helpers */
        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .two-col-grid { grid-template-columns: 1fr; gap: 48px; }
        }

        /* Mobile nav — hidden by default, shown md+ via Tailwind */
        .gi-nav { display: none; align-items: center; gap: 28px; flex: 1; justify-content: center; }
        @media (min-width: 768px) { .gi-nav { display: flex; } }

        .nav-link { color: #8A8F98; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #FAFAFA; }

        /* Focus styles for keyboard navigation */
        :focus-visible {
          outline: 2px solid #00FFB2;
          outline-offset: 3px;
          border-radius: 4px;
        }

        /* Respect user motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .reveal, .reveal-hero {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .marquee-track { animation: none; }
          .badge-pulse { animation: none; }
          .gi-card, .gi-route-card { transition: none; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      <div
        className="gi-page"
        style={{ background: "#050505", color: "#FAFAFA", minHeight: "100vh" }}
      >
        {/* ── NAVBAR ────────────────────────────────────────────────── */}
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
            {/* Logo */}
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

            {/* Nav — visibility handled by .gi-nav CSS (not inline style, which would override) */}
            <nav className="gi-nav" aria-label="Navegación principal">
              <a href="#como-funciona" className="nav-link">Cómo Funciona</a>
              <a href="#rutas" className="nav-link">Rutas</a>
              <a href="#diagnostico" className="nav-link">Diagnóstico</a>
            </nav>

            {/* CTA */}
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
              Solicitar Diagnóstico →
            </Link>
          </div>
        </header>

        <main>
          {/* ── HERO ──────────────────────────────────────────────────── */}
          <section
            style={{
              padding: "100px 24px 80px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated grid */}
            <div
              className="gi-grid-bg"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.5,
              }}
            />
            {/* Glow orb */}
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
                  "radial-gradient(ellipse at 50% 0%, rgba(0,255,178,0.13) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                maxWidth: "860px",
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
                  marginBottom: "32px",
                }}
              >
                🔍 Sistema de Inteligencia Estratégica
              </div>

              {/* H1 */}
              <h1
                className="gi-display reveal-hero d1"
                style={{
                  fontSize: "clamp(40px, 6.5vw, 72px)",
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: "-0.045em",
                  color: "#FAFAFA",
                  marginBottom: "24px",
                }}
              >
                Tu negocio ya está dando señales.
                <br />
                La pregunta es si las estás
                <br />
                <span style={{ color: "#00FFB2" }}>leyendo a tiempo.</span>
              </h1>

              {/* Sub */}
              <p
                className="reveal-hero d2"
                style={{
                  fontSize: "20px",
                  color: "#8A8F98",
                  lineHeight: 1.65,
                  maxWidth: "580px",
                  margin: "0 auto 40px",
                }}
              >
                Detectamos señales de crecimiento, fugas de caja y cuellos de
                botella para activar la ruta correcta de escala.
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
                  Solicitar Diagnóstico
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
                  Ver cómo funciona ↓
                </a>
              </div>

              {/* Micro stats */}
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
                  { val: "4", label: "Rutas Estratégicas" },
                  { val: "6+", label: "Industrias" },
                  { val: "72h", label: "Diagnóstico" },
                ].map(({ val, label }, i) => (
                  <div
                    key={val}
                    style={{
                      flex: 1,
                      padding: "20px 8px",
                      textAlign: "center",
                      borderRight:
                        i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
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
                    <div
                      style={{ fontSize: "11px", color: "#5A5F68", marginTop: "4px" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── LOGO STRIP ────────────────────────────────────────────── */}
          <section style={{ padding: "32px 0 80px", overflow: "hidden" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "#3A3F48",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              Experiencia Aplicada Con
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
          </section>

          {/* ── SIGNAL DETECTION — Bento Grid ─────────────────────────── */}
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
                  fontSize: "clamp(28px, 4vw, 50px)",
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  color: "#FAFAFA",
                  maxWidth: "560px",
                  lineHeight: 1.08,
                  marginBottom: "16px",
                }}
              >
                Tu negocio ya muestra estas señales
              </h2>
              <p
                style={{
                  fontSize: "18px",
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
                gap: "14px",
              }}
            >
              {[
                {
                  icon: "💸",
                  title: "Caja atrapada",
                  desc: "Ingresos avanzan, liquidez no acompaña.",
                  d: "d1",
                },
                {
                  icon: "⚡",
                  title: "Demanda sin escala",
                  desc: "El mercado responde, la ejecución se tensa.",
                  d: "d2",
                },
                {
                  icon: "🏗️",
                  title: "Modelo no replicable",
                  desc: "Oportunidad existe, estructura no.",
                  d: "d3",
                },
                {
                  icon: "🤖",
                  title: "IA sin secuencia",
                  desc: "Automatizar sin diagnóstico amplifica desorden.",
                  d: "d4",
                },
              ].map(({ icon, title, desc, d }) => (
                <div
                  key={title}
                  className={`gi-card reveal ${d}`}
                  style={{
                    background: "#0f0f0f",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "16px",
                    padding: "32px",
                    cursor: "default",
                  }}
                >
                  <div style={{ fontSize: "34px", marginBottom: "20px" }}>
                    {icon}
                  </div>
                  <h3
                    className="gi-display"
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#FAFAFA",
                      marginBottom: "8px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "15px", color: "#8A8F98", lineHeight: 1.65 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
          <section
            id="como-funciona"
            style={{ padding: "120px 24px", background: "#080808" }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div className="reveal" style={{ marginBottom: "80px" }}>
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
                    fontSize: "clamp(28px, 4vw, 50px)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    color: "#FAFAFA",
                    marginBottom: "16px",
                    lineHeight: 1.08,
                  }}
                >
                  Cómo funciona
                </h2>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#8A8F98",
                    maxWidth: "440px",
                    lineHeight: 1.65,
                  }}
                >
                  No todos necesitan lo mismo. El poder está en saber qué hacer
                  primero.
                </p>
              </div>

              <div className="two-col-grid">
                {/* Steps */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "48px",
                  }}
                >
                  {[
                    {
                      num: "01",
                      title: "Detectamos señales",
                      desc: "Leemos patrones comerciales, financieros, operativos y de escalabilidad.",
                      d: "d1",
                    },
                    {
                      num: "02",
                      title: "Diagnosticamos la restricción real",
                      desc: "Separamos síntomas de causas. Ubicamos el cuello de botella dominante.",
                      d: "d2",
                    },
                    {
                      num: "03",
                      title: "Activamos la ruta correcta",
                      desc: "Dirección concreta: liberar caja, elevar performance, preparar expansión o implementar IA.",
                      d: "d3",
                    },
                  ].map(({ num, title, desc, d }) => (
                    <div
                      key={num}
                      className={`reveal ${d}`}
                      style={{
                        display: "flex",
                        gap: "24px",
                        alignItems: "flex-start",
                      }}
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
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#FAFAFA",
                            marginBottom: "8px",
                            letterSpacing: "-0.025em",
                          }}
                        >
                          {title}
                        </h3>
                        <p
                          style={{
                            fontSize: "15px",
                            color: "#8A8F98",
                            lineHeight: 1.7,
                          }}
                        >
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
                        "radial-gradient(circle at 80% 20%, rgba(0,255,178,0.08) 0%, transparent 70%)",
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
                    Diagnóstico de Restricción
                  </p>
                  {[
                    {
                      label: "Flujo de caja",
                      val: 68,
                      color: "#00FFB2",
                    },
                    {
                      label: "Capacidad operativa",
                      val: 42,
                      color: "#00D4FF",
                    },
                    {
                      label: "Readiness de expansión",
                      val: 31,
                      color: "#FFB800",
                    },
                    {
                      label: "Madurez para IA",
                      val: 55,
                      color: "#B060FF",
                    },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "#8A8F98" }}>
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color,
                          }}
                        >
                          {val}%
                        </span>
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
                      marginTop: "8px",
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
                          fontSize: "10px",
                          color: "#5A5F68",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          marginBottom: "4px",
                        }}
                      >
                        Ruta recomendada
                      </p>
                      <p
                        className="gi-display"
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#00FFB2",
                        }}
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

          {/* ── FOUR ROUTES ───────────────────────────────────────────── */}
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
                  fontSize: "clamp(28px, 4vw, 50px)",
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  color: "#FAFAFA",
                  lineHeight: 1.08,
                }}
              >
                4 Rutas. Una prioridad correcta.
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))",
                gap: "14px",
              }}
            >
              {[
                {
                  name: "Liberación de Caja",
                  color: "#00FFB2",
                  forWho:
                    "Para negocios que venden pero siguen operando con caja tensionada.",
                  outcome:
                    "Captura liquidez y reduce fricción financiera operativa.",
                  d: "d1",
                },
                {
                  name: "Performance Improvement",
                  color: "#00D4FF",
                  forWho:
                    "Para operadores con demanda real pero frenos en productividad.",
                  outcome:
                    "Mejora donde más impacta margen y capacidad de respuesta.",
                  d: "d2",
                },
                {
                  name: "Franchise Readiness",
                  color: "#FFB800",
                  forWho:
                    "Para negocios con señales de expansión que necesitan validar el modelo.",
                  outcome:
                    "Convierte expansión en sistema, no en apuesta improvisada.",
                  d: "d3",
                },
                {
                  name: "Transformación IA",
                  color: "#B060FF",
                  forWho:
                    "Para empresas que quieren automatizar con secuencia estratégica.",
                  outcome:
                    "Implementa IA donde genera ventaja real, sin digitalizar desorden.",
                  d: "d4",
                },
              ].map(({ name, color, forWho, outcome, d }) => (
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
                    gap: "14px",
                    transition:
                      "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
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
                    }}
                  >
                    {name}
                  </span>
                  <p style={{ fontSize: "14px", color: "#8A8F98", lineHeight: 1.6 }}>
                    {forWho}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#FAFAFA",
                      fontWeight: 500,
                      lineHeight: 1.6,
                    }}
                  >
                    {outcome}
                  </p>
                  <span
                    style={{ color, fontSize: "20px", marginTop: "auto" }}
                  >
                    →
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── INTERACTIVE DIAGNOSTIC ────────────────────────────────── */}
          <section
            id="diagnostico"
            style={{ padding: "120px 24px", background: "#080808" }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div
                className="reveal"
                style={{ textAlign: "center", marginBottom: "64px" }}
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
                  ⚡ Diagnóstico Express
                </p>
                <h2
                  className="gi-display"
                  style={{
                    fontSize: "clamp(28px, 4vw, 50px)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    color: "#FAFAFA",
                    marginBottom: "16px",
                    lineHeight: 1.08,
                  }}
                >
                  ¿Dónde está tu restricción hoy?
                </h2>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#8A8F98",
                    maxWidth: "440px",
                    margin: "0 auto",
                    lineHeight: 1.65,
                  }}
                >
                  Responde 4 preguntas. Identifica tu ruta en 60 segundos.
                </p>
              </div>
              <DiagnosticWidget />
            </div>
          </section>

          {/* ── FIT SECTION ───────────────────────────────────────────── */}
          <section
            style={{
              padding: "80px 24px",
              maxWidth: "1200px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div className="reveal">
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#5A5F68",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: "24px",
                }}
              >
                Para quién aplica
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  justifyContent: "center",
                  marginBottom: "32px",
                }}
              >
                {[
                  "F&B",
                  "Retail",
                  "Health & Beauty",
                  "Servicios",
                  "Multi-unit",
                  "Señales tempranas de expansión",
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "#0f0f0f",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "999px",
                      padding: "10px 20px",
                      fontSize: "14px",
                      color: "#8A8F98",
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontSize: "17px",
                  color: "#5A5F68",
                  maxWidth: "520px",
                  margin: "0 auto",
                  lineHeight: 1.65,
                }}
              >
                Para operadores con algo valioso en marcha que necesitan
                claridad para escalar bien.
              </p>
            </div>
          </section>

          {/* ── EXCLUSIVITY ───────────────────────────────────────────── */}
          <section style={{ padding: "80px 24px", background: "#080808" }}>
            <div
              className="reveal"
              style={{
                maxWidth: "760px",
                margin: "0 auto",
                textAlign: "center",
              }}
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
                  fontSize: "clamp(22px, 3.5vw, 36px)",
                  fontWeight: 700,
                  color: "#FAFAFA",
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                  margin: "0 0 28px",
                }}
              >
                "No trabajamos con cualquier negocio. Esto es para operadores
                que quieren una ruta más precisa."
              </blockquote>
              <div
                style={{
                  width: "48px",
                  height: "2px",
                  background: "#00FFB2",
                  margin: "0 auto 24px",
                  borderRadius: "999px",
                }}
              />
              <p style={{ fontSize: "15px", color: "#5A5F68" }}>
                Si no hay señales reales ni voluntad de ejecutar, no hay fit.
              </p>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────── */}
          <section
            id="faq"
            style={{
              padding: "120px 24px",
              maxWidth: "760px",
              margin: "0 auto",
            }}
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
                  a: "No. Es un sistema de lectura estratégica para identificar la restricción real y ordenar la siguiente decisión con mayor precisión.",
                },
                {
                  q: "¿Es software?",
                  a: "No. Puede activar una ruta tecnológica cuando aplica, pero el punto de partida es el diagnóstico del negocio, no la herramienta.",
                },
                {
                  q: "¿Qué recibo al solicitar diagnóstico?",
                  a: "Una lectura inicial de señales, una hipótesis clara sobre el cuello de botella dominante y la ruta estratégica que debería ir primero.",
                },
                {
                  q: "¿Aplica para cualquier empresa?",
                  a: "No. Está pensado para negocios con operación real, señales de crecimiento y voluntad de ejecutar decisiones con criterio.",
                },
              ].map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ─────────────────────────────────────────────── */}
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
            {/* Mini dashboard strip */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "600px",
                height: "120px",
                background:
                  "linear-gradient(to top, rgba(0,255,178,0.04), transparent)",
                borderTop: "1px solid rgba(0,255,178,0.06)",
                borderRadius: "20px 20px 0 0",
                pointerEvents: "none",
              }}
            />

            <div
              style={{ position: "relative", maxWidth: "680px", margin: "0 auto" }}
            >
              <div className="reveal">
                <h2
                  className="gi-display"
                  style={{
                    fontSize: "clamp(28px, 4.5vw, 56px)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    color: "#FAFAFA",
                    lineHeight: 1.08,
                    marginBottom: "20px",
                  }}
                >
                  Descubre qué está señalando tu negocio antes de perder otro
                  trimestre.
                </h2>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#8A8F98",
                    lineHeight: 1.65,
                    marginBottom: "40px",
                  }}
                >
                  Si ya hay señales, conviene leerlas antes de invertir más en
                  la dirección equivocada.
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
                    Solicitar Diagnóstico
                  </Link>
                  <a
                    href={TEAM_CTA_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#FAFAFA",
                      borderRadius: "999px",
                      padding: "16px 36px",
                      fontSize: "16px",
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

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
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
            <p
              style={{
                fontSize: "13px",
                color: "#5A5F68",
                fontWeight: 500,
              }}
            >
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#8A8F98")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#5A5F68")
                  }
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
