import { Building2, ShieldCheck, Workflow } from "lucide-react";
import { ProgramInstitutionalLogosRow } from "@/components/home/ProgramInstitutionalLogosRow";

export function ProgramValidationSection() {
  return (
    <section className="section-grid-bg relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="min-w-0">
            <p className="section-label">Validación institucional</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Este sistema no salió de teoría.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Fue implementado en programas e iniciativas reales de desarrollo
              empresarial, escalamiento y estructuración junto a instituciones
              nacionales e internacionales.
            </p>

            <div className="mt-6 rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_42px_-30px_rgba(15,23,42,0.16)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2860E7]">
                Organizaciones visibles en el proyecto
              </p>
              <ProgramInstitutionalLogosRow className="mt-5" />
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-black/8 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Propaís
                </span>
                <span className="rounded-full border border-black/8 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Gobierno de Corea del Sur
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                title: "Metodología aplicada",
                body: "No es un deck de consultoría. Es un sistema usado en programas reales.",
                icon: Workflow,
              },
              {
                title: "Institucionalidad fuerte",
                body: "La narrativa transmite seriedad, filtro de calidad y capacidad de implementación.",
                icon: Building2,
              },
              {
                title: "Confianza comercial",
                body: "Le da al asesor una base sólida para vender el programa con autoridad.",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[26px] border border-black/8 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.18)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
