"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import {
  homeClientLogos,
  programInstitutionalLogos,
} from "@/components/home/homeBrandData";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument-serif",
  display: "swap",
});

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
  franquiciar: "https://franquiciar.franquiciaslatam.com",
  invertir: "/quiz",
  casos: "#video-hero",
  ia: "https://franquicias.ai",
};

const NAV_LINKS = [
  // "franquiciar" is a same-site subdomain move: same-tab navigation, no target="_blank".
  { label: "Franquiciar mi Negocio", href: HREF.franquiciar, external: false },
  { label: "Invertir", href: HREF.invertir, external: false },
  { label: "Casos de Éxito", href: HREF.casos, external: false },
  { label: "Franquicias.ia", href: HREF.ia, external: true },
];

// Empresarios: metodología premiada — BID, Naciones Unidas, MinTIC (logos del proyecto).
const EMPRESARIOS_AWARD_LOGOS = programInstitutionalLogos;
// Inversionistas: plataforma IA con 2 premios de innovación — BID + MinTIC.
const INVERSIONISTAS_AWARD_LOGOS = [
  programInstitutionalLogos[0],
  programInstitutionalLogos[2],
];

const MARQUEE_LOGOS = [...homeClientLogos, ...homeClientLogos];

const STAT_TARGETS = { stores: 450, countries: 40, sales: 250 };

function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 10 H16 M11 4.5 L16.5 10 L11 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// MinTIC's asset is a solid-fill color badge (not a transparent line mark), so
// brightness(0)/invert(1) collapses it into a plain white block. Give it a
// small white chip instead of forcing the white-silhouette treatment.
function AwardLogo({
  logo,
  height,
  delay,
}: {
  logo: { src: string; alt: string };
  height: number;
  delay: string;
}) {
  const isFullColorBadge = logo.src.includes("mintic");

  if (isFullColorBadge) {
    return (
      <span className="hdf-strip-logo-chip" style={{ animationDelay: delay }}>
        <Image src={logo.src} alt={logo.alt} width={800} height={300} style={{ height: height - 6 }} />
      </span>
    );
  }

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={800}
      height={300}
      className="hdf-strip-logo"
      style={{ animationDelay: delay, height }}
    />
  );
}

