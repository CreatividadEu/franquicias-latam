"use client";

import { SANDBOX_PHASES, phaseIndex } from "@/lib/sandbox/phases";
import { useSandbox } from "./SandboxProvider";

/**
 * Rail de progreso con las siete paradas (§1). Discreto: puntos + etiquetas
 * pequeñas y una línea que se rellena en teal (color de sistema). Las paradas
 * ya visitadas son botones; el presentador puede saltar a cualquiera.
 */
export default function ProgressRail({ compact = false }: { compact?: boolean }) {
  const { phase, visited, goTo, presenter, messages, t } = useSandbox();
  const current = phaseIndex(phase);
  const last = SANDBOX_PHASES.length - 1;
  const fill = last > 0 ? (current / last) * 100 : 0;

  return (
    <nav aria-label={t("chrome.progressLabel")} className="w-full">
      <ol className="relative flex items-start justify-between">
        {/* Línea de fondo y relleno: de centro a centro de las paradas extremas. */}
        <div
          aria-hidden
          className="absolute top-[3px] h-px bg-white/10"
          style={{ left: `calc(100% / ${SANDBOX_PHASES.length * 2})`, right: `calc(100% / ${SANDBOX_PHASES.length * 2})` }}
        >
          <div
            className="h-full bg-[var(--sb-teal)]/70 transition-[width] duration-700 ease-out"
            style={{ width: `${fill}%` }}
          />
        </div>

        {SANDBOX_PHASES.map((p, i) => {
          const state = i < current ? "done" : i === current ? "current" : "todo";
          const reachable = presenter || visited.includes(p.id) || i <= current;
          const label = messages.phases[p.id].label;
          return (
            <li key={p.id} className="relative flex flex-1 justify-center">
              <button
                type="button"
                disabled={!reachable}
                aria-current={state === "current" ? "step" : undefined}
                aria-label={label}
                onClick={() => goTo(p.id, "rail")}
                className="group flex flex-col items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={[
                    "block size-[7px] rounded-full transition-all duration-500",
                    state === "current"
                      ? "bg-[var(--sb-teal)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--sb-teal)_22%,transparent)]"
                      : state === "done"
                        ? "bg-[var(--sb-teal)]/70"
                        : "bg-white/15",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    state === "current" ? "text-[var(--sb-text)]" : "text-[var(--sb-muted)]",
                    reachable && state !== "current" ? "group-hover:text-[var(--sb-text)]" : "",
                    compact && state !== "current" ? "sr-only" : "",
                  ].join(" ")}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
