"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// ── Trofeos: casos de éxito por tamaño de operación ─────────────────────────
// Riel de escala interactivo (misma gramática que la línea de stats de Totto:
// hairline con nodos luminosos) con cuatro paradas — Enterprise → Micro — y
// una vitrina de vidrio que se transforma con cada selección. Auto-avanza
// cada 6s; la primera interacción manual toma el control.

type CaseMetric = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  caption?: string;
};

type CaseStudy = {
  id: string;
  programa: string;
  tier: string;
  railLabel: string;
  logo?: { src: string; alt: string };
  clienteText?: string;
  clienteSub?: string;
  proyecto: string;
  descripcion: string;
  metrics: CaseMetric[];
  accent: string;
  glow: string;
};

const CASES: CaseStudy[] = [
  {
    id: "enterprise",
    programa: "Programa Enterprise",
    tier: "Grandes compañías globales",
    railLabel: "Enterprise",
    logo: { src: "/logos_clientes/logo_sodexo.svg", alt: "Sodexo" },
    proyecto: "Kitchen Works",
    descripcion:
      "Estructuración, programa y plataforma de formación de una de las ofertas de mayor tamaño de Sodexo a nivel global.",
    metrics: [
      {
        value: 24,
        prefix: "€",
        suffix: "B",
        label: "Facturación anual",
        caption: "24 billones de euros",
      },
    ],
    accent: "#6EA8FF",
    glow: "rgba(110, 168, 255, 0.4)",
  },
  {
    id: "franquicias-os",
    programa: "Programa Franquicias OS",
    tier: "Corporativos y plataformas",
    railLabel: "Franquicias OS",
    logo: { src: "/logos_clientes/logo_mercado_libre.svg", alt: "Mercado Libre" },
    proyecto: "CDF Tucarro",
    descripcion:
      "Creación del sistema de franquicias y experiencia de los Centros de Fotografía de Tucarro.com.",
    metrics: [
      {
        value: 22,
        prefix: "$",
        suffix: "B",
        label: "Facturación anual",
        caption: "22 billones de dólares",
      },
    ],
    accent: "#37E6C3",
    glow: "rgba(55, 230, 195, 0.4)",
  },
  {
    id: "pyme",
    programa: "Programa Franquicias PyME",
    tier: "Marcas en crecimiento",
    railLabel: "PyME",
    logo: { src: "/saju/saju-mono.png", alt: "SAJÚ" },
    clienteText: "SAJÚ",
    proyecto: "Franquicias SAJÚ",
    descripcion:
      "Creación del sistema de franquicias de la amada marca colombiana SAJÚ.",
    metrics: [
      {
        value: 6,
        prefix: "$",
        suffix: "M",
        label: "Facturación anual",
        caption: "6 millones de dólares",
      },
    ],
    accent: "#FFA24F",
    glow: "rgba(255, 162, 79, 0.4)",
  },
  {
    id: "micro",
    programa: "Programa Microfranquicias",
    tier: "Microempresas e impacto",
    railLabel: "Micro",
    clienteText: "Propaís",
    clienteSub: "Con fondos del Banco Interamericano de Desarrollo",
    proyecto: "Microfranquicias Propaís",
    descripcion:
      "Desarrollamos más de 20 proyectos de microfranquicias con Propaís y fondos del Banco Interamericano de Desarrollo — los proveedores más grandes de todo el proyecto, con 50% del total y una puntuación histórica de 97.5% de aprobación.",
    metrics: [
      { value: 20, suffix: "+", label: "Sistemas creados" },
      { value: 50, suffix: "%", label: "Del proyecto total" },
      { value: 97.5, decimals: 1, suffix: "%", label: "Aprobación histórica" },
    ],
    accent: "#FF6B7D",
    glow: "rgba(255, 107, 125, 0.4)",
  },
];

