import type { Metadata } from "next";
import { Award, BookOpen, Compass, Flag, Flame, Map as MapIcon, Mountain, Star } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { getJourneyView } from "@/lib/totto-way/queries";
import { Eyebrow, TwProgress } from "../../_components/atoms";

export const metadata: Metadata = { title: "Mi viaje" };
export const dynamic = "force-dynamic";

const ICONS = { flag: Flag, book: BookOpen, badge: Award, star: Star, fire: Flame, compass: Compass, map: MapIcon, mountain: Mountain } as const;

export default async function JourneyPage() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  const view = await getJourneyView(session);
  const format = new Intl.DateTimeFormat(session.locale === "en" ? "en-US" : "es-CO", { month: "short", year: "numeric" });
  const doneCount = view.timeline.filter((item) => item.done).length;
  const doneRatio = view.timeline.length > 0 ? (doneCount / view.timeline.length) * 100 : 0;
  const BadgeIcon = ICONS[view.badge.icon as keyof typeof ICONS] ?? Compass;

  return (
    <>
      <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
        <Eyebrow>{t("journey.eyebrow")}</Eyebrow>
        <h1 className="tw-title-lg">{t("journey.title")}</h1>
      </div>

      <div className="tw-journey-layout">
        {view.timeline.length === 0 ? (
          <p className="tw-muted">{t("journey.empty")}</p>
        ) : (
          <div className="tw-timeline" data-done-ratio style={{ ["--tw-timeline-done" as string]: `${doneRatio}%` }}>
            {view.timeline.map((item) => (
              <article
                key={item.id}
                className={`tw-milestone${item.current ? " tw-milestone--current" : ""}${item.done ? "" : " tw-milestone--future"}`}
              >
                <span className="tw-milestone__date">{format.format(item.date)}</span>
                <div>
                  <h2 className="tw-milestone__title">{item.title}</h2>
                  <p className="tw-milestone__desc">{item.current ? `${item.desc} · ${t("journey.here")}` : item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <aside className="tw-aside">
          {view.gamification ? (
            <section className="tw-card tw-card--black" style={{ display: "grid", gap: 12 }}>
              <Eyebrow tone="yellow">{t("journey.badgeTitle")}</Eyebrow>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="tw-medallion__disc" style={{ width: 56, height: 56 }}>
                  <BadgeIcon strokeWidth={1.8} />
                </span>
                <div>
                  <div className="tw-title-sm" style={{ color: "#fff" }}>
                    {view.badge.name}
                  </div>
                  <div className="tw-small tw-muted">{view.xpTotal.toLocaleString("es-CO")} XP</div>
                </div>
              </div>
              <TwProgress value={view.badgeProgress * 100} track="dark" thin label={t("journey.badgeTitle")} />
              <p className="tw-small tw-muted">
                {view.nextBadge
                  ? t("journey.badgeNext", { n: view.nextBadge.remaining.toLocaleString("es-CO"), badge: view.nextBadge.name })
                  : t("journey.badgeMax")}
              </p>
            </section>
          ) : null}

          <section className="tw-card" style={{ display: "grid", gap: 6 }}>
            <Eyebrow>{t("journey.career")}</Eyebrow>
            <div className="tw-career">
              {view.career.map((step) => (
                <div key={step.role} className={`tw-career__step${step.current ? " tw-career__step--current" : ""}`}>
                  <div className="tw-career__head">
                    <span className="tw-career__title">{step.title}</span>
                    <span className={`tw-chip${step.complete ? " tw-chip--yellow" : " tw-chip--soft"}`}>
                      {t("journey.careerChapters", { done: step.done, total: step.total })}
                    </span>
                  </div>
                  <TwProgress value={(step.done / step.total) * 100} thin tone={step.complete ? "yellow" : "black"} label={step.title} />
                </div>
              ))}
            </div>
            <p className="tw-small tw-muted">{t("journey.careerHint")}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
