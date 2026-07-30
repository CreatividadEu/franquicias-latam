"use client";

import { LEGAL_CELLS, LEGAL_FOOT, SECTIONS } from "@/lib/intel/copy";
import { mShort } from "@/lib/intel/format";
import type { ModelResult } from "@/lib/intel/totto-model";
import Section from "./Section";

export default function LegalPanel({ result }: { result: ModelResult }) {
  const { legal, damage } = result;

  const cells = [
    { ...LEGAL_CELLS.min, value: legal.min, tone: "var(--text)" },
    { ...LEGAL_CELLS.max, value: legal.max, tone: "var(--accent)" },
    { ...LEGAL_CELLS.agg, value: legal.aggravated, tone: "var(--accent)" },
    { ...LEGAL_CELLS.iva, value: damage.iva, tone: "var(--bleed)" },
  ];

  return (
    <Section title={SECTIONS.legal} note={SECTIONS.legalNote}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] p-4"
          >
            <p className="intel-eyebrow">{cell.label}</p>
            <p className="mono mt-2 text-[20px] leading-none" style={{ color: cell.tone }}>
              COP {mShort(cell.value)}
            </p>
            <p className="intel-hint mt-2">{cell.detail}</p>
          </div>
        ))}
      </div>

      <p className="intel-hint mt-4">{LEGAL_FOOT}</p>
    </Section>
  );
}
