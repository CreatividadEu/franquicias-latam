"use client";

import { useState, type ReactNode } from "react";
import {
  EVIDENCE,
  evidenceSrc,
  formatCo,
  type EvidenceSlug,
} from "@/lib/totto/caso001";
import { useCountUp, useInView } from "./hooks";
import s from "./caso001.module.css";

/** Une clases sin traer una dependencia por tan poco. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// ── Reveal ──────────────────────────────────────────────────────────────────

export function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Retardo en ms para escalonar bloques hermanos. */
  delay?: number;
  id?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div
      id={id}
      ref={ref}
      className={cx(s.reveal, inView && s.revealIn, className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

// ── Motivo de esquina Totto ─────────────────────────────────────────────────

/** Las esquinas de línea redondeada rojo + amarillo: la firma visual de Totto. */
export function CornerMotif({ className }: { className?: string }) {
  return (
    <svg
      className={cx(s.corner, className)}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 100 V32 A28 28 0 0 1 32 4 H100"
        stroke="var(--red)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M22 100 V42 A20 20 0 0 1 42 22 H100"
        stroke="var(--gold)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Contador ────────────────────────────────────────────────────────────────

export function Counter({
  value,
  className,
  duration,
  suffix,
}: {
  value: number;
  className?: string;
  duration?: number;
  suffix?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const current = useCountUp(value, inView, duration);

  return (
    <span ref={ref} className={className}>
      {formatCo(current)}
      {suffix}
    </span>
  );
}

// ── Evidencia ───────────────────────────────────────────────────────────────

/**
 * Marco de evidencia. Nunca deforma la captura (`object-fit: contain` sobre un
 * marco de alto reservado) y, si el archivo todavía no está montado en
 * /public, lo declara como anexo pendiente en vez de fingir que existe.
 */
export function Evidence({
  slug,
  lead,
  priority = false,
  className,
}: {
  slug: EvidenceSlug;
  /** Línea destacada sobre el pie: el titular literal de la captura. */
  lead?: string;
  /** Solo para las capturas de la primera pantalla. */
  priority?: boolean;
  className?: string;
}) {
  const item = EVIDENCE[slug];
  const [missing, setMissing] = useState(false);

  return (
    <figure className={cx(s.evidence, className)}>
      <div className={s.evidenceHead}>
        <span className={s.mono}>{item.slug}</span>
        <span className={cx(s.evidenceSeal, s.mono)}>
          <EvidenceSealIcon />
          SHA-256
        </span>
      </div>

      <div className={s.evidenceFrame}>
        {missing ? (
          <div className={s.evidenceMissing}>
            <span className={s.evidenceMissingTag}>Anexo pendiente</span>
            <p className={s.note}>
              La captura se sirve desde <code className={s.mono}>{evidenceSrc(slug)}</code>.
            </p>
            <p className={s.note}>{item.alt}</p>
          </div>
        ) : (
          // next/image no aplica aquí: las capturas del expediente entran con
          // relaciones de aspecto distintas y no se pueden recortar ni conocer
          // de antemano. Se sirven ya optimizadas en .webp.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={s.evidenceImg}
            src={evidenceSrc(slug)}
            alt={item.alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={() => setMissing(true)}
          />
        )}
      </div>

      <figcaption className={s.evidenceFoot}>
        {lead ? <strong className={s.evidenceLead}>{lead}</strong> : null}
        {item.caption}
        <span className={cx(s.note, s.mono)} style={{ display: "block", marginTop: 6 }}>
          {item.source}
        </span>
      </figcaption>
    </figure>
  );
}

function EvidenceSealIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5 13.5 4v4c0 3.2-2.3 5.6-5.5 6.5C4.8 13.6 2.5 11.2 2.5 8V4L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="m5.6 8 1.7 1.7 3.1-3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── Rótulos ─────────────────────────────────────────────────────────────────

export function Eyebrow({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "red";
}) {
  return <p className={cx(s.eyebrow, tone === "red" && s.eyebrowRed)}>{children}</p>;
}
