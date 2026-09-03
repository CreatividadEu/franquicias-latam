"use client";

import type { SandboxPhaseId } from "@/lib/sandbox/phases";
import { useSandbox } from "./SandboxProvider";

/**
 * Franja de método (§4): 3–5 palabras que nombran lo que hacemos en el
 * proyecto real. El ejercicio se lee como una muestra del método, no un juego.
 */
export default function MethodStrip({ phase }: { phase: SandboxPhaseId }) {
  const { messages } = useSandbox();
  const steps = messages.phases[phase].method;
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sb-muted)]">
          <span>{step}</span>
          {i < steps.length - 1 && (
            <span aria-hidden className="text-[var(--sb-accent)]">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
