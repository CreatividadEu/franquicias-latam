import type { Metadata } from "next";
import { Award, BookOpen, Heart, PiggyBank, ShoppingBag, Star, TrendingUp, Users } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { getBenefits } from "@/lib/totto-way/queries";
import { Eyebrow, Placeholder } from "../../_components/atoms";

export const metadata: Metadata = { title: "Beneficios" };
export const dynamic = "force-dynamic";

const ICONS = { bag: ShoppingBag, piggy: PiggyBank, heart: Heart, ladder: TrendingUp, book: BookOpen, star: Star, people: Users, trophy: Award } as const;

export default async function BenefitsPage() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  const benefits = await getBenefits(session);

  if (benefits.length === 0) return <Placeholder title={t("benefits.title")} body={t("benefits.empty")} />;

  return (
    <>
      <div style={{ display: "grid", gap: 6, marginBottom: 20, maxWidth: 640 }}>
        <Eyebrow>{t("benefits.eyebrow")}</Eyebrow>
        <h1 className="tw-title-lg">{t("benefits.title")}</h1>
        <p className="tw-muted">{t("benefits.lead")}</p>
      </div>

      <div className="tw-benefit-grid">
        {benefits.map((benefit, index) => {
          const Icon = ICONS[benefit.icon as keyof typeof ICONS] ?? Star;
          // El manual pide la primera tarjeta amarilla y una negra de contraste.
          const tone = index === 0 ? " tw-card--yellow" : benefit.category === "Carrera" ? " tw-card--black" : "";
          return (
            <details key={benefit.id} id={benefit.id} className={`tw-benefit tw-card${tone}`}>
              <summary>
                <span className="tw-benefit__head">
                  <Icon strokeWidth={1.8} />
                  <Eyebrow tone={tone === " tw-card--black" ? "yellow" : "red"}>{benefit.category}</Eyebrow>
                </span>
                <span className="tw-title-sm">{benefit.title}</span>
              </summary>
              <p className="tw-small" style={{ marginTop: 10 }}>
                {benefit.desc}
              </p>
              {benefit.countries.length > 0 ? (
                <p className="tw-small tw-muted" style={{ marginTop: 8 }}>
                  {t("benefits.countryOnly", { country: benefit.countries.join(", ") })}
                </p>
              ) : null}
              {benefit.link ? (
                <a className="tw-link tw-small" href={benefit.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10 }}>
                  {t("benefits.link")} →
                </a>
              ) : null}
            </details>
          );
        })}
      </div>
    </>
  );
}
