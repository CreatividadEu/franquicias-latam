import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { BarChart, AreaTrendChart } from "@/components/benitez-os/benitez-charts";
import {
  InfoPill,
  MetricCard,
  WorkspaceHeader,
  formatCop,
  formatPercent,
} from "@/components/benitez-os/benitez-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  benitezCapabilities,
  benitezDashboardStats,
  benitezLandingHighlights,
  benitezModulePreview,
  benitezOpportunitySignals,
  benitezRecruitmentPipeline,
  benitezSalesTrend,
} from "@/data/benitez-os";

const moduleIcons = {
  "/benitez-os/dashboard": LayoutDashboard,
  "/benitez-os/recruitment": BriefcaseBusiness,
  "/benitez-os/academy": BookOpenCheck,
  "/benitez-os/operations": MapPinned,
};

export default function BenitezOsOverviewPage() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        badge="Benítez OS"
        title="Talento, formación, operación y rentabilidad en una sola plataforma"
        description="Un vertical SaaS pensado para cadenas de restaurantes experienciales: recluta mejor, entrena con contexto real de negocio y opera con visibilidad ejecutiva multi-sede."
        meta={[
          "Diseñado para cadenas multi-punto",
          "Sin integraciones reales para esta demo",
          "Narrativa enterprise reusable para otros clientes",
        ]}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/dashboard">Explorar dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/recruitment">
                Solicitar demo privada
                <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ventas consolidadas"
          value={formatCop(benitezDashboardStats.totalSales, true)}
          hint="Visión total de la cadena con drill-down inmediato por sede."
          icon={Building2}
          tone="default"
        />
        <MetricCard
          title="Vacantes priorizadas"
          value={benitezDashboardStats.openVacancies.toString()}
          hint="Hiring intelligence para cubrir antes lo que más impacta la operación."
          icon={BriefcaseBusiness}
          tone="warning"
        />
        <MetricCard
          title="Formación conectada"
          value={formatPercent(
            Math.round(
              benitezLandingHighlights.find(
                (highlight) => highlight.label === "Cumplimiento formativo con señal operativa"
              )?.value ?? 0
            )
          )}
          hint="La academia se adapta a fricción real de servicio, experiencia y ticket."
          icon={BookOpenCheck}
          tone="accent"
        />
        <MetricCard
          title="Puntos en intervención"
          value={benitezDashboardStats.pointsAtRisk.toString()}
          hint="Señales de riesgo, alertas y acciones recomendadas en una sola capa."
          icon={ShieldAlert}
          tone="danger"
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur sm:p-7">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Qué problema resuelve
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Talento y contratación",
                detail:
                  "Pipeline moderno para scouting, preselección, entrevistas y cierre, con lectura de fit cultural y de servicio.",
              },
              {
                title: "Formación viva",
                detail:
                  "La capacitación deja de ser estática: se activa según señales del punto, del rol y del colaborador.",
              },
              {
                title: "Inteligencia gerencial",
                detail:
                  "Ventas, ticket, experiencia, servicio y riesgo operativo conectados para decidir mejor y antes.",
              },
            ].map((problem) => (
              <article
                key={problem.title}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5"
              >
                <p className="text-lg font-semibold tracking-[-0.04em] text-slate-950">
                  {problem.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{problem.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(28,25,23,0.92))] p-6 text-white shadow-[0_34px_80px_-36px_rgba(15,23,42,0.6)] sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em]">
                Señales ejecutivas
              </p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Resumen comercial que hace wow en reunión.
              </p>
            </div>
            <Badge className="border-white/15 bg-white/10 text-white/82">
              AI-powered
            </Badge>
          </div>
          <div className="space-y-4">
            {benitezOpportunitySignals.map((signal) => (
              <article
                key={signal.title}
                className="rounded-[24px] border border-white/10 bg-white/6 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-white">
                      {signal.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/68">{signal.detail}</p>
                  </div>
                  {signal.impact ? (
                    <span className="shrink-0 rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                      {signal.impact}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Vista previa del control tower
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Una lectura ejecutiva con señal comercial y operativa al mismo tiempo.
              </p>
            </div>
            <InfoPill>{formatCop(benitezDashboardStats.averageTicket)} ticket promedio</InfoPill>
          </div>

          <AreaTrendChart
            items={benitezSalesTrend.map((item) => ({
              label: item.label,
              value: item.sales,
            }))}
            valueFormatter={(value) => formatCop(value, true)}
          />
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Vista previa del pipeline
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Reclutamiento visible, ordenado y con scoring enfocado en cultura y servicio.
              </p>
            </div>
            <InfoPill>{benitezDashboardStats.openVacancies} vacantes</InfoPill>
          </div>

          <BarChart
            items={benitezRecruitmentPipeline.map((column, index) => ({
              label: column.label,
              value: column.candidates.length,
              hint: index === 0 ? "Ingreso de pool" : "Avance del pipeline",
              highlight: index >= 2,
            }))}
            valueFormatter={(value) => `${value} perfiles`}
            className="h-[280px] grid-cols-5"
          />
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Solución por módulos
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Cuatro frentes conectados que convierten data en acción comercial y operativa.
            </p>
          </div>
          <Badge className="border-slate-200 bg-slate-50 text-slate-700">
            Vertical SaaS premium
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {benitezModulePreview.map((module) => {
            const Icon = moduleIcons[module.href as keyof typeof moduleIcons] ?? LayoutDashboard;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-[28px] border border-slate-200/80 bg-slate-50/75 p-5 transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_24px_46px_-26px_rgba(15,23,42,0.18)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xl font-semibold tracking-[-0.05em] text-slate-950">
                  {module.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {module.description}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  Entrar al módulo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {benitezCapabilities.map((capability) => (
          <article
            key={capability.title}
            className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.18)] backdrop-blur"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-white">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <p className="mt-5 text-lg font-semibold tracking-[-0.04em] text-slate-950">
              {capability.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {capability.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(120,53,15,0.95))] px-6 py-7 text-white shadow-[0_36px_90px_-34px_rgba(15,23,42,0.6)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge className="border-white/12 bg-white/10 text-white/82">
              Enterprise demo
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
              Una narrativa comercial lista para mostrar frente a un cliente grande
            </h2>
            <p className="text-sm leading-7 text-white/72 sm:text-base">
              Benítez OS no se presenta como software suelto. Se presenta como una
              plataforma que mejora contratación, acelera onboarding, profesionaliza
              la formación y da control ejecutivo sobre una operación multi-sede.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/dashboard">Ver control tower</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/operations">
                Abrir demo navegable
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
