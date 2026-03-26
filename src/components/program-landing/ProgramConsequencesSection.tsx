import { CircleAlert, TrendingUp, WalletCards } from "lucide-react";
import { programConsequenceCards } from "@/components/program-landing/programLandingData";

const icons = [TrendingUp, WalletCards, CircleAlert];

export function ProgramConsequencesSection() {
  return (
    <section className="section-grid-bg relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Qué pasa si no actúas</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Vender más no equivale a construir una red.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            Sin estructura de expansión, el crecimiento suele ser más lento, más
            costoso y menos monetizable de lo que aparenta.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {programConsequenceCards.map((card, index) => {
            const Icon = icons[index];
            return (
              <article
                key={card.title}
                className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.18)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-700">
                  {card.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
