type KpiCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  hint?: string;
};

export function KpiCard({ label, value, delta, deltaTone = "neutral", hint }: KpiCardProps) {
  const deltaColor =
    deltaTone === "positive"
      ? "text-fl-teal"
      : deltaTone === "negative"
      ? "text-red-400"
      : "text-fl-muted";

  return (
    <div className="rounded-xl border border-fl-border bg-fl-surface p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-fl-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-fl-text tabular-nums">{value}</p>
      {delta && <p className={`mt-1 text-xs ${deltaColor}`}>{delta}</p>}
      {hint && <p className="mt-2 text-[11px] text-fl-muted/80">{hint}</p>}
    </div>
  );
}
