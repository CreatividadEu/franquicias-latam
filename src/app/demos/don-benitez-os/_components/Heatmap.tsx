"use client";

type HeatmapProps = {
  rows: number[][];
  rowLabels: string[];
  colLabels: string[];
  intensityColor?: "teal" | "red";
  onCellClick?: (row: number, col: number, value: number) => void;
  highlightedCell?: { row: number; col: number };
};

export function Heatmap({
  rows,
  rowLabels,
  colLabels,
  intensityColor = "teal",
  onCellClick,
  highlightedCell,
}: HeatmapProps) {
  const palette = intensityColor === "teal" ? "0,240,255" : "239,68,68";

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-[2px] text-[11px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-fl-base pr-2 text-right text-fl-muted" />
            {colLabels.map((label, j) => (
              <th key={j} className="px-1 text-center font-normal text-fl-muted">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="sticky left-0 bg-fl-base pr-2 text-right text-fl-muted">
                {rowLabels[i]}
              </td>
              {row.map((v, j) => {
                const isHL =
                  highlightedCell && highlightedCell.row === i && highlightedCell.col === j;
                const alpha = Math.max(0.08, Math.min(0.95, v));
                return (
                  <td
                    key={j}
                    onClick={onCellClick ? () => onCellClick(i, j, v) : undefined}
                    className={`h-8 min-w-[32px] rounded-sm transition-transform ${
                      onCellClick ? "cursor-pointer hover:scale-110" : ""
                    } ${isHL ? "ring-2 ring-fl-teal" : ""}`}
                    style={{ backgroundColor: `rgba(${palette},${alpha})` }}
                    title={`${rowLabels[i]} · ${colLabels[j]}: ${(v * 100).toFixed(0)}%`}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
