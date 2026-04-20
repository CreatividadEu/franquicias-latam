"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Clock3,
  MessageSquareWarning,
  PartyPopper,
  Sparkles,
  Target,
  Ticket,
  UsersRound,
} from "lucide-react";

import {
  benitezLocationRanking,
  benitezLocations,
  benitezOperationsHeatmap,
} from "@/data/benitez-os";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InfoPill,
  InsightListCard,
  MetricCard,
  WorkspaceHeader,
  formatCop,
  formatMinutes,
  formatPercent,
  getRiskBadgeClass,
  getRiskLabel,
} from "@/components/benitez-os/benitez-ui";
import {
  AreaTrendChart,
  HeatmapGrid,
  ScoreRing,
} from "@/components/benitez-os/benitez-charts";

const chainAverages = {
  averageTicket: Math.round(
    benitezLocations.reduce((total, location) => total + location.averageTicket, 0) /
      benitezLocations.length
  ),
  satisfaction: Math.round(
    benitezLocations.reduce((total, location) => total + location.satisfaction, 0) /
      benitezLocations.length
  ),
  serviceMinutes:
    benitezLocations.reduce((total, location) => total + location.serviceMinutes, 0) /
    benitezLocations.length,
  prepMinutes:
    benitezLocations.reduce((total, location) => total + location.prepMinutes, 0) /
    benitezLocations.length,
  upsellRate: Math.round(
    benitezLocations.reduce((total, location) => total + location.upsellRate, 0) /
      benitezLocations.length
  ),
};

