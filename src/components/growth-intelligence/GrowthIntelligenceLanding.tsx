import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  HeartPulse,
  Radar,
  ScanSearch,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  UtensilsCrossed,
  Workflow,
} from "lucide-react";
import { ProgramInstitutionalLogosRow } from "@/components/home/ProgramInstitutionalLogosRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIMARY_CTA_HREF = "/quiz";
const TEAM_CTA_HREF =
  "https://calendly.com/franquicias_latam/programa_aceleradora_franquicias";

const sectionLinks = [
  { href: "#senales", label: "Señales" },
  { href: "#como-funciona", label: "Método" },
  { href: "#rutas", label: "Rutas" },
  { href: "#credibilidad", label: "Credibilidad" },
  { href: "#fit", label: "Fit" },
  { href: "#faq", label: "FAQ" },
];

const blindSpots = [
  {
    icon: CircleDollarSign,
    title: "Estás creciendo, pero la caja sigue apretada",
    description:
      "Tus ingresos avanzan, pero la liquidez no acompaña. El problema no siempre es vender más, sino liberar la caja que ya estás generando.",
  },
  {
    icon: Gauge,
    title: "Hay demanda, pero la operación no escala",
    description:
      "El mercado responde, pero la ejecución se tensa: tiempos, calidad, liderazgo y consistencia empiezan a frenarte.",
  },
  {
    icon: Building2,
    title: "Quieres expandirte, pero el modelo aún no está listo",
    description:
      "La oportunidad existe, pero todavía faltan estructura, repetibilidad y claridad para crecer sin multiplicar el caos.",
  },
  {
    icon: Bot,
    title: "Quieres IA, pero lo que necesitas primero es secuencia",
    description:
      "Automatizar sin diagnóstico suele amplificar desorden. La pregunta no es si implementar IA, sino en qué momento y sobre qué base.",
  },
];

const processSteps = [
  {
    icon: Radar,
    title: "Detectamos señales",
    description:
      "Leemos patrones comerciales, financieros, operativos y de escalabilidad para identificar dónde se está acumulando la fricción.",
  },
  {
    icon: ScanSearch,
    title: "Diagnosticamos el cuello de botella real",
    description:
      "Separamos síntomas de causas. No atacamos ruido; ubicamos la restricción que hoy está limitando crecimiento, caja o expansión.",
  },
  {
    icon: Target,
    title: "Activamos la ruta correcta",
    description:
      "Traducimos el diagnóstico en una dirección concreta: liberar caja, elevar performance, preparar expansión o diseñar transformación IA.",
  },
];

const signalGroups = [
  {
    title: "Comerciales",
    items: [
      "Demanda sin captura suficiente",
      "Conversión inestable",
      "Ticket o mezcla comercial deteriorada",
      "Canales que crecen sin rentabilidad",
    ],
  },
  {
    title: "Financieras",
    items: [
      "Caja atrapada en operación",
      "Márgenes erosionados",
      "Capital de trabajo bajo presión",
      "Inversión sin retorno claro",
    ],
  },
  {
    title: "Operativas",
    items: [
      "Capacidad desalineada con la demanda",
      "Cuellos de botella por proceso",
      "Dependencia excesiva del dueño",
      "Fallas de consistencia multi-sede",
    ],
  },
  {
    title: "Escalabilidad",
    items: [
      "Modelo difícil de replicar",
      "Expansión sin readiness",
      "Estándares poco transferibles",
      "Tecnología sin secuencia estratégica",
    ],
  },
];

const routes = [
  {
    icon: CircleDollarSign,
    title: "Liberación de Caja",
    forWho:
      "Para negocios que venden, pero siguen operando con caja tensionada o con capital atrapado en la ejecución.",
    outcome:
      "Ordena prioridades para capturar liquidez, reducir fricción financiera y volver a crear capacidad de maniobra.",
  },
  {
    icon: Gauge,
    title: "Performance Improvement",
    forWho:
      "Para operadores con demanda real, pero con frenos en productividad, consistencia, rentabilidad o experiencia operativa.",
    outcome:
      "Enfoca la mejora donde más impacta desempeño, margen y capacidad de respuesta sin añadir complejidad innecesaria.",
  },
  {
    icon: Workflow,
    title: "Franchise Readiness",
    forWho:
      "Para negocios con señales de expansión que necesitan validar si el modelo ya puede replicarse de forma vendible y controlada.",
    outcome:
      "Aclara qué debe estructurarse primero para convertir expansión en un sistema, no en una apuesta improvisada.",
  },
  {
    icon: BrainCircuit,
    title: "Transformación IA",
    forWho:
      "Para empresas que quieren automatizar, instrumentar o acelerar decisiones, pero necesitan primero una secuencia estratégica correcta.",
    outcome:
      "Define dónde IA sí genera ventaja, qué bases operativas requiere y cómo implementarla sin digitalizar desorden.",
  },
];

