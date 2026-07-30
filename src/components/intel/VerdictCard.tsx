"use client";

import { SECTIONS, verdict } from "@/lib/intel/copy";
import type { ModelResult } from "@/lib/intel/totto-model";

export default function VerdictCard({ result }: { result: ModelResult }) {
  return (
    <section
      aria-labelledby="verdict-title"
      className="intel-card intel-rule-accent intel-card-pad"
    >
      <h2 id="verdict-title" className="intel-eyebrow">
        {SECTIONS.verdict} · {result.plan.name}
      </h2>
      <p className="intel-body mt-3 max-w-[76ch] text-[15px]" style={{ color: "var(--text)" }}>
        {verdict(result)}
      </p>
    </section>
  );
}
