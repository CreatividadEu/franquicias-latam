"use client";

// Propuesta privada The Body Concept × Franquicias LATAM.
// Réplica del lenguaje visual del dossier de franquicia de la marca (menta,
// tipografía redondeada, secciones numeradas N/8, tarjetas de borde verde)
// con las piezas propias del historial de dossiers: countdown de validez,
// beacons de apertura/CTA y CTA de pago Stripe.
//
// La página enseña alcance y rigor sin exponer método: los indicadores del
// modelo aparecen bloqueados y el simulador es una demo ilustrativa.

import Image from "next/image";
import React, {
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { homeClientLogos } from "@/components/home/homeBrandData";

const SLUG = "the-body-concept";
const DEADLINE_LABEL = "25 · JUL · 2026";
const WA_URL =
  "https://wa.me/34695126804?text=" +
  encodeURIComponent(
    "Hola Daniel — somos The Body Concept. Queremos activar el modelo financiero. ",
  );
const MAIL_URL =
  "mailto:dseneor@franquiciaslatam.co?subject=" +
  encodeURIComponent("The Body Concept — datos para transferencia") +
  "&body=" +
  encodeURIComponent(
    "Hola Daniel,\n\nQueremos arrancar por transferencia local. Envíanos los datos bancarios y la factura con IVA.\n\n— The Body Concept",
  );

const STRIPE_BUY_BUTTON_ID = "buy_btn_1TuZzPKl3NRWAkCGbaOQ6CBC";
const STRIPE_PK =
  "pk_live_51PkPlxKl3NRWAkCGlOaYDJ7kIaFvJZiF4bbK7k1A4kF2128sfTIBsu5WOnJNoaEZEICLEY6BzYRM8yyicIj5ppCc00QkPh8zLV";

const euros = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/* ── Beacons ──────────────────────────────────────────────────────────────── */

function sendBeacon(url: string, payload: Record<string, string>) {
  const body = JSON.stringify({ ...payload, slug: SLUG });
  try {
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) {
      return;
    }
  } catch {
    /* cae al fetch */
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

/* ── Countdown (patrón hidratación-segura del historial) ─────────────────── */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Digit({ value }: { value: string }) {
  return (
    <span key={value} className="tbc-digit" aria-hidden>
      {value}
    </span>
  );
}

function CountdownBar({ deadlineIso }: { deadlineIso: string }) {
  const deadline = useMemo(() => new Date(deadlineIso).getTime(), [deadlineIso]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const raf = requestAnimationFrame(() => {
      setNow(Date.now());
      interval = setInterval(() => {
        const t = Date.now();
        setNow(t);
        if (deadline - t <= 0) {
          if (interval) clearInterval(interval);
          window.location.reload();
        }
      }, 1000);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (interval) clearInterval(interval);
    };
  }, [deadline]);

  const remaining = now === null ? null : Math.max(0, deadline - now);
  const totalSeconds = remaining === null ? null : Math.floor(remaining / 1000);
  const days = totalSeconds === null ? null : Math.floor(totalSeconds / 86400);
  const hours =
    totalSeconds === null ? null : Math.floor((totalSeconds % 86400) / 3600);
  const minutes =
    totalSeconds === null ? null : Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds === null ? null : totalSeconds % 60;
  const urgent = remaining !== null && remaining < 24 * 3_600_000;

  return (
    <div className={`tbc-bar${urgent ? " tbc-bar--urgent" : ""}`} role="timer">
      <span className="tbc-bar-label">
        Propuesta válida hasta el <strong>{DEADLINE_LABEL}</strong>
      </span>
      <span className="tbc-bar-timer" aria-hidden>
        {days !== null && days > 0 && (
          <>
            <Digit value={String(days)} />
            <em>d</em>
          </>
        )}
        <Digit value={hours === null ? "––" : pad(hours)} />
        <em>:</em>
        <Digit value={minutes === null ? "––" : pad(minutes)} />
        <em>:</em>
        <Digit value={seconds === null ? "––" : pad(seconds)} />
      </span>
      <a className="tbc-bar-cta" href="#inversion" data-cta>
        Reservar inicio →
      </a>
    </div>
  );
}

/* ── Línea de pulso EMS (motivo de marca) ─────────────────────────────────── */

function PulseLine({ tone = "green" }: { tone?: "green" | "white" }) {
  return (
    <svg
      className={`tbc-pulse tbc-pulse--${tone}`}
      viewBox="0 0 600 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 20 H210 L226 20 234 6 244 34 252 12 258 26 264 20 H380 L392 20 400 10 410 30 418 16 424 20 H600"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Cabecera de sección numerada (lenguaje del dossier) ─────────────────── */

function SectionHead({
  n,
  kicker,
  title,
}: {
  n: number;
  kicker: string;
  title: string;
}) {
  return (
    <div className="tbc-band">
      <div className="tbc-shell tbc-band-inner" data-reveal>
        <span className="tbc-band-num">
          {n}
          <i>/8</i>
        </span>
        <span className="tbc-band-rule" aria-hidden />
        <span className="tbc-band-titles">
          <small>{kicker}</small>
          <strong>{title}</strong>
        </span>
      </div>
    </div>
  );
}

/* ── Contador animado (stats Franquicias LATAM) ──────────────────────────── */

function CountUp({
  target,
  suffix = "",
  duration = 1400,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span ref={ref}>
      {euros.format(value)}
      {suffix}
    </span>
  );
}

/* ── Simulador ilustrativo del modelo dinámico ───────────────────────────── */

type SimInputs = { precio: number; sesiones: number; dias: number };
const SIM_DEFAULT: SimInputs = { precio: 25, sesiones: 22, dias: 22 };

// Curva de mejora puramente ilustrativa (progresiva hasta +22% en el mes 12).
// Los coeficientes reales del modelo se calibran con datos auditados.
function upliftAt(month: number): number {
  const p = month / 11;
  return 0.22 * (1 - Math.pow(1 - p, 2.2));
}

function smoothPath(xs: number[], ys: number[]): string {
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return d;
}

function Simulator() {
  const [target, setTarget] = useState<SimInputs>(SIM_DEFAULT);
  const [anim, setAnim] = useState<SimInputs>(SIM_DEFAULT);

  // El efecto se reinicia con cada cambio de target, así que puede cerrar
  // sobre él directamente; el lerp por rAF da la sensación de "modelo vivo".
  useEffect(() => {
    let raf = 0;
    if (prefersReducedMotion()) {
      raf = requestAnimationFrame(() => setAnim(target));
      return () => cancelAnimationFrame(raf);
    }
    const tick = () => {
      let done = true;
      setAnim((prev) => {
        const next: SimInputs = { ...prev };
        (Object.keys(next) as (keyof SimInputs)[]).forEach((k) => {
          const delta = target[k] - prev[k];
          if (Math.abs(delta) < 0.05) {
            next[k] = target[k];
          } else {
            next[k] = prev[k] + delta * 0.16;
            done = false;
          }
        });
        return next;
      });
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const ingresosMes = anim.precio * anim.sesiones * anim.dias;

  const W = 560;
  const H = 210;
  const PAD_X = 10;
  const PAD_Y = 16;
  const months = Array.from({ length: 12 }, (_, i) => i);
  const base = months.map((m) => ingresosMes * (1 + 0.004 * m));
  const optimo = months.map((m) => ingresosMes * (1 + 0.004 * m + upliftAt(m)));
  const maxY = Math.max(...optimo) * 1.06;
  const minY = Math.min(...base) * 0.92;
  const xs = months.map(
    (m) => PAD_X + (m / 11) * (W - PAD_X * 2),
  );
  const toY = (v: number) =>
    H - PAD_Y - ((v - minY) / (maxY - minY)) * (H - PAD_Y * 2);
  const basePath = smoothPath(xs, base.map(toY));
  const optPath = smoothPath(xs, optimo.map(toY));
  const optArea = `${optPath} L ${xs[11]} ${H} L ${xs[0]} ${H} Z`;

  const slider = (
    key: keyof SimInputs,
    label: string,
    min: number,
    max: number,
    unit: string,
  ) => (
    <label className="tbc-slider">
      <span className="tbc-slider-head">
        <span>{label}</span>
        <strong>
          {Math.round(target[key])}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={target[key]}
        onChange={(e) =>
          setTarget((t) => ({ ...t, [key]: Number(e.target.value) }))
        }
        aria-label={label}
      />
    </label>
  );

  return (
    <div className="tbc-sim" data-reveal>
      <div className="tbc-sim-head">
        <span className="tbc-sim-tag">Simulador · demo ilustrativa</span>
        <span className="tbc-sim-tag tbc-sim-tag--ghost">
          El modelo real: 100% de indicadores enlazados, en tiempo real
        </span>
      </div>

      <div className="tbc-sim-grid">
        <div className="tbc-sim-controls">
          {slider("precio", "Precio por sesión", 18, 40, " €")}
          {slider("sesiones", "Sesiones al día", 8, 30, "")}
          {slider("dias", "Días activos al mes", 18, 26, "")}

          <div className="tbc-sim-out">
            <small>Ingresos mensuales estimados</small>
            <strong>{euros.format(Math.round(ingresosMes))} €</strong>
            <span>
              {euros.format(Math.round(ingresosMes * 12))} € / año · por unidad
            </span>
          </div>
        </div>

        <div className="tbc-sim-chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Proyección ilustrativa a 12 meses">
            <defs>
              <linearGradient id="tbcArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#57b57e" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#57b57e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((p) => (
              <line
                key={p}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={H * p}
                y2={H * p}
                className="tbc-chart-grid"
              />
            ))}
            <path d={optArea} fill="url(#tbcArea)" />
            <path d={basePath} className="tbc-chart-base" />
            <path d={optPath} className="tbc-chart-opt" />
            <circle cx={xs[11]} cy={toY(base[11])} r="4" className="tbc-dot-base" />
            <circle cx={xs[11]} cy={toY(optimo[11])} r="5" className="tbc-dot-opt" />
          </svg>
          <div className="tbc-chart-legend">
            <span>
              <i className="tbc-leg tbc-leg--base" /> Trayectoria actual
            </span>
            <span>
              <i className="tbc-leg tbc-leg--opt" /> Con modelo optimizado
              <em>· curva ilustrativa</em>
            </span>
          </div>
        </div>
      </div>

      <div className="tbc-locked">
        {[
          ["EBITDA ajustado", "38,4 %"],
          ["Caja liberada", "112.480 €"],
          ["Payback por formato", "14,2 meses"],
          ["Punto de equilibrio", "9,3 ses./día"],
        ].map(([label, fake]) => (
          <div className="tbc-locked-row" key={label}>
            <span className="tbc-locked-label">
              <svg viewBox="0 0 24 24" aria-hidden>
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" />
              </svg>
              {label}
            </span>
            <span className="tbc-locked-value" aria-hidden>
              {fake}
            </span>
            <span className="tbc-locked-note">se calibra en la auditoría</span>
          </div>
        ))}
      </div>

      <p className="tbc-sim-foot">
        Widget ilustrativo: ninguna cifra de esta demo constituye una
        proyección. El modelo real se construye y calibra con los datos
        auditados de la compañía — y esos números viven solo en la sala
        privada del proyecto.
      </p>
    </div>
  );
}

/* ── Stripe Buy Button ────────────────────────────────────────────────────── */

function StripeBuyButton() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://js.stripe.com/v3/buy-button.js"]',
    );
    if (existing) {
      const raf = requestAnimationFrame(() => setState("ready"));
      return () => cancelAnimationFrame(raf);
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    script.onload = () => setState("ready");
    script.onerror = () => setState("error");
    document.head.appendChild(script);
  }, []);

  return (
    <div className="tbc-stripe-slot" data-cta>
      {state === "ready" &&
        createElement("stripe-buy-button", {
          "buy-button-id": STRIPE_BUY_BUTTON_ID,
          "publishable-key": STRIPE_PK,
        })}
      {state === "loading" && (
        <span className="tbc-stripe-loading">Cargando pago seguro…</span>
      )}
      {state === "error" && (
        <a
          className="tbc-btn tbc-btn--green"
          href={WA_URL}
          target="_blank"
          rel="noreferrer"
        >
          Pedir link de pago por WhatsApp →
        </a>
      )}
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────────────────── */

export function TheBodyConceptDossier({
  deadlineIso,
  openKey,
  inviteToken,
}: {
  deadlineIso: string;
  openKey?: string;
  inviteToken?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  // Beacon de primera apertura: arma la ventana de lectura del link abierto.
  useEffect(() => {
    if (openKey) sendBeacon("/api/dossier/open", { k: openKey });
  }, [openKey]);

  // Tracking delegado de CTAs con atribución por credencial.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("[data-cta]");
      if (!el) return;
      const payload: Record<string, string> = {};
      if (openKey) payload.k = openKey;
      else if (inviteToken) payload.t = inviteToken;
      if (Object.keys(payload).length) sendBeacon("/api/dossier/cta", payload);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [openKey, inviteToken]);

  // Reveal por scroll (patrón IntersectionObserver del historial).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("tbc-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("tbc-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // Barra de progreso de lectura.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="tbc" ref={rootRef}>
      <span
        className="tbc-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
      <CountdownBar deadlineIso={deadlineIso} />

      {/* ── Portada ── */}
      <header className="tbc-hero">
        <div className="tbc-hero-mark" aria-hidden>
          <Image src="/dossier/tbc/cmark.webp" alt="" width={623} height={525} />
        </div>
        <div className="tbc-shell tbc-hero-grid">
          <div className="tbc-hero-copy" data-reveal>
            <Image
              className="tbc-hero-logo"
              src="/dossier/tbc/wordmark-white.png"
              alt="The Body Concept"
              width={699}
              height={172}
              priority
            />
            <p className="tbc-hero-eyebrow">
              Propuesta estratégica · Confidencial · Julio 2026
            </p>
            <h1>
              El siguiente músculo
              <br />
              es <span>financiero.</span>
            </h1>
            <p className="tbc-hero-sub">
              Un modelo financiero dinámico que audita, libera caja y mejora
              márgenes en 4–6 semanas — y deja listo el sistema de franquicias
              de The Body Concept para expandirse por Iberoamérica.
            </p>
            <div className="tbc-hero-ctas">
              <a className="tbc-btn tbc-btn--solid" href="#inversion" data-cta>
                Reservar inicio →
              </a>
              <a className="tbc-btn tbc-btn--ghost" href="#punto-de-partida">
                Ver la propuesta ↓
              </a>
            </div>
            <div className="tbc-hero-meta">
              <span>
                Para: <strong>The Body Concept · Gnesis EMS</strong>
              </span>
              <span>
                De: <strong>Franquicias LATAM</strong>
              </span>
              <span>Valencia — Madrid — Bogotá</span>
            </div>
          </div>
          <div className="tbc-hero-figure" aria-hidden>
            <Image
              src="/dossier/tbc/hero-man.webp"
              alt=""
              width={900}
              height={1157}
              priority
            />
          </div>
        </div>
        <PulseLine tone="white" />
      </header>

      {/* ── 1/8 Punto de partida ── */}
      <section id="punto-de-partida">
        <SectionHead n={1} kicker="The Body Concept" title="El punto de partida" />
        <div className="tbc-shell tbc-cols">
          <div data-reveal>
            <p>
              Quince años fabricando tecnología EMS propia. Tres sistemas —
              <strong> Gnesis Plus, G-Slim y G-Face</strong> — operando bajo una
              misma marca. Centros propios que validan el modelo cada día, una
              franquicia sin royalties y equipos con certificación
              electromédica.
            </p>
            <p>
              The Body Concept ya construyó lo más difícil: un producto que
              funciona y una marca que lo demuestra.
            </p>
            <p className="tbc-green">
              Lo que convierte una buena franquicia en un sistema de expansión
              no es más producto. Es un motor financiero que demuestre — número
              a número — cuánto rinde el modelo en cada mercado.
            </p>
            <div className="tbc-chips">
              <span>3 sistemas propios</span>
              <span>Sesiones de 25′</span>
              <span>Fabricación propia</span>
              <span>Sin royalties</span>
            </div>
          </div>
          <figure className="tbc-photo" data-reveal>
            <Image
              src="/dossier/tbc/storefront.webp"
              alt="Centro The Body Concept"
              width={1500}
              height={1013}
            />
            <figcaption>El modelo, en la calle: centro The Body Concept.</figcaption>
          </figure>
        </div>
      </section>

      {/* ── 2/8 La auditoría ── */}
      <section>
        <SectionHead n={2} kicker="Fase 1 · Semanas 1–2" title="La auditoría" />
        <div className="tbc-shell">
          <p className="tbc-lede" data-reveal>
            Auditamos los resultados de la empresa con un análisis riguroso —
            rigor de banca de inversión, lenguaje de operador — para encontrar
            exactamente dónde está el dinero que el negocio ya genera y no ve.
          </p>
          <div className="tbc-grid3">
            {[
              [
                "Liberar caja",
                "Ciclo de caja, inventario de equipos, cobros y pagos: dónde está atrapado el efectivo y cómo soltarlo sin tocar la operación.",
              ],
              [
                "Mejorar márgenes",
                "Coste real por sesión, mix de servicios y arquitectura de precios por formato: qué palancas mueven el margen y cuánto aporta cada una.",
              ],
              [
                "Activar estrategias",
                "Acciones operativas y comerciales listas para implementarse de inmediato — con responsable, calendario y meta. No un informe: un plan en ejecución.",
              ],
            ].map(([t, d], i) => (
              <article className="tbc-card" data-reveal key={t} style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="tbc-card-index">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>

          <div className="tbc-flow" data-reveal>
            {["Datos", "Diagnóstico", "Modelo", "Acciones", "Resultados"].map(
              (step, i) => (
                <React.Fragment key={step}>
                  {i > 0 && <span className="tbc-flow-link" aria-hidden />}
                  <span className="tbc-flow-step">{step}</span>
                </React.Fragment>
              ),
            )}
          </div>

          <aside className="tbc-secret" data-reveal>
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x="5" y="10" width="14" height="10" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" />
            </svg>
            <p>
              <strong>Este documento muestra el alcance, nunca el método.</strong>{" "}
              La arquitectura del modelo, sus coeficientes y sus fórmulas son
              propiedad intelectual de Franquicias LATAM y se transfieren
              únicamente dentro del proyecto, en la sala privada con acceso
              controlado.
            </p>
          </aside>
        </div>
      </section>

      {/* ── 3/8 El modelo dinámico ── */}
      <section>
        <SectionHead n={3} kicker="El entregable" title="El modelo dinámico" />
        <div className="tbc-shell">
          <p className="tbc-lede" data-reveal>
            Un modelo financiero vivo: cada supuesto conectado a los
            indicadores más relevantes, en tiempo real. Cambias una variable —
            precio, ocupación, mercado — y todo el sistema respira con ella.
          </p>
          <div className="tbc-grid2">
            <article className="tbc-card tbc-card--tall" data-reveal>
              <h3>Excel maestro</h3>
              <p>
                Formulado y auditable, listo para dirección, bancos e
                inversionistas. Supuestos por mercado, tres formatos, un solo
                libro.
              </p>
            </article>
            <article className="tbc-card tbc-card--tall" data-reveal style={{ transitionDelay: "80ms" }}>
              <h3>Sala privada con clave</h3>
              <p>
                Versión web cerrada para modelar escenarios por país con
                indicadores enlazados en tiempo real. Con acceso controlado —
                exactamente como esta página que estás leyendo.
              </p>
            </article>
          </div>
          <Simulator />
        </div>
      </section>

      {/* ── 4/8 Tres formatos ── */}
      <section>
        <SectionHead n={4} kicker="El alcance" title="Tres formatos, un sistema" />
        <div className="tbc-shell">
          <p className="tbc-lede" data-reveal>
            El modelo nace preparado para el sistema completo de franquicias:
            el formato que ya funciona, el que abre el mercado masivo, y la
            combinación de ambos.
          </p>
          <div className="tbc-grid3 tbc-formats">
            <article className="tbc-format tbc-format--green" data-reveal>
              <span className="tbc-format-tag">Formato probado</span>
              <div className="tbc-format-photo">
                <Image
                  src="/dossier/tbc/sys-gnesis.webp"
                  alt="Entrenamiento Gnesis Plus"
                  width={517}
                  height={524}
                />
              </div>
              <h3>Centro</h3>
              <p>
                El formato actual The Body Concept, llevado a su mejor versión:
                la unidad económica que ya funciona, optimizada palanca a
                palanca.
              </p>
              <div className="tbc-format-locks">
                <span>Capex ▒▒▒</span>
                <span>Payback ▒▒</span>
                <span>Margen ▒▒</span>
              </div>
            </article>
            <article className="tbc-format tbc-format--yellow" data-reveal style={{ transitionDelay: "70ms" }}>
              <span className="tbc-format-tag">Nuevo · bajo capex</span>
              <div className="tbc-format-photo">
                <Image
                  src="/dossier/tbc/runner.webp"
                  alt="Formato de bajo capex"
                  width={540}
                  height={897}
                />
              </div>
              <h3>Acceso</h3>
              <p>
                Formato de baja inversión diseñado para penetración masiva — y
                para convertir cada apertura en un canal de venta de máquinas
                Gnesis.
              </p>
              <div className="tbc-format-locks">
                <span>Capex ▒▒▒</span>
                <span>Payback ▒▒</span>
                <span>Margen ▒▒</span>
              </div>
            </article>
            <article className="tbc-format tbc-format--mix" data-reveal style={{ transitionDelay: "140ms" }}>
              <span className="tbc-format-tag">Lo mejor de ambos</span>
              <div className="tbc-format-photo">
                <Image
                  src="/dossier/tbc/duo-flex.webp"
                  alt="Formato híbrido"
                  width={806}
                  height={543}
                />
              </div>
              <h3>Híbrido</h3>
              <p>
                Cobertura de mercado, ticket flexible y dos fuentes de ingreso
                — servicio y equipamiento — bajo una misma economía.
              </p>
              <div className="tbc-format-locks">
                <span>Capex ▒▒▒</span>
                <span>Payback ▒▒</span>
                <span>Margen ▒▒</span>
              </div>
            </article>
          </div>
          <p className="tbc-green tbc-center" data-reveal>
            Cada formato entra al modelo con su propia hoja de supuestos, por
            mercado y en tiempo real.
          </p>
        </div>
      </section>

      {/* ── 5/8 Calendario ── */}
      <section>
        <SectionHead n={5} kicker="4–6 semanas" title="El calendario" />
        <div className="tbc-shell">
          <div className="tbc-timeline">
            {[
              [
                "S1–S2",
                "Auditoría y datos",
                "Información financiera y operativa, entrevistas, ciclo de caja, coste por sesión. El diagnóstico llega con hallazgos accionables, no con generalidades.",
              ],
              [
                "S3–S4",
                "El modelo",
                "Construcción del modelo dinámico multi-formato y multi-mercado. Validación de supuestos con dirección, sesión a sesión.",
              ],
              [
                "S5–S6",
                "Ejecución",
                "Implementación de las mejoras proyectadas: acciones operativas y comerciales en marcha, con seguimiento para cumplir lo proyectado.",
              ],
            ].map(([w, t, d], i) => (
              <article className="tbc-week" data-reveal key={w} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="tbc-week-tag">{w}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <div className="tbc-milestone" data-reveal>
            <PulseLine />
            <p>
              <strong>Al cierre:</strong> el sistema de franquicias tiene su
              modelo financiero listo — Centro, Acceso e Híbrido — y las
              mejoras ya están en ejecución. <em>Y con él, arranca la Fase 2.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ── 6/8 Iberoamérica ── */}
      <section>
        <SectionHead n={6} kicker="Fase 2 · Sin fee" title="Plan Iberoamérica" />
        <div className="tbc-shell tbc-cols tbc-cols--rev">
          <figure className="tbc-runner" data-reveal aria-hidden>
            <Image
              src="/dossier/tbc/closing-duo.webp"
              alt=""
              width={751}
              height={1093}
            />
          </figure>
          <div data-reveal>
            <p className="tbc-lede">
              Con el modelo listo, salimos juntos a comercializar las
              franquicias en las diferentes geografías.
            </p>
            <p className="tbc-green">
              Sin fee. Nuestra monetización es una comisión sobre resultados:
              si The Body Concept no vende, nosotros tampoco.
            </p>
            <div className="tbc-mech">
              {[
                [
                  "Landing de conversión",
                  "Página inteligente dedicada a la marca en nuestro portal, construida para convertir inversionistas.",
                ],
                [
                  "Promoción multicanal",
                  "Distribución por nuestros canales y alianzas — sin costo para la marca.",
                ],
                [
                  "Reunión semanal · 15–20′",
                  "Avances, cambios de estrategia y decisiones. Corta por diseño.",
                ],
                [
                  "Leads de alto valor",
                  "Reporte en tiempo real de leads calificados y novedades de cada mercado.",
                ],
              ].map(([t, d]) => (
                <div className="tbc-mech-item" key={t}>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              ))}
            </div>
            <div className="tbc-chips tbc-chips--geo">
              {["España", "México", "Colombia", "Perú", "Chile", "Ecuador", "Argentina", "+"].map(
                (c) => (
                  <span key={c}>{c}</span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7/8 Quiénes somos (Franquicias LATAM, banda oscura) ── */}
      <section className="tbc-dark">
        <div className="tbc-shell">
          <div className="tbc-band-inner tbc-band-inner--dark" data-reveal>
            <span className="tbc-band-num">
              7<i>/8</i>
            </span>
            <span className="tbc-band-rule" aria-hidden />
            <span className="tbc-band-titles">
              <small>Franquicias LATAM</small>
              <strong>Quiénes somos</strong>
            </span>
          </div>
          <div className="tbc-dark-grid">
            <div data-reveal>
              <Image
                className="tbc-fl-logo"
                src="/logo_latam/franquicias_latam_logo.png"
                alt="Franquicias LATAM"
                width={220}
                height={74}
              />
              <p className="tbc-dark-lede">
                El estándar de franquicias en Iberoamérica. Desde Madrid y
                Bogotá operamos en 12 países — legal, expansión, capital e
                inteligencia artificial — con tecnología propia: desarrollada,
                financiada y premiada.
              </p>
              <ul className="tbc-laurels">
                <li>2× financiados por el Banco Interamericano de Desarrollo</li>
                <li>Ganadores · Locomotora de la Innovación — MinTIC</li>
                <li>Ganadores · Retos 4.0 — MinTIC</li>
                <li>Startup finalista en Collision Conf. — Toronto</li>
              </ul>
            </div>
            <div className="tbc-stats" data-reveal>
              <div>
                <strong>
                  <CountUp target={750} suffix="+" />
                </strong>
                <span>marcas estructuradas con nuestra metodología</span>
              </div>
              <div>
                <strong>
                  <CountUp target={12} />
                </strong>
                <span>países en operación</span>
              </div>
              <div>
                <strong>
                  <CountUp target={20} suffix="+" />
                </strong>
                <span>sistemas de microfranquicia con BID · Propaís</span>
              </div>
              <div>
                <strong>
                  <CountUp target={97} suffix=",5%" />
                </strong>
                <span>aprobación histórica en ese programa</span>
              </div>
            </div>
          </div>

          <div className="tbc-proof" data-reveal aria-label="Marcas desarrolladas con nuestra metodología">
            <div className="tbc-proof-track">
              {[...homeClientLogos, ...homeClientLogos].map((logo, i) => (
                <span className="tbc-proof-item" key={`${logo.alt}-${i}`}>
                  {/* eager: el loop desplaza los logos hacia el viewport y el
                      lazy nativo los dejaría aparecer en huecos vacíos */}
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={40}
                    loading="eager"
                  />
                </span>
              ))}
            </div>
          </div>
          <p className="tbc-proof-note" data-reveal>
            De Totto a Sodexo, de Subway a Mercado Libre: la metodología que
            estructura expansiones reales.
          </p>
        </div>
      </section>

      {/* ── 8/8 Inversión ── */}
      <section id="inversion">
        <SectionHead n={8} kicker="Fase 1 · Modelo financiero" title="La inversión" />
        <div className="tbc-shell">
          <div className="tbc-price" data-reveal>
            <span className="tbc-price-amount">
              2.500 € <i>+ IVA*</i>
            </span>
            <span className="tbc-price-sub">
              Proyecto completo · 4–6 semanas · implementación incluida
            </span>
          </div>

          <div className="tbc-grid2 tbc-pay-steps">
            <article className="tbc-card tbc-card--step" data-reveal>
              <span className="tbc-step-when">Hoy · antes del 25 de julio</span>
              <strong>1.500 €</strong>
              <p>Reserva el arranque y agenda la sesión de datos inicial.</p>
            </article>
            <article className="tbc-card tbc-card--step" data-reveal style={{ transitionDelay: "80ms" }}>
              <span className="tbc-step-when">Día 30</span>
              <strong>1.000 €</strong>
              <p>Con el modelo en construcción avanzada y hallazgos sobre la mesa.</p>
            </article>
          </div>

          <div className="tbc-grid2 tbc-pay-methods">
            <article className="tbc-method" data-reveal>
              <h3>Tarjeta · Stripe</h3>
              <p>
                Pago protegido y gestionado por Stripe. Facturación
                internacional: <strong>no aplica IVA</strong>.
              </p>
              <StripeBuyButton />
            </article>
            <article className="tbc-method" data-reveal style={{ transitionDelay: "80ms" }}>
              <h3>Transferencia local</h3>
              <p>
                Cuenta bancaria local con factura; <strong>aplica IVA</strong>.
                Pide los datos y emitimos la factura hoy mismo.
              </p>
              <a className="tbc-btn tbc-btn--green" href={MAIL_URL} data-cta>
                Solicitar datos bancarios →
              </a>
              <a className="tbc-btn tbc-btn--line" href={WA_URL} target="_blank" rel="noreferrer" data-cta>
                O por WhatsApp
              </a>
            </article>
          </div>

          <ul className="tbc-includes" data-reveal>
            {[
              "Auditoría integral de resultados: caja, márgenes, operación",
              "Modelo dinámico multi-formato y multi-mercado (Centro · Acceso · Híbrido)",
              "Excel maestro + sala privada con clave, indicadores en tiempo real",
              "Plan de acciones implementado y acompañado hasta cumplir lo proyectado",
              "Al cierre: sistema listo para franquiciar — y arranca la Fase 2 sin fee",
            ].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="tbc-fine">
            *El IVA aplica únicamente en la modalidad de transferencia con
            factura local.
          </p>
        </div>
      </section>

      {/* ── Cierre ── */}
      <footer className="tbc-close">
        <div className="tbc-shell tbc-close-grid">
          <div data-reveal>
            <Image
              className="tbc-close-logo"
              src="/dossier/tbc/wordmark-white.png"
              alt="The Body Concept"
              width={699}
              height={172}
            />
            <h2>Da el siguiente paso.</h2>
            <p>
              El producto ya existe. La marca ya funciona. Lo que sigue es el
              motor financiero que lo convierte en un sistema de expansión — y
              un socio que solo gana cuando tú ganas.
            </p>
            <div className="tbc-hero-ctas">
              <a className="tbc-btn tbc-btn--solid" href="#inversion" data-cta>
                Reservar el arranque →
              </a>
              <a
                className="tbc-btn tbc-btn--ghost"
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                data-cta
              >
                Hablar con Daniel
              </a>
            </div>
            <p className="tbc-sign">
              Daniel Seneor — Franquicias LATAM
              <span>Madrid — Bogotá · dseneor@franquiciaslatam.co · +34 695 126 804</span>
            </p>
          </div>
          <div className="tbc-close-figure" aria-hidden>
            <Image
              src="/dossier/tbc/sys-gface.webp"
              alt=""
              width={663}
              height={820}
            />
          </div>
        </div>
        <p className="tbc-confidential">
          Documento confidencial · Preparado en exclusiva para The Body Concept
          &amp; Gnesis EMS · Prohibida su distribución · © 2026 Franquicias LATAM
        </p>
      </footer>

      <style jsx global>{`
        /* El widget global de WhatsApp compite con la barra fija del dossier. */
        .wa-widget {
          display: none !important;
        }

        .tbc {
          --ink: #3a3a39;
          --body: #67706b;
          --green: #57b57e;
          --green-deep: #2f8757;
          --green-ink: #1e4632;
          --mint: #a3deba;
          --mint-soft: #eaf6ef;
          --mist: #f3f5f4;
          --line: #d7ecdf;
          --num: #d3d8d5;
          --yellow: #e2b616;
          --pink: #e6197e;
          --dark: #10271b;
          background: #fff;
          color: var(--body);
          font-family: var(--font-quick), "Quicksand", sans-serif;
          font-size: 16.5px;
          line-height: 1.7;
          letter-spacing: 0;
          overflow-x: clip;
        }
        .tbc h1,
        .tbc h2,
        .tbc h3,
        .tbc h4,
        .tbc strong {
          color: var(--ink);
        }
        .tbc h1,
        .tbc h2,
        .tbc h3,
        .tbc h4 {
          font-family: var(--font-mont), "Montserrat", sans-serif;
        }
        .tbc-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 1.4rem;
        }
        .tbc section {
          padding-bottom: 5.5rem;
        }

        /* Reveal */
        .tbc [data-reveal] {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .tbc .tbc-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Barra de progreso + countdown */
        .tbc-progress {
          position: fixed;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, var(--green), var(--mint));
          transform-origin: 0 50%;
          z-index: 60;
        }
        .tbc-bar {
          position: fixed;
          top: 3px;
          left: 0;
          right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.1rem;
          padding: 0.55rem 1rem;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line);
          font-size: 13.5px;
        }
        .tbc-bar-label strong {
          color: var(--green-deep);
          font-weight: 700;
        }
        .tbc-bar-timer {
          display: inline-flex;
          align-items: baseline;
          gap: 2px;
          font-family: var(--font-mont), sans-serif;
          font-weight: 700;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }
        .tbc-bar-timer em {
          font-style: normal;
          color: var(--green);
          margin-right: 2px;
        }
        .tbc-digit {
          animation: tbc-digit-in 0.35s ease;
        }
        @keyframes tbc-digit-in {
          from {
            opacity: 0.2;
          }
          to {
            opacity: 1;
          }
        }
        .tbc-bar--urgent .tbc-bar-timer {
          color: #b3261e;
        }
        .tbc-bar-cta {
          font-family: var(--font-mont), sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          background: var(--green-deep);
          padding: 0.42rem 1.05rem;
          border-radius: 999px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tbc-bar-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(47, 135, 87, 0.35);
        }

        /* Hero */
        .tbc-hero {
          position: relative;
          padding: 7.5rem 0 0;
          background: linear-gradient(168deg, #b8e6ca 0%, var(--mint) 46%, #7cc79c 100%);
          overflow: hidden;
        }
        .tbc-hero-mark {
          position: absolute;
          right: -6%;
          top: -10%;
          width: min(560px, 60vw);
          opacity: 0.35;
          pointer-events: none;
        }
        .tbc-hero-mark img {
          width: 100%;
          height: auto;
        }
        .tbc-hero-grid {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
          gap: 2rem;
          align-items: end;
        }
        .tbc-hero-copy {
          padding: 1rem 0 4.5rem;
        }
        .tbc-hero-logo {
          width: 215px;
          height: auto;
          margin-bottom: 2.4rem;
        }
        .tbc-hero-eyebrow {
          font-family: var(--font-mont), sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.92);
          margin-bottom: 1.2rem;
        }
        .tbc-hero h1 {
          font-size: clamp(2.5rem, 5.6vw, 4.1rem);
          font-weight: 800;
          line-height: 1.04;
          color: #fff;
          letter-spacing: -0.015em;
          margin-bottom: 1.3rem;
          text-wrap: balance;
        }
        .tbc-hero h1 span {
          color: var(--green-ink);
        }
        .tbc-hero-sub {
          max-width: 34rem;
          font-size: 18px;
          color: #1c3f2d;
          font-weight: 500;
          margin-bottom: 1.9rem;
        }
        .tbc-hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .tbc-btn {
          font-family: var(--font-mont), sans-serif;
          font-weight: 700;
          font-size: 14.5px;
          padding: 0.85rem 1.7rem;
          border-radius: 999px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          display: inline-block;
          text-align: center;
        }
        .tbc-btn:hover {
          transform: translateY(-2px);
        }
        .tbc-btn--solid {
          background: #fff;
          color: var(--green-deep);
          box-shadow: 0 12px 30px rgba(16, 54, 35, 0.22);
        }
        .tbc-btn--ghost {
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          color: #fff;
        }
        .tbc-btn--green {
          background: var(--green-deep);
          color: #fff;
          box-shadow: 0 10px 24px rgba(47, 135, 87, 0.28);
        }
        .tbc-btn--line {
          border: 1.5px solid var(--line);
          color: var(--green-deep);
          margin-left: 0.6rem;
        }
        .tbc-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem 1.6rem;
          font-size: 13.5px;
          color: rgba(20, 55, 38, 0.85);
        }
        .tbc-hero-meta strong {
          color: #fff;
          font-weight: 700;
        }
        .tbc-hero-figure {
          align-self: end;
          margin-bottom: -6px;
          filter: drop-shadow(0 24px 40px rgba(16, 54, 35, 0.28));
        }
        .tbc-hero-figure img {
          width: 100%;
          max-width: 360px;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        .tbc-pulse {
          display: block;
          width: 100%;
          height: 40px;
        }
        .tbc-pulse path {
          stroke: var(--green);
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: tbc-pulse-draw 3.2s ease forwards infinite;
        }
        .tbc-pulse--white path {
          stroke: rgba(255, 255, 255, 0.9);
        }
        @keyframes tbc-pulse-draw {
          0% {
            stroke-dashoffset: 900;
          }
          55%,
          80% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -900;
          }
        }
        .tbc-hero > .tbc-pulse {
          position: absolute;
          bottom: 12px;
          left: 0;
          opacity: 0.65;
        }

        /* Cabeceras de sección */
        .tbc-band {
          background: var(--mist);
          margin-bottom: 3.2rem;
        }
        .tbc-band-inner {
          display: flex;
          align-items: center;
          gap: 1.4rem;
          padding-top: 2.4rem;
          padding-bottom: 2.4rem;
        }
        .tbc-band-num {
          font-family: var(--font-mont), sans-serif;
          font-size: clamp(2.6rem, 5vw, 3.6rem);
          font-weight: 800;
          color: var(--green);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .tbc-band-num i {
          font-style: normal;
          color: var(--num);
        }
        .tbc-band-rule {
          width: 2px;
          align-self: stretch;
          background: var(--num);
        }
        .tbc-band-titles {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .tbc-band-titles small {
          font-family: var(--font-mont), sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .tbc-band-titles strong {
          font-family: var(--font-mont), sans-serif;
          font-size: clamp(1.55rem, 3.4vw, 2.3rem);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          color: var(--green);
          line-height: 1.1;
        }

        /* Layouts */
        .tbc-cols {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 3rem;
          align-items: center;
        }
        .tbc-cols--rev {
          grid-template-columns: minmax(0, 0.62fr) minmax(0, 1.38fr);
        }
        .tbc p + p {
          margin-top: 1rem;
        }
        .tbc-green {
          color: var(--green-deep) !important;
          font-weight: 700;
          font-size: 1.06em;
        }
        .tbc-center {
          text-align: center;
          max-width: 44rem;
          margin: 2.4rem auto 0;
        }
        .tbc-lede {
          font-size: 19px;
          max-width: 46rem;
          margin-bottom: 2.4rem;
          color: var(--ink);
          font-weight: 500;
        }
        .tbc-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-top: 1.6rem;
        }
        .tbc-chips span {
          font-family: var(--font-mont), sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--green-deep);
          background: var(--mint-soft);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 0.38rem 0.9rem;
        }
        .tbc-photo {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--line);
          box-shadow: 0 18px 44px rgba(30, 70, 50, 0.12);
        }
        .tbc-photo img {
          width: 100%;
          height: auto;
          display: block;
        }
        .tbc-photo figcaption {
          font-size: 12.5px;
          padding: 0.7rem 1rem;
          background: #fff;
          color: var(--body);
        }

        /* Tarjetas */
        .tbc-grid3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.1rem;
        }
        .tbc-grid2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.1rem;
        }
        .tbc-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 1.5rem 1.4rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.5s ease;
          position: relative;
        }
        .tbc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 38px rgba(30, 70, 50, 0.12);
        }
        .tbc-card h3 {
          font-size: 17px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.55rem;
          color: var(--green-deep);
        }
        .tbc-card p {
          font-size: 15px;
        }
        .tbc-card-index {
          font-family: var(--font-mont), sans-serif;
          font-weight: 800;
          color: var(--num);
          font-size: 15px;
          display: block;
          margin-bottom: 0.7rem;
        }
        .tbc-card--tall {
          padding: 1.9rem 1.7rem;
        }
        .tbc-card--tall h3 {
          font-size: 19px;
        }

        /* Pipeline */
        .tbc-flow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin: 2.6rem 0 2.2rem;
        }
        .tbc-flow-step {
          font-family: var(--font-mont), sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--green-deep);
          border: 1.5px solid var(--green);
          border-radius: 999px;
          padding: 0.5rem 1.15rem;
          background: #fff;
        }
        .tbc-flow-link {
          width: 34px;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            var(--green) 0 6px,
            transparent 6px 11px
          );
        }

        /* Nota confidencial */
        .tbc-secret {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          background: var(--mint-soft);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 1.3rem 1.5rem;
          max-width: 52rem;
          margin: 0 auto;
        }
        .tbc-secret svg,
        .tbc-locked-label svg {
          width: 22px;
          height: 22px;
          flex: none;
          stroke: var(--green-deep);
          fill: none;
          stroke-width: 1.8;
        }
        .tbc-secret p {
          font-size: 14.5px;
        }

        /* Simulador */
        .tbc-sim {
          margin-top: 2.4rem;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: linear-gradient(180deg, #fff 0%, var(--mint-soft) 130%);
          box-shadow: 0 24px 60px rgba(30, 70, 50, 0.1);
          padding: 1.6rem 1.7rem 1.4rem;
        }
        .tbc-sim-head {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .tbc-sim-tag {
          font-family: var(--font-mont), sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fff;
          background: var(--green);
          border-radius: 999px;
          padding: 0.4rem 1rem;
        }
        .tbc-sim-tag--ghost {
          color: var(--green-deep);
          background: transparent;
          border: 1px dashed var(--green);
        }
        .tbc-sim-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 2rem;
          align-items: center;
        }
        .tbc-slider {
          display: block;
          margin-bottom: 1.15rem;
        }
        .tbc-slider-head {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 0.35rem;
        }
        .tbc-slider-head strong {
          font-family: var(--font-mont), sans-serif;
          color: var(--green-deep);
          font-variant-numeric: tabular-nums;
        }
        .tbc-slider input {
          width: 100%;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--green), var(--mint));
          outline: none;
          cursor: pointer;
        }
        .tbc-slider input::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid var(--green-deep);
          box-shadow: 0 3px 10px rgba(30, 70, 50, 0.3);
          transition: transform 0.15s ease;
        }
        .tbc-slider input::-webkit-slider-thumb:hover {
          transform: scale(1.12);
        }
        .tbc-slider input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid var(--green-deep);
        }
        .tbc-sim-out {
          border-top: 1px solid var(--line);
          padding-top: 1.1rem;
          display: flex;
          flex-direction: column;
        }
        .tbc-sim-out small {
          font-family: var(--font-mont), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--body);
        }
        .tbc-sim-out strong {
          font-family: var(--font-mont), sans-serif;
          font-size: clamp(2rem, 4.5vw, 2.7rem);
          font-weight: 800;
          color: var(--green-deep);
          font-variant-numeric: tabular-nums;
          line-height: 1.15;
        }
        .tbc-sim-out span {
          font-size: 13.5px;
        }
        .tbc-sim-chart svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .tbc-chart-grid {
          stroke: var(--line);
          stroke-width: 1;
        }
        .tbc-chart-base {
          fill: none;
          stroke: #b9c6bf;
          stroke-width: 2.5;
          stroke-linecap: round;
        }
        .tbc-chart-opt {
          fill: none;
          stroke: var(--green-deep);
          stroke-width: 3.5;
          stroke-linecap: round;
        }
        .tbc-dot-base {
          fill: #b9c6bf;
        }
        .tbc-dot-opt {
          fill: var(--green-deep);
          stroke: #fff;
          stroke-width: 2;
        }
        .tbc-chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.4rem;
          font-size: 13px;
          margin-top: 0.5rem;
        }
        .tbc-chart-legend em {
          font-style: normal;
          color: var(--num);
          margin-left: 0.3rem;
        }
        .tbc-leg {
          display: inline-block;
          width: 18px;
          height: 3px;
          border-radius: 2px;
          vertical-align: middle;
          margin-right: 6px;
        }
        .tbc-leg--base {
          background: #b9c6bf;
        }
        .tbc-leg--opt {
          background: var(--green-deep);
        }

        /* KPIs bloqueados */
        .tbc-locked {
          margin-top: 1.6rem;
          border-top: 1px solid var(--line);
          padding-top: 1.1rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem 2rem;
        }
        .tbc-locked-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 14px;
          padding: 0.35rem 0;
        }
        .tbc-locked-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--ink);
          font-weight: 600;
          flex: 1;
        }
        .tbc-locked-label svg {
          width: 16px;
          height: 16px;
        }
        .tbc-locked-value {
          filter: blur(7px);
          user-select: none;
          color: var(--green-deep);
          font-family: var(--font-mont), sans-serif;
          font-weight: 700;
        }
        .tbc-locked-note {
          font-size: 11.5px;
          color: var(--num);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .tbc-sim-foot {
          margin-top: 1.3rem;
          font-size: 12.5px;
          color: var(--body);
          border-left: 3px solid var(--green);
          padding-left: 0.9rem;
        }

        /* Formatos */
        .tbc-formats {
          align-items: stretch;
        }
        .tbc-format {
          border-radius: 20px;
          border: 1px solid var(--line);
          padding: 1.5rem 1.4rem 1.4rem;
          background: #fff;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.5s ease;
        }
        .tbc-format:hover {
          transform: translateY(-4px);
        }
        .tbc-format--green:hover {
          box-shadow: 0 20px 44px rgba(87, 181, 126, 0.28);
        }
        .tbc-format--yellow:hover {
          box-shadow: 0 20px 44px rgba(226, 182, 22, 0.26);
        }
        .tbc-format--mix:hover {
          box-shadow: 0 20px 44px rgba(230, 25, 126, 0.18);
        }
        .tbc-format::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
        }
        .tbc-format--green::before {
          background: var(--green);
        }
        .tbc-format--yellow::before {
          background: var(--yellow);
        }
        .tbc-format--mix::before {
          background: linear-gradient(90deg, var(--green), var(--yellow), var(--pink));
        }
        .tbc-format-tag {
          font-family: var(--font-mont), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--body);
          margin-bottom: 0.9rem;
          display: block;
        }
        .tbc-format-photo {
          height: 190px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .tbc-format-photo img {
          max-height: 190px;
          width: auto;
          height: auto;
          max-width: 100%;
          object-fit: contain;
        }
        .tbc-format h3 {
          font-size: 21px;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .tbc-format--green h3 {
          color: var(--green-deep);
        }
        .tbc-format--yellow h3 {
          color: #b28c00;
        }
        .tbc-format--mix h3 {
          background: linear-gradient(90deg, var(--green-deep), #b28c00, var(--pink));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .tbc-format p {
          font-size: 14.5px;
          flex: 1;
        }
        .tbc-format-locks {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.1rem;
          flex-wrap: wrap;
        }
        .tbc-format-locks span {
          font-family: var(--font-mont), sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--num);
          border: 1px dashed var(--num);
          border-radius: 999px;
          padding: 0.28rem 0.7rem;
        }

        /* Timeline */
        .tbc-timeline {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.1rem;
          position: relative;
        }
        .tbc-week {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 1.5rem 1.4rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.5s ease;
        }
        .tbc-week:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 38px rgba(30, 70, 50, 0.12);
        }
        .tbc-week-tag {
          font-family: var(--font-mont), sans-serif;
          font-weight: 800;
          font-size: 13px;
          color: #fff;
          background: var(--green);
          border-radius: 999px;
          padding: 0.3rem 0.85rem;
          display: inline-block;
          margin-bottom: 0.9rem;
          letter-spacing: 0.08em;
        }
        .tbc-week h3 {
          font-size: 17px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
        }
        .tbc-week p {
          font-size: 14.5px;
        }
        .tbc-milestone {
          margin-top: 2.2rem;
          text-align: center;
        }
        .tbc-milestone .tbc-pulse {
          max-width: 420px;
          margin: 0 auto 0.6rem;
        }
        .tbc-milestone p {
          max-width: 46rem;
          margin: 0 auto;
          font-size: 16.5px;
        }
        .tbc-milestone em {
          color: var(--green-deep);
          font-style: normal;
          font-weight: 700;
        }

        /* Iberoamérica */
        .tbc-runner {
          display: flex;
          justify-content: center;
        }
        .tbc-runner img {
          max-width: 300px;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 20px 34px rgba(30, 70, 50, 0.2));
        }
        .tbc-mech {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 1.6rem;
          margin: 1.8rem 0 1.4rem;
        }
        .tbc-mech-item {
          border-left: 3px solid var(--green);
          padding-left: 0.95rem;
        }
        .tbc-mech-item h4 {
          font-size: 14.5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 800;
          color: var(--green-deep);
          margin-bottom: 0.25rem;
        }
        .tbc-mech-item p {
          font-size: 14px;
        }
        .tbc-chips--geo span {
          background: #fff;
        }

        /* Franquicias LATAM (banda oscura) */
        .tbc-dark {
          background: radial-gradient(120% 140% at 80% -20%, #1d4b33 0%, var(--dark) 55%);
          color: #b9cec2;
          padding-top: 4.2rem;
          padding-bottom: 4.6rem !important;
          margin-bottom: 3.2rem;
        }
        .tbc-dark h2,
        .tbc-dark h3,
        .tbc-dark h4,
        .tbc-dark strong {
          color: #fff;
        }
        .tbc-band-inner--dark {
          padding-top: 0;
          padding-bottom: 2.4rem;
        }
        .tbc-band-inner--dark .tbc-band-num {
          color: var(--mint);
        }
        .tbc-band-inner--dark .tbc-band-num i,
        .tbc-band-inner--dark + * {
          color: rgba(255, 255, 255, 0.35);
        }
        .tbc-band-inner--dark .tbc-band-rule {
          background: rgba(255, 255, 255, 0.25);
        }
        .tbc-band-inner--dark .tbc-band-titles small {
          color: rgba(255, 255, 255, 0.75);
        }
        .tbc-band-inner--dark .tbc-band-titles strong {
          color: var(--mint);
        }
        .tbc-dark-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 3rem;
          align-items: start;
        }
        .tbc-fl-logo {
          height: 58px;
          width: auto;
          filter: brightness(0) invert(1);
          margin-bottom: 1.4rem;
        }
        .tbc-dark-lede {
          font-size: 18px;
          color: #dcebe2;
          font-weight: 500;
          max-width: 34rem;
        }
        .tbc-laurels {
          margin-top: 1.5rem;
          list-style: none;
          padding: 0;
          display: grid;
          gap: 0.55rem;
        }
        .tbc-laurels li {
          font-size: 13.5px;
          padding-left: 1.5rem;
          position: relative;
          color: #e9d9ac;
        }
        .tbc-laurels li::before {
          content: "❧";
          position: absolute;
          left: 0;
          color: #d9b26a;
        }
        .tbc-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .tbc-stats div {
          border: 1px solid rgba(163, 222, 186, 0.25);
          border-radius: 16px;
          padding: 1.1rem 1.2rem;
          background: rgba(255, 255, 255, 0.03);
        }
        .tbc-stats strong {
          font-family: var(--font-mont), sans-serif;
          font-size: clamp(1.7rem, 3.4vw, 2.3rem);
          font-weight: 800;
          color: var(--mint);
          display: block;
          line-height: 1.1;
          font-variant-numeric: tabular-nums;
        }
        .tbc-stats span {
          font-size: 13px;
        }
        .tbc-proof {
          margin-top: 3rem;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .tbc-proof-track {
          display: flex;
          align-items: center;
          gap: 3.4rem;
          width: max-content;
          animation: tbc-proof-scroll 26s linear infinite;
        }
        .tbc-proof:hover .tbc-proof-track {
          animation-play-state: paused;
        }
        @keyframes tbc-proof-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .tbc-proof-item {
          flex: none;
        }
        .tbc-proof-item img {
          height: 40px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.75;
          transition: opacity 0.3s ease;
        }
        .tbc-proof-item img:hover {
          opacity: 1;
        }
        .tbc-proof-note {
          text-align: center;
          font-size: 13.5px;
          margin-top: 1.6rem;
          color: rgba(220, 235, 226, 0.75);
        }

        /* Inversión */
        .tbc-price {
          text-align: center;
          margin-bottom: 2.4rem;
        }
        .tbc-price-amount {
          font-family: var(--font-mont), sans-serif;
          font-size: clamp(3rem, 7vw, 4.6rem);
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
          display: block;
          line-height: 1.05;
        }
        .tbc-price-amount i {
          font-style: normal;
          font-size: 0.38em;
          font-weight: 700;
          color: var(--green);
          vertical-align: super;
        }
        .tbc-price-sub {
          font-family: var(--font-mont), sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--green-deep);
        }
        .tbc-pay-steps {
          max-width: 46rem;
          margin: 0 auto 1.4rem;
        }
        .tbc-card--step {
          text-align: center;
          padding: 1.6rem 1.4rem;
        }
        .tbc-step-when {
          font-family: var(--font-mont), sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--green-deep);
          display: block;
          margin-bottom: 0.5rem;
        }
        .tbc-card--step strong {
          font-family: var(--font-mont), sans-serif;
          font-size: 2.1rem;
          font-weight: 800;
          display: block;
          margin-bottom: 0.4rem;
        }
        .tbc-card--step p {
          font-size: 13.5px;
        }
        .tbc-pay-methods {
          max-width: 58rem;
          margin: 0 auto;
          align-items: stretch;
        }
        .tbc-method {
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 1.8rem 1.7rem;
          background: linear-gradient(180deg, #fff, var(--mint-soft) 160%);
          text-align: center;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .tbc-method h3 {
          font-size: 17px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.6rem;
          color: var(--green-deep);
        }
        .tbc-method p {
          font-size: 14.5px;
          margin-bottom: 1.3rem;
        }
        .tbc-stripe-slot {
          min-height: 52px;
          display: flex;
          justify-content: center;
        }
        .tbc-stripe-loading {
          font-size: 13px;
          color: var(--num);
          align-self: center;
        }
        .tbc-includes {
          list-style: none;
          padding: 0;
          max-width: 44rem;
          margin: 2.6rem auto 0;
          display: grid;
          gap: 0.6rem;
        }
        .tbc-includes li {
          position: relative;
          padding-left: 1.9rem;
          font-size: 15px;
        }
        .tbc-includes li::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: var(--mint-soft);
          border: 1px solid var(--line);
          color: var(--green-deep);
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tbc-fine {
          text-align: center;
          font-size: 12px;
          color: var(--num);
          margin-top: 1.6rem;
        }

        /* Cierre */
        .tbc-close {
          background: linear-gradient(160deg, var(--mint) 0%, #8fd3ab 55%, #6dbd90 100%);
          padding: 4.5rem 0 0;
          color: #1c3f2d;
        }
        .tbc-close-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
          gap: 2rem;
          align-items: end;
        }
        .tbc-close-logo {
          width: 190px;
          height: auto;
          margin-bottom: 2rem;
        }
        .tbc-close h2 {
          font-size: clamp(2.1rem, 5vw, 3.2rem);
          font-weight: 800;
          color: #fff;
          margin-bottom: 1rem;
          line-height: 1.08;
        }
        .tbc-close p {
          max-width: 33rem;
          font-weight: 500;
        }
        .tbc-close .tbc-hero-ctas {
          margin-top: 1.8rem;
        }
        .tbc-sign {
          font-family: var(--font-mont), sans-serif;
          font-weight: 700;
          color: #fff;
          margin-top: 2.4rem;
          padding-bottom: 3rem;
        }
        .tbc-sign span {
          display: block;
          font-family: var(--font-quick), sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: rgba(20, 55, 38, 0.85);
          margin-top: 0.3rem;
        }
        .tbc-close-figure {
          align-self: end;
        }
        .tbc-close-figure img {
          max-width: 300px;
          width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
          filter: drop-shadow(0 20px 34px rgba(16, 54, 35, 0.25));
        }
        .tbc-confidential {
          text-align: center;
          font-size: 11.5px;
          letter-spacing: 0.06em;
          padding: 1.1rem 1.4rem;
          background: rgba(16, 54, 35, 0.25);
          color: rgba(255, 255, 255, 0.85);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .tbc-hero-grid,
          .tbc-cols,
          .tbc-cols--rev,
          .tbc-dark-grid,
          .tbc-close-grid {
            grid-template-columns: 1fr;
          }
          .tbc-grid3 {
            grid-template-columns: 1fr;
          }
          .tbc-sim-grid {
            grid-template-columns: 1fr;
            gap: 1.4rem;
          }
          .tbc-timeline {
            grid-template-columns: 1fr;
          }
          .tbc-hero-figure {
            order: -1;
            margin-top: -2rem;
          }
          .tbc-hero-figure img {
            max-width: 240px;
          }
          .tbc-hero-copy {
            padding-bottom: 3.4rem;
          }
          .tbc-bar {
            top: auto;
            bottom: 0;
            border-top: 1px solid var(--line);
            border-bottom: none;
            justify-content: space-between;
            gap: 0.5rem;
          }
          .tbc-bar-label {
            display: none;
          }
          .tbc-hero {
            padding-top: 3rem;
          }
          .tbc-runner {
            order: 2;
          }
          .tbc-close-figure {
            display: none;
          }
          .tbc-confidential {
            padding-bottom: 4.4rem;
          }
        }
        @media (max-width: 640px) {
          .tbc-grid2,
          .tbc-mech,
          .tbc-locked,
          .tbc-stats {
            grid-template-columns: 1fr;
          }
          .tbc-btn--line {
            margin-left: 0;
            margin-top: 0.6rem;
          }
          .tbc-method .tbc-btn {
            display: block;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .tbc [data-reveal] {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .tbc-pulse path {
            animation: none;
            stroke-dashoffset: 0;
          }
          .tbc-proof-track {
            animation: none;
          }
          .tbc-digit {
            animation: none;
          }
          .tbc-card,
          .tbc-format,
          .tbc-week,
          .tbc-btn,
          .tbc-bar-cta {
            transition: none;
          }
        }

        /* Print */
        @media print {
          .tbc-bar,
          .tbc-progress,
          .tbc-stripe-slot {
            display: none !important;
          }
          .tbc [data-reveal] {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
