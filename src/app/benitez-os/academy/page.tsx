import Link from "next/link";
import { ArrowRight, BookOpenCheck, BrainCircuit, Sparkles } from "lucide-react";

import { AcademyWorkspace } from "@/components/benitez-os/academy-workspace";
import { WorkspaceHeader } from "@/components/benitez-os/benitez-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BenitezAcademyPage() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        badge="Living academy"
        title="Formación viva que se adapta al desempeño de cada punto, rol y colaborador"
        description="La academia deja de ser un repositorio estático y se convierte en un sistema que recomienda qué entrenar según servicio, ticket, celebraciones, tiempos y quejas."
        meta={[
          "Rutas por rol y por punto",
          "Seguimiento por colaborador",
          "Recomendaciones AI simuladas",
        ]}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/recruitment">Ver recruitment</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/operations">
                Ver operaciones
                <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(28,25,23,0.92))] px-6 py-7 text-white shadow-[0_36px_90px_-34px_rgba(15,23,42,0.55)] sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <p className="text-sm font-semibold tracking-[-0.03em]">
                Adaptive training engine
              </p>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
              La formación se mueve con la operación, no contra ella
            </h2>
            <p className="text-sm leading-7 text-white/72 sm:text-base">
              Si un punto cae en ticket promedio, la plataforma sugiere venta
              sugerida. Si cae en experiencia, empuja celebración, hospitalidad o
              manejo de quejas. Si cae en tiempos, reordena foco de líderes y cocina.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: BookOpenCheck,
                title: "Rutas por rol",
                detail: "Mesero, anfitrión, cocina, cajero y líder con foco distinto.",
              },
              {
                icon: BrainCircuit,
                title: "Señal operativa",
                detail: "Cada recomendación responde al dolor real del punto.",
              },
              {
                icon: Sparkles,
                title: "Progreso visible",
                detail: "Seguimiento por colaborador, sede y capa gerencial.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] border border-white/10 bg-white/6 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <p className="mt-4 text-base font-semibold tracking-[-0.03em] text-white">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/68">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AcademyWorkspace />

      <div className="flex flex-wrap gap-3">
        <Badge className="border-slate-200 bg-white text-slate-700">
          Cultura
        </Badge>
        <Badge className="border-slate-200 bg-white text-slate-700">
          Servicio
        </Badge>
        <Badge className="border-slate-200 bg-white text-slate-700">
          Experiencia
        </Badge>
        <Badge className="border-slate-200 bg-white text-slate-700">
          Venta sugerida
        </Badge>
        <Badge className="border-slate-200 bg-white text-slate-700">
          Manejo de quejas
        </Badge>
        <Badge className="border-slate-200 bg-white text-slate-700">
          Operación en hora pico
        </Badge>
      </div>
    </div>
  );
}
