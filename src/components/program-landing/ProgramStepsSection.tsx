import { ChartNoAxesCombined, FileCheck2, GitBranchPlus } from "lucide-react";
import { programSteps } from "@/components/program-landing/programLandingData";

const stepIcons = [ChartNoAxesCombined, FileCheck2, GitBranchPlus];

export function ProgramStepsSection() {
  return (
    <section
      id="proceso"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Cómo funciona el programa</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Tres movimientos. Una salida clara.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            Del diagnóstico al sistema replicable y de ahí a una expansión con
            lógica comercial real.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {programSteps.map((step, index) => {
            const Icon = stepIcons[index];

            return (
              <article
                key={step.step}
                className="flex h-full flex-col rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_42px_-30px_rgba(15,23,42,0.16)] sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {step.step}
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF3FF] text-[#2860E7]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-700">
                  {step.description}
                </p>

                <div className="mt-5 space-y-2">
                  {step.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      {outcome}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    Qué detectamos aquí
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {step.detect}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