const credibilityBlocks = [
  {
    title: "Experiencia institucional aplicada",
    description:
      "La metodología ya ha sido aplicada en proyectos junto a BID, Naciones Unidas y MinTIC dentro de contextos reales de crecimiento empresarial.",
  },
  {
    title: "Desarrollo productivo y expansión",
    description:
      "También se ha utilizado en iniciativas con Propaís y Gobierno de Corea del Sur para estructurar capacidades de escalamiento.",
  },
  {
    title: "Franquicias, expansión y ejecución LATAM",
    description:
      "La lectura combina práctica en expansión, estructuración de modelos y decisiones operativas en negocios que quieren multiplicarse con criterio.",
  },
  {
    title: "Capacidad financiera, operativa y tecnológica",
    description:
      "No es una mirada aislada. Integra lectura de caja, performance, readiness de expansión y secuencia de transformación.",
  },
];

const fitSegments = [
  {
    icon: UtensilsCrossed,
    title: "Food & Beverage",
    description:
      "Conceptos con flujo, complejidad operativa y presión constante entre demanda, caja y estandarización.",
  },
  {
    icon: Store,
    title: "Retail",
    description:
      "Negocios con tracción comercial que necesitan ordenar margen, inventario, formato y capacidad de réplica.",
  },
  {
    icon: HeartPulse,
    title: "Health & Beauty",
    description:
      "Modelos donde experiencia, consistencia y economics de sede importan tanto como el crecimiento comercial.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Servicios",
    description:
      "Empresas donde el cuello de botella suele estar en capacidad, estandarización, pricing o dependencia del fundador.",
  },
  {
    icon: Building2,
    title: "Conceptos multi-unit",
    description:
      "Operaciones con más de una unidad que necesitan visibilidad para crecer sin perder control ni margen.",
  },
  {
    icon: ShoppingBag,
    title: "Negocios con señales tempranas de expansión",
    description:
      "Empresas que empiezan a ver demanda repetible, nuevos mercados o interés por escalar, pero aún no saben qué activar primero.",
  },
];

