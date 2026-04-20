import { useId } from "react";

import { cn } from "@/lib/utils";

type BarChartItem = {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
};

type AreaTrendItem = {
  label: string;
  value: number;
};

type HeatmapRow = {
  label: string;
  values: Array<{
    label: string;
    value: number;
  }>;
};

function valueToOpacity(value: number) {
  return 0.12 + Math.max(0, Math.min(1, value / 100)) * 0.72;
}

export function BarChart({
  items,
  className,
  valueFormatter,
}: {
  items: BarChartItem[];
  className?: string;
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("grid h-[280px] grid-cols-2 gap-4 sm:grid-cols-5 xl:grid-cols-10", className)}>
      {items.map((item) => {
        const height = Math.max((item.value / maxValue) * 100, 12);

        return (
          <div key={item.label} className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-1 items-end">
              <div className="relative flex h-full w-full items-end overflow-hidden rounded-[22px] border border-slate-200/80 bg-slate-100/85 p-2">
                <div
                  className={cn(
                    "w-full rounded-[16px] bg-gradient-to-t transition-all duration-500",
                    item.highlight
                      ? "from-amber-500 via-orange-400 to-yellow-200"
                      : "from-slate-950 via-slate-700 to-slate-400"
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                {item.label}
              </p>
              <p className="truncate text-sm font-semibold tracking-[-0.03em] text-slate-900">
                {valueFormatter ? valueFormatter(item.value) : item.value.toString()}
              </p>
              {item.hint ? <p className="text-xs text-slate-500">{item.hint}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AreaTrendChart({
  items,
  className,
  valueFormatter,
}: {
  items: AreaTrendItem[];
  className?: string;
  valueFormatter?: (value: number) => string;
}) {
  const areaGradientId = useId();
  const lineGradientId = useId();
  const width = 100;
  const height = 44;
  const padding = 5;
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const minValue = Math.min(...items.map((item) => item.value), maxValue);
  const range = Math.max(maxValue - minValue, 1);

  const points = items.map((item, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(items.length - 1, 1);
    const y =
      height -
      padding -
      ((item.value - minValue) / range) * (height - padding * 2);
    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? width} ${
    height - padding
  } L ${points[0]?.x ?? padding} ${height - padding} Z`;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.03),rgba(255,255,255,0.65))] p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
          <defs>
            <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217,119,6,0.55)" />
              <stop offset="100%" stopColor="rgba(217,119,6,0.05)" />
            </linearGradient>
            <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {[0.2, 0.4, 0.6, 0.8].map((fraction) => (
            <line
              key={fraction}
              x1={padding}
              x2={width - padding}
              y1={padding + fraction * (height - padding * 2)}
              y2={padding + fraction * (height - padding * 2)}
              stroke="rgba(148,163,184,0.25)"
              strokeDasharray="1.8 2.4"
              strokeWidth="0.5"
            />
          ))}

          <path d={areaPath} fill={`url(#${areaGradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${lineGradientId})`}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point) => (
            <circle
              key={point.label}
              cx={point.x}
              cy={point.y}
              r="1.6"
              fill="#0f172a"
              stroke="#fff"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[-0.03em] text-slate-900">
              {valueFormatter ? valueFormatter(item.value) : item.value.toString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoreRing({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#score-ring)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
          <defs>
            <linearGradient id="score-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tracking-[-0.08em] text-slate-950">
            {value}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            score
          </span>
        </div>
      </div>
      <p className="text-center text-sm text-slate-600">{label}</p>
    </div>
  );
}

export function HeatmapGrid({
  rows,
  className,
}: {
  rows: HeatmapRow[];
  className?: string;
}) {
  const headers = rows[0]?.values.map((value) => value.label) ?? [];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/85",
        className
      )}
    >
      <div className="grid grid-cols-[minmax(170px,1.4fr)_repeat(5,minmax(90px,1fr))] border-b border-slate-200/80 bg-slate-50/90 px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        <div>Punto</div>
        {headers.map((header) => (
          <div key={header} className="text-center">
            {header}
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-200/80">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(170px,1.4fr)_repeat(5,minmax(90px,1fr))] items-center px-4 py-3"
          >
            <div className="pr-4">
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-900">
                {row.label}
              </p>
            </div>
            {row.values.map((cell) => (
              <div key={`${row.label}-${cell.label}`} className="px-2">
                <div
                  className="rounded-2xl px-2 py-3 text-center text-sm font-semibold text-slate-900"
                  style={{
                    backgroundColor: `rgba(245, 158, 11, ${valueToOpacity(
                      cell.value
                    )})`,
                  }}
                >
                  {cell.value}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
