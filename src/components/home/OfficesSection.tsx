"use client";

import { useEffect, useState } from "react";

// ── Oficinas — Madrid · Bogotá ──────────────────────────────────────────────
// Dos sedes con el mismo peso visual. Reloj local en vivo por ciudad.
// `image` es opcional: cuando haya fotos, basta con añadir la URL.

type Office = {
  region: string;
  city: string;
  building: string;
  detail: string;
  timeZone: string;
  mapsQuery: string;
  image?: string;
  accent: string;
};

const OFFICES: Office[] = [
  {
    region: "Europa",
    city: "Madrid",
    building: "Paseo de la Castellana, 77",
    detail: "Distrito financiero",
    timeZone: "Europe/Madrid",
    mapsQuery: "Paseo de la Castellana 77, Madrid",
    accent: "#6EA8FF",
  },
  {
    region: "LATAM",
    city: "Bogotá",
    building: "Edificio Flormorado",
    detail: "Oficina privada",
    timeZone: "America/Bogota",
    mapsQuery: "Edificio Flormorado, Bogotá",
    accent: "#37E6C3",
  },
];

function useLocalTimes() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(new Date()));
    const id = window.setInterval(() => setNow(new Date()), 20_000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, []);

  return (timeZone: string) => {
    if (!now) return "––:––";
    try {
      return new Intl.DateTimeFormat("es", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).format(now);
    } catch {
      return "––:––";
    }
  };
}

export function OfficesSection() {
  const timeIn = useLocalTimes();

  return (
    <section className="hdo-section w-full max-w-[1120px]">
      <div className="hdo-head">
        <em className="hdo-eyebrow">Nuestras oficinas</em>
        <h2 className="hdo-title">
          Madrid <span className="hdo-dot" aria-hidden>·</span> Bogotá
        </h2>
        <p className="hdo-sub">
          Una firma en dos continentes — al lado de tu operación y de tu
          expansión.
        </p>
      </div>

      <div className="hdo-grid">
        {OFFICES.map((office) => (
          <a
            key={office.city}
            href={`https://maps.google.com/?q=${encodeURIComponent(office.mapsQuery)}`}
            target="_blank"
            rel="noreferrer"
            className="hdo-card"
            style={{ "--hdo-accent": office.accent } as React.CSSProperties}
            aria-label={`Oficina de ${office.city}: ${office.building}`}
          >
            <span className="hdo-topline" aria-hidden />
            {office.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={office.image}
                alt=""
                className="hdo-photo"
                loading="lazy"
              />
            )}
            <span className="hdo-sheen" aria-hidden />

            <div className="hdo-row">
              <span className="hdo-region">{office.region}</span>
              <span className="hdo-clock">
                <span className="hdo-clock-time tabular-nums">
                  {timeIn(office.timeZone)}
                </span>
                <span className="hdo-clock-label">hora local</span>
              </span>
            </div>

            <span className="hdo-city">{office.city}</span>

            <div className="hdo-foot">
              <span className="hdo-building">
                {office.building}
                <em>{office.detail}</em>
              </span>
              <span className="hdo-maps">
                Cómo llegar <span aria-hidden>→</span>
              </span>
            </div>
          </a>
        ))}
      </div>

      <style jsx global>{`
        .hdo-section {
          margin-top: 84px;
        }
        .hdo-head {
          text-align: center;
          margin-bottom: 34px;
        }
        .hdo-eyebrow {
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-size: 24px;
          color: #8fdcec;
        }
        .hdo-title {
          margin: 10px 0 0;
          font-size: clamp(28px, 4.6vw, 44px);
          font-weight: 600;
          letter-spacing: -0.025em;
          color: #f2f5fc;
        }
        .hdo-dot {
          color: #37e6c3;
        }
        .hdo-sub {
          margin: 12px auto 0;
          max-width: 480px;
          font-size: 16px;
          line-height: 1.6;
          color: #8e9fbe;
        }
        .hdo-grid {
          display: grid;
          gap: 22px;
        }
        @media (min-width: 760px) {
          .hdo-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .hdo-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow: hidden;
          min-height: 250px;
          padding: 26px 28px 24px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          /* Fallback para navegadores sin color-mix() */
          background: rgba(10, 16, 32, 0.78);
          background:
            radial-gradient(120% 90% at 85% -10%, color-mix(in srgb, var(--hdo-accent) 14%, transparent), transparent 55%),
            rgba(10, 16, 32, 0.78);
          color: #f2f5fc;
          text-decoration: none;
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.35s, box-shadow 0.35s;
        }
        .hdo-card:hover {
          transform: translateY(-5px);
          border-color: color-mix(in srgb, var(--hdo-accent) 65%, transparent);
          box-shadow: 0 32px 80px -24px color-mix(in srgb, var(--hdo-accent) 40%, transparent);
        }
        .hdo-topline {
          position: absolute;
          top: 0;
          left: 28px;
          right: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--hdo-accent) 55%, transparent), transparent);
        }
        .hdo-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.22;
        }
        .hdo-sheen {
          position: absolute;
          inset: 0 auto 0 0;
          width: 34%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.05) 50%, transparent);
          transform: translateX(-140%);
          transition: transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1);
          pointer-events: none;
        }
        .hdo-card:hover .hdo-sheen {
          transform: translateX(340%);
        }
        .hdo-row {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .hdo-region {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--hdo-accent);
        }
        .hdo-clock {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }
        .hdo-clock-time {
          font-size: 21px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #dfe8fa;
        }
        .hdo-clock-label {
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #5e6f8f;
        }
        .hdo-city {
          position: relative;
          margin-top: auto;
          font-family: var(--font-instrument-serif), "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(44px, 6vw, 62px);
          line-height: 1;
          letter-spacing: -0.01em;
        }
        .hdo-foot {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-top: 14px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hdo-building {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 15px;
          font-weight: 600;
          color: #d7e1f5;
        }
        .hdo-building em {
          font-style: normal;
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #5e6f8f;
        }
        .hdo-maps {
          font-size: 13.5px;
          font-weight: 700;
          white-space: nowrap;
          color: var(--hdo-accent);
        }
        @media (prefers-reduced-motion: reduce) {
          .hdo-card,
          .hdo-sheen {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
