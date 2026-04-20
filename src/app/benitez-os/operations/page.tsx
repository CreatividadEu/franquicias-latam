import Link from "next/link";
import { ArrowRight, MapPinned, ShieldAlert, Sparkles } from "lucide-react";

import { OperationsWorkspace } from "@/components/benitez-os/operations-workspace";
import { WorkspaceHeader } from "@/components/benitez-os/benitez-ui";
import { Button } from "@/components/ui/button";

export default function BenitezOperationsPage() {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        badge="Operations performance"
        title="Desempeño por punto con lectura de riesgo, experiencia y acciones operativas"
        description="Selecciona una sede y conecta satisfacción, servicio, ticket promedio, cumplimiento, celebraciones e incidencias con decisiones concretas."
        meta={[
          "Selector de punto de venta",
          "Heatmap de desempeño multi-sede",
          "Recomendaciones AI simuladas por punto",
        ]}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/benitez-os/dashboard">Ver dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/benitez-os/recruitment">
                Ver hiring intelligence
                <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(120,53,15,0.95))] px-6 py-7 text-white shadow-[0_36px_90px_-34px_rgba(15,23,42,0.55)] sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-amber-300" />
              <p className="text-sm font-semibold tracking-[-0.03em]">
                Control operativo por sede
              </p>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
              La plataforma no solo muestra dónde duele: propone qué hacer
            </h2>
            <p className="text-sm leading-7 text-white/72 sm:text-base">
              El módulo de operations conecta desempeño comercial, experiencia,
              formación y staffing para revelar qué sede requiere intervención y qué
              palancas tienen más probabilidad de mejorar resultado.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: ShieldAlert,
                title: "Señales de riesgo",
                detail: "Ticket, servicio, formación, quejas y celebraciones en una sola lectura.",
              },
              {
                icon: Sparkles,
                title: "Acciones sugeridas",
                detail: "Recomendaciones claras para líderes, operaciones y formación.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] border border-white/12 bg-white/8 p-4"
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

      <OperationsWorkspace />
    </div>
  );
}