export function OperationsWorkspace() {
  const [selectedLocationId, setSelectedLocationId] = useState("circunvalar");
  const selectedLocation =
    benitezLocations.find((location) => location.id === selectedLocationId) ??
    benitezLocations[0];

  const actions = selectedLocation.aiActions.map((detail, index) => ({
    title: `Acción prioritaria ${index + 1}`,
    detail,
  }));

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        badge="Operations intelligence"
        title={`${selectedLocation.name}: desempeño, señales y acciones sugeridas`}
        description="Selecciona un punto y entiende, en segundos, dónde está la fricción operativa, qué está afectando experiencia y qué mover primero."
        meta={[
          `Manager: ${selectedLocation.manager}`,
          `${selectedLocation.teamSize} colaboradores`,
          `${selectedLocation.openVacancies} vacantes activas`,
        ]}
        actions={
          <div className="flex flex-wrap gap-3">
            <Badge className={getRiskBadgeClass(selectedLocation.riskLevel)}>
              {getRiskLabel(selectedLocation.riskLevel)}
            </Badge>
            <Button variant="outline" size="sm">
              Intervención sugerida
            </Button>
          </div>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-white/86 p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Selector de punto de venta
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Cambia de sede y compara el desempeño contra el promedio de la cadena.
            </p>
          </div>
          <InfoPill>10 puntos conectados</InfoPill>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {benitezLocations.map((location) => {
            const active = location.id === selectedLocationId;
            return (
              <button
                key={location.id}
                type="button"
                onClick={() => setSelectedLocationId(location.id)}
                className={`min-w-[180px] rounded-[24px] border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-[0_26px_50px_-28px_rgba(15,23,42,0.5)]"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <p className="text-sm font-semibold tracking-[-0.03em]">{location.zone}</p>
                <p
                  className={`mt-1 text-xs uppercase tracking-[0.16em] ${
                    active ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  {location.city}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <ScoreRing
              value={selectedLocation.globalScore}
              label={selectedLocation.narrative}
            />

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                  Focus de la sede
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLocation.focusModules.map((module) => (
                    <Badge
                      key={module}
                      className="border-slate-200 bg-white text-slate-700"
                    >
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                  Alertas activas
                </p>
                <div className="mt-4 space-y-3">
                  {selectedLocation.alerts.map((alert) => (
                    <div
                      key={alert}
                      className="rounded-2xl border border-rose-100 bg-rose-50/90 px-4 py-3 text-sm leading-6 text-rose-900/80"
                    >
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Ticket promedio"
            value={formatCop(selectedLocation.averageTicket)}
            hint={`Cadena: ${formatCop(chainAverages.averageTicket)} · Delta ${
              selectedLocation.averageTicket - chainAverages.averageTicket >= 0 ? "+" : ""
            }${formatCop(selectedLocation.averageTicket - chainAverages.averageTicket)}`}
            icon={Ticket}
            tone={
              selectedLocation.averageTicket >= chainAverages.averageTicket
                ? "success"
                : "warning"
            }
          />
          <MetricCard
            title="Satisfacción cliente"
            value={formatPercent(selectedLocation.satisfaction)}
            hint={`Promedio red: ${formatPercent(chainAverages.satisfaction)}`}
            icon={UsersRound}
            tone={
              selectedLocation.satisfaction >= chainAverages.satisfaction
                ? "success"
                : "warning"
            }
          />
          <MetricCard
            title="Tiempo de atención"
            value={formatMinutes(selectedLocation.serviceMinutes)}
            hint={`Cadena: ${formatMinutes(chainAverages.serviceMinutes)}`}
            icon={Clock3}
            tone={
              selectedLocation.serviceMinutes <= chainAverages.serviceMinutes
                ? "success"
                : "danger"
            }
          />
          <MetricCard
            title="Tiempo de preparación"
            value={formatMinutes(selectedLocation.prepMinutes)}
            hint={`Cadena: ${formatMinutes(chainAverages.prepMinutes)}`}
            icon={ArrowUpDown}
            tone={
              selectedLocation.prepMinutes <= chainAverages.prepMinutes
                ? "success"
                : "warning"
            }
          />
          <MetricCard
            title="Upsell / venta sugerida"
            value={formatPercent(selectedLocation.upsellRate)}
            hint={`Cadena: ${formatPercent(chainAverages.upsellRate)}`}
            icon={Target}
            tone={
              selectedLocation.upsellRate >= chainAverages.upsellRate
                ? "success"
                : "warning"
            }
          />
          <MetricCard
            title="Celebraciones ejecutadas"
            value={selectedLocation.celebrationsExecuted.toString()}
            hint={`${formatPercent(selectedLocation.celebrationRate)} de cumplimiento del protocolo`}
            icon={PartyPopper}
            tone={selectedLocation.celebrationRate >= 90 ? "accent" : "warning"}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5">
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Tendencia de ventas del punto
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Evolución semanal para entender si la sede está recuperando ritmo o
              degradándose.
            </p>
          </div>
          <AreaTrendChart
            items={selectedLocation.weeklySales.map((value, index) => ({
              label: `Sem ${index + 12}`,
              value,
            }))}
            valueFormatter={(value) => formatCop(value, true)}
          />
        </section>

        <InsightListCard
          title="AI operational actions"
          description="Recomendaciones accionables para corregir la sede antes de que el impacto llegue a ingresos."
          items={actions}
          tone={selectedLocation.riskLevel === "high" ? "danger" : "accent"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Ranking de puntos
            </p>
          </div>
          <div className="space-y-3">
            {benitezLocationRanking.map((location, index) => (
              <article
                key={location.id}
                className={`rounded-[22px] border px-4 py-4 ${
                  location.id === selectedLocation.id
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-slate-50/80 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em]">
                      #{index + 1} · {location.name}
                    </p>
                    <p
                      className={`mt-1 text-xs uppercase tracking-[0.16em] ${
                        location.id === selectedLocation.id
                          ? "text-white/68"
                          : "text-slate-500"
                      }`}
                    >
                      {location.manager}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tracking-[-0.04em]">
                      {location.globalScore}
                    </p>
                    <p
                      className={`text-xs ${
                        location.id === selectedLocation.id
                          ? "text-white/68"
                          : "text-slate-500"
                      }`}
                    >
                      score
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Heatmap de desempeño multi-sede
              </p>
            </div>
            <HeatmapGrid rows={benitezOperationsHeatmap} />
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
            <div className="mb-5 flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-rose-500" />
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Incidencias del punto seleccionado
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Quejas
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                  {selectedLocation.complaints}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Cumplimiento operativo
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                  {formatPercent(selectedLocation.globalScore)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Formación activa
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                  {formatPercent(selectedLocation.trainingCompliance)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
