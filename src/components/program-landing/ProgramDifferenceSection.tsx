import { BadgeAlert, BadgeCheck } from "lucide-react";
import { programDifferenceCards } from "@/components/program-landing/programLandingData";

export function ProgramDifferenceSection() {
  return (
    <section className="section-grid-bg relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Esto no es consultoría</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Es un programa con metodología, secuencia y salida.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            La diferencia no es semántica. Cambia cómo se ejecuta, cómo se mide
            y qué resultado real obtiene la empresa.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {programDifferenceCards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_20px_48px_-36px_rgba(15,23,42,0.2)]"
            >
              <div className="grid gap-px bg-black/6 md:grid-cols-2">
                <div className="bg-white p-5 sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    <BadgeAlert className="size-3.5" aria-hidden="true" />
                    Consultoría tradicional
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    {card.consulting}
                  </p>
                </div>

                <div className="bg-[linear-gradient(180deg,rgba(239,246,255,0.95)_0%,rgba(255,247,237,0.92)_100%)] p-5 sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7] ring-1 ring-[#2860E7]/10">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Programa Franquicias LATAM
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    {card.program}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
