import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  FolderKanban,
  LineChart,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { DashboardPreview } from "@/components/home/DashboardPreview";

const trustPoints = [
  "Financiado por BID",
  "Ejecutado con Naciones Unidas",
  "+500 negocios desarrollados",
  "Metodolog\u00eda validada globalmente",
];

const programCards: Array<{
  title: string;
  bullets: string[];
  icon: LucideIcon;
}> = [
  {
    title: "DESARROLLAMOS",
    bullets: ["Modelo de negocio", "Manuales y procesos", "Estructura financiera"],
    icon: FolderKanban,
  },
  {
    title: "OPTIMIZAMOS",
    bullets: ["Rentabilidad", "Operaciones", "Pricing efectivo"],
    icon: LineChart,
  },
  {
    title: "COMERCIALIZAMOS",
    bullets: [
      "Venta de franquicias",
      "Leads e inversionistas",
      "Expansi\u00f3n estructurada",
    ],
    icon: Megaphone,
  },
];

const processSteps = [
  {
    title: "Diagn\u00f3stico estrat\u00e9gico",
    description: "Evaluamos si tu negocio es franquiciable.",
  },
  {
    title: "Desarrollo del sistema",
    description: "Creamos modelo financiero, manuales y estructura.",
  },
  {
    title: "Expansi\u00f3n y comercializaci\u00f3n",
    description: "Generamos demanda e inversionistas.",
  },
];

function MiniDiagnosticForm() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.55)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Diagn&oacute;stico express
      </p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        &iquest;TU NEGOCIO ES FRANQUICIABLE?
      </h3>
      <p className="mt-2 text-sm text-slate-600 sm:text-base">
        En 30 segundos te lo decimos.
      </p>

      <form className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Tipo de negocio</span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-[#2860E7] focus:outline-none focus:ring-4 focus:ring-[rgba(40,96,231,0.18)]"
            defaultValue=""
            aria-label="Tipo de negocio"
          >
            <option value="" disabled>
              Selecciona una opci&oacute;n
            </option>
            <option value="retail">Retail</option>
            <option value="servicios">Servicios</option>
            <option value="restaurantes">Restaurantes</option>
            <option value="salud">Salud y bienestar</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Facturaci&oacute;n mensual
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-[#2860E7] focus:outline-none focus:ring-4 focus:ring-[rgba(40,96,231,0.18)]"
            defaultValue=""
            aria-label="Facturaci&oacute;n mensual"
          >
            <option value="" disabled>
              Selecciona un rango
            </option>
            <option value="under-50m">Menos de $50M COP</option>
            <option value="50m-150m">$50M - $150M COP</option>
            <option value="150m-300m">$150M - $300M COP</option>
            <option value="300m-plus">M&aacute;s de $300M COP</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">N&uacute;mero de sedes</span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-[#2860E7] focus:outline-none focus:ring-4 focus:ring-[rgba(40,96,231,0.18)]"
            defaultValue=""
            aria-label="N&uacute;mero de sedes"
          >
            <option value="" disabled>
              Selecciona una opci&oacute;n
            </option>
            <option value="1">1 sede</option>
            <option value="2-5">2 a 5 sedes</option>
            <option value="6-15">6 a 15 sedes</option>
            <option value="15-plus">M&aacute;s de 15 sedes</option>
          </select>
        </label>

        <button
          type="button"
          className="w-full rounded-xl bg-[#2860E7] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1F52CC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)] sm:text-base"
        >
          Obtener diagn&oacute;stico &rarr;
        </button>
      </form>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-[#f8fafc] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          C&Oacute;MO FUNCIONA
        </h2>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-4 sm:space-y-5">
            {processSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.5)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#2860E7] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <MiniDiagnosticForm />
        </div>
      </div>
    </section>
  );
}

function MethodologyStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm">
          METODOLOG&Iacute;A VALIDADA INTERNACIONALMENTE
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-2">
            <Image
              src="/logos_clientes/logo_bid.svg"
              alt="BID"
              width={104}
              height={28}
              className="h-5 w-auto grayscale opacity-70"
            />
          </span>
          {["Naciones Unidas", "Naciones Unidas"].map((logo, index) => (
            <span
              key={`${logo}-${index}`}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 sm:text-sm"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeHeroFranchise() {
  return (
    <>
      <section
        id="proceso"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#f8fbff] to-[#f2f6ff] py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(1100px,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.2),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="relative">
              <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                Convierte tu Negocio en una Franquicia.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
                Desarrollamos, optimizamos y comercializamos negocios con la metodolog&iacute;a premiada por el BID y organismos internacionales.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center rounded-xl bg-[#2860E7] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#1F52CC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.35)]"
                >
                  Evaluar mi negocio &rarr;
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Ver c&oacute;mo funciona
                </a>
              </div>

              <ul className="mt-7 grid gap-3 text-sm sm:grid-cols-2 sm:text-base">
                {trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-3.5 py-2.5 text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 lg:mt-0 scroll-fade-in">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>
      <HowItWorks />
      <MethodologyStrip />
    </>
  );
}
