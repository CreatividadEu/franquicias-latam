import type { ReactNode } from "react";

/** Vocabulario visual Totto (PLAN §6.2). Componentes de presentación puros. */

export function Eyebrow({
  children,
  tone = "red",
  className = "",
}: {
  children: ReactNode;
  tone?: "red" | "yellow" | "muted" | "light";
  className?: string;
}) {
  const toneClass = tone === "red" ? "" : ` tw-eyebrow--${tone}`;
  return <span className={`tw-eyebrow${toneClass} ${className}`.trim()}>{children}</span>;
}

export function XpChip({ xp, tone = "black" }: { xp: number; tone?: "black" | "yellow" | "red" | "outline" }) {
  const toneClass = tone === "black" ? "" : ` tw-chip--${tone}`;
  return <span className={`tw-chip${toneClass}`}>+{xp} XP</span>;
}

export function Chip({
  children,
  tone = "black",
}: {
  children: ReactNode;
  tone?: "black" | "yellow" | "red" | "outline" | "soft";
}) {
  const toneClass = tone === "black" ? "" : ` tw-chip--${tone}`;
  return <span className={`tw-chip${toneClass}`}>{children}</span>;
}

export function TwProgress({
  value,
  tone = "yellow",
  track = "light",
  thin = false,
  label,
}: {
  value: number;
  tone?: "yellow" | "black" | "red";
  track?: "light" | "dark" | "glass";
  thin?: boolean;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const trackClass = track === "light" ? "" : ` tw-progress--${track}`;
  const fillClass = tone === "yellow" ? "" : ` tw-progress__fill--${tone}`;
  return (
    <div
      className={`tw-progress${trackClass}${thin ? " tw-progress--thin" : ""}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`tw-progress__fill${fillClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function GlassCard({ eyebrow, value, caption }: { eyebrow: string; value: ReactNode; caption?: ReactNode }) {
  return (
    <div className="tw-glass">
      <span className="tw-eyebrow">{eyebrow}</span>
      <span className="tw-stat">{value}</span>
      {caption ? <span className="tw-small">{caption}</span> : null}
    </div>
  );
}

export function Avatar({ initials, size = "md", tone = "yellow" }: { initials: string; size?: "md" | "lg"; tone?: "yellow" | "dark" }) {
  return (
    <span className={`tw-avatar${size === "lg" ? " tw-avatar--lg" : ""}${tone === "dark" ? " tw-avatar--dark" : ""}`} aria-hidden>
      {initials}
    </span>
  );
}

export function initialsOf(name: string | null | undefined, fallback = "TW"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="tw-placeholder">
      <Eyebrow>Totto Way</Eyebrow>
      <h2 className="tw-title-md">{title}</h2>
      <p className="tw-muted">{body}</p>
    </div>
  );
}
