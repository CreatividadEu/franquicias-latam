"use client";

import type { SandboxPhaseId } from "@/lib/sandbox/phases";
import PhaseFrame from "./PhaseFrame";
import { useSandbox } from "./SandboxProvider";

/**
 * Hito 1: las cinco fases de método aún no tienen su ejercicio. El esqueleto
 * recorre igual las siete paradas para poder ensayar el flujo completo.
 */
export default function PhasePlaceholder({ phase }: { phase: SandboxPhaseId }) {
  const { t, messages } = useSandbox();
  const takeHomes = messages.report.takeHomes as Record<string, string>;
  const takeHome = takeHomes[phase];

  return (
    <PhaseFrame
      phase={phase}
      kicker={t("placeholder.kicker")}
      title={t("placeholder.title", { phase: messages.phases[phase].label })}
    >
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <div className="sb-card p-6 sm:p-8">
          <p className="sb-serif text-3xl leading-tight">{messages.phases[phase].title}</p>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--sb-muted)]">
            {t("placeholder.body")}
          </p>
        </div>
        {takeHome && (
          <div className="sb-card-strong p-6">
            <p className="sb-kicker">{t("placeholder.takeHome")}</p>
            <p className="mt-3 text-[15px] leading-relaxed">{takeHome}</p>
          </div>
        )}
      </div>
    </PhaseFrame>
  );
}
