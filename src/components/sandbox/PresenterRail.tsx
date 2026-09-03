"use client";

import { SANDBOX_PHASES, formatBudget, nextPhase, phaseDef, phaseIndex } from "@/lib/sandbox/phases";
import { useTicker } from "./hooks";
import { useSandbox } from "./SandboxProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  sessionStartedAt: number;
  phaseStartedAt: number;
};

function mmss(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Rail del consultor (§1, `?presenter=1`): tiempo por fase contra el
 * presupuesto, beats, notas de presentador y control de salto. El cliente
 * nunca lo ve: solo se monta con el flag y vive fuera del área de la fase.
 */
export default function PresenterRail({ open, onClose, sessionStartedAt, phaseStartedAt }: Props) {
  const { phase, t, messages, goTo, next, back, visited } = useSandbox();
  const now = useTicker(open, 1000);

  if (!open) return null;

  const def = phaseDef(phase);
  const elapsed = Math.max(0, Math.round((now - phaseStartedAt) / 1000));
  const total = Math.max(0, Math.round((now - sessionStartedAt) / 1000));
  const ratio = Math.min(1, elapsed / def.budgetSec);
  const over = elapsed > def.budgetSec;
  const guide = messages.presenter.phases[phase];

  const beats = guide.beats.map((beat, i) => {
    const start = guide.beats.slice(0, i).reduce((acc, b) => acc + b.sec, 0);
    const end = start + beat.sec;
    return { ...beat, start, end, active: elapsed >= start && elapsed < end };
  });

  const totalBudget = SANDBOX_PHASES.reduce((acc, p) => acc + p.budgetSec, 0);
  const canNext = Boolean(nextPhase(phase));

  return (
    <aside
      aria-label={t("presenter.title")}
      className="sb-scroll fixed inset-x-0 bottom-0 z-40 max-h-[70dvh] overflow-y-auto rounded-t-3xl border-t border-[var(--sb-border-strong)] bg-[var(--sb-bg-2)] px-5 pb-6 pt-4 shadow-[0_-24px_60px_-30px_rgba(0,0,0,0.8)] lg:sticky lg:top-0 lg:h-dvh lg:max-h-none lg:rounded-none lg:border-l lg:border-t-0 lg:px-5 lg:pt-5 lg:shadow-none"
    >
      <div className="flex items-center justify-between">
        <p className="sb-kicker text-[var(--sb-teal)]">{t("presenter.title")}</p>
        <button type="button" onClick={onClose} className="sb-chip">
          {t("chrome.closePresenter")}
        </button>
      </div>

      {/* Reloj de fase */}
      <section className="sb-card mt-4 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold">{messages.phases[phase].label}</p>
          <p className="sb-num text-xs text-[var(--sb-muted)]">
            {t("presenter.budget")} {formatBudget(def.budgetSec)}
          </p>
        </div>
        <p className={`sb-num mt-2 text-4xl font-medium tabular-nums ${over ? "text-[var(--sb-amber)]" : ""}`}>
          {mmss(elapsed)}
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-[width] duration-1000 ease-linear ${over ? "bg-[var(--sb-amber)]" : "bg-[var(--sb-teal)]"}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[var(--sb-muted)]">
          <span>{over ? t("presenter.overBudget") : t("presenter.elapsed")}</span>
          <span className="sb-num">
            {t("presenter.total")} {mmss(total)} / {mmss(totalBudget)}
          </span>
        </div>
      </section>

      {/* Beats */}
      <section className="mt-4">
        <p className="sb-kicker">{t("presenter.beats")}</p>
        <ol className="mt-2 space-y-1.5">
          {beats.map((beat) => (
            <li
              key={beat.label}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] ${
                beat.active ? "bg-[color-mix(in_srgb,var(--sb-teal)_10%,transparent)] text-[var(--sb-text)]" : "text-[var(--sb-muted)]"
              }`}
            >
              <span>{beat.label}</span>
              <span className="sb-num text-[11px]">{beat.sec}s</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Notas */}
      <section className="mt-4">
        <p className="sb-kicker">{t("presenter.notes")}</p>
        <ul className="mt-2 space-y-2.5">
          {guide.notes.map((note) => (
            <li key={note} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--sb-text)]/85">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[var(--sb-accent)]" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Control */}
      <section className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={back} disabled={phaseIndex(phase) === 0} className="sb-btn sb-btn-ghost h-10 text-sm">
          ← {t("common.back")}
        </button>
        <button type="button" onClick={next} disabled={!canNext} className="sb-btn sb-btn-teal h-10 text-sm">
          {t("presenter.forceNext")} →
        </button>
      </section>

      <section className="mt-4">
        <p className="sb-kicker">{t("presenter.jump")}</p>
        <ol className="mt-2 grid grid-cols-2 gap-1.5">
          {SANDBOX_PHASES.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => goTo(p.id, "jump")}
                aria-current={p.id === phase ? "step" : undefined}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[12px] transition-colors ${
                  p.id === phase
                    ? "border-[var(--sb-teal)]/60 text-[var(--sb-text)]"
                    : visited.includes(p.id)
                      ? "border-[var(--sb-border)] text-[var(--sb-text)]/80 hover:border-[var(--sb-border-strong)]"
                      : "border-[var(--sb-border)] text-[var(--sb-muted)] hover:border-[var(--sb-border-strong)]"
                }`}
              >
                <span>
                  <span className="sb-num mr-1.5 text-[var(--sb-muted)]">{i + 1}</span>
                  {messages.phases[p.id].label}
                </span>
                <span className="sb-num text-[11px] text-[var(--sb-muted)]">{formatBudget(p.budgetSec)}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--sb-muted)]">{t("presenter.shortcuts")}</p>
      </section>
    </aside>
  );
}
