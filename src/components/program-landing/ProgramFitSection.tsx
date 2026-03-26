import { CheckCheck, CircleOff } from "lucide-react";
import {
  programFitBad,
  programFitGood,
} from "@/components/program-landing/programLandingData";

export function ProgramFitSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Calificación de fit</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            No es para todas las empresas. Y eso es parte del valor.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.18)] sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200">
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Apto para
            </div>
            <div className="mt-5 space-y-3">
              {programFitGood.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-black/8 bg-slate-50 px-4 py-3"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <CheckCheck className="size-3.5" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,247,237,0.92)_0%,rgba(255,255,255,1)_100%)] p-6 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.18)] sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-200">
              <CircleOff className="size-3.5" aria-hidden="true" />
              No apto para
            </div>
            <div className="mt-5 space-y-3">
              {programFitBad.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-white/90 px-4 py-3"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                    <CircleOff className="size-3.5" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
