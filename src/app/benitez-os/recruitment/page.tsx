import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Sparkles,
  Target,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import { RecruitmentBoard } from "@/components/benitez-os/recruitment-board";
import {
  InsightListCard,
  MetricCard,
  WorkspaceHeader,
} from "@/components/benitez-os/benitez-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  benitezCandidates,
  benitezHiringInsights,
  benitezLocationMap,
  benitezOpenRoles,
  benitezRecruitmentPipeline,
  benitezTopCandidates,
} from "@/data/benitez-os";

export default function BenitezRecruitmentPage() {
  const activeCandidates = benitezCandidates.filter(
    (candidate) => candidate.stage !== "hired"
  ).length;
  const averageScore = Math.round(
    benitezCandidates.reduce((total, candidate) => total + candidate.overallScore, 0) /
      benitezCandidates.length
  );
  const timeToHire = 13;

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        badge="Hiring intelligence"
        title="Un pipeline de reclutamiento diseñado para una marca experiencial"
        description="Scouting, preselección, entrevistas, prueba y contratación en una sola vista, con scoring por cultura, servicio y recomendación operativa."
        meta={[
          `${activeCandidates} candidatos activos en pipeline`,
          `${benitezOpenRoles.length} frentes de vacante priorizados`,
          "Recomendaciones AI simuladas por rol y punto",
        ]}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/dashboard">Volver al dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/academy">
                Conectar con onboarding
                <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Candidatos activos"
          value={activeCandidates.toString()}
          hint="Perfiles visibles y comparables en una sola capa."
          icon={UsersRound}
          tone="default"
        />
        <MetricCard
          title="Vacantes abiertas"
          value={benitezOpenRoles.length.toString()}
          hint="Coberturas con contexto real de urgencia operativa."
          icon={BriefcaseBusiness}
          tone="warning"
        />
        <MetricCard
          title="Score promedio"
          value={averageScore.toString()}
          hint="Lectura agregada del fit del pipeline actual."
          icon={Target}
          tone="accent"
        />
        <MetricCard
          title="Time to hire"
          value={`${timeToHire} días`}
          hint="Tiempo objetivo simulado con fast-track en perfiles críticos."
          icon={Clock3}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Vacantes priorizadas por impacto
              </p>
              <p className="text-sm leading-6 text-slate-600">
                El sistema no solo muestra puestos abiertos: muestra cuáles mover
                primero para proteger operación y experiencia.
              </p>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              Multi-punto
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {benitezOpenRoles.map((role) => (
              <article
                key={role.id}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      {role.role} · {benitezLocationMap[role.locationId]?.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{role.note}</p>
                  </div>
                  <Badge
                    className={
                      role.urgency === "Alta"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {role.urgency}
                  </Badge>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {role.count} posición(es)
                </p>
              </article>
            ))}
          </div>
        </section>

        <InsightListCard
          title="AI hiring recommendation"
          description="La capa AI sugiere prioridades, filtros y perfiles críticos para sostener la experiencia de marca."
          items={benitezHiringInsights}
          tone="accent"
        />
      </div>

      <RecruitmentBoard candidates={benitezCandidates} />

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Perfiles más fuertes del pipeline
            </p>
          </div>
          <div className="space-y-3">
            {benitezTopCandidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      {candidate.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {candidate.role} · {candidate.city}
                    </p>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {candidate.overallScore}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {candidate.recommendation}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(120,53,15,0.95))] px-6 py-7 text-white shadow-[0_36px_90px_-34px_rgba(15,23,42,0.6)] sm:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <UserRoundPlus className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[-0.03em]">Narrativa comercial</p>
              <h2 className="text-3xl font-semibold tracking-[-0.06em]">
                Contratación como ventaja competitiva, no como cuello de botella
              </h2>
              <p className="text-sm leading-7 text-white/72 sm:text-base">
                En una marca como Benítez, contratar bien no solo llena turnos:
                define la experiencia, la energía en punto y la capacidad de vender
                más a través del servicio. Este módulo demuestra justamente eso.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {benitezRecruitmentPipeline.map((column) => (
                  <Badge
                    key={column.stage}
                    className="border-white/12 bg-white/10 text-white/82"
                  >
                    {column.label}: {column.candidates.length}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
