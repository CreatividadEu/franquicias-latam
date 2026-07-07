"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { homeClientLogos } from "@/components/home/homeBrandData";

// ── Config / state source ──────────────────────────────────────────────────
const CUPOS_TOTAL = 14;
const COUNTER_TARGET = 750;

function clampInt(value: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, value));
}
const CUPOS_RESTANTES = clampInt(
  Number.parseInt(process.env.NEXT_PUBLIC_FIA_CUPOS ?? "5", 10) || 5,
  0,
  CUPOS_TOTAL,
);

// Destinos: se conservan los flujos existentes del sitio.
const HREF = {
  franquiciar: "#proceso", // flujo franquiciar / diagnóstico
  invertir: "/quiz", // quiz de match del inversor
  casos: "#video-hero",
  ia: "https://franquicias.ai", // marca / producto Franquicias.ia
  badge: "#proceso", // aplicar al programa
  comenzar: "/quiz",
};

const NAV_LINKS = [
  { label: "Franquiciar mi Negocio", href: HREF.franquiciar, external: false },
  { label: "Invertir", href: HREF.invertir, external: false },
  { label: "Casos de Éxito", href: HREF.casos, external: false },
  { label: "Franquicias.ia", href: HREF.ia, external: true },
];

const HERO_LOGOS = homeClientLogos.slice(0, 6);

