"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ── Botón flotante de WhatsApp ───────────────────────────────────────────────
// Botón con halo pulsante + burbuja teaser estilo chat (typing → mensaje) que
// aparece una vez por sesión y se puede descartar. Todo el árbol vive bajo
// `.wa-widget` (hijo directo de <body>): las rutas que ocultan el widget
// (p. ej. propuesta.css) apuntan a esa clase.

// Rutas que se presentan solas, sin chrome de la plataforma: aquí el widget no
// se oculta por CSS, simplemente no se monta (ni DOM, ni timers, ni teaser).
const STANDALONE_PREFIXES = ["/intel"];

const WA_PHONE = "34695126804";
const WA_MESSAGE = "Quiero más información sobre Franquicias LATAM.";
const WA_HREF = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;

const TEASER_DELAY_MS = 2400;
const TYPING_MS = 1200;
const DISMISS_KEY = "wa-teaser-dismissed";

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // sessionStorage puede no estar disponible (p. ej. modo privado).
  }
}

function WhatsAppIcon({ size = 30 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const standalone = STANDALONE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );

  // idle → typing → shown → dismissed
  const [teaser, setTeaser] = useState<"idle" | "typing" | "shown" | "dismissed">(
    "idle",
  );
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (standalone) return;

    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let showTimer = 0;
    let typingTimer = 0;
    const raf = requestAnimationFrame(() => {
      const isReduced = media?.matches ?? false;
      setReduced(isReduced);
      // Con reduced-motion no hay teaser automático: solo el botón.
      if (wasDismissed() || isReduced) {
        setTeaser("dismissed");
        return;
      }
      showTimer = window.setTimeout(() => {
        setTeaser("typing");
        typingTimer = window.setTimeout(() => setTeaser("shown"), TYPING_MS);
      }, TEASER_DELAY_MS);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(showTimer);
      window.clearTimeout(typingTimer);
    };
  }, [standalone]);

  const dismissTeaser = () => {
    rememberDismissed();
    setTeaser("dismissed");
  };

  const teaserVisible = teaser === "typing" || teaser === "shown";

  if (standalone) return null;

  return (
    <div className="wa-widget">
      {teaserVisible && (
        <div className="wa-bubble" role="status">
          <button
            type="button"
            className="wa-bubble-close"
            aria-label="Cerrar mensaje"
            onClick={dismissTeaser}
          >
            ✕
          </button>
          {teaser === "typing" ? (
            <span className="wa-typing" aria-label="Escribiendo…">
              <span />
              <span />
              <span />
            </span>
          ) : (
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-bubble-body"
              onClick={dismissTeaser}
            >
              <strong>👋 ¿Hablamos?</strong>
              Cuéntanos tu caso por WhatsApp — te respondemos en minutos.
            </a>
          )}
          <span className="wa-bubble-tail" aria-hidden />
        </div>
      )}

      <a
        href={WA_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className={`wa-btn${reduced ? " wa-btn--static" : ""}`}
        onClick={dismissTeaser}
      >
        <span className="wa-btn-pulse" aria-hidden />
        <span className="wa-btn-face">
          <span className="wa-btn-sheen" aria-hidden />
          <WhatsAppIcon />
        </span>
        {teaser !== "dismissed" && (
          <span className="wa-btn-badge" aria-hidden>
            1
          </span>
        )}
        <span className="wa-btn-dot" aria-hidden />
      </a>

      <style jsx global>{`
        .wa-widget {
          position: fixed;
          right: 26px;
          bottom: 26px;
          /* Debajo de los overlays/modales del sitio (z-50). */
          z-index: 40;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          font-family: inherit;
        }
        @media (max-width: 639px) {
          .wa-widget {
            right: 16px;
            bottom: 16px;
          }
        }

        /* ── Botón ── */
        .wa-btn {
          position: relative;
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          color: #ffffff;
          animation: wa-pop-in 0.6s cubic-bezier(0.2, 1.4, 0.3, 1) 0.5s both;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @media (max-width: 639px) {
          .wa-btn {
            width: 58px;
            height: 58px;
          }
        }
        .wa-btn:hover {
          transform: translateY(-3px) scale(1.06);
        }
        .wa-btn:active {
          transform: scale(0.94);
        }
        .wa-btn:focus-visible {
          outline: 2px solid #25d366;
          outline-offset: 4px;
        }
        .wa-btn-face {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 50%;
          background: linear-gradient(135deg, #2ee071 0%, #25d366 45%, #128c7e 100%);
          box-shadow:
            0 12px 34px -8px rgba(18, 140, 126, 0.65),
            0 0 0 1px rgba(255, 255, 255, 0.14) inset,
            0 2px 0 rgba(255, 255, 255, 0.22) inset;
          transition: box-shadow 0.25s ease;
        }
        .wa-btn:hover .wa-btn-face {
          box-shadow:
            0 18px 44px -8px rgba(18, 140, 126, 0.8),
            0 0 28px rgba(37, 211, 102, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset,
            0 2px 0 rgba(255, 255, 255, 0.25) inset;
        }
        .wa-btn-sheen {
          position: absolute;
          inset: 0 auto 0 -60%;
          width: 45%;
          background: linear-gradient(
            105deg,
            transparent,
            rgba(255, 255, 255, 0.35) 50%,
            transparent
          );
          transform: skewX(-18deg);
          animation: wa-sheen 4.6s ease-in-out 2s infinite;
          pointer-events: none;
        }
        /* Halo "radar" que respira detrás del botón. */
        .wa-btn-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.5);
          animation: wa-radar 2.6s cubic-bezier(0.2, 0.6, 0.35, 1) 1.4s infinite;
          pointer-events: none;
        }
        /* Punto "en línea": responde la promesa de inmediatez. */
        .wa-btn-dot {
          position: absolute;
          z-index: 2;
          right: 2px;
          bottom: 4px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #4ade80;
          border: 2.5px solid #05080f;
          animation: wa-dot-pulse 2.2s ease-in-out infinite;
        }
        .wa-btn-badge {
          position: absolute;
          z-index: 2;
          top: -3px;
          right: -3px;
          display: grid;
          place-items: center;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          border-radius: 999px;
          background: #ff4d4d;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          box-shadow: 0 4px 12px -2px rgba(255, 77, 77, 0.6);
          animation: wa-badge-in 0.45s cubic-bezier(0.2, 1.6, 0.4, 1) 1.6s both;
        }
        .wa-btn--static,
        .wa-btn--static .wa-btn-pulse,
        .wa-btn--static .wa-btn-sheen,
        .wa-btn--static .wa-btn-dot,
        .wa-btn--static .wa-btn-badge {
          animation: none;
        }

        /* ── Burbuja teaser ── */
        .wa-bubble {
          position: relative;
          max-width: 250px;
          padding: 14px 34px 14px 16px;
          border-radius: 18px 18px 4px 18px;
          background: linear-gradient(180deg, #10202e, #0b1722);
          border: 1px solid rgba(37, 211, 102, 0.35);
          box-shadow:
            0 24px 60px -18px rgba(0, 0, 0, 0.7),
            0 0 30px -12px rgba(37, 211, 102, 0.4);
          animation: wa-bubble-in 0.45s cubic-bezier(0.2, 1.2, 0.3, 1) both;
        }
        .wa-bubble-tail {
          position: absolute;
          right: 14px;
          bottom: -7px;
          width: 14px;
          height: 14px;
          transform: rotate(45deg);
          border-radius: 3px;
          background: #0b1722;
          border-right: 1px solid rgba(37, 211, 102, 0.35);
          border-bottom: 1px solid rgba(37, 211, 102, 0.35);
        }
        .wa-bubble-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13.5px;
          line-height: 1.5;
          color: #b8c7d9;
          text-decoration: none;
        }
        .wa-bubble-body strong {
          font-size: 14.5px;
          color: #ffffff;
        }
        .wa-bubble-close {
          position: absolute;
          top: 8px;
          right: 8px;
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #8ea3b8;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .wa-bubble-close:hover {
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }
        .wa-typing {
          display: inline-flex;
          gap: 5px;
          padding: 4px 2px;
        }
        .wa-typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #25d366;
          animation: wa-typing-bounce 1.1s ease-in-out infinite;
        }
        .wa-typing span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .wa-typing span:nth-child(3) {
          animation-delay: 0.3s;
        }

        /* ── Keyframes ── */
        @keyframes wa-pop-in {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes wa-radar {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          70%,
          100% {
            opacity: 0;
            transform: scale(1.75);
          }
        }
        @keyframes wa-sheen {
          0%,
          55% {
            transform: translateX(0) skewX(-18deg);
          }
          80%,
          100% {
            transform: translateX(420%) skewX(-18deg);
          }
        }
        @keyframes wa-dot-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.55);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(74, 222, 128, 0);
          }
        }
        @keyframes wa-badge-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes wa-bubble-in {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes wa-typing-bounce {
          0%,
          60%,
          100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wa-btn,
          .wa-btn-pulse,
          .wa-btn-sheen,
          .wa-btn-dot,
          .wa-btn-badge,
          .wa-bubble,
          .wa-typing span {
            animation: none !important;
          }
          .wa-btn,
          .wa-btn:hover,
          .wa-btn:active {
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