const faqItems = [
  {
    question: "¿Esto es consultoría tradicional?",
    answer:
      "No. Es un sistema de lectura estratégica para identificar la restricción real y ordenar la siguiente decisión con mayor precisión.",
  },
  {
    question: "¿Es una solución de software?",
    answer:
      "Tampoco. Puede activar una ruta tecnológica cuando aplica, pero el punto de partida es el diagnóstico del negocio, no la herramienta.",
  },
  {
    question: "¿Qué recibo al solicitar el diagnóstico?",
    answer:
      "Una lectura inicial de señales, una hipótesis clara sobre el cuello de botella dominante y la ruta estratégica que debería ir primero.",
  },
  {
    question: "¿Aplica para cualquier empresa?",
    answer:
      "No. Está pensado para negocios con operación real, señales de crecimiento y voluntad de ejecutar decisiones con criterio.",
  },
];

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:text-4xl lg:text-[3.2rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type SurfaceProps = ComponentProps<"div">;

function Surface({ className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/[0.035] shadow-[0_30px_80px_-42px_rgba(15,23,42,0.85)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function DividerLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-100">
      <span className="size-2 rounded-full bg-cyan-300" aria-hidden="true" />
      {children}
    </div>
  );
}

export function GrowthIntelligenceLanding() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.18),transparent_28%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[28rem] h-[56rem] bg-[radial-gradient(circle_at_72%_20%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_20%_42%,rgba(56,189,248,0.10),transparent_24%),linear-gradient(180deg,rgba(10,15,30,0.14),transparent_55%)]"
        />

        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#050816]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo_latam/franquicias_latam_logo.png"
                alt="Franquicias LATAM"
                width={640}
                height={160}
                className="h-10 w-auto brightness-0 invert sm:h-12"
                priority
              />
              <div className="hidden min-[480px]:block">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
                  Strategic Offer
                </p>
                <p className="text-sm font-semibold tracking-tight text-white">
                  Sistema Growth Intelligence
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <a
                href="#como-funciona"
                className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white sm:inline-flex"
              >
                Ver cómo funciona
              </a>
              <Button
                asChild
                size="sm"
                className="rounded-full px-5 shadow-[0_20px_45px_-24px_rgba(56,189,248,0.9)]"
              >
                <Link href={PRIMARY_CTA_HREF}>
                  Solicitar diagnóstico
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:pb-24 lg:pt-20">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14">
                <div className="relative z-10 min-w-0">
                  <DividerLabel>Growth Intelligence System</DividerLabel>
                  <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl lg:text-[5.2rem]">
                    Tu negocio ya está dando señales. La pregunta es si las
                    estás viendo a tiempo.
                  </h1>
                  <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                    Nuestro Growth Intelligence System detecta señales de
                    crecimiento, fugas de caja, cuellos de botella operativos y
                    potencial de expansión para recomendar la ruta correcta:
                    liberar caja, mejorar desempeño, preparar expansión o
                    implementar IA.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-7 shadow-[0_24px_55px_-28px_rgba(56,189,248,0.95)]"
                    >
                      <Link href={PRIMARY_CTA_HREF}>
                        Solicitar diagnóstico
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-full border-white/15 bg-white/[0.03] px-7 text-white hover:border-white/25 hover:bg-white/[0.07]"
                    >
                      <a href="#como-funciona">Ver cómo funciona</a>
                    </Button>
                  </div>

                  <div className="mt-10 grid gap-3 sm:grid-cols-3">
                    {[
                      "Detecta lo que ya está pasando",
                      "Prioriza lo que realmente destraba crecimiento",
                      "Activa la ruta correcta para escalar",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-sm leading-relaxed text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span className="rounded-full border border-white/10 px-3 py-2">
                      F&B
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-2">
                      Retail
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-2">
                      Health & Beauty
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-2">
                      Servicios
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-2">
                      Multi-unit
                    </span>
                  </div>
                </div>

                <Surface className="relative overflow-hidden p-5 sm:p-6 lg:p-7">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_84%_26%,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_20%_88%,rgba(99,102,241,0.15),transparent_24%)]"
                  />

                  <div className="relative z-10">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emerald-100/80">
                          Señal detectada
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                          Caja atrapada pese a la demanda.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                          Oportunidad
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                          Expansión posible si corriges secuencia.
                        </p>
                      </div>
                    </div>

                    <div className="relative mx-auto mt-8 flex aspect-square w-full max-w-[23rem] items-center justify-center">
                      <div className="absolute inset-[6%] rounded-full border border-cyan-300/15" />
                      <div className="absolute inset-[16%] rounded-full border border-cyan-300/15" />
                      <div className="absolute inset-[29%] rounded-full border border-cyan-300/20" />
                      <div className="absolute left-1/2 top-[6%] h-[88%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                      <div className="absolute left-[6%] top-1/2 h-px w-[88%] -translate-y-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                      <div className="absolute left-[18%] top-[20%] rounded-full border border-cyan-300/25 bg-[#081122] px-3 py-2 text-xs text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.16)]">
                        Fuga de caja
                      </div>
                      <div className="absolute right-[12%] top-[26%] rounded-full border border-white/10 bg-[#0c1529] px-3 py-2 text-xs text-slate-200">
                        Demanda sin capacidad
                      </div>
                      <div className="absolute bottom-[19%] left-[14%] rounded-full border border-white/10 bg-[#0c1529] px-3 py-2 text-xs text-slate-200">
                        Modelo no replicable
                      </div>
                      <div className="absolute bottom-[14%] right-[18%] rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-50 shadow-[0_0_18px_rgba(129,140,248,0.16)]">
                        IA sin secuencia
                      </div>

                      <div className="relative flex size-28 items-center justify-center rounded-full border border-cyan-300/25 bg-[radial-gradient(circle,rgba(34,211,238,0.30),rgba(5,8,22,0.72)_72%)] shadow-[0_0_70px_rgba(34,211,238,0.22)]">
                        <div className="flex size-18 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
                          <Radar className="size-8 text-cyan-100" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[26px] border border-white/10 bg-black/20 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Route map
                          </p>
                          <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                            4 rutas. Una prioridad correcta.
                          </p>
                        </div>
                        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                          Diagnóstico activo
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {routes.map((route) => {
                          const Icon = route.icon;

                          return (
                            <div
                              key={route.title}
                              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-transform duration-200 hover:-translate-y-0.5"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                                  <Icon className="size-5 text-cyan-100" aria-hidden="true" />
                                </div>
                                <p className="font-semibold tracking-tight text-white">
                                  {route.title}
                                </p>
                              </div>
                              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                {route.outcome}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Surface>
              </div>
            </div>
          </section>

          <section className="px-4 pb-8 sm:px-6">
            <div className="mx-auto max-w-7xl overflow-x-auto">
              <nav
                aria-label="Navegación de la página"
                className="flex min-w-max items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-2"
              >
                {sectionLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </section>

          <section
            id="senales"
            className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <SectionIntro
                eyebrow="Lo que suele pasar"
                title="Puede que tu negocio ya tenga potencial de escala, pero estés resolviendo el problema equivocado primero."
                description="La mayoría de las empresas no se frenan por falta de oportunidad. Se frenan por leer mal la secuencia."
              />

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {blindSpots.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Surface
                      key={item.title}
                      className="h-full p-6 transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100 w-fit">
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold leading-tight tracking-tight text-white">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {item.description}
                      </p>
                    </Surface>
                  );
                })}
              </div>
            </div>
          </section>

          <section
            id="como-funciona"
            className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <SectionIntro
                eyebrow="Cómo funciona"
                title="Cómo funciona"
                description="No todos los negocios necesitan lo mismo. El poder está en saber qué hacer primero."
              />

              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {processSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <Surface key={step.title} className="relative h-full p-6 sm:p-7">
                      <div className="flex items-center justify-between gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                          <Icon className="size-6" aria-hidden="true" />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {step.description}
                      </p>
                    </Surface>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <SectionIntro
                eyebrow="Mapa de análisis"
                title="Señales que analizamos"
                description="Leemos el negocio como un sistema. Lo importante no es acumular datos, sino detectar qué patrón explica mejor la restricción actual."
              />

              <div className="mt-10 grid gap-4 lg:grid-cols-2">
                {signalGroups.map((group) => (
                  <Surface key={group.title} className="p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <div className="size-2.5 rounded-full bg-cyan-300" aria-hidden="true" />
                      <h3 className="text-xl font-semibold tracking-tight text-white">
                        {group.title}
                      </h3>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </Surface>
                ))}
              </div>
            </div>
          </section>

          <section
            id="rutas"
            className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <SectionIntro
                eyebrow="Rutas estratégicas"
                title="Cuando el diagnóstico es claro, la ruta correcta también lo es."
                description="La calidad del crecimiento depende menos de hacer más cosas y más de ejecutar en el orden correcto."
              />

              <div className="mt-10 grid gap-4 xl:grid-cols-2">
                {routes.map((route) => {
                  const Icon = route.icon;

                  return (
                    <Surface
                      key={route.title}
                      className="relative overflow-hidden p-6 sm:p-7"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute right-0 top-0 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl"
                      />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                            <Icon className="size-6" aria-hidden="true" />
                          </div>
                          <span className="rounded-full border border-white/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Ruta activable
                          </span>
                        </div>

                        <h3 className="mt-6 text-[1.65rem] font-semibold tracking-tight text-white sm:text-[1.85rem]">
                          {route.title}
                        </h3>

                        <div className="mt-5 space-y-4">
                          <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Para quién es
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                              {route.forWho}
                            </p>
                          </div>
                          <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Outcome
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
                              {route.outcome}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Surface>
                  );
                })}
              </div>
            </div>
          </section>

          <section
            id="credibilidad"
            className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
                <SectionIntro
                  eyebrow="Credibilidad"
                  title="Construido desde experiencia real en crecimiento, expansión y ejecución"
                  description="La propuesta no nace de teoría genérica. Se apoya en experiencia aplicada sobre crecimiento empresarial, estructuración y expansión en la región."
                />

                <Surface className="p-6 sm:p-7">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Organizaciones y contexto de aplicación
                  </p>
                  <ProgramInstitutionalLogosRow
                    className="mt-6 gap-6 sm:gap-8"
                    imageClassName="opacity-90 brightness-110"
                  />

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {credibilityBlocks.map((block) => (
                      <div
                        key={block.title}
                        className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
                      >
                        <h3 className="text-lg font-semibold tracking-tight text-white">
                          {block.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {block.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Surface>
              </div>
            </div>
          </section>

          <section
            id="fit"
            className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <SectionIntro
                eyebrow="Fit"
                title="¿Para quién aplica?"
                description="Está diseñado para dueños y operadores que ya tienen algo valioso en marcha y necesitan más claridad estratégica para escalar bien."
              />

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fitSegments.map((segment) => {
                  const Icon = segment.icon;

                  return (
                    <Surface key={segment.title} className="h-full p-6">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100 w-fit">
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">
                        {segment.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                        {segment.description}
                      </p>
                    </Surface>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <Surface className="overflow-hidden p-8 sm:p-10 lg:p-12">
                <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                  <div>
                    <DividerLabel>Exclusividad</DividerLabel>
                    <h2 className="mt-5 text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:text-4xl lg:text-[3.1rem]">
                      No trabajamos con cualquier negocio.
                    </h2>
                  </div>

                  <div className="space-y-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                    <p>
                      Esto no es para empresas buscando consejos genéricos. Es
                      para operadores que quieren una ruta más precisa para
                      crecer.
                    </p>
                    <p>
                      Si el negocio todavía no tiene señales reales o no existe
                      voluntad de ejecutar con disciplina, no hay fit. Si sí las
                      tiene, actuar tarde puede costar otro trimestre entero.
                    </p>
                  </div>
                </div>
              </Surface>
            </div>
          </section>

          <section
            id="faq"
            className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <SectionIntro
                eyebrow="Claridad"
                title="Preguntas frecuentes"
                description="Una página pensada para tomar mejores decisiones más rápido también debe responder dudas con precisión."
              />

              <div className="mt-10 grid gap-4 lg:grid-cols-2">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-[24px] border border-white/10 bg-white/[0.035] p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                      <span className="text-lg font-semibold tracking-tight text-white">
                        {item.question}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition-transform duration-200 group-open:rotate-45">
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:pb-24">
            <div className="mx-auto max-w-7xl">
              <div className="overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(8,17,34,0.96),rgba(11,18,38,0.92))] p-8 shadow-[0_40px_120px_-50px_rgba(6,182,212,0.35)] sm:p-10 lg:p-12">
                <div className="mx-auto max-w-4xl text-center">
                  <DividerLabel>Próximo paso</DividerLabel>
                  <h2 className="mt-5 text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-white sm:text-4xl lg:text-[3.45rem]">
                    Descubre qué está señalando tu negocio antes de perder otro
                    trimestre resolviendo lo incorrecto.
                  </h2>
                  <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
                    Si ya hay señales, conviene leerlas bien antes de invertir
                    más tiempo, más dinero o más energía en la dirección
                    equivocada.
                  </p>

                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-7 shadow-[0_24px_55px_-28px_rgba(56,189,248,0.95)]"
                    >
                      <Link href={PRIMARY_CTA_HREF}>
                        Solicitar diagnóstico
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-full border-white/15 bg-white/[0.04] px-7 text-white hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      <a
                        href={TEAM_CTA_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Hablar con el equipo
                        <ChevronRight aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/8 px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                Sistema Growth Intelligence
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Franquicias LATAM. Diagnóstico estratégico para crecimiento,
                caja, expansión y secuencia de transformación.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <Link href="/" className="transition-colors hover:text-white">
                Inicio
              </Link>
              <Link href={PRIMARY_CTA_HREF} className="transition-colors hover:text-white">
                Solicitar diagnóstico
              </Link>
              <a
                href={TEAM_CTA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                Hablar con el equipo
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
