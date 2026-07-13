"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { homeClientLogos } from "@/components/home/homeBrandData";

// ── Dossier Pampa Malbec ─────────────────────────────────────────────────────
// Estética heritage steakhouse: charcoal/crema, Cinzel para display, Archivo
// para todo lo demás, hairlines, letras de fase A–E en rojo. Sin gradientes.

const STRIPE_URL = "https://buy.stripe.com/9B600k7PM69M9vv3UZ5c41x";

const PHASES: {
  letter: string;
  title: string;
  items: [string, string][];
  note?: string;
}[] = [
  {
    letter: "A",
    title: "Propuesta estratégica de franquicia",
    items: [
      ["A.1", "Diagnóstico estratégico según los objetivos de Pampa Malbec"],
      ["A.2", "Ruta de crecimiento según modelos de franquicia a desarrollar"],
      ["A.3", "Definición del perfil de franquiciado"],
    ],
  },
  {
    letter: "B",
    title: "Desarrollo de viabilidad financiera",
    items: [
      ["B.1", "Análisis y optimización del modelo financiero actual"],
      ["B.2", "Viabilidad financiera de las franquicias Pampa Malbec"],
      ["B.3", "Diseño de viabilidad financiera para franquiciados Pampa Malbec"],
    ],
  },
  {
    letter: "C",
    title: "Manuales",
    items: [
      ["C.1", "Manuales de preapertura (Escrito + Video HD)"],
      ["C.2", "Manuales operativos (Escrito + Video HD)"],
      ["C.3", "Manuales de talento humano (Escrito)"],
    ],
    note: "Nota: los videos podrán utilizarse luego como material de marketing.",
  },
  {
    letter: "D",
    title: "Fase legal de la franquicia",
    items: [
      ["D.1", "Contrato de confidencialidad"],
      ["D.2", "Carta de intención"],
      ["D.3", "Contrato de franquicia"],
      ["D.4", "Licencia de uso de marca"],
    ],
  },
  {
    letter: "E",
    title: "Marketing y ventas",
    items: [
      ["E.1", "Estrategia de Go to Market"],
      ["E.2", "Plan de ventas por canales"],
      ["E.3", "Estrategias de medición y conversión (KPI's, CAC's…)"],
      ["E.4", "Dossier de la franquicia"],
      ["E.5", "Perfil en franquicialatam.com (1 mes · entrega de leads)"],
      ["E.6", "Reel en redes sociales (entrega de leads generados)"],
    ],
  },
];

const CONDICIONES = [
  "El 10% aplica solo si reservas y pagas la separación del cupo dentro de los 3 días — a más tardar el 15 de julio de 2026.",
  "Separación del cupo: 1.500 €, asegura el lugar y se abona a la inversión total.",
  "Con descuento: 3 cuotas, una cada 30 días, la primera 30 días después del pago del cupo.",
  "Sin descuento: 5 cuotas bajo el mismo esquema de 30 días — pensada para cuidar el flujo de caja de nuestros emprendedores; requiere igualmente separar el cupo en 3 días.",
  "Vigencia de la propuesta: 15 días (hasta el 24 de julio de 2026), valores sin IVA.",
];

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

// Dígito que se funde suavemente al cambiar: la key fuerza el remount y la
// animación de entrada hace el fade.
function Digit({ value }: { value: string }) {
  return (
    <span key={value} className="pd-digit">
      {value}
    </span>
  );
}

function CountdownBar({ deadlineIso }: { deadlineIso: string }) {
  const deadline = new Date(deadlineIso).getTime();
  // El reloj arranca tras el mount (SSR pinta "––"): así el HTML del server
  // y el del cliente coinciden y no hay error de hidratación por Date.now().
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (deadline - t <= 0) {
        window.clearInterval(id);
        // El servidor decide: al recargar, la page renderiza la expiración.
        window.location.reload();
      }
    }, 1000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [deadline]);

  const left = now === null ? null : deadline - now;
  const totalSeconds = left === null ? null : Math.max(0, Math.floor(left / 1000));
  const urgent = left !== null && left < 6 * 3_600_000;

  return (
    <div className={`pd-bar${urgent ? " pd-bar--urgent" : ""}`} role="timer">
      <span className="pd-bar-label">Esta propuesta se cierra en</span>
      <span className="pd-bar-time" aria-hidden>
        <Digit value={totalSeconds === null ? "––" : pad(Math.floor(totalSeconds / 3600))} />
        <i>:</i>
        <Digit value={totalSeconds === null ? "––" : pad(Math.floor(totalSeconds / 60) % 60)} />
        <i>:</i>
        <Digit value={totalSeconds === null ? "––" : pad(totalSeconds % 60)} />
      </span>
      <a
        className="pd-bar-cta"
        href={STRIPE_URL}
        target="_blank"
        rel="noreferrer"
        data-cta
      >
        Reservar →
      </a>
    </div>
  );
}