function Arrow({ size = 20, stroke = 2.4 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 10 H16 M11 4.5 L16.5 10 L11 15.5"
        fill="none"
        stroke="#fff"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeHeroMidnight() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState(0);
  const proofRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  // Contador animado 0 → 750 al entrar en viewport (una vez).
  useEffect(() => {
    const node = proofRef.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // rAF para no llamar setState de forma síncrona dentro del efecto.
    if (reduced || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setCount(COUNTER_TARGET));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const duration = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * COUNTER_TARGET));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mn-hero relative isolate overflow-hidden bg-[#060D1F] text-white">
      {/* ── Fondo: aurora + grid ─────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="mn-aurora mn-aurora-a" />
        <div className="mn-aurora mn-aurora-b" />
        <div className="mn-aurora mn-aurora-c" />
        <div className="mn-grid absolute inset-0" />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="relative flex items-center justify-between px-5 py-5 sm:px-10 lg:px-16 lg:py-[26px]">
        <Link href="/" aria-label="Franquicias LATAM" className="mn-focus rounded">
          <Image
            src="/logo_latam/franquicias_latam_logo.png"
            alt="Franquicias LATAM"
            width={480}
            height={120}
            priority
            className="h-12 w-auto brightness-0 invert sm:h-14"
          />
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="mn-navlink mn-focus"
              >
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href} className="mn-navlink mn-focus">
                {link.label}
              </a>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={HREF.comenzar} className="mn-pill mn-focus hidden sm:inline-flex">
            Comenzar
          </Link>
          <button
            type="button"
            aria-label="Menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="mn-focus grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 md:hidden"
          >
            <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="absolute inset-x-4 top-[72px] z-30 rounded-2xl border border-white/12 bg-[#0A1226]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-[16px] font-medium text-[rgba(232,238,255,.9)] hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={HREF.comenzar}
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-xl bg-white/10 px-4 py-3 text-center text-[16px] font-semibold"
              >
                Comenzar
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center px-4 pb-16 pt-8 text-center sm:px-6 sm:pb-24 sm:pt-[54px] lg:pb-28">
        {/* FOMO badge */}
        <a href={HREF.badge} className="mn-badge-outer mn-focus">
          <div className="mn-badge-inner">
            <span className="mn-shimmer" aria-hidden />
            {/* Desktop */}
            <div className="hidden items-center gap-[14px] py-2 pl-[22px] pr-[9px] md:flex">
              <span className="flex items-center gap-[9px] text-[13px] font-bold tracking-[0.12em] text-[#7DE3FF]">
                <span className="mn-dot" />
                APLICACIONES ABIERTAS
              </span>
              <span className="h-[18px] w-px bg-white/[0.18]" />
              <span className="text-[15px] font-medium text-[rgba(232,238,255,.92)]">
                Franquicias.ia{" "}
                <span className="text-[rgba(232,238,255,.55)]">2ª Gen · Agosto 2026</span>
              </span>
              <span className="mn-orange-chip">
                Solo quedan <span data-cupos>{CUPOS_RESTANTES}</span> de {CUPOS_TOTAL} cupos
                <Arrow size={15} stroke={2.6} />
              </span>
            </div>
            {/* Móvil (compacto) */}
            <div className="flex items-center gap-2.5 py-1.5 pl-4 pr-1.5 md:hidden">
              <span className="mn-dot" />
              <span className="text-[12.5px] font-medium text-[rgba(232,238,255,.92)]">
                Franquicias.ia{" "}
                <span className="text-[rgba(232,238,255,.55)]">· Agosto 2026</span>
              </span>
              <span className="mn-orange-chip mn-orange-chip--sm">
                {CUPOS_RESTANTES}/{CUPOS_TOTAL} cupos
              </span>
            </div>
          </div>
        </a>

        {/* Headline */}
        <h1 className="mn-h1 mt-8 sm:mt-9">
          La próxima gran franquicia
          <br />
          de LATAM <span className="mn-grad">es la tuya.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-[18px] font-normal text-[rgba(232,238,255,.62)] sm:mt-[30px] sm:text-[23px]">
          Desarrollamos y vendemos las mejores franquicias.
          <br />
          <span className="font-semibold text-white">¿Cómo quieres crecer hoy?</span>
        </p>

        {/* Dual CTAs */}
        <div className="mt-9 flex w-full flex-col items-center gap-5 sm:mt-[42px] sm:w-auto sm:flex-row sm:items-start sm:gap-5">
          <div className="flex w-full flex-col items-center gap-[11px] sm:w-auto">
            <a href={HREF.franquiciar} className="mn-cta-primary mn-focus">
              Franquiciar mi Negocio
              <Arrow />
            </a>
            <span className="text-[15px] text-[rgba(232,238,255,.5)] sm:text-[17.5px]">
              Diagnóstico gratis · Respuesta en 48h
            </span>
          </div>
          <div className="flex w-full flex-col items-center gap-[11px] sm:w-auto">
            <Link href={HREF.invertir} className="mn-cta-ghost mn-focus">
              Invertir en Franquicias
            </Link>
            <span className="text-[15px] text-[rgba(232,238,255,.5)] sm:text-[17.5px]">
              Tu match ideal en 2 minutos
            </span>
          </div>
        </div>

        {/* Social proof */}
        <div
          ref={proofRef}
          className="mt-14 flex items-center gap-4 text-[17px] text-[rgba(232,238,255,.65)] sm:mt-[72px] sm:text-[19px]"
        >
          <span className="text-[28px] font-bold tracking-[-0.02em] text-white sm:text-[34px]">
            <span className="tabular-nums">{count}</span>+
          </span>
          <span>clientes confían en nosotros.</span>
        </div>

        {/* Logo bar */}
        <div className="mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-5 opacity-45 sm:gap-x-[76px]">
          {HERO_LOGOS.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={40}
              className="h-6 w-auto object-contain brightness-0 invert sm:h-7"
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        /* Global (mn- prefijo único) para aplicar también sobre <Link>/<a> de next,
           que styled-jsx no alcanza a scopear. */
        .mn-hero {
          --dim92: rgba(232, 238, 255, 0.92);
        }

        /* ── Aurora ── */
        .mn-aurora {
          position: absolute;
          border-radius: 99em;
          will-change: transform;
        }
        .mn-aurora-a {
          top: -220px;
          left: 18%;
          width: 900px;
          height: 620px;
          max-width: 90vw;
          background: radial-gradient(closest-side, rgba(66, 46, 245, 0.34), transparent 70%);
          filter: blur(70px);
          animation: auroraA 16s ease-in-out infinite;
        }
        .mn-aurora-b {
          top: -140px;
          right: 6%;
          width: 700px;
          height: 540px;
          max-width: 80vw;
          background: radial-gradient(closest-side, rgba(0, 196, 244, 0.22), transparent 70%);
          filter: blur(70px);
          animation: auroraB 19s ease-in-out infinite;
        }
        .mn-aurora-c {
          bottom: -340px;
          left: 50%;
          margin-left: -450px;
          width: 900px;
          height: 520px;
          max-width: 95vw;
          background: radial-gradient(closest-side, rgba(249, 94, 11, 0.16), transparent 70%);
          filter: blur(80px);
          animation: auroraA 22s ease-in-out infinite;
        }
        .mn-grid {
          background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          -webkit-mask-image: radial-gradient(ellipse 65% 60% at 50% 38%, #000 30%, transparent 75%);
          mask-image: radial-gradient(ellipse 65% 60% at 50% 38%, #000 30%, transparent 75%);
        }

        /* ── Nav ── */
        .mn-navlink {
          font-size: 17px;
          font-weight: 500;
          color: rgba(232, 238, 255, 0.85);
          transition: color 0.2s ease;
        }
        .mn-navlink:hover {
          color: #fff;
        }
        .mn-pill {
          align-items: center;
          padding: 13px 28px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          transition: all 0.2s ease;
        }
        .mn-pill:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        /* ── FOMO badge ── */
        .mn-badge-outer {
          display: inline-block;
          padding: 1.5px;
          border-radius: 99px;
          background: linear-gradient(
            92deg,
            rgba(0, 196, 244, 0.75),
            rgba(91, 46, 245, 0.65) 45%,
            rgba(249, 94, 11, 0.85)
          );
          box-shadow: 0 10px 34px rgba(0, 196, 244, 0.18);
          transition: all 0.25s ease;
        }
        .mn-badge-outer:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 44px rgba(0, 196, 244, 0.28);
        }
        .mn-badge-inner {
          position: relative;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(7, 14, 32, 0.88);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }
        .mn-shimmer {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 36%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.09) 50%, transparent);
          animation: badgeShimmer 3.4s ease-in-out infinite;
          pointer-events: none;
        }
        .mn-dot {
          width: 9px;
          height: 9px;
          border-radius: 99px;
          background: #00e0ff;
          flex-shrink: 0;
          animation: pulseDotCyan 2s infinite;
        }
        .mn-orange-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 99px;
          background: linear-gradient(135deg, #ff8a1e, #f95e0b);
          font-size: 14.5px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          animation: glowOrange 2.4s ease-in-out infinite;
        }
        .mn-orange-chip--sm {
          padding: 7px 13px;
          font-size: 12.5px;
        }

        /* ── Headline ── */
        .mn-h1 {
          font-size: clamp(38px, 6vw, 78px);
          line-height: 1.06;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .mn-grad {
          background: linear-gradient(92deg, #7da2ff 5%, #00e0ff 60%, #7cf5d4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        /* ── CTAs ── */
        .mn-cta-primary,
        .mn-cta-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 420px;
          padding: 20px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          transition: all 0.2s ease;
        }
        .mn-cta-primary {
          background: linear-gradient(135deg, #ff8a1e, #f95e0b);
          box-shadow: 0 16px 44px rgba(249, 94, 11, 0.38);
        }
        .mn-cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 54px rgba(249, 94, 11, 0.5);
        }
        .mn-cta-ghost {
          background: rgba(255, 255, 255, 0.07);
          border: 1.5px solid rgba(125, 162, 255, 0.5);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
        }
        .mn-cta-ghost:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-3px);
        }

        @media (min-width: 640px) {
          .mn-cta-primary,
          .mn-cta-ghost {
            width: auto;
            padding: 23px 44px;
            font-size: 21px;
          }
        }

        /* ── Focus ── */
        .mn-focus:focus-visible {
          outline: 2px solid #00e0ff;
          outline-offset: 3px;
        }

        /* ── Keyframes ── */
        @keyframes auroraA {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(70px, 40px) scale(1.15);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes auroraB {
          0% {
            transform: translate(0, 0) scale(1.1);
          }
          50% {
            transform: translate(-60px, -30px) scale(1);
          }
          100% {
            transform: translate(0, 0) scale(1.1);
          }
        }
        @keyframes badgeShimmer {
          0% {
            transform: translateX(-140%);
          }
          55% {
            transform: translateX(340%);
          }
          100% {
            transform: translateX(340%);
          }
        }
        @keyframes glowOrange {
          0% {
            box-shadow: 0 0 0 0 rgba(249, 94, 11, 0.45);
          }
          50% {
            box-shadow: 0 0 22px 3px rgba(249, 94, 11, 0.55);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(249, 94, 11, 0.45);
          }
        }
        @keyframes pulseDotCyan {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 196, 244, 0.55);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 196, 244, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 196, 244, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mn-aurora,
          .mn-shimmer,
          .mn-dot,
          .mn-orange-chip {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
