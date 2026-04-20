import Link from "next/link";
import { KpiCard } from "./_components/KpiCard";
import { AlertRow } from "./_components/AlertRow";
import { POINTS, latest, consolidatedMTD, ALERTS } from "./_lib/seed";
import { FLAG_COPY } from "./_lib/narrative";

const FLAG_DOT: Record<string, string> = {
  star: "bg-fl-teal",
  "second-best": "bg-fl-teal/70",
  "wait-problem": "bg-red-400",
  ramping: "bg-amber-400",
  "food-cost": "bg-red-400",
  steady: "bg-fl-muted/60",
};

export default function PanoramaPage() {
  const kpis = consolidatedMTD();
  const formattedRevenue = `$${Math.round(kpis.revenue / 1_000_000).toLocaleString("es-CO")}M`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-fl-text">Panorama</h1>
        <p className="mt-1 text-sm text-fl-muted">
          10 puntos · consolidado del mes · {ALERTS.length} alertas activas
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Ingresos MTD" value={formattedRevenue} delta="+8.4% vs. mes anterior" deltaTone="positive" />
        <KpiCard
          label="Ticket promedio"
          value={`$${kpis.avgTicket.toLocaleString("es-CO")}`}
          delta="+$2.1K vs. mes anterior"
          deltaTone="positive"
        />
        <KpiCard label="NPS consolidado" value={`${kpis.nps}`} delta="Kennedy arrastra" deltaTone="negative" />
        <KpiCard label="Vacantes abiertas" value={`${kpis.openPositions}`} delta="6 en Cali · apertura" deltaTone="neutral" />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-fl-text">Alertas IA</h2>
        <p className="mt-0.5 text-xs text-fl-muted">Problemas detectados y ruteados al módulo de acción.</p>
        <div className="mt-3 space-y-2">
          {ALERTS.filter((a) => a.severity !== "low").map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-fl-text">Puntos</h2>
        <p className="mt-0.5 text-xs text-fl-muted">Clic para abrir el pulso del punto.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {POINTS.map((p) => {
            const today = latest(p);
            const waitTone =
              today.waitTimeAvg > 14 ? "text-red-400" : today.waitTimeAvg > 11 ? "text-amber-400" : "text-fl-muted";
            return (
              <Link
                key={p.id}
                href={`/demos/don-benitez-os/pulso?point=${p.id}`}
                className="group rounded-xl border border-fl-border bg-fl-surface p-4 transition-colors hover:border-fl-teal/40"
              >
                <div className="flex items-center justify-between">
                  <span className={`h-2 w-2 rounded-full ${FLAG_DOT[p.flag]}`} aria-hidden />
                  <span className="text-[10px] uppercase tracking-wider text-fl-muted">{p.city}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-fl-text group-hover:text-fl-teal">
                  {p.name}
                </p>
                <p className="mt-0.5 text-[11px] text-fl-muted">{FLAG_COPY[p.flag]}</p>
                <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                  <span className="text-fl-muted">NPS</span>
                  <span className="text-right tabular-nums text-fl-text">{today.nps}</span>
                  <span className="text-fl-muted">Espera</span>
                  <span className={`text-right tabular-nums ${waitTone}`}>{today.waitTimeAvg} min</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
