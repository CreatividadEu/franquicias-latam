"use client";

import type { ReactNode } from "react";
import { SANDBOX_PHASE_IDS, phaseIndex, type SandboxPhaseId } from "@/lib/sandbox/phases";
import MethodStrip from "./MethodStrip";
import { useSandbox } from "./SandboxProvider";

type Props = {
  phase: SandboxPhaseId;
  title?: string;
  kicker?: string;
  children: ReactNode;
  nextLabel?: string;
  /** Contenido extra a la izquierda del botón Siguiente. */
  footer?: ReactNode;
  hideNext?: boolean;
  wide?: boolean;
};

/**
 * Patrón global de fase (§4): franja de método → título editorial → cuerpo →
 * «Siguiente» siempre alcanzable (sticky, sin campos obligatorios).
 */
export default function PhaseFrame({
  phase,
  title,
  kicker,
  children,
  nextLabel,
  footer,
  hideNext = false,
  wide = false,
}: Props) {
  const { t, messages, next } = useSandbox();
  const idx = phaseIndex(phase);

  return (
    <div
      className={`mx-auto flex w-full flex-1 flex-col px-5 pt-5 sm:px-8 sm:pt-7 ${
        wide ? "max-w-6xl" : "max-w-5xl"
      }`}
    >
      <MethodStrip phase={phase} />
      <header className="mt-5 sm:mt-7">
        <p className="sb-kicker">
          {kicker ??
            `${messages.phases[phase].label} · ${t("chrome.phaseOf", {
              n: idx + 1,
              total: SANDBOX_PHASE_IDS.length,
            })}`}
        </p>
        <h1 className="sb-title mt-3 max-w-3xl">{title ?? messages.phases[phase].title}</h1>
      </header>

      <div className="mt-8 flex-1 pb-8">{children}</div>

      {!hideNext && (
        <footer className="sticky bottom-0 z-20 -mx-5 mt-auto flex items-center justify-end gap-3 border-t border-[var(--sb-border)] bg-[color-mix(in_srgb,var(--sb-bg)_86%,transparent)] px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
          {footer}
          <button type="button" className="sb-btn sb-btn-primary" onClick={next}>
            {nextLabel ?? t("common.next")}
            <span aria-hidden>→</span>
          </button>
        </footer>
      )}
    </div>
  );
}
