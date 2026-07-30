"use client";

import {
  GROUPS,
  INPUT_SPECS,
  type InputKey,
  type InputSpec,
  type Inputs,
} from "@/lib/intel/totto-model";
import { cop, num, pctValue } from "@/lib/intel/format";
import { SECTIONS } from "@/lib/intel/copy";

/** Lectura del valor de un supuesto, según su unidad. */
export function formatInput(spec: InputSpec, value: number): string {
  switch (spec.unit) {
    case "u":
      return `${num(value)} u`;
    case "cop":
      return cop(value);
    case "copM":
      return `COP ${num(value)} M`;
    case "pct":
      return pctValue(value, spec.step < 1 ? 1 : 0);
    case "smlmv":
      return `${num(value)} SMLMV`;
    case "count":
      return num(value);
  }
}

function SliderRow({
  spec,
  value,
  onChange,
}: {
  spec: InputSpec;
  value: number;
  onChange: (key: InputKey, value: number) => void;
}) {
  const id = `in-${spec.key}`;
  const fill = ((value - spec.min) / (spec.max - spec.min)) * 100;
  const readout = formatInput(spec, value);

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13.5px] leading-snug" style={{ color: "var(--text-2)" }}>
          {spec.label}
        </label>
        <span className="mono flex-none text-[13px]" style={{ color: "var(--accent)" }}>
          {readout}
        </span>
      </div>

      <input
        id={id}
        type="range"
        className="intel-slider mt-2.5"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        aria-valuetext={readout}
        aria-describedby={spec.hint ? `${id}-hint` : undefined}
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(event) => onChange(spec.key, Number(event.target.value))}
      />

      {spec.hint ? (
        <p id={`${id}-hint`} className="intel-hint mt-1.5">
          {spec.hint}
        </p>
      ) : null}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="intel-chevron"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path d="M2.5 4.25 6 7.75l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function AssumptionsRail({
  inputs,
  onChange,
  onReset,
  dirty,
}: {
  inputs: Inputs;
  onChange: (key: InputKey, value: number) => void;
  onReset: () => void;
  dirty: boolean;
}) {
  return (
    <aside className="intel-card intel-card-pad" aria-label={SECTIONS.assumptions}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="intel-section-title">{SECTIONS.assumptions}</h2>
        {dirty ? (
          <button
            type="button"
            onClick={onReset}
            className="mono cursor-pointer text-[11.5px] uppercase transition-colors hover:text-[var(--text)]"
            style={{ letterSpacing: "0.08em", color: "var(--text-3)" }}
          >
            Restablecer
          </button>
        ) : (
          <p className="intel-section-note">{SECTIONS.assumptionsNote}</p>
        )}
      </div>

      <div className="flex flex-col">
        {GROUPS.map((group, index) => {
          const specs = INPUT_SPECS.filter((spec) => spec.group === group.id);
          return (
            <details
              key={group.id}
              open
              className="intel-accordion border-t border-[var(--border)] py-3 first:border-t-0"
              style={index === 0 ? { borderTop: "none" } : undefined}
            >
              <summary className="py-1">
                <span className="flex flex-col gap-1">
                  <span className="intel-eyebrow" style={{ color: "var(--text-2)" }}>
                    {group.title}
                  </span>
                  <span className="intel-hint">{group.note}</span>
                </span>
                <Chevron />
              </summary>

              <div className="mt-1 divide-y divide-[var(--border)]">
                {specs.map((spec) => (
                  <SliderRow
                    key={spec.key}
                    spec={spec}
                    value={inputs[spec.key]}
                    onChange={onChange}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </aside>
  );
}
