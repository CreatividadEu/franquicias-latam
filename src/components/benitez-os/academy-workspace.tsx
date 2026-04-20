import { BookOpenCheck, BrainCircuit, GraduationCap, TimerReset, Trophy } from "lucide-react";

import {
  benitezAcademyByLocation,
  benitezAcademyRecommendations,
  benitezCollaborators,
  benitezLocationMap,
  benitezModuleMap,
  benitezModules,
  benitezRoleTracks,
  benitezTopCollaborators,
} from "@/data/benitez-os";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MetricCard,
  InsightListCard,
  formatPercent,
} from "@/components/benitez-os/benitez-ui";
import { BarChart } from "@/components/benitez-os/benitez-charts";

export function AcademyWorkspace() {
  const averageProgress = Math.round(
    benitezCollaborators.reduce((total, collaborator) => total + collaborator.progress, 0) /
      benitezCollaborators.length
  );
  const overdue = benitezCollaborators.filter((collaborator) => collaborator.progress < 70).length;
  const topLocation = [...benitezAcademyByLocation].sort(
    (left, right) => right.averageProgress - left.averageProgress
  )[0];
  const laggingLocations = [...benitezAcademyByLocation]
    .sort((left, right) => left.averageProgress - right.averageProgress)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Colaboradores activos"
          value={benitezCollaborators.length.toString()}
          hint="Seguimiento formativo con lectura por sede, rol y señal operativa."
          icon={GraduationCap}
          tone="default"
        />
        <MetricCard
          title="Progreso promedio"
          value={formatPercent(averageProgress)}
          hint="La academia prioriza lo que cada punto necesita mejorar ahora."
          icon={BookOpenCheck}
          tone="accent"
        />
        <MetricCard
          title="Entrenamientos pendientes"
          value={overdue.toString()}
          hint="Personas con menos de 70% de avance y riesgo de impacto en piso."
          icon={TimerReset}
          tone="warning"
        />
        <MetricCard
          title="Punto líder en cumplimiento"
          value={topLocation.locationName.split(" · ")[1] ?? topLocation.locationName}
          hint={`Con ${topLocation.averageProgress}% de avance promedio y liderazgo visible en piso.`}
          icon={Trophy}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Rutas por rol
              </p>
              <p className="text-sm leading-6 text-slate-600">
                La formación cambia según el rol y el dolor del punto, no según un
                calendario fijo.
              </p>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              Adaptive academy
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benitezRoleTracks.map((track) => (
              <article
                key={track.role}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      {track.role}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {track.collaborators} colaboradores
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {track.averageProgress}%
                  </span>
                </div>

                <div className="mt-4">
                  <Progress value={track.averageProgress} className="h-2.5 bg-slate-200" />
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">Módulo sugerido:</span>{" "}
                    {track.suggestedModule}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Score de desempeño:</span>{" "}
                    {track.averagePerformance}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Rezagados:</span>{" "}
                    {track.laggingCount}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <InsightListCard
          title="AI training recommendation"
          description="El sistema recomienda qué enseñar y dónde, según señales reales del negocio."
          items={benitezAcademyRecommendations}
          tone="accent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Cumplimiento por punto
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Los puntos con más fricción requieren intervención diferente.
              </p>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              Multi-sede
            </Badge>
          </div>

          <BarChart
            items={benitezAcademyByLocation.map((location) => ({
              label: location.locationName.split(" · ")[1] ?? location.locationName,
              value: location.averageProgress,
              hint: `${location.laggingCount} rezagados`,
              highlight: location.averageProgress < 78,
            }))}
            valueFormatter={(value) => `${value}%`}
            className="h-[300px]"
          />
        </section>

        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Puntos rezagados y siguiente movimiento
            </p>
          </div>

          <div className="space-y-4">
            {laggingLocations.map((location) => (
              <article
                key={location.locationId}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      {location.locationName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Módulo recomendado ahora: {location.topModule}
                    </p>
                  </div>
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                    {location.averageProgress}%
                  </Badge>
                </div>
                <div className="mt-4">
                  <Progress value={location.averageProgress} className="h-2.5 bg-slate-200" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5">
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Cápsulas activas
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Contenido corto, accionable y conectado a los retos reales del punto.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {benitezModules.map((module) => (
              <article
                key={module.id}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge className="border-slate-200 bg-white text-slate-700">
                    {module.category}
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    {module.duration}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold tracking-[-0.04em] text-slate-950">
                  {module.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
                <p className="mt-4 text-sm font-medium text-slate-900">{module.impact}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
              Top colaboradores por progreso
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Punto</TableHead>
                <TableHead>Avance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benitezTopCollaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell className="font-medium text-slate-900">
                    {collaborator.name}
                  </TableCell>
                  <TableCell>{collaborator.role}</TableCell>
                  <TableCell>
                    {benitezLocationMap[collaborator.locationId]?.zone ??
                      benitezLocationMap[collaborator.locationId]?.city}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[160px]">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{collaborator.status}</span>
                        <span>{formatPercent(collaborator.progress)}</span>
                      </div>
                      <Progress value={collaborator.progress} className="h-2.5 bg-slate-200" />
                      <p className="mt-2 text-xs text-slate-500">
                        Siguiente:{" "}
                        {benitezModuleMap[collaborator.recommendedModuleId]?.title ??
                          "Cultura Benítez"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