function CtaBlock({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`pd-cta-block${dark ? "" : " pd-cta-block--cream"}`}>
      <span className="pd-chip">
        10% dcto. si separas tu cupo antes del 15 de julio de 2026
      </span>
      <a
        className="pd-cta"
        href={STRIPE_URL}
        target="_blank"
        rel="noreferrer"
        data-cta
      >
        Separar mi cupo · Reservar ahora →
      </a>
      <span className="pd-cta-sub">Pago seguro vía Stripe · Reserva de 1.500 €</span>
    </div>
  );
}

// ── Autodestrucción por lectura ──────────────────────────────────────────────
// Cada sección leída se desintegra (estilo "delete" de Telegram) cuando su
// borde inferior cruza el 22% superior del viewport: polvo + blur y un
// vestigio sellado que no puede volver a leerse. El alto del bloque se
// conserva (visibility) para que el scroll nunca salte.
const DUST_COLORS = ["#C9A44C", "#A31621", "#6E6860"];

function Ephemeral({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"live" | "burning" | "gone">("live");

  useEffect(() => {
    if (state !== "live") return;
    let raf = 0;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const check = () => {
      const el = ref.current;
      if (!el) return;
      if (el.getBoundingClientRect().bottom < window.innerHeight * 0.22) {
        window.removeEventListener("scroll", onScroll);
        if (reduced) {
          setState("gone");
          return;
        }
        setState("burning");
        window.setTimeout(() => setState("gone"), 950);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [state]);

  return (
    <div ref={ref} className={`pd-eph pd-eph--${state}`}>
      <div className="pd-eph-content" aria-hidden={state === "gone"}>
        {children}
      </div>
      {state === "burning" && (
        <div className="pd-eph-dust" aria-hidden>
          {Array.from({ length: 30 }, (_, i) => (
            <span
              key={i}
              style={
                {
                  left: `${(i * 37 + 11) % 100}%`,
                  top: `${(i * 53 + 23) % 100}%`,
                  width: 3 + (i % 4),
                  height: 3 + (i % 4),
                  background: DUST_COLORS[i % 3],
                  "--dx": `${((i * 17) % 44) - 22}px`,
                  animationDelay: `${(i % 6) * 0.06}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
      {state === "gone" && (
        <div className="pd-eph-seal" aria-hidden>
          <span className="pd-eph-rule" />
          <span className="pd-eph-note">
            Sección eliminada · Este dossier se lee una sola vez
          </span>
          <span className="pd-eph-rule" />
        </div>
      )}
    </div>
  );
}

export function PampaMalbecDossier({
  deadlineIso,
  inviteToken,
}: {
  deadlineIso: string;
  inviteToken: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Tracking del CTA: un beacon por click (no bloquea la navegación).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-cta]");
      if (!target) return;
      try {
        const payload = JSON.stringify({ t: inviteToken });
        if (!navigator.sendBeacon?.("/api/dossier/cta", payload)) {
          void fetch("/api/dossier/cta", {
            method: "POST",
            body: payload,
            keepalive: true,
          });
        }
      } catch {
        /* el tracking nunca debe romper el CTA */
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [inviteToken]);

  // Scroll-reveal sobrio (300ms). Con reduced-motion, todo visible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll("[data-reveal]"));
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("pd-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pd-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="pd-root">
      <CountdownBar deadlineIso={deadlineIso} />

      {/* ── Portada ── */}
      <Ephemeral>
      <header className="pd-cover">
        <p className="pd-eyebrow pd-eyebrow--gold" data-reveal>
          FRANQUICIAS LATAM · CONFIDENCIAL
        </p>
        <p className="pd-brand" data-reveal>
          PAMPA <span aria-hidden>★</span> MALBEC
          <span className="pd-brand-sub">Tradicional Parrilla Argentina</span>
        </p>
        <h1 className="pd-title" data-reveal>
          Propuesta Estratégica
          <br />
          de Franquicia
        </h1>
        <div className="pd-rule" aria-hidden data-reveal />
        <p className="pd-meta" data-reveal>
          Presentada a: <strong>Juan Martín Arancedo, Maria Ximena Ocampo</strong>
        </p>
        <p className="pd-meta pd-meta--muted" data-reveal>
          Bogotá / Madrid · 9 de julio de 2026 · Franquiciaslatam.com
        </p>
      </header>
      </Ephemeral>

      {/* ── Carta ── */}
      <Ephemeral>
      <section className="pd-section">
        <p className="pd-eyebrow pd-eyebrow--red" data-reveal>
          CARTA
        </p>
        <div className="pd-letter" data-reveal>
          <p>Estimados Juan Martín y Maria Ximena:</p>
          <p>
            Gracias por abrirnos las puertas de Pampa Malbec. Lo que ustedes han
            construido — una parrilla argentina con tradición, producto y una
            marca que se respeta — tiene exactamente lo que buscamos en una
            franquicia ganadora. Esta propuesta resume, en cinco fases, el
            camino probado con el que cientos de marcas han pasado de un gran
            restaurante a una red que crece con orden, rentabilidad y control.
          </p>
          <p>
            Nuestro equipo queda a su disposición desde Bogotá y Madrid. El
            siguiente paso es de ustedes.
          </p>
          <p className="pd-signature">
            Daniel Seneor
            <span>CEO · Franquicias LATAM</span>
          </p>
        </div>
      </section>
      </Ephemeral>

      {/* ── Programa ── */}
      <Ephemeral>
      <section className="pd-section pd-section--alt">
        <p className="pd-eyebrow pd-eyebrow--red" data-reveal>
          PROGRAMA
        </p>
        <h2 className="pd-h2" data-reveal>
          Cinco fases, un mismo destino
        </h2>
        <ol className="pd-program" data-reveal>
          {PHASES.map((phase) => (
            <li key={phase.letter}>
              <span className="pd-program-letter" aria-hidden>
                {phase.letter}
              </span>
              {phase.title}
            </li>
          ))}
        </ol>
      </section>
      </Ephemeral>

      {/* ── Fases ── */}
      {PHASES.map((phase) => (
        <Ephemeral key={phase.letter}>
        <section className="pd-section pd-phase">
          <div className="pd-phase-letter" aria-hidden data-reveal>
            {phase.letter}
          </div>
          <div className="pd-phase-body">
            <p className="pd-eyebrow pd-eyebrow--gold" data-reveal>
              FASE {phase.letter}
            </p>
            <h2 className="pd-h2" data-reveal>
              {phase.title}
            </h2>
            <ul className="pd-items">
              {phase.items.map(([code, text]) => (
                <li key={code} data-reveal>
                  <span className="pd-item-code">{code}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            {phase.note && (
              <p className="pd-note" data-reveal>
                {phase.note}
              </p>
            )}
          </div>
        </section>
        </Ephemeral>
      ))}

      {/* ── Inversión y condiciones ── */}
      <section className="pd-section pd-section--dark">
        <p className="pd-eyebrow pd-eyebrow--gold" data-reveal>
          INVERSIÓN Y CONDICIONES
        </p>
        <h2 className="pd-h2 pd-h2--cream" data-reveal>
          Una decisión, dos caminos
        </h2>
        <div className="pd-pricing" data-reveal>
          <div className="pd-price">
            <span className="pd-price-label">Precio base</span>
            <span className="pd-price-value">13,889 USD + IVA</span>
            <span className="pd-price-sub">hasta 5 cuotas · sin descuento</span>
          </div>
          <div className="pd-price pd-price--featured">
            <span className="pd-price-label">Con 10% de descuento · en 3 cuotas</span>
            <span className="pd-price-value">12,500 USD + IVA</span>
            <span className="pd-price-sub">Ahorras 1,389 USD</span>
          </div>
        </div>
        <ol className="pd-terms" data-reveal>
          {CONDICIONES.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ol>
        <div data-reveal>
          <CtaBlock dark />
        </div>

        {/* Prueba social: las marcas del home, para reafirmar la decisión */}
        <div className="pd-proof" data-reveal>
          <span className="pd-proof-caption">
            Las marcas que confiaron en este proceso
          </span>
          <div className="pd-proof-mask">
            <div className="pd-proof-track">
              {[...homeClientLogos, ...homeClientLogos].map((logo, i) => (
                <Image
                  key={`${logo.alt}-${i}`}
                  src={logo.src}
                  alt={i < homeClientLogos.length ? logo.alt : ""}
                  width={120}
                  height={44}
                  className="pd-proof-logo"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cierre ── */}
      <section className="pd-section pd-closing">
        <h2 className="pd-closing-title" data-reveal>
          Hagamos crecer la tradición
          <br />
          de Pampa Malbec.
        </h2>
        <p className="pd-signature pd-signature--center" data-reveal>
          Daniel Seneor
          <span>CEO · Franquicias LATAM</span>
        </p>
        <div data-reveal>
          <CtaBlock />
        </div>
      </section>

      <footer className="pd-footer">
        Confidencial — preparado exclusivamente para Pampa Malbec
      </footer>

      <style jsx global>{`
        .pd-root {
          background: #f4f0e8;
          color: #17130f;
          font-family: var(--font-archivo), system-ui, sans-serif;
          padding-top: 46px;
          padding-bottom: 0;
        }
        @media (max-width: 767px) {
          .pd-root {
            padding-top: 0;
            padding-bottom: 54px;
          }
        }

        /* ── Barra de cierre (countdown) ── */
        .pd-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          height: 46px;
          padding: 0 18px;
          background: #17130f;
          border-bottom: 1px solid rgba(201, 164, 76, 0.28);
        }
        @media (max-width: 767px) {
          .pd-bar {
            top: auto;
            bottom: 0;
            height: 54px;
            border-bottom: none;
            border-top: 1px solid rgba(201, 164, 76, 0.28);
          }
        }
        .pd-bar-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #6e6860;
          white-space: nowrap;
        }
        .pd-bar-time {
          display: inline-flex;
          align-items: baseline;
          gap: 3px;
          color: #c9a44c;
          font-variant-numeric: tabular-nums;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .pd-bar-time i {
          font-style: normal;
          opacity: 0.55;
        }
        .pd-digit {
          display: inline-block;
          min-width: 2ch;
          text-align: center;
          animation: pd-digit-in 0.35s ease both;
        }
        .pd-bar--urgent .pd-bar-time {
          color: #d24857;
          animation: pd-minute-pulse 60s linear infinite;
        }
        .pd-bar-cta {
          padding: 7px 16px;
          background: #a31621;
          color: #f4f0e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }
        @media (min-width: 768px) {
          .pd-bar-cta {
            display: none;
          }
        }

        /* ── Reveal ── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(14px);
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }
        [data-reveal].pd-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Portada ── */
        .pd-cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          min-height: calc(100vh - 46px);
          padding: 90px 24px;
          background: #17130f;
          color: #f4f0e8;
          text-align: center;
        }
        .pd-eyebrow {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
        }
        .pd-eyebrow--gold {
          color: #c9a44c;
        }
        .pd-eyebrow--red {
          color: #a31621;
        }
        .pd-brand {
          margin: 6px 0 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-family: var(--font-cinzel), serif;
          font-weight: 700;
          font-size: clamp(17px, 2.4vw, 22px);
          letter-spacing: 0.3em;
        }
        .pd-brand > span[aria-hidden] {
          display: contents;
        }
        .pd-brand-sub {
          font-family: var(--font-archivo), sans-serif;
          font-weight: 500;
          font-size: 11.5px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #6e6860;
        }
        .pd-title {
          margin: 10px 0 4px;
          font-family: var(--font-cinzel), serif;
          font-weight: 900;
          font-size: clamp(38px, 7vw, 78px);
          line-height: 1.08;
          letter-spacing: 0.015em;
        }
        .pd-rule {
          width: 76px;
          height: 1px;
          background: rgba(201, 164, 76, 0.5);
        }
        .pd-meta {
          margin: 0;
          font-size: 14.5px;
          letter-spacing: 0.02em;
          color: #f4f0e8;
        }
        .pd-meta strong {
          font-weight: 700;
        }
        .pd-meta--muted {
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6e6860;
        }

        /* ── Secciones ── */
        .pd-section {
          padding: 84px 24px;
          max-width: 860px;
          margin: 0 auto;
        }
        .pd-section--alt {
          max-width: none;
          background: #ece6da;
        }
        .pd-section--alt > * {
          max-width: 812px;
          margin-left: auto;
          margin-right: auto;
        }
        .pd-section--dark {
          max-width: none;
          background: #17130f;
          color: #f4f0e8;
        }
        .pd-section--dark > * {
          max-width: 812px;
          margin-left: auto;
          margin-right: auto;
        }
        .pd-h2 {
          margin: 14px auto 0;
          font-family: var(--font-cinzel), serif;
          font-weight: 700;
          font-size: clamp(26px, 3.6vw, 40px);
          line-height: 1.15;
          color: #17130f;
        }
        .pd-h2--cream {
          color: #f4f0e8;
        }

        .pd-letter {
          margin-top: 26px;
          font-size: 16.5px;
          line-height: 1.85;
          color: #17130f;
        }
        .pd-letter p {
          margin: 0 0 18px;
          max-width: 640px;
        }
        .pd-signature {
          margin-top: 30px !important;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: var(--font-cinzel), serif;
          font-weight: 700;
          font-size: 19px;
        }
        .pd-signature span {
          font-family: var(--font-archivo), sans-serif;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #6e6860;
        }
        .pd-signature--center {
          align-items: center;
          text-align: center;
        }

        .pd-program {
          margin: 34px auto 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
        }
        .pd-program li {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 17px 2px;
          border-top: 1px solid rgba(23, 19, 15, 0.14);
          font-size: 17px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .pd-program li:last-child {
          border-bottom: 1px solid rgba(23, 19, 15, 0.14);
        }
        .pd-program-letter {
          font-family: var(--font-cinzel), serif;
          font-weight: 900;
          font-size: 24px;
          color: #a31621;
          min-width: 34px;
        }

        /* ── Fase ── */
        .pd-phase {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 30px;
          border-top: 1px solid rgba(23, 19, 15, 0.1);
        }
        @media (max-width: 700px) {
          .pd-phase {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
        .pd-phase-letter {
          font-family: var(--font-cinzel), serif;
          font-weight: 900;
          font-size: clamp(84px, 11vw, 132px);
          line-height: 0.9;
          color: #a31621;
        }
        .pd-items {
          margin: 26px 0 0;
          padding: 0;
          list-style: none;
        }
        .pd-items li {
          display: flex;
          gap: 18px;
          padding: 14px 2px;
          border-top: 1px solid rgba(23, 19, 15, 0.12);
          font-size: 16px;
          line-height: 1.6;
        }
        .pd-items li:last-child {
          border-bottom: 1px solid rgba(23, 19, 15, 0.12);
        }
        .pd-item-code {
          font-weight: 800;
          color: #a31621;
          min-width: 42px;
          letter-spacing: 0.04em;
        }
        .pd-note {
          margin: 18px 0 0;
          font-size: 13.5px;
          font-style: italic;
          color: #6e6860;
        }

        /* ── Inversión ── */
        .pd-pricing {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin-top: 38px;
        }
        @media (max-width: 640px) {
          .pd-pricing {
            grid-template-columns: 1fr;
          }
        }
        .pd-price {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding: 28px 26px;
          border: 1px solid rgba(244, 240, 232, 0.22);
        }
        .pd-price--featured {
          border-color: #c9a44c;
        }
        .pd-price-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c9a44c;
        }
        .pd-price-value {
          font-family: var(--font-cinzel), serif;
          font-weight: 700;
          font-size: clamp(26px, 3.4vw, 36px);
          color: #f4f0e8;
        }
        .pd-price--featured .pd-price-value {
          color: #c9a44c;
        }
        .pd-price-sub {
          font-size: 13.5px;
          color: #6e6860;
        }
        .pd-price--featured .pd-price-sub {
          color: #f4f0e8;
        }
        .pd-terms {
          margin: 36px auto 0;
          padding: 0 0 0 20px;
          display: flex;
          flex-direction: column;
          gap: 13px;
          font-size: 14.5px;
          line-height: 1.65;
          color: rgba(244, 240, 232, 0.82);
        }
        .pd-terms li::marker {
          color: #c9a44c;
          font-weight: 700;
        }

        /* ── CTA ── */
        .pd-cta-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-top: 46px;
          text-align: center;
        }
        .pd-chip {
          display: inline-block;
          padding: 8px 16px;
          border: 1px solid #c9a44c;
          color: #c9a44c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .pd-cta-block--cream .pd-chip {
          border-color: #a31621;
          color: #a31621;
        }
        .pd-cta {
          display: inline-block;
          padding: 19px 42px;
          background: #a31621;
          color: #f4f0e8;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .pd-cta:hover {
          background: #8c1220;
        }
        .pd-cta-sub {
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #6e6860;
        }

        /* ── Cierre ── */
        .pd-closing {
          text-align: center;
          padding-top: 100px;
          padding-bottom: 100px;
        }
        .pd-closing-title {
          margin: 0;
          font-family: var(--font-cinzel), serif;
          font-weight: 900;
          font-size: clamp(30px, 5vw, 54px);
          line-height: 1.18;
          color: #17130f;
        }
        .pd-closing .pd-signature {
          margin-top: 34px !important;
        }

        .pd-footer {
          padding: 26px 24px;
          background: #17130f;
          color: #6e6860;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          text-align: center;
        }

        /* ── Autodestrucción por lectura ── */
        .pd-eph {
          position: relative;
        }
        .pd-eph--burning .pd-eph-content {
          animation: pd-eph-burn 0.95s ease forwards;
        }
        .pd-eph--gone .pd-eph-content {
          visibility: hidden;
        }
        .pd-eph-dust {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 3;
        }
        .pd-eph-dust span {
          position: absolute;
          border-radius: 1.5px;
          opacity: 0;
          animation: pd-eph-dust 0.9s ease-out forwards;
        }
        .pd-eph-seal {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 0 26px;
          animation: pd-eph-seal-in 0.5s ease both;
        }
        .pd-eph-rule {
          flex: 1;
          max-width: 130px;
          height: 1px;
          background: rgba(201, 164, 76, 0.3);
        }
        .pd-eph-note {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #6e6860;
          text-align: center;
        }

        /* ── Prueba social bajo el CTA ── */
        .pd-proof {
          margin-top: 46px;
        }
        .pd-proof-caption {
          display: block;
          margin-bottom: 20px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #c9a44c;
          text-align: center;
        }
        .pd-proof-mask {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent,
            #000 12%,
            #000 88%,
            transparent
          );
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 12%,
            #000 88%,
            transparent
          );
        }
        .pd-proof-track {
          display: flex;
          align-items: center;
          gap: 54px;
          width: max-content;
          padding-right: 54px;
          animation: pd-proof-scroll 30s linear infinite;
        }
        .pd-proof-logo {
          height: 26px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.6;
        }

        @keyframes pd-eph-burn {
          to {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(-16px) scale(0.99);
          }
        }
        @keyframes pd-eph-dust {
          0% {
            opacity: 0.95;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx, 0px), -70px) rotate(140deg);
          }
        }
        @keyframes pd-eph-seal-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pd-proof-scroll {
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes pd-digit-in {
          from {
            opacity: 0.15;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pd-minute-pulse {
          0%,
          1.6%,
          100% {
            opacity: 1;
          }
          0.8% {
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pd-digit,
          .pd-bar--urgent .pd-bar-time,
          .pd-eph-content,
          .pd-proof-track {
            animation: none !important;
          }
          [data-reveal] {
            transition: none;
          }
          .pd-proof-mask {
            overflow-x: auto;
          }
        }

        @media print {
          .pd-bar,
          .pd-cta,
          .pd-bar-cta,
          .pd-chip,
          .pd-cta-sub,
          .pd-proof {
            display: none !important;
          }
          .pd-root {
            padding: 0;
          }
          [data-reveal] {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