export function HomeDecisionFork() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Contact modal
  const [contactOpen, setContactOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fNombre, setFNombre] = useState("");
  const [fTelefono, setFTelefono] = useState("");
  const [fEmpresa, setFEmpresa] = useState("");
  const [fInstagram, setFInstagram] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Contador animado 0 → 750 al entrar en viewport (una vez).
  const [clientCount, setClientCount] = useState(0);
  const proofRef = useRef<HTMLDivElement | null>(null);
  const proofStartedRef = useRef(false);

  // Stats "growth line" (450 / 40+ / USD $250M)
  const [stats, setStats] = useState({ stores: 0, countries: 0, sales: 0 });
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsStartedRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => {
        setClientCount(COUNTER_TARGET);
        setStats(STAT_TARGETS);
      });
      return () => cancelAnimationFrame(raf);
    }

    const runCounter = (
      node: HTMLElement | null,
      startedRef: React.MutableRefObject<boolean>,
      onTick: (progress: number) => void,
      duration: number,
    ) => {
      if (!node) return () => {};
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              onTick(eased);
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
    };

    const stopProof = runCounter(
      proofRef.current,
      proofStartedRef,
      (p) => setClientCount(Math.round(p * COUNTER_TARGET)),
      1500,
    );
    const stopStats = runCounter(
      statsRef.current,
      statsStartedRef,
      (p) =>
        setStats({
          stores: Math.round(p * STAT_TARGETS.stores),
          countries: Math.round(p * STAT_TARGETS.countries),
          sales: Math.round(p * STAT_TARGETS.sales),
        }),
      1900,
    );

    return () => {
      stopProof();
      stopStats();
    };
  }, []);

  const openContact = () => {
    setContactOpen(true);
    setSubmitted(false);
    setSubmitError(null);
  };
  const closeContact = () => setContactOpen(false);

  // Escape + overlay click + focus trap while modal is open.
  useEffect(() => {
    if (!contactOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContact();
        return;
      }
      if (event.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'input, button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const firstInput = modalRef.current?.querySelector<HTMLElement>("input");
    firstInput?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contactOpen]);

  const submitContact = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // /api/leads/form requires an email; the design's contact form doesn't
      // collect one, so we synthesize a sentinel from the phone number.
      const phoneDigits = fTelefono.replace(/\D/g, "") || Date.now().toString();
      const res = await fetch("/api/leads/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fNombre,
          phone: fTelefono,
          email: `${phoneDigits}@sin-email.franquiciaslatam.co`,
          franchiseSlug: "home-contact",
          sourceType: "home_contact",
          landingSource: "home_contact",
          type: "contact",
          message: `Empresa: ${fEmpresa || "—"} · Instagram: ${fInstagram || "—"}`,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setSubmitted(true);
    } catch {
      setSubmitError(
        "No pudimos enviar tus datos. Intenta de nuevo o escríbenos por WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={`hdf-root relative isolate overflow-hidden bg-[#05080F] text-[#F2F5FC] ${spaceGrotesk.variable} ${instrumentSerif.variable}`}
    >
      {/* ── Fondo: gradientes + grid + aurora ───────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hdf-bg-glow" />
        <div className="hdf-grid absolute inset-0" />
        <div className="hdf-aurora" />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-14 lg:py-[26px]">
        <Link href="/" aria-label="Franquicias LATAM" className="hdf-focus rounded flex items-center gap-3">
          <Image
            src="/logo_latam/franquicias_latam_logo.png"
            alt="Franquicias LATAM"
            width={480}
            height={120}
            priority
            className="h-10 w-auto brightness-0 invert sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="hdf-navlink hdf-focus"
              >
                {link.label}
              </a>
            ) : link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="hdf-navlink hdf-focus">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="hdf-navlink hdf-focus">
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openContact}
            className="hdf-contact-btn hdf-focus hidden sm:inline-flex"
          >
            <span className="hdf-sheen" aria-hidden />
            Contactar
          </button>
          <button
            type="button"
            aria-label="Menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="hdf-focus grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 md:hidden"
          >
            <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="absolute inset-x-4 top-[72px] z-30 rounded-2xl border border-white/12 bg-[#0A1226]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
            <div className="flex flex-col">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[rgba(232,238,255,.9)] hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ) : link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[rgba(232,238,255,.9)] hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-[16px] font-medium text-[rgba(232,238,255,.9)] hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openContact();
                }}
                className="mt-1 rounded-xl bg-white/10 px-4 py-3 text-center text-[16px] font-semibold"
              >
                Contactar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <main className="relative z-[2] flex flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
        {/* Cupos capsule */}
        <a href={HREF.franquiciar} className="hdf-badge-outer hdf-focus">
          <div className="hdf-badge-inner">
            <span className="hdf-shimmer" aria-hidden />
            <div className="hidden items-center gap-[14px] py-2 pl-[22px] pr-[9px] md:flex">
              <span className="flex items-center gap-[9px] text-[13px] font-bold tracking-[0.14em] text-[#8FDCEC]">
                <span className="hdf-dot" />
                CUPOS ABIERTOS AGOSTO 2026
              </span>
              <span className="hdf-orange-chip">
                Quedan {CUPOS_RESTANTES} de {CUPOS_TOTAL} cupos
                <Arrow size={15} />
              </span>
            </div>
            <div className="flex items-center gap-2.5 py-1.5 pl-4 pr-1.5 md:hidden">
              <span className="hdf-dot" />
              <span className="text-[12.5px] font-semibold tracking-[0.1em] text-[#8FDCEC]">
                CUPOS AGOSTO 2026
              </span>
              <span className="hdf-orange-chip hdf-orange-chip--sm">
                {CUPOS_RESTANTES}/{CUPOS_TOTAL}
              </span>
            </div>
          </div>
        </a>

        {/* Headline */}
        <h1 className="hdf-h1 mt-8 sm:mt-9">
          ¿Cómo quieres <em className="hdf-grad">crecer</em> hoy?
        </h1>

        {/* Two paths */}
        <div className="hdf-cards mt-10 grid w-full max-w-[1120px] gap-6 sm:mt-14">
          <a href={HREF.franquiciar} className="hdf-card hdf-card--orange">
            <span className="hdf-card-topline hdf-card-topline--orange" />
            <span className="hdf-card-eyebrow hdf-card-eyebrow--orange">Para Empresarios</span>
            <span className="hdf-card-title">Soy negocio y quiero franquiciar.</span>
            <span className="hdf-card-cta hdf-card-cta--orange">
              Diagnóstico gratis · Respuesta en 48h <Arrow />
            </span>
            <span className="hdf-card-strip">
              <span className="hdf-card-strip-divider hdf-card-strip-divider--orange" />
              <span className="hdf-card-strip-label">METODOLOGÍA PREMIADA POR</span>
              <span className="hdf-card-strip-logos">
                {EMPRESARIOS_AWARD_LOGOS.map((logo, i) => (
                  <AwardLogo
                    key={logo.alt}
                    logo={logo}
                    delay={`${i * 0.6}s`}
                    height={i === 0 ? 28 : i === 1 ? 25 : 30}
                  />
                ))}
              </span>
            </span>
          </a>

          <Link href={HREF.invertir} className="hdf-card hdf-card--cyan">
            <span className="hdf-card-topline hdf-card-topline--cyan" />
            <span className="hdf-card-eyebrow hdf-card-eyebrow--cyan">Para Inversionistas</span>
            <span className="hdf-card-title">Quiero invertir en una franquicia.</span>
            <span className="hdf-card-cta hdf-card-cta--cyan">
              Tu match ideal en 1 minuto <Arrow />
            </span>
            <span className="hdf-card-strip">
              <span className="hdf-card-strip-divider hdf-card-strip-divider--cyan" />
              <span className="hdf-card-strip-label">PLATAFORMA IA · 2 PREMIOS DE INNOVACIÓN</span>
              <span className="hdf-card-strip-logos">
                {INVERSIONISTAS_AWARD_LOGOS.map((logo, i) => (
                  <AwardLogo
                    key={logo.alt}
                    logo={logo}
                    delay={`${i * 0.3}s`}
                    height={i === 0 ? 28 : 24}
                  />
                ))}
              </span>
            </span>
          </Link>
        </div>

        {/* Social proof: label + marquee + video + stats */}
        <div id="video-hero" className="mt-16 flex w-full max-w-[1120px] flex-col items-center gap-8 sm:mt-[72px]">
          <div ref={proofRef} className="hdf-proof-label">
            <strong className="tabular-nums">{clientCount}+ CLIENTES</strong> CONFÍAN EN NOSOTROS
          </div>

          <div className="hdf-marquee-mask w-full">
            <div className="hdf-marquee">
              {MARQUEE_LOGOS.map((logo, index) => (
                <Image
                  key={`${logo.alt}-${index}`}
                  src={logo.src}
                  alt={logo.alt}
                  width={140}
                  height={60}
                  className="hdf-marquee-logo"
                />
              ))}
            </div>
          </div>

          {/* Video testimonial */}
          <div className="mt-3 flex w-full max-w-[780px] flex-col items-center gap-4">
            <div className="hdf-video-frame">
              <div className="hdf-video-inner">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/r0Qc7FsEQRU?rel=0&modestbranding=1"
                  title="Testimonio de cliente — Totto x Franquicias LATAM"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-col items-center gap-4 text-center">
              <em className="hdf-eyebrow-serif">Caso de éxito</em>
              <h2 className="hdf-h2">
                Totto <span className="hdf-grad">×</span> Franquicias LATAM
              </h2>
              <span className="text-[17px] text-[#8E9FBE]">
                Natan Bursztyn · CEO y Fundador de Totto
              </span>

              <div ref={statsRef} className="hdf-stats-row">
                <span className="hdf-stats-line" aria-hidden />
                <div className="hdf-stat">
                  <span className="hdf-stat-node hdf-stat-node--blue" />
                  <span className="hdf-stat-value hdf-stat-value--blue tabular-nums">
                    {stats.stores}
                  </span>
                  <span className="hdf-stat-label">TIENDAS</span>
                  <em className="hdf-stat-caption">Una apertura a la vez.</em>
                </div>
                <div className="hdf-stat">
                  <span className="hdf-stat-node hdf-stat-node--teal" />
                  <span className="hdf-stat-value hdf-stat-value--teal tabular-nums">
                    {stats.countries}+
                  </span>
                  <span className="hdf-stat-label">PAÍSES</span>
                  <em className="hdf-stat-caption">De Bogotá para el mundo.</em>
                </div>
                <div className="hdf-stat">
                  <span className="hdf-stat-node hdf-stat-node--orange" />
                  <span className="hdf-stat-value hdf-stat-value--orange tabular-nums">
                    USD ${stats.sales}M
                  </span>
                  <span className="hdf-stat-label">VENTAS ANUALES</span>
                  <em className="hdf-stat-caption">Cada año. En todo el mundo.</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal de contacto ────────────────────────────────────────────── */}
      {contactOpen && (
        <div
          onClick={closeContact}
          className="hdf-overlay fixed inset-0 z-50 grid place-items-center p-6"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hdf-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="hdf-modal"
          >
            <div className="hdf-modal-inner">
              <span className="hdf-modal-topline" aria-hidden />
              <span className="hdf-modal-glow" aria-hidden />
              <button
                type="button"
                onClick={closeContact}
                aria-label="Cerrar"
                className="hdf-modal-close"
              >
                ✕
              </button>

              {!submitted ? (
                <>
                  <div className="flex flex-col gap-2">
                    <em id="hdf-modal-title" className="hdf-modal-title">
                      Hablemos de crecer.
                    </em>
                    <span className="text-[15.5px] text-[#B4C2DC]">
                      Déjanos tus datos y te respondemos en menos de 48 horas.
                    </span>
                  </div>
                  <form onSubmit={submitContact} className="mt-5 flex flex-col gap-3.5">
                    <input
                      required
                      value={fNombre}
                      onChange={(e) => setFNombre(e.target.value)}
                      placeholder="Nombre"
                      className="hdf-input"
                    />
                    <input
                      required
                      type="tel"
                      value={fTelefono}
                      onChange={(e) => setFTelefono(e.target.value)}
                      placeholder="Teléfono"
                      className="hdf-input"
                    />
                    <input
                      required
                      value={fEmpresa}
                      onChange={(e) => setFEmpresa(e.target.value)}
                      placeholder="Nombre de Empresa"
                      className="hdf-input"
                    />
                    <input
                      required
                      value={fInstagram}
                      onChange={(e) => setFInstagram(e.target.value)}
                      placeholder="Instagram del Negocio"
                      className="hdf-input"
                    />
                    <button type="submit" disabled={submitting} className="hdf-submit-btn">
                      <span className="hdf-sheen hdf-sheen--fast" aria-hidden />
                      {submitting ? "Enviando…" : "Enviar →"}
                    </button>
                    {submitError && (
                      <p role="alert" className="text-center text-sm text-[#FF8A8A]">
                        {submitError}
                      </p>
                    )}
                    <span className="text-center text-[13px] text-[#8E9FBE]">
                      Respuesta en menos de 48h · Sin compromiso
                    </span>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3.5 py-7 text-center">
                  <span className="hdf-success-ring">✓</span>
                  <em className="hdf-modal-title" style={{ color: "#F2F5FC" }}>
                    Listo. Hablamos pronto.
                  </em>
                  <p className="text-[15px] leading-relaxed text-[#8E9FBE]">
                    Recibimos tus datos. Te contactamos en menos de 48 horas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hdf-root {
          font-family: var(--font-space-grotesk), "Space Grotesk", sans-serif;
        }

        /* ── Fondo ── */
        .hdf-bg-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(1400px 900px at 50% -20%, #0c1730 0%, transparent 62%),
            radial-gradient(900px 640px at 88% 112%, #0b1428 0%, transparent 55%);
        }
        .hdf-grid {
          background-image: linear-gradient(rgba(120, 150, 220, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 150, 220, 0.045) 1px, transparent 1px);
          background-size: 72px 72px;
          -webkit-mask-image: radial-gradient(1200px 800px at 50% 30%, #000 30%, transparent 100%);
          mask-image: radial-gradient(1200px 800px at 50% 30%, #000 30%, transparent 100%);
        }
        .hdf-aurora {
          position: absolute;
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: min(1100px, 92vw);
          height: 420px;
          background: radial-gradient(
            closest-side,
            rgba(110, 168, 255, 0.14),
            rgba(55, 230, 195, 0.05) 55%,
            transparent 75%
          );
          filter: blur(40px);
          animation: hdf-aurora-breath 9s ease-in-out infinite;
        }

        /* ── Nav ── */
        .hdf-navlink {
          font-size: 14.5px;
          font-weight: 500;
          color: #8e9fbe;
          transition: color 0.2s ease;
        }
        .hdf-navlink:hover {
          color: #ff8a3d;
        }
        .hdf-contact-btn {
          position: relative;
          overflow: hidden;
          padding: 12px 26px;
          border-radius: 999px;
          background: linear-gradient(#0a1224, #0a1224) padding-box,
            conic-gradient(
                from var(--hdf-angle, 0deg),
                rgba(255, 122, 41, 0.25) 0deg,
                rgba(255, 122, 41, 0.25) 280deg,
                #ffa24f 320deg,
                #37e6c3 345deg,
                rgba(255, 122, 41, 0.25) 360deg
              )
              border-box;
          border: 1px solid transparent;
          color: #ffb877;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          animation: hdf-shine-rotate 3.2s linear infinite;
          transition: box-shadow 0.25s, color 0.25s;
        }
        .hdf-contact-btn:hover {
          color: #ffd9b0;
          box-shadow: 0 0 36px rgba(255, 122, 41, 0.4);
        }
        .hdf-sheen {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
          animation: hdf-sheen-sweep 3.4s ease-in-out infinite;
          pointer-events: none;
        }
        .hdf-sheen--fast {
          animation-duration: 2.8s;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
        }

        /* ── Cupos badge ── */
        .hdf-badge-outer {
          display: inline-block;
          padding: 1px;
          border-radius: 999px;
          background: conic-gradient(
            from var(--hdf-angle, 0deg),
            rgba(127, 216, 232, 0.18) 0deg,
            rgba(127, 216, 232, 0.18) 290deg,
            rgba(55, 230, 195, 0.95) 320deg,
            rgba(255, 162, 79, 0.9) 340deg,
            rgba(127, 216, 232, 0.18) 360deg
          );
          animation: hdf-shine-rotate 3.6s linear infinite, hdf-fade-up 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition: box-shadow 0.25s;
        }
        .hdf-badge-outer:hover {
          box-shadow: 0 0 36px rgba(110, 168, 255, 0.2);
        }
        .hdf-badge-inner {
          position: relative;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(10, 18, 36, 0.88);
          backdrop-filter: blur(10px);
        }
        .hdf-shimmer {
          position: absolute;
          inset: 0 auto 0 0;
          width: 36%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.09) 50%, transparent);
          animation: hdf-sheen-sweep 3.4s ease-in-out infinite;
          pointer-events: none;
        }
        .hdf-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #37e6c3;
          box-shadow: 0 0 10px rgba(55, 230, 195, 0.9);
          animation: hdf-pulse-dot 2.2s infinite;
        }
        .hdf-orange-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          border-radius: 999px;
          background: linear-gradient(90deg, #ff7a29, #ffa24f);
          color: #160900;
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
          box-shadow: 0 4px 18px -4px rgba(255, 122, 41, 0.55);
        }
        .hdf-orange-chip--sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        /* ── Headline ── */
        .hdf-h1 {
          margin: 0;
          font-size: clamp(38px, 6.4vw, 71px);
          line-height: 1.05;
          letter-spacing: -0.03em;
          font-weight: 600;
        }
        .hdf-grad {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.01em;
          background: linear-gradient(100deg, #6ea8ff, #37e6c3, #6ea8ff);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: hdf-gradient-drift 7s ease-in-out infinite;
        }
        .hdf-h2 {
          margin: 0;
          font-size: clamp(28px, 4.6vw, 44px);
          line-height: 1.08;
          letter-spacing: -0.025em;
          font-weight: 600;
          color: #f2f5fc;
        }
        .hdf-eyebrow-serif {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 26px;
          color: #8fdcec;
          letter-spacing: 0.01em;
        }

        /* ── Cards ── */
        .hdf-cards {
          animation: hdf-fade-up 0.8s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @media (min-width: 900px) {
          .hdf-cards {
            grid-template-columns: 1fr 1fr;
            align-items: stretch;
          }
        }
        .hdf-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 36px 30px 28px;
          border-radius: 22px;
          text-align: left;
          color: #f2f5fc;
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s, border-color 0.35s;
        }
        @media (min-width: 640px) {
          .hdf-card {
            padding: 40px 42px 34px;
          }
        }
        .hdf-card:hover {
          transform: translateY(-5px);
          color: #f2f5fc;
        }
        .hdf-card--orange {
          border: 1px solid rgba(255, 122, 41, 0.28);
          background: linear-gradient(165deg, rgba(255, 122, 41, 0.09), rgba(255, 122, 41, 0.015) 52%),
            rgba(10, 16, 32, 0.75);
        }
        .hdf-card--orange:hover {
          border-color: rgba(255, 138, 61, 0.85);
          box-shadow: 0 32px 80px -20px rgba(255, 122, 41, 0.38), inset 0 1px 0 rgba(255, 180, 120, 0.25);
        }
        .hdf-card--cyan {
          border: 1px solid rgba(127, 216, 232, 0.24);
          background: linear-gradient(165deg, rgba(110, 168, 255, 0.08), rgba(55, 230, 195, 0.015) 52%),
            rgba(10, 16, 32, 0.75);
        }
        .hdf-card--cyan:hover {
          border-color: rgba(143, 220, 236, 0.8);
          box-shadow: 0 32px 80px -20px rgba(110, 168, 255, 0.32), inset 0 1px 0 rgba(150, 220, 255, 0.22);
        }
        .hdf-card-topline {
          position: absolute;
          top: 0;
          left: 30px;
          right: 30px;
          height: 1px;
        }
        @media (min-width: 640px) {
          .hdf-card-topline {
            left: 42px;
            right: 42px;
          }
        }
        .hdf-card-topline--orange {
          background: linear-gradient(90deg, transparent, rgba(255, 150, 80, 0.5), transparent);
        }
        .hdf-card-topline--cyan {
          background: linear-gradient(90deg, transparent, rgba(130, 200, 255, 0.45), transparent);
        }
        .hdf-card-eyebrow {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-size: 20px;
          letter-spacing: 0.02em;
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: hdf-gradient-drift 5s ease-in-out infinite;
        }
        .hdf-card-eyebrow--orange {
          background-image: linear-gradient(100deg, #ff9d4d, #ffe0b8, #ff9d4d);
        }
        .hdf-card-eyebrow--cyan {
          background-image: linear-gradient(100deg, #8fdcec, #e2f8ff, #8fdcec);
          animation-delay: 0.6s;
        }
        .hdf-card-title {
          margin-top: 14px;
          font-size: 24px;
          line-height: 1.22;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        @media (min-width: 640px) {
          .hdf-card-title {
            font-size: 26px;
          }
        }
        .hdf-card-cta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
          font-weight: 600;
          font-size: 16px;
        }
        @media (min-width: 640px) {
          .hdf-card-cta {
            font-size: 17px;
          }
        }
        .hdf-card-cta--orange {
          color: #ff8a3d;
        }
        .hdf-card-cta--cyan {
          color: #8fdcec;
        }
        .hdf-card-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 20px;
          margin-top: auto;
          padding-top: 22px;
        }
        .hdf-card-strip-divider {
          width: 100%;
          height: 1px;
          margin-bottom: 8px;
        }
        .hdf-card-strip-divider--orange {
          background: linear-gradient(90deg, rgba(255, 122, 41, 0.25), transparent);
        }
        .hdf-card-strip-divider--cyan {
          background: linear-gradient(90deg, rgba(127, 216, 232, 0.22), transparent);
        }
        .hdf-card-strip-label {
          width: 100%;
          font-size: 11px;
          letter-spacing: 0.16em;
          color: #8e9fbe;
          font-weight: 600;
          white-space: nowrap;
        }
        .hdf-card-strip-logos {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px 24px;
          min-width: 0;
        }
        .hdf-strip-logo {
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.92;
          animation: hdf-logo-float 4.5s ease-in-out infinite;
        }
        .hdf-strip-logo-chip {
          display: inline-flex;
          align-items: center;
          border-radius: 6px;
          background: #fff;
          padding: 3px 7px;
          opacity: 0.95;
          animation: hdf-logo-float 4.5s ease-in-out infinite;
        }
        .hdf-strip-logo-chip img {
          width: auto;
        }

        /* ── Social proof ── */
        .hdf-proof-label {
          font-size: 12.5px;
          letter-spacing: 0.2em;
          font-weight: 600;
          color: #5e6f8f;
        }
        .hdf-proof-label strong {
          color: #c9d6ee;
          font-weight: 700;
        }
        .hdf-marquee-mask {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
        }
        .hdf-marquee {
          display: flex;
          align-items: center;
          gap: 64px;
          width: max-content;
          animation: hdf-marquee-scroll 30s linear infinite;
          padding-right: 64px;
        }
        @media (min-width: 640px) {
          .hdf-marquee {
            gap: 92px;
            padding-right: 92px;
          }
        }
        .hdf-marquee-logo {
          height: 44px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        @media (min-width: 640px) {
          .hdf-marquee-logo {
            height: 60px;
          }
        }

        /* ── Video ── */
        .hdf-video-frame {
          position: relative;
          width: 100%;
          border-radius: 22px;
          padding: 1.5px;
          background: conic-gradient(
            from var(--hdf-angle, 0deg),
            rgba(127, 216, 232, 0.15) 0deg,
            rgba(127, 216, 232, 0.15) 280deg,
            rgba(55, 230, 195, 0.85) 315deg,
            rgba(255, 162, 79, 0.8) 340deg,
            rgba(127, 216, 232, 0.15) 360deg
          );
          animation: hdf-shine-rotate 6s linear infinite;
          box-shadow: 0 40px 120px -40px rgba(110, 168, 255, 0.35), 0 0 60px -20px rgba(55, 230, 195, 0.15);
        }
        .hdf-video-inner {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 21px;
          overflow: hidden;
          background: #05080f;
        }

        /* ── Stats growth line ── */
        .hdf-stats-row {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          width: 100%;
          margin-top: 18px;
        }
        @media (min-width: 640px) {
          .hdf-stats-row {
            gap: 24px;
          }
        }
        .hdf-stats-line {
          position: absolute;
          top: 9px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(110, 168, 255, 0.6),
            rgba(55, 230, 195, 0.6),
            rgba(255, 162, 79, 0.6),
            transparent
          );
          background-size: 200% 100%;
          animation: hdf-gradient-drift 6s ease-in-out infinite;
        }
        .hdf-stat {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .hdf-stat-node {
          position: relative;
          z-index: 1;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0a1020;
          border: 2px solid;
          animation: hdf-node-pulse 2.8s ease-in-out infinite;
        }
        .hdf-stat-node--blue {
          border-color: #6ea8ff;
        }
        .hdf-stat-node--teal {
          border-color: #37e6c3;
          animation-delay: 0.5s;
        }
        .hdf-stat-node--orange {
          border-color: #ffa24f;
          animation-delay: 1s;
        }
        .hdf-stat-value {
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        @media (min-width: 640px) {
          .hdf-stat-value {
            font-size: 42px;
          }
        }
        .hdf-stat-value--blue {
          background-image: linear-gradient(100deg, #6ea8ff, #37e6c3);
        }
        .hdf-stat-value--teal {
          background-image: linear-gradient(100deg, #37e6c3, #8fdcec);
        }
        .hdf-stat-value--orange {
          background-image: linear-gradient(100deg, #ffa24f, #ff7a29);
        }
        .hdf-stat-label {
          font-size: 12px;
          letter-spacing: 0.14em;
          color: #8e9fbe;
          font-weight: 600;
        }
        .hdf-stat-caption {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 14.5px;
          color: #c9d6ee;
        }
        @media (min-width: 640px) {
          .hdf-stat-caption {
            font-size: 16.5px;
          }
        }

        /* ── Contact modal ── */
        .hdf-overlay {
          background: rgba(4, 7, 14, 0.55);
          backdrop-filter: blur(18px) saturate(1.3);
          -webkit-backdrop-filter: blur(18px) saturate(1.3);
          animation: hdf-overlay-in 0.3s ease both;
          font-family: var(--font-space-grotesk), "Space Grotesk", sans-serif;
        }
        .hdf-modal {
          position: relative;
          width: 100%;
          max-width: 480px;
          border-radius: 26px;
          padding: 1.5px;
          background: linear-gradient(
            165deg,
            rgba(255, 162, 79, 0.5),
            rgba(255, 255, 255, 0.1) 30%,
            rgba(255, 255, 255, 0.06) 70%,
            rgba(55, 230, 195, 0.35)
          );
          animation: hdf-modal-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          box-shadow: 0 60px 140px -40px rgba(0, 0, 0, 0.85), 0 0 90px -30px rgba(255, 122, 41, 0.2);
        }
        .hdf-modal-inner {
          position: relative;
          overflow: hidden;
          border-radius: 25px;
          background: linear-gradient(180deg, #101a30 0%, #0a1122 100%);
          padding: 36px 28px 32px;
        }
        @media (min-width: 480px) {
          .hdf-modal-inner {
            padding: 40px 40px 36px;
          }
        }
        .hdf-modal-topline {
          position: absolute;
          top: 0;
          left: 40px;
          right: 40px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 162, 79, 0.7), transparent);
        }
        .hdf-modal-glow {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 420px;
          height: 200px;
          background: radial-gradient(closest-side, rgba(255, 122, 41, 0.14), transparent 75%);
          filter: blur(30px);
          pointer-events: none;
        }
        .hdf-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(242, 245, 252, 0.18);
          background: rgba(255, 255, 255, 0.05);
          color: #8e9fbe;
          font-size: 15px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        }
        .hdf-modal-close:hover {
          color: #f2f5fc;
          border-color: rgba(242, 245, 252, 0.45);
        }
        .hdf-modal-title {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 28px;
          color: #ffb877;
          letter-spacing: 0.01em;
        }
        @media (min-width: 480px) {
          .hdf-modal-title {
            font-size: 30px;
          }
        }
        .hdf-input {
          padding: 15px 17px;
          border-radius: 14px;
          border: 1px solid rgba(159, 176, 204, 0.28);
          background: #070d1b;
          color: #f2f5fc;
          font-family: inherit;
          font-size: 15.5px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .hdf-input::placeholder {
          color: #7e90b0;
        }
        .hdf-input:focus {
          border-color: #ffa24f;
          background: #0a1224;
          box-shadow: 0 0 0 3px rgba(255, 122, 41, 0.18);
        }
        .hdf-submit-btn {
          position: relative;
          overflow: hidden;
          margin-top: 4px;
          padding: 15px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(90deg, #ff7a29, #ffa24f);
          color: #160900;
          font-family: inherit;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 12px 36px -10px rgba(255, 122, 41, 0.6);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .hdf-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 48px -10px rgba(255, 122, 41, 0.75);
        }
        .hdf-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }
        .hdf-success-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 1.5px solid rgba(55, 230, 195, 0.6);
          display: grid;
          place-items: center;
          font-size: 22px;
          color: #37e6c3;
          box-shadow: 0 0 40px rgba(55, 230, 195, 0.35);
        }

        /* ── Focus ── */
        .hdf-focus:focus-visible {
          outline: 2px solid #37e6c3;
          outline-offset: 3px;
        }

        /* ── Keyframes ── */
        @property --hdf-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes hdf-shine-rotate {
          to {
            --hdf-angle: 360deg;
          }
        }
        @keyframes hdf-sheen-sweep {
          0% {
            transform: translateX(-160%) skewX(-18deg);
          }
          60%,
          100% {
            transform: translateX(220%) skewX(-18deg);
          }
        }
        @keyframes hdf-pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(0.65);
          }
        }
        @keyframes hdf-fade-up {
          0% {
            opacity: 0;
            transform: translateY(22px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes hdf-gradient-drift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes hdf-aurora-breath {
          0%,
          100% {
            opacity: 0.5;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.85;
            transform: translateX(-50%) scale(1.12);
          }
        }
        @keyframes hdf-logo-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes hdf-marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes hdf-node-pulse {
          0%,
          100% {
            box-shadow: 0 0 10px rgba(55, 230, 195, 0.5);
          }
          50% {
            box-shadow: 0 0 26px rgba(55, 230, 195, 1);
          }
        }
        @keyframes hdf-modal-in {
          0% {
            opacity: 0;
            transform: translateY(26px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes hdf-overlay-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hdf-aurora,
          .hdf-shimmer,
          .hdf-dot,
          .hdf-badge-outer,
          .hdf-contact-btn,
          .hdf-sheen,
          .hdf-grad,
          .hdf-card-eyebrow,
          .hdf-strip-logo,
          .hdf-strip-logo-chip,
          .hdf-marquee,
          .hdf-stats-line,
          .hdf-stat-node,
          .hdf-video-frame,
          .hdf-cards {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
