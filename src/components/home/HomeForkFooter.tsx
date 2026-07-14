"use client";

import Image from "next/image";
import Link from "next/link";

// ── Footer del home (tema oscuro, sistema visual hdf) ───────────────────────
// Tres bloques: sedes (Madrid · Bogotá), ecosistema (subdominios) y legal
// (Términos, Privacidad/Habeas Data). Los datos de sede se mantienen en
// sintonía con OfficesSection.

const FOOTER_OFFICES = [
  {
    city: "Madrid",
    country: "España",
    lines: ["Paseo de la Castellana 77, Of. 02-113", "Distrito financiero"],
    mapsQuery: "Paseo de la Castellana 77, Madrid",
    accent: "#6EA8FF",
  },
  {
    city: "Bogotá",
    country: "Colombia",
    lines: ["Carrera 7 #116-50, Edificio Flormorado", "Usaquén"],
    mapsQuery: "Carrera 7 #116-50, Edificio Flormorado, Bogotá",
    accent: "#37E6C3",
  },
];

const FOOTER_ECOSYSTEM = [
  {
    label: "Franquiciar mi Negocio",
    href: "https://franquiciar.franquiciaslatam.com",
    hint: "franquiciar.franquiciaslatam.com",
  },
  {
    label: "Franquicias.ai — Plataforma IA",
    href: "https://franquicias.ai",
    hint: "franquicias.ai",
  },
  {
    label: "Agendar una sesión estratégica",
    href: "https://cal.franquiciaslatam.com/estrategia",
    hint: "cal.franquiciaslatam.com",
  },
  {
    label: "Franquicias en Colombia",
    href: "https://franquiciaslatam.com/co",
    hint: "franquiciaslatam.com/co",
  },
  {
    label: "Franquicias en Ecuador",
    href: "https://franquiciaslatam.com/ec",
    hint: "franquiciaslatam.com/ec",
  },
];

const FOOTER_LEGAL = [
  { label: "Términos y Condiciones", href: "/terminos" },
  { label: "Política de Privacidad y Habeas Data", href: "/privacidad" },
];

export function HomeForkFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="hdff" aria-label="Pie de página">
      <div className="hdff-inner">
        <div className="hdff-grid">
          {/* Marca */}
          <div className="hdff-brand">
            <Link href="/" aria-label="Franquicias LATAM" className="hdff-logo-link">
              <Image
                src="/logo_latam/franquicias_latam_logo.png"
                alt="Franquicias LATAM"
                width={480}
                height={120}
                className="hdff-logo"
              />
            </Link>
            <p className="hdff-tagline">
              El Estándar de Franquicias en Iberoamérica. Legal, expansión,
              capital e inteligencia artificial en 12 países.
            </p>
          </div>

          {/* Sedes */}
          <div className="hdff-col">
            <h3 className="hdff-heading">Sedes</h3>
            <ul className="hdff-list">
              {FOOTER_OFFICES.map((office) => (
                <li key={office.city}>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(office.mapsQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hdff-office"
                    style={{ "--hdff-accent": office.accent } as React.CSSProperties}
                  >
                    <span className="hdff-office-city">
                      {office.city}, {office.country}
                    </span>
                    {office.lines.map((line) => (
                      <span key={line} className="hdff-office-line">
                        {line}
                      </span>
                    ))}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosistema / subdominios */}
          <div className="hdff-col">
            <h3 className="hdff-heading">Ecosistema</h3>
            <ul className="hdff-list">
              {FOOTER_ECOSYSTEM.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hdff-link"
                  >
                    {item.label}
                    <span className="hdff-link-hint">{item.hint}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="hdff-col">
            <h3 className="hdff-heading">Legal</h3>
            <ul className="hdff-list">
              {FOOTER_LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hdff-link">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:datos@franquiciaslatam.co" className="hdff-link">
                  Ejercer tus derechos de datos
                  <span className="hdff-link-hint">
                    datos@franquiciaslatam.co
                  </span>
                </a>
              </li>
            </ul>
            <p className="hdff-legal-note">
              Tratamos tus datos conforme a la Ley 1581 de 2012 (Colombia) y al
              RGPD y la LOPDGDD (España/UE).
            </p>
          </div>
        </div>

        <div className="hdff-bottom">
          <span>
            © {year} Franquicias LATAM · Madrid · Bogotá — Todos los derechos
            reservados.
          </span>
          <span className="hdff-bottom-links">
            {FOOTER_LEGAL.map((item, index) => (
              <Link key={item.href} href={item.href} className="hdff-bottom-link">
                {index > 0 && <span aria-hidden> · </span>}
                {item.label}
              </Link>
            ))}
          </span>
        </div>
      </div>

      <style jsx global>{`
        .hdff {
          position: relative;
          width: 100%;
          margin-top: 96px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, rgba(8, 13, 26, 0.4), rgba(5, 8, 15, 0.9));
        }
        .hdff::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: min(720px, 80vw);
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(110, 168, 255, 0.5),
            rgba(55, 230, 195, 0.5),
            transparent
          );
        }
        .hdff-inner {
          margin: 0 auto;
          max-width: 1120px;
          padding: 56px 20px 30px;
        }
        @media (min-width: 640px) {
          .hdff-inner {
            padding: 64px 24px 34px;
          }
        }
        .hdff-grid {
          display: grid;
          gap: 36px 28px;
          text-align: left;
        }
        @media (min-width: 640px) {
          .hdff-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 980px) {
          .hdff-grid {
            grid-template-columns: 1.3fr 1fr 1fr 1fr;
          }
        }
        .hdff-logo-link {
          display: inline-flex;
        }
        .hdff-logo {
          height: 64px;
          width: auto;
          filter: brightness(0) invert(1);
        }
        .hdff-tagline {
          margin: 14px 0 0;
          max-width: 300px;
          font-size: 14px;
          line-height: 1.65;
          color: #8e9fbe;
        }
        .hdff-heading {
          margin: 0 0 16px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #5e6f8f;
        }
        .hdff-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hdff-office {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-decoration: none;
        }
        .hdff-office-city {
          font-size: 14.5px;
          font-weight: 600;
          color: #dfe8fa;
          transition: color 0.2s ease;
        }
        .hdff-office:hover .hdff-office-city {
          color: var(--hdff-accent, #8fdcec);
        }
        .hdff-office-line {
          font-size: 13.5px;
          line-height: 1.45;
          color: #8e9fbe;
        }
        .hdff-link {
          display: flex;
          flex-direction: column;
          gap: 1px;
          font-size: 14px;
          font-weight: 500;
          color: #aebadb;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .hdff-link:hover {
          color: #ff8a3d;
        }
        .hdff-link-hint {
          font-size: 12px;
          font-weight: 400;
          color: #5e6f8f;
        }
        .hdff-legal-note {
          margin: 18px 0 0;
          max-width: 250px;
          font-size: 12px;
          line-height: 1.6;
          color: #5e6f8f;
        }
        .hdff-bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px 24px;
          margin-top: 44px;
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          font-size: 12.5px;
          color: #5e6f8f;
          text-align: left;
        }
        .hdff-bottom-links {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .hdff-bottom-link {
          color: #8e9fbe;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .hdff-bottom-link:hover {
          color: #f2f5fc;
        }
      `}</style>
    </footer>
  );
}
