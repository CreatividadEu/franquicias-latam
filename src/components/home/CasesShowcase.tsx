"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Poppins, Newsreader } from "next/font/google";

// ── "Un caso para cada escala" — acordeón cromático ─────────────────────────
// Cuatro paneles a toda altura sobre #05070d; el activo se expande (flex 8
// vs 1, 0.85s cubic-bezier(0.66,0,0.22,1)) con glow de acento, número índice
// fantasma, detalle del proyecto a la izquierda y hero stat degradado con
// count-up de 1100ms a la derecha. Los colapsados muestran etiqueta vertical
// y punto luminoso. Auto-rota cada 6s con línea de progreso de 2px (pausa en
// hover); click + flechas del teclado; en <980px pasa a columna con bandas
// de 64px. Tipografía del handoff: Poppins + Newsreader Italic.

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});

type CaseMetric = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  caption?: string;
};

type CasePanel = {
  id: string;
  programa: string;
  tier: string;
  railLabel: string;
  logo?: { src: string; alt: string };
  logoChip?: { src: string; alt: string };
  /** Logo a color sobre chip claro con destello (mismo shine de los laureles). */
  logoGlass?: { src: string; alt: string };
  clienteText?: string;
  clienteSub?: string;
  proyecto: string;
  descripcion: string;
  metrics: CaseMetric[];
  accent: string;
  glow: string;
};

const CASES: CasePanel[] = [
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
    accent: "#5E8BFF",
    glow: "rgba(94, 139, 255, 0.45)",
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
    accent: "#38D9A9",
    glow: "rgba(56, 217, 169, 0.45)",
  },
  {
    id: "pyme",
    programa: "Programa Franquicias PyME",
    tier: "Marcas en crecimiento",
    railLabel: "PyME",
    logoChip: { src: "/saju/saju-mono.png", alt: "SAJÚ" },
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
    accent: "#F79D45",
    glow: "rgba(247, 157, 69, 0.45)",
  },
  {
    id: "micro",
    programa: "Programa Microfranquicias",
    tier: "Microempresas e impacto",
    railLabel: "Micro",
    logoGlass: {
      src: "https://propais.org.co/wp-content/themes/propais/img/logopro.png",
      alt: "Propaís",
    },
    clienteSub: "Con fondos del Banco Interamericano de Desarrollo",
    proyecto: "Microfranquicias Propaís",
    descripcion:
      "Desarrollamos más de 20 proyectos de microfranquicias con Propaís y fondos del Banco Interamericano de Desarrollo — los proveedores más grandes de todo el proyecto, con 50% del total y una puntuación histórica de 97.5% de aprobación.",
    metrics: [
      { value: 20, suffix: "+", label: "Sistemas creados" },
      { value: 50, suffix: "%", label: "Del proyecto total" },
      { value: 97.5, decimals: 1, suffix: "%", label: "Aprobación histórica" },
    ],
    accent: "#F65E7C",
    glow: "rgba(246, 94, 124, 0.45)",
  },
];

