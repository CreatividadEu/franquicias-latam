/**
 * Embudo horizontal de las 7 etapas. Cada barra usa el color fijo de su etapa
 * — el mismo que verás en el kanban, en las barras por país y en el drawer.
 * La conversión es etapa→etapa sobre leads que alcanzaron cada nivel.
 */
import { STAGE_COLOR, STAGE_LABEL } from "@/lib/saju/command-center";
import type { FunnelStage } from "@/lib/saju/metrics";

export function PipelineFunnel({ funnel }: { funnel: FunnelStage[] }) {
  const max = Math.max(...funnel.map((row) => row.count), 1);

  return (
    <div className="cc-card cc-card--pad">
      <div className="cc-funnel">
        {funnel.map((row) => {
          const color = STAGE_COLOR[row.stage];
          const width = Math.max((row.count / max) * 100, row.count > 0 ? 6 : 1.5);
          const insideBar = row.count > 0 && width > 12;

          return (
            <div key={row.stage} className="cc-funnel__row">
              <span className="cc-label cc-label--12" style={{ color: "var(--cc-ink-2)" }}>
                {STAGE_LABEL[row.stage]}
              </span>

              <div className="cc-funnel__bar-track">
                <div
                  className="cc-funnel__bar"
                  style={{ width: `${width}%`, background: color.solid }}
                />
                <span
                  className="cc-num cc-funnel__count"
                  style={
                    insideBar
                      ? { color: color.fg, left: 8 }
                      : { left: `calc(${width}% + 8px)` }
                  }
                >
                  {row.count}
                </span>
              </div>

              <span className="cc-num cc-funnel__conv" title="Conversión desde la etapa anterior">
                {row.conversion === null ? "—" : `${row.conversion}%`}
              </span>
            </div>
          );
        })}
      </div>
      <p className="cc-hint" style={{ marginTop: 12 }}>
        Leads que alcanzaron cada etapa · la columna derecha es la conversión desde la anterior.
      </p>
    </div>
  );
}
