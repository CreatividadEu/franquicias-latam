"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import {
  homeClientLogos,
  programInstitutionalLogos,
} from "@/components/home/homeBrandData";
import { EvaluationExperience } from "@/components/home/EvaluationExperience";
import { OfficesSection } from "@/components/home/OfficesSection";

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

type NavLink = {
  label: string;
  href: string;
  external: boolean;
  opensEvaluation?: boolean;
};

const NAV_LINKS: NavLink[] = [
  // "Franquiciar mi Negocio" abre la Evaluación Privada (el mismo flow que la
  // tarjeta de empresarios); no navega al subdominio. `href` queda como
  // fallback accesible.
  {
    label: "Franquiciar mi Negocio",
    href: HREF.franquiciar,
    external: false,
    opensEvaluation: true,
  },
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

// ── Typewriter del eyebrow de Empresarios ───────────────────────────────────
// "Para " queda fijo; las palabras se escriben y se borran, y la última
// ("Franquiciar tu Negocio") queda fija.
const TYPE_WORDS = ["Startups", "Microempresas", "PyMES", "Grandes Empresas"];
const TYPE_FINAL = "Quienes Quieren Crecer";
const TYPE_MS = 58;
const TYPE_JITTER_MS = 26;
const DELETE_MS = 32;
const HOLD_WORD_MS = 1050;
const HOLD_EMPTY_MS = 300;

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

// Flechas progresivas 1 → 2 → 3 (onda con easing, 4 ciclos); al terminar,
// `primed` las deja fijas como estela.
function ArrowTrail({ primed }: { primed: boolean }) {
  return (
    <span
      className={`hdf-arrows${primed ? " hdf-arrows--primed" : ""}`}
      aria-hidden="true"
    >
      <Arrow />
      <Arrow />
      <Arrow />
    </span>
  );
}

// Ciclos de la onda de flechas: mantener en sintonía con el CSS
// (.hdf-arrows svg → animation ... 4) y el timer de "primed".
const ARROW_CYCLES_MS = 7100;

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
        <Image src={logo.src} alt={logo.alt} width={800} height={300} style={{ height: height - 10 }} />
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

// ── Palmarés: franja de laureles dorados (handoff hifi) ─────────────────────
// Cuatro insignias estilo festival de cine: laureles de trazo dorado
// (#f5e9c8 → #d9b26a), pila eyebrow / nombre / origen y separadores de 1px.
// BID usa el logo real del proyecto en blanco; MinTIC va en chip blanco
// (su asset es un badge de color sólido que no admite monocromo); Collision
// queda tipográfico con su chispa — no hay logo oficial en el repo.
const LAUREL_D =
  "M 17,117 A 55 55 0 0 0 17,13 M 27.5,112.6 Q 34,107.6 41.8,110.3 Q 33.7,116.7 27.5,112.6 Z M 36.8,105.9 Q 32.8,98.8 36.5,91.5 Q 41.7,100.4 36.8,105.9 Z M 44.5,97.3 Q 48.4,90.1 56.6,89.4 Q 51.8,98.5 44.5,97.3 Z M 50.2,87.4 Q 43.7,82.6 44.1,74.3 Q 52.4,80.4 50.2,87.4 Z M 53.8,76.4 Q 54.4,68.3 61.7,64.3 Q 60.9,74.5 53.8,76.4 Z M 55,65 Q 47.1,63.2 44.1,55.5 Q 54.1,57.7 55,65 Z M 53.8,53.6 Q 51.1,45.9 56,39.3 Q 59.6,49 53.8,53.6 Z M 50.2,42.6 Q 42.2,44.2 36.4,38.4 Q 46.4,36.3 50.2,42.6 Z M 44.5,32.7 Q 38.9,26.8 40.8,18.8 Q 47.9,26.1 44.5,32.7 Z M 36.8,24.1 Q 30.2,28.8 22.5,25.9 Q 30.8,19.8 36.8,24.1 Z M 27.5,17.4 Q 20,14.3 18.4,6.2 Q 27.9,10 27.5,17.4 Z M 17,12.7 Q 9.6,16.1 2.6,11.7 Q 11.9,7.4 17,12.7 Z";

// El primer laurel define <defs> (gradiente lgold + path laurelB); los otros
// siete lo reutilizan con <use>. El lado izquierdo va espejado.
function LaurelSvg({
  flip = false,
  withDefs = false,
}: {
  flip?: boolean;
  withDefs?: boolean;
}) {
  return (
    <svg
      width="58"
      height="108"
      viewBox="0 0 70 130"
      className={`hdf-palm-laurel${flip ? " hdf-palm-laurel--l" : ""}`}
      aria-hidden="true"
    >
      {withDefs && (
        <defs>
          <linearGradient
            id="lgold"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="8"
            x2="0"
            y2="128"
          >
            <stop offset="0" stopColor="#f5e9c8" />
            <stop offset=".5" stopColor="#d9b26a" />
            <stop offset="1" stopColor="rgba(217,178,106,.18)" />
          </linearGradient>
          <path
            id="laurelB"
            stroke="url(#lgold)"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={LAUREL_D}
          />
        </defs>
      )}
      <use href="#laurelB" />
    </svg>
  );
}

function PalmSep() {
  return <div className="hdf-palm-sep" aria-hidden />;
}

function TypewriterEyebrow({ className }: { className: string }) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);
  const reducedRef = useRef(false);
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Arranca al entrar en viewport (una vez). Con reduced-motion o sin
  // IntersectionObserver, muestra directamente el estado final; si el
  // usuario activa reduced-motion a mitad de ciclo, corta al estado final.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const finish = () => {
      setRunning(false);
      setTyped(TYPE_FINAL);
      setDone(true);
    };

    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    reducedRef.current = media?.matches ?? false;

    if (reducedRef.current || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(finish);
      return () => cancelAnimationFrame(raf);
    }

    const onMediaChange = () => {
      reducedRef.current = media?.matches ?? false;
      if (reducedRef.current) {
        startedRef.current = true;
        finish();
      }
    };
    if (media) {
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onMediaChange);
      } else {
        media.addListener(onMediaChange);
      }
    }

    // No destructurar solo entries[0]: el navegador puede agrupar la entrada
    // inicial (false) con el cruce real (true) en una misma entrega.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !startedRef.current) {
          startedRef.current = true;
          if (reducedRef.current) {
            finish();
          } else {
            setRunning(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (media) {
        if (typeof media.removeEventListener === "function") {
          media.removeEventListener("change", onMediaChange);
        } else {
          media.removeListener(onMediaChange);
        }
      }
    };
  }, []);

  // Ciclo escribe → pausa → borra; la última palabra queda fija.
  useEffect(() => {
    if (!running) return;
    let alive = true;
    let timer = 0;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    (async () => {
      const sequence = [...TYPE_WORDS, TYPE_FINAL];
      for (const word of sequence) {
        const isFinal = word === TYPE_FINAL;
        for (let i = 1; i <= word.length; i++) {
          if (!alive) return;
          setTyped(word.slice(0, i));
          await sleep(TYPE_MS + Math.random() * TYPE_JITTER_MS);
        }
        if (!alive) return;
        if (isFinal) {
          setDone(true);
          return;
        }
        await sleep(HOLD_WORD_MS);
        for (let i = word.length - 1; i >= 0; i--) {
          if (!alive) return;
          setTyped(word.slice(0, i));
          await sleep(DELETE_MS);
        }
        if (!alive) return;
        await sleep(HOLD_EMPTY_MS);
      }
    })();

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [running]);

  return (
    <span ref={rootRef} className={className} aria-label={`Para ${TYPE_FINAL}`}>
      <span aria-hidden="true">
        {"Para "}
        {typed}
        <span className={`hdf-caret${done ? " hdf-caret--done" : ""}`} />
      </span>
    </span>
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

  // Evaluación Privada: onda de flechas → morph de la tarjeta → overlay.
  const [evalPrimed, setEvalPrimed] = useState(false);
  const [evalOpen, setEvalOpen] = useState(false);
  const [companySeed, setCompanySeed] = useState("");
  const evalCtaRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = evalCtaRef.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setEvalPrimed(true));
      return () => cancelAnimationFrame(raf);
    }

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          timer = window.setTimeout(() => setEvalPrimed(true), ARROW_CYCLES_MS);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const openEvaluation = () => setEvalOpen(true);

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
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && !startedRef.current) {
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
            className="h-20 w-auto brightness-0 invert sm:h-24"
          />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) =>
            link.opensEvaluation ? (
              <button
                key={link.label}
                type="button"
                onClick={openEvaluation}
                className="hdf-navlink hdf-navlink--btn hdf-focus"
              >
                {link.label}
              </button>
            ) : link.external ? (
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
                link.opensEvaluation ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openEvaluation();
                    }}
                    className="rounded-xl px-4 py-3 text-left text-[16px] font-medium text-[rgba(232,238,255,.9)] hover:bg-white/5"
                  >
                    {link.label}
                  </button>
                ) : link.href.startsWith("#") ? (
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
      <main className="relative z-[2] flex flex-col items-center px-4 pb-16 pt-[52px] text-center sm:px-6 sm:pb-24 lg:pb-28">
        {/* Palmarés: franja de laureles dorados */}
        <section className="hdf-palms" aria-label="Reconocimientos">
          <div className="hdf-palms-halo" aria-hidden />
          <div className="hdf-palms-row">
            <div className="hdf-palm" style={{ animationDelay: "0.05s" }}>
              <LaurelSvg flip withDefs />
              <div className="hdf-palm-stack">
                <div className="hdf-palm-eyebrow">2× FINANCIADOS POR</div>
                <span
                  className="hdf-palm-glass"
                  style={{ "--sd": "0.15s" } as React.CSSProperties}
                >
                  <Image
                    src={programInstitutionalLogos[0].src}
                    alt={programInstitutionalLogos[0].alt}
                    width={800}
                    height={300}
                    className="hdf-palm-bid"
                  />
                </span>
                <div className="hdf-palm-origin hdf-palm-origin--wrap">
                  BANCO INTERAMERICANO DE DESARROLLO
                </div>
              </div>
              <LaurelSvg />
            </div>
            <PalmSep />
            <div className="hdf-palm" style={{ animationDelay: "0.2s" }}>
              <LaurelSvg flip />
              <div className="hdf-palm-stack">
                <div className="hdf-palm-eyebrow">GANADORES</div>
                <div className="hdf-palm-name-serif hdf-palm-name-loco">
                  Locomotora de
                  <br />
                  la Innovación
                </div>
                <span
                  className="hdf-palm-glass hdf-palm-glass--seal"
                  style={{ "--sd": "0.45s" } as React.CSSProperties}
                >
                  <Image
                    src={programInstitutionalLogos[2].src}
                    alt={programInstitutionalLogos[2].alt}
                    width={800}
                    height={300}
                  />
                </span>
              </div>
              <LaurelSvg />
            </div>
            <PalmSep />
            <div className="hdf-palm" style={{ animationDelay: "0.35s" }}>
              <LaurelSvg flip />
              <div className="hdf-palm-stack">
                <div className="hdf-palm-eyebrow">GANADORES</div>
                <div className="hdf-palm-name-serif hdf-palm-name-retos">
                  Retos 4.0
                </div>
                <span
                  className="hdf-palm-glass hdf-palm-glass--seal"
                  style={{ "--sd": "0.75s" } as React.CSSProperties}
                >
                  <Image
                    src={programInstitutionalLogos[2].src}
                    alt={programInstitutionalLogos[2].alt}
                    width={800}
                    height={300}
                  />
                </span>
              </div>
              <LaurelSvg />
            </div>
            <PalmSep />
            <div className="hdf-palm" style={{ animationDelay: "0.5s" }}>
              <LaurelSvg flip />
              <div className="hdf-palm-stack">
                <div className="hdf-palm-eyebrow">STARTUP FINALISTA</div>
                <span
                  className="hdf-palm-glass"
                  style={{ "--sd": "1.05s" } as React.CSSProperties}
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden>
                    <g stroke="#ff5d5d" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="6" y1="1" x2="6" y2="11" />
                      <line x1="1.7" y1="3.5" x2="10.3" y2="8.5" />
                      <line x1="10.3" y1="3.5" x2="1.7" y2="8.5" />
                    </g>
                  </svg>
                  <Image
                    src="/logos/logo_collision.png"
                    alt="Collision Conf."
                    width={501}
                    height={98}
                    className="hdf-palm-collision-logo"
                  />
                </span>
                <div className="hdf-palm-origin">TORONTO · CANADÁ</div>
              </div>
              <LaurelSvg />
            </div>
          </div>
        </section>

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

        {/* Manifiesto: el estándar de la industria */}
        <div className="hdf-manifesto">
          <p className="hdf-manifesto-lead">
            El <em className="hdf-grad">Estándar de Franquicias</em> en
            Iberoamérica.
          </p>
          <p className="hdf-manifesto-body">
            Los únicos del sector con <strong>tecnología propia</strong> —
            desarrollada, financiada y premiada. Desde{" "}
            <strong>Madrid y Bogotá</strong> operamos en{" "}
            <strong>12 países</strong>: legal, expansión, capital e
            inteligencia artificial bajo un mismo techo.
          </p>
        </div>

        {/* Two paths */}
        <div className="hdf-cards mt-8 grid w-full max-w-[1120px] gap-6 sm:mt-12">
          <div
            role="button"
            tabIndex={0}
            aria-label="Comenzar mi Evaluación Privada"
            onClick={openEvaluation}
            onKeyDown={(e) => {
              // Solo cuando el foco está en la tarjeta misma: los eventos del
              // input interno burbujean y un preventDefault aquí bloquearía
              // escribir espacios en él.
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEvaluation();
              }
            }}
            className="hdf-card hdf-card--orange hdf-card--action"
          >
            <span className="hdf-card-topline hdf-card-topline--orange" />
            <TypewriterEyebrow className="hdf-card-eyebrow hdf-card-eyebrow--orange" />
            <span className="hdf-card-title">Soy negocio y quiero franquiciar.</span>
            {!evalPrimed ? (
              <span ref={evalCtaRef} className="hdf-card-cta hdf-card-cta--orange">
                Diagnóstico gratis · Respuesta en 48h <ArrowTrail primed={false} />
              </span>
            ) : (
              <>
                <span
                  ref={evalCtaRef}
                  className="hdf-card-cta hdf-card-cta--orange hdf-card-cta--live"
                >
                  Comienza tu Evaluación Privada <ArrowTrail primed />
                </span>
                <span
                  className="hdf-eval-start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    className="hdf-eval-input"
                    placeholder="Nombre de tu Negocio"
                    value={companySeed}
                    onChange={(e) => setCompanySeed(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openEvaluation();
                    }}
                    aria-label="Nombre de tu negocio"
                  />
                  <button
                    type="button"
                    className="hdf-eval-btn"
                    onClick={openEvaluation}
                  >
                    Empezar <Arrow size={15} />
                  </button>
                </span>
              </>
            )}
            <span className="hdf-card-strip">
              <span className="hdf-card-strip-divider hdf-card-strip-divider--orange" />
              <span className="hdf-card-strip-label">METODOLOGÍA PREMIADA POR</span>
              <span className="hdf-card-strip-logos">
                {EMPRESARIOS_AWARD_LOGOS.map((logo, i) => (
                  <AwardLogo
                    key={logo.alt}
                    logo={logo}
                    delay={`${i * 0.6}s`}
                    height={i === 0 ? 47 : i === 1 ? 44 : 36}
                  />
                ))}
              </span>
            </span>
          </div>

          <Link href={HREF.invertir} className="hdf-card hdf-card--cyan">
            <span className="hdf-card-topline hdf-card-topline--cyan" />
            <span className="hdf-card-sheen" aria-hidden />
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
                    height={i === 0 ? 47 : 36}
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
          <div className="mt-4 flex w-full max-w-[780px] flex-col items-center gap-4">
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

            <div className="mt-2 flex flex-col items-center gap-4 text-center">
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

        {/* Oficinas — Madrid · Bogotá */}
        <OfficesSection />
      </main>

      {/* Evaluación Privada (overlay inmersivo) */}
      <EvaluationExperience
        open={evalOpen}
        initialCompany={companySeed}
        onClose={() => setEvalOpen(false)}
      />

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
        /* Cuando el navlink es un <button> (abre la Evaluación Privada). */
        .hdf-navlink--btn {
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          line-height: inherit;
          cursor: pointer;
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

        /* ── Palmarés: franja de laureles dorados ── */
        .hdf-palms {
          position: relative;
          width: 100%;
          margin-bottom: 46px;
        }
        .hdf-palms-halo {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 980px;
          height: 240px;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            closest-side,
            rgba(233, 199, 128, 0.09),
            transparent 72%
          );
          animation: hdf-palm-glow 5.5s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .hdf-palms-row {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: stretch;
          gap: 14px 30px;
        }
        .hdf-palm {
          flex: none;
          display: flex;
          align-items: center;
          animation: hdf-palm-fade-up 0.9s ease both;
        }
        .hdf-palm-laurel {
          filter: drop-shadow(0 0 7px rgba(230, 190, 120, 0.3));
        }
        .hdf-palm-laurel--l {
          transform: scaleX(-1);
        }
        .hdf-palm-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          max-width: 186px;
          padding: 0 6px;
          text-align: center;
        }
        .hdf-palm-eyebrow {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.24em;
          color: rgba(244, 241, 234, 0.52);
          white-space: nowrap;
        }
        .hdf-palm-name-serif {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          color: #f4f1ea;
        }
        .hdf-palm-name-loco {
          font-size: 22px;
          line-height: 1.14;
        }
        .hdf-palm-name-retos {
          font-size: 27px;
          line-height: 1;
        }
        /* Chips de vidrio para los logos: glassmorphism + destello periódico */
        .hdf-palm-glass {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.13),
            rgba(255, 255, 255, 0.045) 55%,
            rgba(255, 255, 255, 0.09)
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 10px 30px -12px rgba(230, 190, 120, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hdf-palm-glass::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -70%;
          width: 45%;
          background: linear-gradient(
            105deg,
            transparent,
            rgba(255, 255, 255, 0.28) 50%,
            transparent
          );
          transform: skewX(-18deg);
          animation: hdf-palm-shine 5.6s ease-in-out var(--sd, 0s) infinite;
          pointer-events: none;
        }
        .hdf-palm-glass--seal img {
          height: 18px;
          width: auto;
          object-fit: contain;
        }
        .hdf-palm-collision-logo {
          height: 19px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }
        .hdf-palm-origin {
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: 0.17em;
          line-height: 1.7;
          color: rgba(233, 207, 154, 0.55);
          white-space: nowrap;
        }
        .hdf-palm-origin--wrap {
          max-width: 150px;
          white-space: normal;
        }
        .hdf-palm-bid {
          height: 30px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }
        .hdf-palm-sep {
          width: 1px;
          align-self: center;
          height: 56px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(233, 207, 154, 0.26),
            transparent
          );
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
        /* ── Manifiesto bajo el titular ── */
        .hdf-manifesto {
          max-width: 800px;
          margin-top: 22px;
          animation: hdf-fade-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s
            both;
        }
        .hdf-manifesto-lead {
          margin: 0;
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-size: clamp(22px, 2.8vw, 31px);
          line-height: 1.2;
          color: #f2f5fc;
          text-wrap: balance;
          text-shadow: 0 0 34px rgba(110, 168, 255, 0.22);
        }
        .hdf-manifesto-lead .hdf-grad {
          filter: drop-shadow(0 0 16px rgba(55, 230, 195, 0.3));
        }
        .hdf-manifesto-body {
          margin: 13px auto 0;
          max-width: 730px;
          font-size: 16.5px;
          line-height: 1.7;
          color: #aebadb;
          text-wrap: pretty;
        }
        .hdf-manifesto-body strong {
          color: #ffffff;
          font-weight: 600;
        }
        @media (max-width: 639px) {
          .hdf-manifesto-body {
            font-size: 15px;
          }
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
        /* En pantallas muy angostas (<350px) la frase final del typewriter
           ("Para Franquiciar tu Negocio") saltaría a 2 líneas a mitad de la
           animación; reducimos el cuerpo para que quede en una sola. */
        @media (max-width: 349px) {
          .hdf-card-eyebrow {
            font-size: 16.5px;
          }
        }
        .hdf-caret {
          display: inline-block;
          width: 2px;
          height: 0.92em;
          margin-left: 3px;
          vertical-align: -0.08em;
          border-radius: 1px;
          background: #ffb877;
          box-shadow: 0 0 8px rgba(255, 162, 79, 0.8);
          animation: hdf-caret-blink 1.05s step-end infinite;
        }
        .hdf-caret--done {
          animation: hdf-caret-blink 1.05s step-end 3, hdf-caret-fade 0.5s ease 3.2s forwards;
        }
        .hdf-card-title {
          margin-top: 16px;
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
        /* Tras el morph, el copy respira con un brillo suave y continuo. */
        .hdf-card-cta--live {
          animation: hdf-cta-glow 3.2s ease-in-out 0.4s infinite;
        }
        /* Invitación periódica en la tarjeta de Inversionistas: destello
           diagonal + doble empujón de la flecha, para que no se sienta quieta
           al lado del morph de Empresarios. */
        .hdf-card-sheen {
          position: absolute;
          inset: 0 auto 0 0;
          width: 38%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(143, 220, 236, 0.08) 45%,
            rgba(255, 255, 255, 0.06) 55%,
            transparent
          );
          transform: translateX(-170%) skewX(-8deg);
          animation: hdf-card-sheen-sweep 7s cubic-bezier(0.3, 0.6, 0.2, 1) 2.4s infinite;
          pointer-events: none;
        }
        .hdf-card-cta--cyan svg {
          animation: hdf-arrow-nudge 7s ease-in-out 2.6s infinite;
        }
        .hdf-card--action {
          cursor: pointer;
        }

        /* ── Onda de flechas 1 → 2 → 3 ── */
        .hdf-arrows {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .hdf-arrows svg {
          opacity: 0;
          transform: translateX(-7px) scale(0.85);
          animation: hdf-arrow-wave 1.6s cubic-bezier(0.25, 0.8, 0.3, 1) var(--d, 0s) 4;
        }
        .hdf-arrows svg:nth-child(1) {
          --d: 0s;
        }
        .hdf-arrows svg:nth-child(2) {
          --d: 0.22s;
        }
        .hdf-arrows svg:nth-child(3) {
          --d: 0.44s;
        }
        .hdf-arrows--primed svg {
          animation: none;
          opacity: 1;
          transform: none;
        }

        /* ── Morph: inicio de la Evaluación Privada en la tarjeta ── */
        .hdf-eval-start {
          display: flex;
          gap: 10px;
          width: 100%;
          margin-top: 18px;
          animation: hdf-fade-up 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        /* En pantallas angostas la cápsula manda: input a todo el ancho y
           botón debajo (el placeholder no se debe truncar). */
        @media (max-width: 419px) {
          .hdf-eval-start {
            flex-direction: column;
          }
          .hdf-eval-btn {
            justify-content: center;
          }
        }
        .hdf-eval-input {
          flex: 1;
          min-width: 0;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 138, 61, 0.42);
          background: rgba(255, 255, 255, 0.05);
          color: #f2f5fc;
          font-family: inherit;
          font-size: 15px;
          outline: none;
          /* Reposo con halo tenue: la cápsula es el punto focal de la tarjeta. */
          box-shadow: 0 0 22px -8px rgba(255, 138, 61, 0.35);
          transition: border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
          animation: hdf-input-beacon 2.4s ease-in-out 0.75s 3;
        }
        .hdf-eval-input::placeholder {
          color: #9aa9c7;
          transition: color 0.35s ease, text-shadow 0.35s ease;
          animation: hdf-placeholder-glow 2.4s ease-in-out 0.75s 3;
        }
        .hdf-eval-input:focus {
          border-color: #ff8a3d;
          box-shadow: 0 0 0 4px rgba(255, 122, 41, 0.14), 0 0 30px -6px rgba(255, 138, 61, 0.45);
          animation: none;
        }
        .hdf-eval-input:focus::placeholder {
          color: #8e9fbe;
          animation: none;
        }
        .hdf-eval-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #ff7a29, #ffa24f);
          color: #160900;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 10px 30px -10px rgba(255, 122, 41, 0.55);
          transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .hdf-eval-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px -10px rgba(255, 122, 41, 0.7);
        }
        .hdf-card-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px 20px;
          margin-top: auto;
          padding-top: 26px;
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
          gap: 14px 22px;
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
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.97);
          padding: 5px 10px;
          opacity: 0.96;
          box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
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
          margin-top: 22px;
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
        @keyframes hdf-arrow-wave {
          0% {
            opacity: 0;
            transform: translateX(-7px) scale(0.85);
          }
          18% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          62% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          82% {
            opacity: 0;
            transform: translateX(9px) scale(0.9);
          }
          100% {
            opacity: 0;
            transform: translateX(-7px) scale(0.85);
          }
        }
        @keyframes hdf-caret-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @keyframes hdf-caret-fade {
          to {
            opacity: 0;
          }
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
        @keyframes hdf-palm-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes hdf-palm-glow {
          from {
            opacity: 0.45;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes hdf-palm-shine {
          0%,
          55% {
            transform: translateX(0) skewX(-18deg);
          }
          78%,
          100% {
            transform: translateX(430%) skewX(-18deg);
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
        @keyframes hdf-input-beacon {
          0%,
          100% {
            border-color: rgba(255, 138, 61, 0.42);
            box-shadow: 0 0 22px -8px rgba(255, 138, 61, 0.35);
            background: rgba(255, 255, 255, 0.05);
          }
          50% {
            border-color: rgba(255, 170, 105, 0.95);
            box-shadow: 0 0 0 5px rgba(255, 122, 41, 0.13), 0 0 36px -4px rgba(255, 138, 61, 0.6);
            background: rgba(255, 138, 61, 0.09);
          }
        }
        @keyframes hdf-placeholder-glow {
          0%,
          100% {
            color: #9aa9c7;
            text-shadow: 0 0 0 rgba(255, 162, 79, 0);
          }
          50% {
            color: #ffddbd;
            text-shadow: 0 0 14px rgba(255, 162, 79, 0.55);
          }
        }
        @keyframes hdf-cta-glow {
          0%,
          100% {
            text-shadow: 0 0 0 rgba(255, 150, 80, 0);
          }
          50% {
            text-shadow: 0 0 16px rgba(255, 150, 80, 0.55);
          }
        }
        @keyframes hdf-card-sheen-sweep {
          0% {
            transform: translateX(-170%) skewX(-8deg);
          }
          30%,
          100% {
            transform: translateX(440%) skewX(-8deg);
          }
        }
        @keyframes hdf-arrow-nudge {
          0%,
          68%,
          100% {
            transform: translateX(0);
          }
          76% {
            transform: translateX(5px);
          }
          84% {
            transform: translateX(1px);
          }
          92% {
            transform: translateX(5px);
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
          .hdf-palm,
          .hdf-palms-halo,
          .hdf-palm-glass::after,
          .hdf-manifesto,
          .hdf-marquee,
          .hdf-stats-line,
          .hdf-stat-node,
          .hdf-video-frame,
          .hdf-cards,
          .hdf-eval-start,
          .hdf-eval-input,
          .hdf-eval-input::placeholder,
          .hdf-card-cta--live,
          .hdf-card-sheen,
          .hdf-card-cta--cyan svg {
            animation: none !important;
          }
          .hdf-arrows svg {
            animation: none !important;
            opacity: 1;
            transform: none;
          }
          .hdf-caret {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
