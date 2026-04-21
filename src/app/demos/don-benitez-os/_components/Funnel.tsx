type FunnelStage = { label: string; count: number };

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.count));
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = (s.count / max) * 100;
        const conversion = i > 0 ? (s.count / stages[i - 1].count) * 100 : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-32 shrink-0 text-xs text-fl-muted">{s.label}</div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-fl-surface">
              <div
                className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-fl-teal/80 to-fl-purple/60"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex h-full items-center px-3">
                <span className="text-xs font-medium text-fl-text tabular-nums">
                  {s.count.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
            <div className="w-16 shrink-0 text-right text-[11px] text-fl-muted tabular-nums">
              {conversion !== null ? `${conversion.toFixed(0)}%` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
