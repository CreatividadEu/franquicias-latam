"use client";

import { useState, useTransition } from "react";
import { BookOpen, CheckCircle2, Clock, Flag, Sparkles, Trophy } from "lucide-react";

export type OnboardingCopy = {
  eyebrows: string[];
  steps: { title: string; body: string }[];
  xpRows: { label: string; xp: string }[];
  next: string;
  finish: string;
  skip: string;
};

export function OnboardingSteps({ copy, onFinish }: { copy: OnboardingCopy; onFinish: () => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const last = step === copy.steps.length - 1;
  const icons = [Sparkles, Trophy, Flag];
  const Icon = icons[step] ?? Sparkles;

  const finish = () => startTransition(() => onFinish());

  return (
    <div className="tw-onboarding__card" key={step}>
      <div className="tw-onboarding__dots" aria-hidden>
        {copy.steps.map((_, i) => (
          <span key={i} className={`tw-onboarding__dot${i === step ? " is-active" : ""}`} />
        ))}
      </div>
      <span className="tw-eyebrow">{copy.eyebrows[step]}</span>
      <div className="tw-icon-tile tw-icon-tile--yellow" aria-hidden>
        <Icon strokeWidth={1.8} />
      </div>
      <h1 className="tw-title-md">{copy.steps[step].title}</h1>
      <p className="tw-muted" style={{ fontSize: 16 }}>
        {copy.steps[step].body}
      </p>

      {step === 1 ? (
        <div className="tw-xp-table">
          {copy.xpRows.map((row, i) => {
            const RowIcon = [BookOpen, CheckCircle2, Flag, Clock][i] ?? BookOpen;
            return (
              <div key={row.label} className="tw-xp-table__row">
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <RowIcon size={16} strokeWidth={1.8} />
                  {row.label}
                </span>
                <span className="tw-chip">{row.xp}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="tw-onboarding__actions">
        <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" onClick={finish} disabled={pending}>
          {copy.skip}
        </button>
        {last ? (
          <button type="button" className="tw-btn tw-btn--yellow" onClick={finish} disabled={pending}>
            {copy.finish}
          </button>
        ) : (
          <button type="button" className="tw-btn tw-btn--black" onClick={() => setStep((s) => s + 1)}>
            {copy.next}
          </button>
        )}
      </div>
    </div>
  );
}
