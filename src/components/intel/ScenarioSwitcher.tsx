"use client";

import { useRef } from "react";
import { PLANS, type PlanId } from "@/lib/intel/totto-model";

/**
 * Control segmentado de 4 escenarios. Se comporta como un grupo de radios:
 * flechas para moverse, Home/End a los extremos, un solo tab-stop.
 */
export default function ScenarioSwitcher({
  value,
  onChange,
}: {
  value: PlanId;
  onChange: (plan: PlanId) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (index: number) => {
    const next = ((index % PLANS.length) + PLANS.length) % PLANS.length;
    onChange(PLANS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Escenario de respuesta"
      className="intel-segmented"
      onKeyDown={(event) => {
        const index = PLANS.findIndex((plan) => plan.id === value);
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          move(index + 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          move(index - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          move(0);
        } else if (event.key === "End") {
          event.preventDefault();
          move(PLANS.length - 1);
        }
      }}
    >
      {PLANS.map((plan, index) => {
        const active = plan.id === value;
        return (
          <button
            key={plan.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${plan.name} — ${plan.price}`}
            tabIndex={active ? 0 : -1}
            data-active={active}
            data-tone={plan.id === 0 ? "bleed" : "accent"}
            className="intel-segment"
            onClick={() => onChange(plan.id)}
          >
            <span className="intel-segment-name">{plan.name}</span>
            <span className="intel-segment-price">{plan.price}</span>
          </button>
        );
      })}
    </div>
  );
}