const AUTO_MS = 6000;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Conteo con easing cúbico; con reduced-motion muestra el valor final.
function CountUp({
  value,
  decimals = 0,
  duration = 950,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const reduced = prefersReducedMotion();
    const tick = (t: number) => {
      const p = reduced ? 1 : Math.min(1, (t - t0) / duration);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{shown.toFixed(decimals)}</>;
}

export function CasesShowcase() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovered, setHovered] = useState(false);

  // Auto-avance: se detiene con hover y muere con la primera selección manual.
  useEffect(() => {
    if (!auto || hovered || prefersReducedMotion()) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % CASES.length),
      AUTO_MS,
    );
    return () => window.clearInterval(id);
  }, [auto, hovered]);

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") pick((active + 1) % CASES.length);
    if (e.key === "ArrowLeft") pick((active - 1 + CASES.length) % CASES.length);
  };

  const c = CASES[active];

  return (
    <section
      className="hdc-root mt-16 w-full max-w-[1120px] sm:mt-[72px]"
      aria-label="Casos de éxito por tamaño de operación"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <em className="hdf-eyebrow-serif">Un caso para cada escala</em>
        <h2 className="hdf-h2">
          De <span className="hdf-grad">enterprise global</span> a
          microfranquicia.
        </h2>
        <span className="text-[17px] text-[#8E9FBE]">
          El mismo estándar, en cuatro tamaños de operación.
        </span>
      </div>

      {/* Riel de escala */}
      <div
        className="hdc-rail"
        role="tablist"
        aria-label="Selecciona el tamaño de operación"
        onKeyDown={onKeyDown}
      >
        <span className="hdc-rail-line" aria-hidden />
        {CASES.map((k, i) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            id={`hdc-tab-${k.id}`}
            aria-selected={i === active}
            aria-controls={`hdc-panel-${k.id}`}
            tabIndex={i === active ? 0 : -1}
            className={`hdc-stop${i === active ? " hdc-stop--on" : ""}`}
            style={{ "--ac": k.accent, "--ag": k.glow } as React.CSSProperties}
            onClick={() => pick(i)}
          >
            <span className="hdc-node" aria-hidden>
              {auto && !hovered && i === active && (
                <span key={`p-${active}`} className="hdc-node-progress" />
              )}
            </span>
            <b>{k.railLabel}</b>
            <i>{k.tier}</i>
          </button>
        ))}
      </div>

      {/* Vitrina */}
      <div
        key={c.id}
        id={`hdc-panel-${c.id}`}
        role="tabpanel"
        aria-labelledby={`hdc-tab-${c.id}`}
        className="hdc-card"
        style={{ "--ac": c.accent, "--ag": c.glow } as React.CSSProperties}
      >
        <span className="hdc-card-topline" aria-hidden />
        <div className="hdc-card-main">
          <span className="hdc-programa">{c.programa}</span>
          <div className="hdc-cliente">
            {c.logo &&
              (c.clienteText ? (
                <span className="hdc-cliente-chip">
                  <Image
                    src={c.logo.src}
                    alt={c.logo.alt}
                    width={140}
                    height={140}
                  />
                </span>
              ) : (
                <Image
                  src={c.logo.src}
                  alt={c.logo.alt}
                  width={400}
                  height={140}
                  className="hdc-cliente-logo"
                />
              ))}
            {c.clienteText && (
              <span className="hdc-cliente-text">{c.clienteText}</span>
            )}
          </div>
          {c.clienteSub && <span className="hdc-cliente-sub">{c.clienteSub}</span>}
          <em className="hdc-proyecto">
            Proyecto · <span>{c.proyecto}</span>
          </em>
          <p className="hdc-desc">{c.descripcion}</p>
        </div>
        <div className="hdc-card-side">
          {c.metrics.map((m) => (
            <div
              key={m.label}
              className={`hdc-metric${c.metrics.length === 1 ? " hdc-metric--solo" : ""}`}
            >
              <span className="hdc-metric-value tabular-nums">
                {m.prefix}
                <CountUp value={m.value} decimals={m.decimals ?? 0} />
                {m.suffix}
              </span>
              <span className="hdc-metric-label">{m.label}</span>
              {m.caption && <em className="hdc-metric-caption">{m.caption}</em>}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        /* ── Riel de escala ── */
        .hdc-rail {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 44px;
          padding-top: 7px;
        }
        .hdc-rail-line {
          position: absolute;
          top: 13px;
          left: 12.5%;
          right: 12.5%;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #6ea8ff, #37e6c3, #ffa24f, #ff6b7d);
          opacity: 0.55;
        }
        .hdc-stop {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          padding: 0 4px 6px;
          background: none;
          border: none;
          font-family: inherit;
          color: #8e9fbe;
          cursor: pointer;
          transition: color 0.25s;
        }
        .hdc-stop:hover {
          color: #d7e1f5;
        }
        .hdc-node {
          position: relative;
          display: grid;
          place-items: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0a1020;
          border: 2px solid var(--ac);
          transition:
            box-shadow 0.3s,
            transform 0.3s;
        }
        .hdc-stop--on .hdc-node {
          transform: scale(1.35);
          box-shadow: 0 0 18px var(--ag);
          background: var(--ac);
        }
        /* Progreso del auto-avance: anillo que se agota alrededor del nodo */
        .hdc-node-progress {
          position: absolute;
          inset: -7px;
          border-radius: 50%;
          background: conic-gradient(var(--ac) var(--hdc-p, 0%), transparent 0);
          -webkit-mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 2.5px),
            #000 calc(100% - 2px)
          );
          mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 2.5px),
            #000 calc(100% - 2px)
          );
          opacity: 0.9;
          animation: hdc-ring 6s linear forwards;
        }
        .hdc-stop b {
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          color: inherit;
        }
        .hdc-stop--on b {
          color: #f2f5fc;
        }
        .hdc-stop i {
          font-style: normal;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64749a;
        }
        .hdc-stop--on i {
          color: var(--ac);
        }
        @media (max-width: 639px) {
          .hdc-stop i {
            display: none;
          }
          .hdc-stop b {
            font-size: 11.5px;
          }
        }

        /* ── Vitrina ── */
        .hdc-card {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 26px;
          margin-top: 26px;
          padding: 34px 36px 30px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 16, 32, 0.66);
          background:
            radial-gradient(
              120% 150% at 0% 0%,
              color-mix(in srgb, var(--ac) 10%, transparent),
              transparent 58%
            ),
            rgba(10, 16, 32, 0.66);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          text-align: left;
          animation: hdc-card-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @media (max-width: 767px) {
          .hdc-card {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 26px 22px 24px;
          }
        }
        .hdc-card-topline {
          position: absolute;
          top: 0;
          left: 36px;
          right: 36px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--ac),
            transparent
          );
          opacity: 0.75;
        }
        .hdc-card-main {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }
        .hdc-programa {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ac);
        }
        .hdc-cliente {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 6px;
        }
        .hdc-cliente-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #ffffff;
          flex-shrink: 0;
        }
        .hdc-cliente-chip img {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }
        .hdc-cliente-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }
        .hdc-cliente-text {
          font-size: clamp(30px, 4vw, 40px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #f2f5fc;
        }
        .hdc-cliente-sub {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8e9fbe;
        }
        .hdc-proyecto {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-size: 18px;
          color: #b9c6e3;
        }
        .hdc-proyecto span {
          background: linear-gradient(100deg, #ffffff 30%, var(--ac));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .hdc-desc {
          margin: 4px 0 0;
          font-size: 15px;
          line-height: 1.65;
          color: #aebadb;
          text-wrap: pretty;
          max-width: 520px;
        }

        .hdc-card-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          padding-left: 26px;
          border-left: 1px solid rgba(255, 255, 255, 0.09);
        }
        @media (max-width: 767px) {
          .hdc-card-side {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 18px 28px;
            padding-left: 0;
            padding-top: 18px;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.09);
          }
        }
        .hdc-metric {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .hdc-metric-value {
          font-size: 27px;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1;
          color: var(--ac);
          text-shadow: 0 0 22px var(--ag);
        }
        .hdc-metric--solo .hdc-metric-value {
          font-size: clamp(44px, 5.4vw, 62px);
        }
        .hdc-metric-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8e9fbe;
        }
        .hdc-metric-caption {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-size: 13.5px;
          color: #64749a;
        }

        @keyframes hdc-card-in {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @property --hdc-p {
          syntax: "<percentage>";
          inherits: false;
          initial-value: 0%;
        }
        @keyframes hdc-ring {
          to {
            --hdc-p: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hdc-card,
          .hdc-node-progress {
            animation: none !important;
          }
          .hdc-stop--on .hdc-node {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
