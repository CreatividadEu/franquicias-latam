"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { requestSandboxReport } from "@/lib/sandbox/actions";
import { SANDBOX_METHOD_PHASES } from "@/lib/sandbox/phases";
import { READINESS_AXES, type ReadinessScores } from "@/lib/sandbox/schemas";
import PhaseFrame from "./PhaseFrame";
import { rise } from "./motion";
import { useSandbox } from "./SandboxProvider";

const FALLBACK_SCHEDULE_URL = "https://franquiciaslatam.com/franquiciar";

/**
 * Radar de cinco ejes en SVG puro. Placeholder de M1: dibuja la tela siempre y
 * el polígono cuando la sesión ya tiene `readinessScores` (Estrategia, M3).
 */
function MiniRadar({ scores, labels }: { scores: ReadinessScores | null; labels: Record<string, string> }) {
  const size = 260;
  const c = size / 2;
  const r = 84; // deja aire para las etiquetas de los ejes (radio 1.22r)
  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / READINESS_AXES.length;
    return [c + Math.cos(angle) * r * value, c + Math.sin(angle) * r * value] as const;
  };
  const ring = (v: number) => READINESS_AXES.map((_, i) => point(i, v).join(",")).join(" ");
  const polygon = scores
    ? READINESS_AXES.map((axis, i) => point(i, Math.max(0, Math.min(100, scores[axis])) / 100).join(",")).join(" ")
    : null;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[280px]" role="img" aria-label="Radar">
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      {READINESS_AXES.map((axis, i) => {
        const [x, y] = point(i, 1);
        const [lx, ly] = point(i, 1.22);
        return (
          <g key={axis}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--sb-muted)"
              style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              {labels[axis]}
            </text>
          </g>
        );
      })}
      {polygon && (
        <motion.polygon
          points={polygon}
          fill="color-mix(in srgb, var(--sb-accent) 22%, transparent)"
          stroke="var(--sb-accent)"
          strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ transformOrigin: "50% 50%" }}
        />
      )}
    </svg>
  );
}

/** 4.6 Reporte (1'): take-homes, radar, CTA y envío del PDF. */
export default function ReportScreen() {
  const { session, t, messages, track, calendarUrl } = useSandbox();
  const result = session.result;
  const [email, setEmail] = useState(result?.sentToEmail ?? "");
  const [state, setState] = useState<"idle" | "saved" | "error">(result?.sentToEmail ? "saved" : "idle");
  const [pending, startTransition] = useTransition();
  const [interest, setInterest] = useState<"bootcamp" | "consultoria" | null>(null);

  const takeHomes = messages.report.takeHomes as Record<string, string>;
  const scheduleUrl = calendarUrl ?? FALLBACK_SCHEDULE_URL;

  const takeHomeState = (phaseId: string): string | null => {
    if (!result) return null;
    if (phaseId === "estrategia" && result.headline) return result.headline;
    return null;
  };

  const submit = () => {
    startTransition(async () => {
      const res = await requestSandboxReport(session.slug, email);
      setState(res.ok ? "saved" : "error");
    });
  };

  const choose = (option: "bootcamp" | "consultoria") => {
    setInterest(option);
    track("cta_interest", { option });
  };

  return (
    <PhaseFrame phase="reporte" kicker={t("report.kicker")} hideNext wide>
      {/* Take-home strip */}
      <section aria-label={t("report.takeHomesLabel")}>
        <p className="sb-kicker mb-3">{t("report.takeHomesLabel")}</p>
        <ol className="sb-scroll -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {SANDBOX_METHOD_PHASES.map((p, i) => {
            const value = takeHomeState(p.id);
            return (
              <motion.li
                key={p.id}
                {...rise(0.1 + i * 0.08, 12)}
                className={`sb-card flex w-[230px] shrink-0 snap-start flex-col p-5 lg:w-auto ${value ? "sb-card-strong" : ""}`}
              >
                <span className="sb-num text-[11px] font-semibold text-[var(--sb-accent)]">0{i + 1}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sb-muted)]">
                  {messages.phases[p.id].label}
                </span>
                <span className="mt-3 text-[15px] font-semibold leading-snug">{takeHomes[p.id]}</span>
                <span className={`mt-auto pt-5 text-[12px] leading-relaxed ${value ? "sb-serif text-base text-[var(--sb-text)]" : "text-[var(--sb-muted)]"}`}>
                  {value ?? t("report.takeHomePending")}
                </span>
              </motion.li>
            );
          })}
        </ol>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Radar */}
        <motion.section {...rise(0.3)} className="sb-card p-6" aria-label={t("report.radarLabel")}>
          <p className="sb-kicker">{t("report.radarLabel")}</p>
          <div className="mt-4">
            <MiniRadar scores={result?.readinessScores ?? null} labels={messages.report.radarAxes} />
          </div>
          {!result?.readinessScores && (
            <p className="mt-2 text-center text-[12px] text-[var(--sb-muted)]">{t("report.radarPending")}</p>
          )}
        </motion.section>

        {/* CTA + email */}
        <motion.section {...rise(0.4)} className="flex flex-col gap-4">
          <p className="sb-kicker">{t("report.nextStepLabel")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["bootcamp", "consultoria"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                aria-pressed={interest === option}
                className={`sb-card p-5 text-left transition-colors ${
                  interest === option ? "border-[var(--sb-accent)]/60 bg-[color-mix(in_srgb,var(--sb-accent)_8%,transparent)]" : "hover:border-[var(--sb-border-strong)]"
                }`}
              >
                <span className="sb-serif block text-2xl leading-tight">{t(`report.cta.${option}`)}</span>
                <span className="mt-2 block text-[12px] uppercase tracking-[0.16em] text-[var(--sb-muted)]">
                  {t(`report.cta.${option}Meta`)}
                </span>
              </button>
            ))}
          </div>
          <a
            href={scheduleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("cta_schedule", { interest, url: scheduleUrl })}
            className="sb-btn sb-btn-primary h-12"
          >
            {t("report.cta.schedule")}
            <span aria-hidden>→</span>
          </a>

          <form
            className="sb-card mt-2 flex flex-col gap-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor="sb-report-email" className="sb-kicker">
              {t("report.email.label")}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="sb-report-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state !== "idle") setState("idle");
                }}
                placeholder={t("report.email.placeholder")}
                className="sb-input"
              />
              <button type="submit" disabled={pending || !email} className="sb-btn sb-btn-ghost shrink-0">
                {t("report.email.cta")}
              </button>
            </div>
            {state === "saved" && <p className="text-[13px] text-[var(--sb-teal)]">{t("report.email.saved")}</p>}
            {state === "error" && <p className="text-[13px] text-[var(--sb-amber)]">{t("report.email.error")}</p>}
          </form>
        </motion.section>
      </div>

      <motion.p {...rise(0.55)} className="sb-serif mt-14 text-center text-2xl text-[var(--sb-accent)] sm:text-3xl">
        {t("report.closing")}
      </motion.p>
    </PhaseFrame>
  );
}