const AUTO_MS = 6000;
const COUNT_MS = 1100;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Count-up de 1100ms con easing cúbico; reduced-motion salta al final.
function CountUp({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const reduced = prefersReducedMotion();
    const tick = (t: number) => {
      const p = reduced ? 1 : Math.min(1, (t - t0) / COUNT_MS);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{shown.toFixed(decimals)}</>;
}

export function CasesShowcase() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovered, setHovered] = useState(false);

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
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      pick((active + 1) % CASES.length);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      pick((active - 1 + CASES.length) % CASES.length);
    }
  };

  return (
    <section
      className={`hda-root ${poppins.variable} ${newsreader.variable} mt-16 w-full max-w-[1180px] sm:mt-[72px]`}
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

      <div
        className="hda-stage"
        role="tablist"
        aria-label="Selecciona el tamaño de operación"
        onKeyDown={onKeyDown}
      >
        {CASES.map((c, i) => {
          const on = i === active;
          return (
            <article
              key={c.id}
              role="tab"
              id={`hda-tab-${c.id}`}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              className={`hda-panel${on ? " hda-panel--on" : ""}`}
              style={{ "--ac": c.accent, "--ag": c.glow } as React.CSSProperties}
              onClick={() => pick(i)}
            >
              {/* Línea de progreso del auto-avance (2px, acento) */}
              {on && auto && !hovered && (
                <span key={`prog-${active}`} className="hda-progress" aria-hidden />
              )}

              {/* Número índice fantasma */}
              <span className="hda-ghost" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Estado colapsado: punto + etiqueta vertical */}
              <div className="hda-closed" aria-hidden={on}>
                <span className="hda-dot" />
                <b className="hda-vlabel">{c.railLabel}</b>
              </div>

              {/* Estado expandido */}
              <div className="hda-open" aria-hidden={!on}>
                <div className="hda-detail">
                  <span className="hda-programa">{c.programa}</span>
                  <div className="hda-cliente">
                    {c.logo && (
                      <Image
                        src={c.logo.src}
                        alt={c.logo.alt}
                        width={400}
                        height={140}
                        className="hda-cliente-logo"
                      />
                    )}
                    {c.logoChip && (
                      <span className="hda-cliente-chip">
                        <Image
                          src={c.logoChip.src}
                          alt={c.logoChip.alt}
                          width={140}
                          height={140}
                        />
                      </span>
                    )}
                    {c.logoGlass && (
                      <span className="hda-cliente-glass">
                        {/* Host externo (propais.org.co) con aspecto libre →
                            <img> en vez de next/image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.logoGlass.src} alt={c.logoGlass.alt} />
                      </span>
                    )}
                    {c.clienteText && (
                      <span className="hda-cliente-text">{c.clienteText}</span>
                    )}
                  </div>
                  {c.clienteSub && (
                    <span className="hda-cliente-sub">{c.clienteSub}</span>
                  )}
                  <em className="hda-proyecto">
                    Proyecto · <span>{c.proyecto}</span>
                  </em>
                  <p className="hda-desc">{c.descripcion}</p>
                  <span className="hda-tier">{c.tier}</span>
                </div>

                <div className="hda-stats">
                  {c.metrics.map((m) => (
                    <div
                      key={m.label}
                      className={`hda-stat${c.metrics.length === 1 ? " hda-stat--hero" : ""}`}
                    >
                      <span className="hda-stat-value">
                        {m.prefix}
                        {on ? (
                          <CountUp value={m.value} decimals={m.decimals ?? 0} />
                        ) : (
                          m.value.toFixed(m.decimals ?? 0)
                        )}
                        {m.suffix}
                      </span>
                      <span className="hda-stat-label">{m.label}</span>
                      {m.caption && (
                        <em className="hda-stat-caption">{m.caption}</em>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <style jsx global>{`
        .hda-root {
          font-family: var(--font-poppins), system-ui, sans-serif;
        }
        .hda-stage {
          display: flex;
          gap: 12px;
          height: clamp(520px, 68vh, 680px);
          margin-top: 40px;
        }
        .hda-panel {
          position: relative;
          overflow: hidden;
          flex: 1;
          min-width: 0;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-color: color-mix(in srgb, var(--ac) 24%, rgba(255, 255, 255, 0.06));
          background: #05070d;
          background:
            radial-gradient(
              130% 120% at 50% 110%,
              color-mix(in srgb, var(--ac) 13%, transparent),
              transparent 62%
            ),
            #05070d;
          cursor: pointer;
          transition:
            flex 0.85s cubic-bezier(0.66, 0, 0.22, 1),
            border-color 0.5s,
            box-shadow 0.6s;
        }
        .hda-panel--on {
          flex: 8;
          cursor: default;
          border-color: color-mix(in srgb, var(--ac) 55%, transparent);
          box-shadow:
            0 40px 110px -42px var(--ag),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }
        .hda-panel:not(.hda-panel--on):hover {
          border-color: color-mix(in srgb, var(--ac) 45%, transparent);
          box-shadow: 0 20px 60px -30px var(--ag);
        }
        .hda-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          width: 100%;
          transform-origin: left;
          background: var(--ac);
          box-shadow: 0 0 12px var(--ag);
          animation: hda-progress ${AUTO_MS}ms linear forwards;
          z-index: 3;
        }
        .hda-ghost {
          position: absolute;
          right: 18px;
          bottom: -34px;
          font-size: clamp(120px, 15vw, 210px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          color: color-mix(in srgb, var(--ac) 13%, transparent);
          pointer-events: none;
          user-select: none;
          transition: opacity 0.5s;
          z-index: 0;
        }
        .hda-panel:not(.hda-panel--on) .hda-ghost {
          opacity: 0;
        }

        /* ── Colapsado: punto + etiqueta vertical ── */
        .hda-closed {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 18px;
          padding-top: 26px;
          opacity: 1;
          transition: opacity 0.35s 0.25s;
          z-index: 1;
        }
        .hda-panel--on .hda-closed {
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .hda-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--ac);
          box-shadow: 0 0 16px var(--ag), 0 0 4px var(--ag);
          flex-shrink: 0;
        }
        .hda-vlabel {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #aebadb;
          white-space: nowrap;
        }

        /* ── Expandido ── */
        .hda-open {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: 1.45fr 1fr;
          gap: 36px;
          align-items: center;
          text-align: left;
          /* Ancho fijo interior: el texto no refluye durante la animación */
          width: min(920px, calc(100vw - 96px));
          padding: 46px 52px;
          opacity: 0;
          transition: opacity 0.4s;
          z-index: 2;
        }
        .hda-panel--on .hda-open {
          opacity: 1;
          transition: opacity 0.45s 0.3s;
        }
        .hda-panel:not(.hda-panel--on) .hda-open {
          pointer-events: none;
        }
        .hda-detail {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 13px;
          min-width: 0;
        }
        .hda-programa {
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ac);
        }
        .hda-cliente {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 8px;
        }
        .hda-cliente-logo {
          height: 64px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.96;
        }
        .hda-cliente-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 66px;
          height: 66px;
          border-radius: 15px;
          background: #ffffff;
          flex-shrink: 0;
        }
        .hda-cliente-chip img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }
        .hda-cliente-text {
          font-size: clamp(34px, 4.2vw, 50px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #f2f5fc;
        }
        /* Chip claro con destello periódico para logos a color (Propaís):
           mismo lenguaje de shine que los chips de laureles del hero. */
        .hda-cliente-glass {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 24px;
          border-radius: 15px;
          border: 1px solid rgba(233, 207, 154, 0.55);
          background: linear-gradient(160deg, #ffffff, #eef2f8 55%, #ffffff);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 12px 34px -14px rgba(230, 190, 120, 0.55);
        }
        .hda-cliente-glass::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -70%;
          width: 45%;
          background: linear-gradient(
            105deg,
            transparent,
            rgba(230, 190, 120, 0.32) 50%,
            transparent
          );
          transform: skewX(-18deg);
          animation: hda-glass-shine 5.6s ease-in-out infinite;
          pointer-events: none;
        }
        .hda-cliente-glass img {
          height: 46px;
          width: auto;
          object-fit: contain;
          display: block;
        }
        .hda-cliente-sub {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8e9fbe;
        }
        .hda-proyecto {
          font-family: var(--font-newsreader), "Newsreader", serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 500;
          color: #b9c6e3;
        }
        .hda-proyecto span {
          background: linear-gradient(100deg, #ffffff 30%, var(--ac));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .hda-desc {
          margin: 2px 0 0;
          font-size: 14.5px;
          font-weight: 400;
          line-height: 1.7;
          color: #aebadb;
          text-wrap: pretty;
          max-width: 460px;
        }
        .hda-tier {
          margin-top: 8px;
          padding: 6px 13px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--ac) 40%, transparent);
          background: color-mix(in srgb, var(--ac) 8%, transparent);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--ac) 80%, #ffffff);
        }

        .hda-stats {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
          padding-left: 30px;
          border-left: 1px solid rgba(255, 255, 255, 0.09);
        }
        .hda-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hda-stat-value {
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          background: linear-gradient(120deg, #ffffff 15%, var(--ac) 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 0 22px var(--ag));
        }
        .hda-stat--hero .hda-stat-value {
          font-size: clamp(52px, 5.8vw, 76px);
        }
        .hda-stat-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8e9fbe;
        }
        .hda-stat-caption {
          font-family: var(--font-newsreader), "Newsreader", serif;
          font-style: italic;
          font-size: 14px;
          color: #64749a;
        }

        @keyframes hda-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        @keyframes hda-glass-shine {
          0%,
          55% {
            transform: translateX(0) skewX(-18deg);
          }
          78%,
          100% {
            transform: translateX(430%) skewX(-18deg);
          }
        }

        /* ── <980px: columna con bandas de 64px ── */
        @media (max-width: 979px) {
          .hda-stage {
            flex-direction: column;
            height: auto;
            gap: 10px;
          }
          .hda-panel {
            flex: none;
            height: 64px;
            transition:
              height 0.85s cubic-bezier(0.66, 0, 0.22, 1),
              border-color 0.5s,
              box-shadow 0.6s;
          }
          .hda-panel--on {
            flex: none;
            height: auto;
            min-height: 480px;
          }
          .hda-closed {
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            gap: 14px;
            padding: 0 22px;
          }
          .hda-vlabel {
            writing-mode: horizontal-tb;
            transform: none;
          }
          .hda-open {
            position: relative;
            inset: auto;
            grid-template-columns: 1fr;
            gap: 22px;
            width: 100%;
            padding: 26px 22px 30px;
          }
          .hda-stats {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 18px 28px;
            padding-left: 0;
            padding-top: 20px;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.09);
          }
          .hda-stat--hero .hda-stat-value {
            font-size: 48px;
          }
          .hda-cliente-logo {
            height: 52px;
          }
          .hda-cliente-chip {
            width: 56px;
            height: 56px;
          }
          .hda-cliente-chip img {
            width: 42px;
            height: 42px;
          }
          .hda-cliente-glass {
            padding: 10px 18px;
          }
          .hda-cliente-glass img {
            height: 38px;
          }
          .hda-ghost {
            font-size: 130px;
            bottom: -22px;
          }
          /* En columna, el panel activo crece: ocultar colapsado al instante */
          .hda-panel--on .hda-closed {
            display: none;
          }
          .hda-panel:not(.hda-panel--on) .hda-open {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hda-panel {
            transition: none;
          }
          .hda-progress {
            animation: none;
            display: none;
          }
          .hda-cliente-glass::after {
            animation: none;
          }
          .hda-open,
          .hda-closed {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
