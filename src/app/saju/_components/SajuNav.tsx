"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LINKS = [
  { href: "#podcast", label: "Podcast" },
  { href: "#oportunidad", label: "Oportunidad" },
  { href: "#producto", label: "Producto" },
  { href: "#modelos", label: "Modelos" },
  { href: "#deal", label: "El deal" },
];

export function SajuNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setOpen(false);
    }
  };

  return (
    <nav
      className={`saju-nav ${solid ? "saju-nav--solid" : "saju-nav--solid"} ${
        open ? "saju-nav--open" : ""
      }`}
      aria-label="Navegación Sajú"
    >
      <div className="saju-container">
        <div className="saju-nav__inner">
          <a href="#top" className="saju-nav__brand" onClick={(e) => go(e, "#top")}>
            <span className="saju-nav__mono">
              <Image src="/saju/saju-mono.png" alt="Sajú" width={26} height={26} />
            </span>
            <span className="saju-nav__endorse">
              Sajú
              <br />
              presentada por Franquicias LATAM
            </span>
          </a>

          <div className="saju-nav__links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="saju-nav__link" onClick={(e) => go(e, l.href)}>
                {l.label}
              </a>
            ))}
            <a
              href="#aplica"
              className="saju-btn saju-btn--yellow saju-nav__cta"
              onClick={(e) => go(e, "#aplica")}
            >
              Aplica
            </a>
          </div>

          <button
            className="saju-nav__burger"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 7h18" strokeLinecap="round" />
                  <path d="M3 12h18" strokeLinecap="round" />
                  <path d="M3 17h18" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        <div className="saju-nav__mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
          <a href="#aplica" onClick={(e) => go(e, "#aplica")} style={{ color: "var(--yellow)" }}>
            Aplica a la franquicia →
          </a>
        </div>
      </div>
    </nav>
  );
}
