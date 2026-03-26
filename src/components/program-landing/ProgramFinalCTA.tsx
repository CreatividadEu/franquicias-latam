import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { programApplicationHref } from "@/components/program-landing/programLandingData";

export function ProgramFinalCTA() {
  return (
    <section
      id="contacto"
      className="section-grid-bg relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[34px] border border-black/8 bg-white p-8 shadow-[0_28px_70px_-34px_rgba(15,23,42,0.2)] sm:p-10 lg:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="section-label">Aplicación abierta</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Si tu negocio ya vende, el siguiente paso no es improvisar
              expansión. Es estructurarla.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Aplica a la próxima cohorte del Programa de Aceleración de
              Franquicias y descubre si tu negocio está listo para convertirse
              en una red rentable, replicable y vendible.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={programApplicationHref}>
                  Aplicar al Programa
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#video-hero">Ver Diagnóstico en Vivo</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
