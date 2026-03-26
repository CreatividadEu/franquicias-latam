import { programAdmissionSteps } from "@/components/program-landing/programLandingData";

export function ProgramAdmissionSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Proceso de admisión</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Cohortes pequeñas. Filtro serio.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            No todas las empresas que aplican son admitidas. Buscamos fit real,
            capacidad de ejecución y potencial claro de expansión.
          </p>
        </div>

        <div className="relative mt-10">
          <div
            aria-hidden="true"
            className="absolute left-8 right-8 top-7 hidden h-px bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_0%,rgba(37,99,235,0.35)_50%,rgba(148,163,184,0.08)_100%)] lg:block"
          />

          <div className="grid gap-4 lg:grid-cols-5">
            {programAdmissionSteps.map((step, index) => (
              <article
                key={step}
                className="relative rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.18)]"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3FF] text-lg font-bold text-[#2860E7] ring-1 ring-[#2860E7]/12">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-bold leading-tight text-slate-900">
                  {step}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
