"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Poppins, Playfair_Display } from "next/font/google";

// ── "De enterprise global a microfranquicia" — acordeón de casos por escala ──
// Acordeón horizontal de 4 casos (ENTERPRISE → FRANQUICIAS OS → PYME → MICRO).
// Un panel expandido a la vez (982px); los demás colapsan a rieles de 72px con
// punto de acento, etiqueta vertical y número índice tenue. UI oscura con un
// aura de glow por panel (color de firma). Canvas de 1240px (982 + 3×72 +
// 3×14 gap); en móvil se apila en vertical con barras horizontales. Tipografía
// del handoff: Poppins + Playfair Display (acentos serif en itálica).

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

// Alpha helper: hex + 2-digit alpha (idéntico al del handoff de diseño).
const A = (hex: string, a: number) =>
  hex +
  Math.round(Math.min(1, Math.max(0, a)) * 255)
    .toString(16)
    .padStart(2, "0");

type Stat = { v: string; l: string };

type Case = {
  num: string;
  railLabel: string;
  eyebrow: string;
  brand: string;
  logo?: string;
  logoH?: number;
  logoW?: number;
  textLogo?: boolean;
  textLogoSub?: string;
  projA: string;
  projB: string;
  desc: string;
  chip: string;
  accent: string;
  soft: string;
  single: boolean;
  statValue?: string;
  statLabel?: string;
  statSub?: string;
  stats?: Stat[];
};

// Logos: los SVG de Sodexo/Mercado Libre son #3d3d3d y el wordmark de SAJÚ ya
// es blanco; `filter: brightness(0) invert(1)` los normaliza todos a blanco
// sobre transparente (es idempotente sobre lo que ya es blanco).
const DATA: Case[] = [
  {
    num: "01",
    railLabel: "ENTERPRISE",
    eyebrow: "PROGRAMA ENTERPRISE",
    brand: "Sodexo",
    logo: "/logos_clientes/logo_sodexo.svg",
    logoH: 42,
    logoW: 105,
    projA: "Kitchen",
    projB: "Works",
    desc: "Estructuración, programa y plataforma de formación de una de las ofertas de mayor tamaño de Sodexo a nivel global.",
    chip: "GRANDES COMPAÑÍAS GLOBALES",
    accent: "#7d9bff",
    soft: "#bccdff",
    single: true,
    statValue: "€24B",
    statLabel: "FACTURACIÓN ANUAL",
    statSub: "24 billones de euros",
  },
  {
    num: "02",
    railLabel: "FRANQUICIAS OS",
    eyebrow: "PROGRAMA FRANQUICIAS OS",
    brand: "Mercado Libre",
    logo: "/logos_clientes/logo_mercado_libre.svg",
    logoH: 46,
    logoW: 115,
    projA: "CDF",
    projB: "Tucarro",
    desc: "Creación del sistema de franquicias y experiencia de los Centros de Fotografía de Tucarro.com.",
    chip: "CORPORATIVOS Y PLATAFORMAS",
    accent: "#43e5a0",
    soft: "#a9f5d4",
    single: true,
    statValue: "$22B",
    statLabel: "FACTURACIÓN ANUAL",
    statSub: "22 billones de dólares",
  },
  {
    num: "03",
    railLabel: "PYME",
    eyebrow: "PROGRAMA FRANQUICIAS PYME",
    brand: "SAJÚ",
    logo: "/saju/saju-wordmark-tight.png",
    logoH: 52,
    logoW: 91,
    projA: "Franquicias",
    projB: "SAJU",
    desc: "Creación del sistema de franquicias de la amada marca colombiana SAJÚ.",
    chip: "MARCAS EN CRECIMIENTO",
    accent: "#f2a65a",
    soft: "#ffd9a6",
    single: true,
    statValue: "$6M",
    statLabel: "FACTURACIÓN ANUAL",
    statSub: "6 millones de dólares",
  },
  {
    num: "04",
    railLabel: "MICRO",
    eyebrow: "PROGRAMA MICROFRANQUICIAS",
    brand: "Propaís",
    textLogo: true,
    textLogoSub: "CON FONDOS DEL BANCO INTERAMERICANO DE DESARROLLO",
    projA: "Microfranquicias",
    projB: "Propaís",
    desc: "Desarrollamos más de 20 proyectos de microfranquicias con Propaís y fondos del Banco Interamericano de Desarrollo — los proveedores más grandes de todo el proyecto, con 50% del total y una puntuación histórica de 97.5% de aprobación.",
    chip: "MICROEMPRESAS E IMPACTO",
    accent: "#ff5c7c",
    soft: "#ffb6c6",
    single: false,
    stats: [
      { v: "20+", l: "SISTEMAS CREADOS" },
      { v: "50%", l: "DEL PROYECTO TOTAL" },
      { v: "97.5%", l: "APROBACIÓN HISTÓRICA" },
    ],
  },
];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type CasesShowcaseProps = {
  /** Auto-avanza por los paneles. */
  autoCycle?: boolean;
  /** Segundos por panel en auto-cycle (rango 3–12). */
  cycleSeconds?: number;
  /** Escala todos los glows/sombras de acento (0–1). */
  glowIntensity?: number;
  /** Muestra/oculta el gran número fantasma de esquina. */
  showGhostNumbers?: boolean;
};

