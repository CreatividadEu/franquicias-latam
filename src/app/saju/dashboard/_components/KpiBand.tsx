/**
 * Banda de 5 indicadores. Sin iconos decorativos: las cifras mandan.
 */
import type { KpiSummary } from "@/lib/saju/metrics";

function Kpi({
  label,
  value,
  suffix,
  hint,
  alert,
}: {
  label: string;
  value: number;
  suffix?: string;
  hint?: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className="cc-card cc-kpi">
      <p className="cc-label">{label}</p>
      <div className="cc-kpi__value">
        <span
          className="cc-num cc-num--xl"
          style={alert ? { color: "var(--cc-alert)" } : undefined}
        >
          {value}
        </span>
        {suffix && <span className="cc-kpi__suffix">{suffix}</span>}
      </div>
      {hint && <p className="cc-hint">{hint}</p>}
    </div>
  );
}

export function KpiBand({ kpis }: { kpis: KpiSummary }) {
  return (
    <div className="cc-kpis">
      <Kpi label="Leads activos" value={kpis.leadsActivos} hint="En pipeline, sin archivar" />
      <Kpi label="Países activos" value={kpis.paisesActivos} hint="Con al menos un lead vivo" />
      <Kpi
        label="En negociación"
        value={kpis.enNegociacion}
        hint="Condiciones sobre la mesa"
      />
      <Kpi
        label="Etapas avanzadas"
        value={kpis.pctAvanzados}
        suffix="%"
        hint="Evaluación interna o superior"
      />
      <Kpi
        label="Acciones · 7 días"
        value={kpis.accionesProximas}
        hint={
          kpis.accionesVencidas > 0 ? (
            <span className="cc-alert-text">
              <span className="cc-num" style={{ fontSize: 12, color: "var(--cc-alert)" }}>
                {kpis.accionesVencidas}
              </span>{" "}
              {kpis.accionesVencidas === 1 ? "acción vencida" : "acciones vencidas"}
            </span>
          ) : (
            "Sin acciones vencidas"
          )
        }
      />
    </div>
  );
}
