"use client";

import { ANATOMY_LABELS, anatomyNote, SECTIONS } from "@/lib/intel/copy";
import { mShort, pctFromRatio } from "@/lib/intel/format";
import type { ModelResult } from "@/lib/intel/totto-model";
import Section from "./Section";

export default function DamageAnatomy({ result }: { result: ModelResult }) {
  const d = result.damage;

  const rows = [
    { label: ANATOMY_LABELS.lostGP, value: d.lostGP },
    { label: ANATOMY_LABELS.erosion, value: d.erosion },
    { label: ANATOMY_LABELS.clvYear, value: d.clvYear },
    { label: ANATOMY_LABELS.mktLeak, value: d.mktLeak },
    { label: ANATOMY_LABELS.costosIncr, value: d.costosIncr },
  ];

  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Section title={SECTIONS.anatomy} note={anatomyNote(result)}>
      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[14px] leading-snug" style={{ color: "var(--text-2)" }}>
                {row.label}
              </span>
              <span className="mono flex-none text-[14px]" style={{ color: "var(--text)" }}>
                {mShort(row.value)}
                <span style={{ color: "var(--text-3)" }}>
                  {" · "}
                  {pctFromRatio(d.danoPL > 0 ? row.value / d.danoPL : 0, 0)}
                </span>
              </span>
            </div>
            <div className="intel-bar-track mt-2">
              <div className="intel-bar-fill" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-[var(--border-strong)] pt-4">
        <span className="intel-display text-[14px]" style={{ color: "var(--text)" }}>
          {ANATOMY_LABELS.total}
        </span>
        <span className="mono text-[18px]" style={{ color: "var(--bleed)" }}>
          COP {mShort(d.danoPL)}
        </span>
      </div>
    </Section>
  );
}
