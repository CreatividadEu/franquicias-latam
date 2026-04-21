import { POINTS, latest } from "../_lib/seed";
import { POINT_NAMES } from "../_lib/narrative";

function fmt(n: number) {
  return n.toLocaleString("es-CO");
}

export function FinancialTable() {
  const rows = POINTS.map((p) => {
    const last30 = p.daily.slice(-30);
    const revenue = last30.reduce((a, d) => a + d.revenue, 0);
    const foodPct = last30.reduce((a, d) => a + d.foodCostPct, 0) / last30.length;
    const laborPct = last30.reduce((a, d) => a + d.laborCostPct, 0) / last30.length;
    const ebitdaPct = 100 - foodPct - laborPct - 18; // 18% opex asumido
    const ebitda = Math.round((revenue * ebitdaPct) / 100);
    return {
      id: p.id,
      name: POINT_NAMES[p.id],
      revenue,
      foodPct,
      laborPct,
      ebitda,
      ebitdaPct,
      spark: last30.map((d) => d.revenue),
      todayFood: latest(p).foodCostPct,
    };
  });

  const totalRevenue = rows.reduce((a, r) => a + r.revenue, 0);
  const avgFood = rows.reduce((a, r) => a + r.foodPct, 0) / rows.length;
  const avgLabor = rows.reduce((a, r) => a + r.laborPct, 0) / rows.length;
  const totalEbitda = rows.reduce((a, r) => a + r.ebitda, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-fl-border bg-fl-surface">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-fl-border bg-fl-base/50 text-[10px] uppercase tracking-wider text-fl-muted">
            <th className="px-4 py-3 text-left">Punto</th>
            <th className="px-4 py-3 text-right">Ingresos 30d</th>
            <th className="px-4 py-3 text-right">Food %</th>
            <th className="px-4 py-3 text-right">Labor %</th>
            <th className="px-4 py-3 text-right">EBITDA</th>
            <th className="px-4 py-3 text-right">EBITDA %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const foodOverMedian = r.foodPct > avgFood + 1.5;
            return (
              <tr key={r.id} className="border-b border-fl-border/50 hover:bg-fl-base/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-fl-text">{r.name}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Spark values={r.spark} />
                    <span className="tabular-nums text-fl-text">${fmt(Math.round(r.revenue / 1000))}K</span>
                  </div>
                </td>
                <td className={`px-4 py-3 text-right tabular-nums ${foodOverMedian ? "text-red-400 font-medium" : "text-fl-text"}`}>
                  {r.foodPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-fl-text">{r.laborPct.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right tabular-nums text-fl-text">${fmt(Math.round(r.ebitda / 1000))}K</td>
                <td className="px-4 py-3 text-right tabular-nums text-fl-teal">{r.ebitdaPct.toFixed(1)}%</td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-fl-border bg-fl-base/50 font-medium">
            <td className="px-4 py-3 text-fl-muted">Benchmark cadena</td>
            <td className="px-4 py-3 text-right tabular-nums">${fmt(Math.round(totalRevenue / 1000))}K</td>
            <td className="px-4 py-3 text-right tabular-nums">{avgFood.toFixed(1)}%</td>
            <td className="px-4 py-3 text-right tabular-nums">{avgLabor.toFixed(1)}%</td>
            <td className="px-4 py-3 text-right tabular-nums">${fmt(Math.round(totalEbitda / 1000))}K</td>
            <td className="px-4 py-3 text-right tabular-nums text-fl-teal">
              {((totalEbitda / totalRevenue) * 100).toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 60},${20 - ((v - min) / range) * 18}`)
    .join(" ");
  return (
    <svg width="60" height="20" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="rgba(0,240,255,0.6)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
