"use client";

import { KPI_INACTION_HINTS, KPI_LABELS } from "@/lib/intel/copy";
import { mShort, pctFromRatio, times, usdFromM } from "@/lib/intel/format";
import { TRM, type ModelResult } from "@/lib/intel/totto-model";
import { useAnimatedNumber } from "./hooks";

type Tone = "bleed" | "accent" | "pos" | "muted";

const TONE_VAR: Record<Tone, string> = {
  bleed: "var(--bleed)",
  accent: "var(--accent)",
  pos: "var(--pos)",
  muted: "var(--text-3)",
};

function KpiCard({
  label,
  value,
  format,
  hint,
  tone,
}: {
  label: string;
  /** null → el escenario no produce el indicador (se muestra "—"). */
  value: number | null;
  format: (value: number) => string;
  hint: string;
  tone: Tone;
}) {
  const animated = useAnimatedNumber(value ?? 0);

  return (
    <div className="intel-card intel-hover-lift p-5">
      <p className="intel-eyebrow">{label}</p>
      <p
        className="mono mt-2.5 text-[28px] leading-none"
        style={{ color: TONE_VAR[value === null ? "muted" : tone], letterSpacing: "-0.02em" }}
      >
        {value === null ? "—" : format(animated)}
      </p>
      <p className="intel-hint mt-2.5">{hint}</p>
    </div>
  );
}

export default function KpiGrid({ result }: { result: ModelResult }) {
  const { damage, sim, plan } = result;
  const inaction = plan.id === 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label={KPI_LABELS.dano}
        value={damage.danoPL}
        format={(v) => `COP ${mShort(v)}`}
        hint={`≈ ${pctFromRatio(damage.danoPctRev)} de los ingresos Colombia · ≈ ${usdFromM(damage.danoPL, TRM)}`}
        tone="bleed"
      />

      <KpiCard
        label={KPI_LABELS.avoided}
        value={inaction ? null : sim.avoided}
        format={(v) => `COP ${mShort(v)}`}
        hint={
          inaction
            ? KPI_INACTION_HINTS.avoided
            : `Contención anual efectiva de ${pctFromRatio(result.effAnnual, 0)} sobre la pila de daño.`
        }
        tone="accent"
      />

      <KpiCard
        label={KPI_LABELS.recovered}
        value={inaction ? null : sim.recoveredSales}
        format={(v) => `COP ${mShort(v)}`}
        hint={
          inaction
            ? KPI_INACTION_HINTS.recovered
            : `Ingreso que vuelve al canal legítimo (efectividad media ${pctFromRatio(sim.avgEff, 0)}).`
        }
        tone="accent"
      />

      <KpiCard
        label={KPI_LABELS.legal}
        value={inaction ? 0 : sim.recNet}
        format={(v) => `COP ${mShort(v)}`}
        hint={
          inaction
            ? KPI_INACTION_HINTS.legal
            : `Neto de success fee, sobre ${pctFromRatio(plan.pipeline, 0)} del pipeline accionable.`
        }
        tone={inaction ? "muted" : "accent"}
      />

      <KpiCard
        label={KPI_LABELS.roi}
        value={sim.roi}
        format={(v) => times(v)}
        hint={
          inaction
            ? KPI_INACTION_HINTS.roi
            : `Sobre una inversión total de COP ${mShort(sim.totalCost)} en el año 1.`
        }
        tone="pos"
      />

      <KpiCard
        label={KPI_LABELS.payback}
        value={sim.payback}
        format={(v) => `M${Math.round(v)}`}
        hint={
          inaction
            ? KPI_INACTION_HINTS.payback
            : "Primer mes con beneficio acumulado en positivo."
        }
        tone="pos"
      />
    </div>
  );
}