export function CasesShowcase({
  autoCycle = false,
  cycleSeconds = 6,
  glowIntensity = 0.7,
  showGhostNumbers = true,
}: CasesShowcaseProps = {}) {
  const [active, setActive] = useState(0);
  const locked = useRef(false);
  const glow = Math.min(1, Math.max(0, glowIntensity));

  // Auto-cycle: setInterval avanza active = (active+1) % 4; se limpia al elegir
  // manualmente (locked) y al desmontar; se reconstruye si cambia cycleSeconds.
  useEffect(() => {
    if (!autoCycle || locked.current || prefersReducedMotion()) return;
    const secs = Math.min(12, Math.max(3, cycleSeconds));
    const t = window.setInterval(
      () => setActive((a) => (a + 1) % DATA.length),
      secs * 1000,
    );
    return () => window.clearInterval(t);
  }, [autoCycle, cycleSeconds, active]);

  // La selección manual bloquea el auto-cycle.
  const pick = (i: number) => {
    locked.current = true;
    setActive(i);
  };

  // Variables CSS por panel — colores calculados con el mismo A()/glow del
  // handoff para fidelidad exacta; el stylesheet solo las referencia.
  const vars = (d: Case): React.CSSProperties =>
    ({
      "--ac": d.accent,
      "--soft": d.soft,
      "--bd-on": A(d.accent, 0.5),
      "--bd-off": A(d.accent, 0.22),
      "--bg-on-rad": A(d.accent, 0.1),
      "--bg-off-lin": A(d.accent, 0.05),
      "--bg-off-rad": A(d.accent, 0.13),
      "--sh-a": A(d.accent, 0.5 * glow),
      "--sh-b": A(d.accent, 0.35 * glow),
      "--dot-glow": A(d.accent, 0.6 * glow),
      "--idx": A(d.accent, 0.55),
      "--chip-bd": A(d.accent, 0.45),
      "--stat-glow": A(d.accent, 0.25 + 0.4 * glow),
    }) as React.CSSProperties;

  return (
    <section
      className={`casos-root ${poppins.variable} ${playfair.variable} mt-16 w-full max-w-[1240px] sm:mt-[72px]`}
      aria-label="Casos de éxito por tamaño de operación"
    >
      <header className="casos-head">
        <span className="casos-kicker">Un caso para cada escala</span>
        <h2 className="casos-h2">
          De <em>enterprise global</em> a microfranquicia.
        </h2>
        <p className="casos-sub">
          El mismo estándar, en cuatro tamaños de operación.
        </p>
      </header>

      <div className="casos-row">
        {DATA.map((d, i) => {
          const on = i === active;
          return (
            <div
              key={d.num}
              role="button"
              tabIndex={0}
              aria-label={d.railLabel}
              aria-expanded={on}
              className={`casos-panel${on ? " on" : ""}`}
              style={vars(d)}
              onClick={() => {
                if (!on) pick(i);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!on) pick(i);
                }
              }}
            >
              {/* Riel colapsado: punto + etiqueta vertical + número índice */}
              <div className="casos-rail" aria-hidden={on}>
                <span className="casos-dot" />
                <span className="casos-vlabel">{d.railLabel}</span>
                <span className="casos-idx">{d.num}</span>
              </div>

              {/* Contenido expandido */}
              <div className="casos-content" aria-hidden={!on}>
                <div className="casos-left">
                  <div className="casos-eyebrow">{d.eyebrow}</div>

                  {d.textLogo ? (
                    <div className="casos-textlogo-wrap">
                      <div className="casos-textlogo">Propaís</div>
                      <div className="casos-textlogo-sub">{d.textLogoSub}</div>
                    </div>
                  ) : (
                    <Image
                      src={d.logo!}
                      alt={d.brand}
                      width={d.logoW}
                      height={d.logoH}
                      className="casos-logo"
                      style={{ height: d.logoH, width: "auto" }}
                    />
                  )}

                  <div className="casos-proyecto">
                    Proyecto · <span className="a">{d.projA}</span>{" "}
                    <span className="b">{d.projB}</span>
                  </div>

                  <p className="casos-desc">{d.desc}</p>

                  <span className="casos-chip">{d.chip}</span>
                </div>

                <div className="casos-right">
                  {d.single ? (
                    <>
                      <div className="casos-bigval">{d.statValue}</div>
                      <div className="casos-biglabel">{d.statLabel}</div>
                      <div className="casos-bigsub">{d.statSub}</div>
                    </>
                  ) : (
                    <div className="casos-multi">
                      {d.stats!.map((s) => (
                        <div key={s.l}>
                          <div className="casos-mval">{s.v}</div>
                          <div className="casos-mlabel">{s.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showGhostNumbers && (
                  <div className="casos-ghost" aria-hidden>
                    {d.num}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .casos-root {
          font-family: var(--font-poppins), system-ui, sans-serif;
          box-sizing: border-box;
        }
        .casos-root *,
        .casos-root *::before,
        .casos-root *::after {
          box-sizing: border-box;
        }

        /* ── Encabezado ── */
        .casos-head {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto 44px;
          text-align: center;
        }
        .casos-kicker {
          display: block;
          font-family: var(--font-playfair), "Playfair Display", serif;
          font-style: italic;
          font-size: 21px;
          color: #4fd8c6;
        }
        .casos-h2 {
          margin: 12px 0 10px;
          font-size: clamp(30px, 6vw, 46px);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #f2f5fb;
          line-height: 1.1;
        }
        .casos-h2 em {
          font-family: var(--font-playfair), "Playfair Display", serif;
          font-weight: 500;
          font-style: italic;
          background: linear-gradient(95deg, #56d9c9, #7d9bff);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .casos-sub {
          margin: 0;
          font-size: 16px;
          color: #93a0b8;
        }

        /* ── Fila del acordeón ── */
        .casos-row {
          display: flex;
          gap: 14px;
          height: 460px;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
        }

        /* Modelo fluido: base 72px, sin shrink; el activo crece (flex-grow 1)
           para ocupar el espacio libre → exactamente 982px a 1240px de canvas
           (1240 − 4×72 − 3×14 = 910 de espacio libre; 72 + 910 = 982). */
        .casos-panel {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          height: 100%;
          flex: 0 0 72px;
          flex-grow: 0;
          cursor: pointer;
          outline: none;
          border: 1px solid var(--bd-off);
          background:
            linear-gradient(180deg, var(--bg-off-lin), transparent 40%),
            radial-gradient(140% 55% at 50% 110%, var(--bg-off-rad), transparent 60%),
            #05080f;
          transition:
            flex-grow 0.6s cubic-bezier(0.25, 0.9, 0.3, 1),
            border-color 0.4s,
            box-shadow 0.6s;
        }
        .casos-panel.on {
          flex-grow: 1;
          cursor: default;
          border-color: var(--bd-on);
          background:
            radial-gradient(120% 90% at 82% 105%, var(--bg-on-rad), transparent 55%),
            linear-gradient(180deg, #080d17 0%, #050810 70%);
          box-shadow:
            0 34px 90px -28px var(--sh-a),
            0 0 44px -18px var(--sh-b);
        }
        .casos-panel:focus-visible {
          outline: 2px solid var(--ac);
          outline-offset: 3px;
        }

        /* ── Riel colapsado ── */
        .casos-rail {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px 0 16px;
          opacity: 1;
          transition: opacity 0.35s 0.2s;
          pointer-events: none;
        }
        .casos-panel.on .casos-rail {
          opacity: 0;
          transition: opacity 0.25s;
        }
        .casos-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex: none;
          background: var(--ac);
          box-shadow: 0 0 12px 2px var(--dot-glow);
        }
        .casos-vlabel {
          writing-mode: vertical-rl;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2.6px;
          color: #9aa6bc;
          white-space: nowrap;
        }
        .casos-idx {
          margin-top: auto;
          font-size: 13px;
          font-weight: 600;
          color: var(--idx);
        }

        /* ── Contenido expandido ── */
        .casos-content {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          padding: 36px 48px;
          display: flex;
          align-items: center;
          gap: 46px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .casos-panel.on .casos-content {
          opacity: 1;
          transition: opacity 0.4s 0.18s;
          pointer-events: auto;
        }

        .casos-left {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
          position: relative;
          z-index: 1;
        }
        .casos-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3.2px;
          color: var(--ac);
        }
        .casos-logo {
          display: block;
          width: auto;
          margin: 6px 0 2px;
          filter: brightness(0) invert(1);
        }
        .casos-textlogo-wrap {
          margin: 4px 0 2px;
        }
        .casos-textlogo {
          font-size: 38px;
          font-weight: 700;
          color: #f4f7fc;
          line-height: 1;
        }
        .casos-textlogo-sub {
          margin-top: 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.2px;
          color: #93a0b8;
        }
        .casos-proyecto {
          font-family: var(--font-playfair), "Playfair Display", serif;
          font-style: italic;
          font-size: 19px;
          color: #8e9bb3;
        }
        .casos-proyecto .a {
          color: #e2e8f4;
        }
        .casos-proyecto .b {
          color: var(--ac);
        }
        .casos-desc {
          margin: 0;
          font-size: 15px;
          line-height: 1.7;
          color: #a5b1c8;
          max-width: 520px;
          text-wrap: pretty;
        }
        .casos-chip {
          display: inline-block;
          padding: 9px 18px;
          border-radius: 999px;
          border: 1px solid var(--chip-bd);
          color: var(--ac);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.8px;
          margin-top: 4px;
        }

        .casos-right {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding-left: 42px;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .casos-bigval {
          font-size: 82px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
          background: linear-gradient(105deg, #ffffff 25%, var(--soft) 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 8px 34px var(--stat-glow));
        }
        .casos-biglabel {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2.4px;
          color: #b8c2d8;
          margin-top: 16px;
        }
        .casos-bigsub {
          font-family: var(--font-playfair), "Playfair Display", serif;
          font-style: italic;
          font-size: 15px;
          color: #8593ac;
          margin-top: 6px;
        }
        .casos-multi {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .casos-mval {
          font-size: 30px;
          font-weight: 700;
          line-height: 1;
          color: #f2f5fb;
          text-shadow: 0 0 26px rgba(255, 255, 255, 0.25);
        }
        .casos-mlabel {
          margin-top: 6px;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 1.8px;
          color: #93a0b8;
        }

        /* ── Número fantasma ── */
        .casos-ghost {
          position: absolute;
          right: 28px;
          bottom: -30px;
          font-size: 200px;
          font-weight: 700;
          line-height: 0.75;
          letter-spacing: -0.04em;
          color: var(--ac);
          opacity: 0.09;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        /* ── <1024px: apilado vertical con barras horizontales ── */
        @media (max-width: 1023px) {
          .casos-row {
            flex-direction: column;
            height: auto;
            gap: 12px;
            max-width: 660px;
          }
          .casos-panel {
            flex: none;
            width: 100%;
            height: 72px;
            transition:
              height 0.5s cubic-bezier(0.25, 0.9, 0.3, 1),
              border-color 0.4s,
              box-shadow 0.5s;
          }
          .casos-panel.on {
            height: auto;
            min-height: 520px;
          }
          .casos-rail {
            flex-direction: row;
            width: 100%;
            height: 72px;
            justify-content: flex-start;
            align-items: center;
            gap: 14px;
            padding: 0 24px;
          }
          .casos-vlabel {
            writing-mode: horizontal-tb;
            letter-spacing: 2px;
          }
          .casos-idx {
            margin-top: 0;
            margin-left: auto;
          }
          .casos-content {
            position: relative;
            inset: auto;
            width: 100%;
            height: auto;
            flex-direction: column;
            align-items: flex-start;
            gap: 26px;
            padding: 30px 26px 34px;
          }
          .casos-left {
            width: 100%;
          }
          .casos-right {
            width: 100%;
            min-width: 0;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-left: 0;
            padding-top: 26px;
          }
          .casos-bigval {
            font-size: clamp(56px, 12vw, 82px);
          }
          .casos-ghost {
            font-size: 120px;
            right: 16px;
            bottom: -18px;
          }
          .casos-panel:not(.on) .casos-content {
            display: none;
          }
          .casos-panel.on .casos-rail {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .casos-panel,
          .casos-content,
          .casos-rail {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
