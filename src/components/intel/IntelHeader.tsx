import { BRAND } from "@/lib/intel/copy";

export default function IntelHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-block h-[13px] w-[5px] rounded-[1px]"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="mono text-[13px] uppercase"
            style={{ letterSpacing: "0.22em", color: "var(--text)" }}
          >
            {BRAND.wordmark}
          </span>
          <span
            className="mono text-[13px] uppercase"
            style={{ letterSpacing: "0.22em", color: "var(--text-3)" }}
          >
            {BRAND.wordmarkSuffix}
          </span>
        </div>
        <p className="intel-eyebrow">{BRAND.caseTag}</p>
      </div>

      <p className="mono text-[12px] leading-relaxed sm:max-w-[340px] sm:text-right" style={{ color: "var(--text-3)" }}>
        {BRAND.headerRight} ·{" "}
        <span style={{ color: "var(--bleed)" }}>{BRAND.confidential}</span>
      </p>
    </header>
  );
}
