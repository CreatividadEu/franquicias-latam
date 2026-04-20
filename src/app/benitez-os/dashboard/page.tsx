import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleAlert,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { AreaTrendChart, BarChart } from "@/components/benitez-os/benitez-charts";
import {
  InsightListCard,
  MetricCard,
  WorkspaceHeader,
  formatCop,
  formatPercent,
} from "@/components/benitez-os/benitez-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  benitezDashboardStats,
  benitezExecutiveSummary,
  benitezGlobalAlerts,
  benitezLocationRanking,
  benitezOpportunitySignals,
  benitezSalesTrend,
} from "@/data/benitez-os";

export default function BenitezDashboardPage() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        badge="Executive dashboard"
        title="Control tower gerencial para intervenir antes de que el problema golpee ventas"
        description="Ventas, ticket promedio, formación, vacantes, experiencia y riesgo operativo consolidados en una sola vista ejecutiva."
        meta={[
          `${benitezDashboardStats.pointsAtRisk} sedes necesitan intervención`,
          `${benitezDashboardStats.overdueTraining} entrenamientos vencidos o incompletos`,
          `${benitezDashboardStats.openVacancies} vacantes activas`,
        ]}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/operations">Ver operaciones</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/recruitment">
                Ir a recruitment
                <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          title="Ventas totales"
          value={formatCop(benitezDashboardStats.totalSales, true)}
          hint="Facturación mensual consolidada de la red."
          icon={Building2}
          tone="default"
        />
        <MetricCard
          title="Ticket promedio"
          value={formatCop(benitezDashboardStats.averageTicket)}
          hint="Venta media capturada por mesa en la cadena."
          icon={TrendingUp}
          tone="accent"
        />
        <MetricCard
          title="Puntos en riesgo"
          value={benitezDashboardStats.pointsAtRisk.toString()}
          hint="Sedes con señal de intervención por score y alertas combinadas."
          icon={CircleAlert}
          tone="danger"
        />
        <MetricCard
          title="Formación incompleta"
          value={benitezDashboardStats.overdueTraining.toString()}
          hint="Colaboradores con avance formativo por debajo del mínimo objetivo."
          icon={UsersRound}
          tone="warning"
        />
        <MetricCard
          title="Vacantes abiertas"
          value={benitezDashboardStats.openVacancies.toString()}
          hint="Coberturas críticas para proteger experiencia y tiempos."
          icon={BriefcaseBusiness}
          tone="warning"
        />
        <MetricCard
          title="Score global"
          value={benitezDashboardStats.globalScore.toString()}
          hint={`${formatPercent(benitezDashboardStats.chainSatisfaction)} satisfacción promedio en cadena.`}
          icon={Target}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Tendencia consolidada de ingresos
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Lectura rápida para ver estabilidad comercial de la red semana a semana.
              </p>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              Control tower
            </Badge>
          </div>
          <AreaTrendChart
            items={benitezSalesTrend.map((item) => ({
              label: item.label,
              value: item.sales,
            }))}
            valueFormatter={(value) => formatCop(value, true)}
          />
        </section>

        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Ventas por punto
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Ranking comercial comparado entre sedes.
              </p>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              10 puntos
            </Badge>
          </div>
          <BarChart
            items={benitezLocationRanking.map((location, index) => ({
              label: location.zone,
              value: location.monthlySales,
              hint: `${location.globalScore} score`,
              highlight: index <= 2,
            }))}
            valueFormatter={(value) => formatCop(value, true)}
          />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <InsightListCard
          title="AI executive summary"
          description="Resumen ejecutivo simulado para una reunión gerencial o comité de operación."
          items={benitezExecutiveSummary.map((detail, index) => ({
            title: `Lectura ${index + 1}`,
            detail,
          }))}
          tone="accent"
        />

        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Alertas prioritarias
            </p>
          </div>
          <div className="space-y-3">
            {benitezGlobalAlerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      {alert.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{alert.detail}</p>
                  </div>
                  <Badge
                    className={
                      alert.severity === "Alta"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : alert.severity === "Media"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Ranking operativo de puntos
              </p>
              <p className="text-sm leading-6 text-slate-600">
                El ranking mezcla desempeño comercial, servicio, formación y riesgo.
              </p>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              Benchmark interno
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Punto</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Formación</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benitezLocationRanking.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium text-slate-900">
                    <div>
                      <p>{location.name}</p>
                      <p className="text-xs font-normal text-slate-500">{location.manager}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatCop(location.monthlySales, true)}</TableCell>
                  <TableCell>{formatCop(location.averageTicket)}</TableCell>
                  <TableCell>{formatPercent(location.trainingCompliance)}</TableCell>
                  <TableCell>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {location.globalScore}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <InsightListCard
          title="Oportunidades detectadas"
          description="Palancas claras para mover resultados sin esperar integraciones complejas."
          items={benitezOpportunitySignals}
          tone="warning"
        />
      </div>

      <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(120,53,15,0.95))] px-6 py-7 text-white shadow-[0_36px_90px_-34px_rgba(15,23,42,0.6)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <p className="text-sm font-semibold tracking-[-0.03em]">
                Siguiente capa de la narrativa
              </p>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em]">
              Del dashboard a la acción: contratación, formación y operación en el mismo sistema
            </h2>
            <p className="text-sm leading-7 text-white/72 sm:text-base">
              El valor del demo no es solo mostrar métricas. Es demostrar cómo una
              señal gerencial se conecta inmediatamente con un pipeline de hiring,
              una recomendación de entrenamiento y una intervención por punto.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/recruitment">Ver recruitment</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/academy">
                Ver academy
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
