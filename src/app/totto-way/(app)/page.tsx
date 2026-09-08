import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Headphones, User } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, intlLocale, plural, type TwMessageKey } from "@/lib/totto-way/i18n";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { getHomeData } from "@/lib/totto-way/queries";
import { Avatar, Eyebrow, GlassCard, XpChip } from "../_components/atoms";

export const dynamic = "force-dynamic";

export default async function TottoWayHomePage() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  const data = await getHomeData(session);
  const intl = intlLocale(session.locale);
  // El flag showGamification apaga XP, racha e insignias, no solo la Liga.
  const gamified = data.league.enabled;
  const firstName = (session.user.name ?? "").split(" ")[0] || session.user.email;
  const current = data.current;
  const lessonHref = current ? `${NAV_HREF.learn}/${current.chapter.slug}` : NAV_HREF.learn;

  const today: { href: string; label: string; Icon: typeof BookOpen; xp?: number }[] = [];
  if (current) today.push({ href: lessonHref, label: t("home.todayLesson", { title: current.lesson.title }), Icon: BookOpen, xp: gamified ? current.lesson.xp : undefined });
  today.push({ href: NAV_HREF.learn, label: t("home.todayChapters"), Icon: Compass });
  today.push({ href: NAV_HREF.inspire, label: t("nav.inspire"), Icon: Headphones, xp: gamified ? 20 : undefined });
  today.push({ href: NAV_HREF.profile, label: t("home.todayProfile"), Icon: User });

  return (
    <>
      <section className="tw-hero">
        <div className="tw-hero__copy">
          <Eyebrow tone="yellow">{t("home.greeting", { name: firstName })}</Eyebrow>
          <h2>{t("home.title")}</h2>
          {current ? (
            <>
              <p className="tw-muted">{t("home.currentChapter", { number: String(current.chapter.number).padStart(2, "0"), title: current.chapter.title })}</p>
              <p style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="tw-display">{current.lesson.title}</span>
                {gamified ? <XpChip xp={current.lesson.xp} tone="yellow" /> : null}
                <span className="tw-small tw-muted">{plural(t, "common.lessonsLeft", current.remaining)}</span>
              </p>
            </>
          ) : (
            <p className="tw-muted">{data.chapters.some((c) => c.status === "PUBLISHED") ? t("home.allDone") : t("common.notConfigured")}</p>
          )}
          <div className="tw-hero__actions">
            <Link href={lessonHref} className="tw-btn tw-btn--yellow">
              {current ? t("home.continueLesson") : t("home.startChapter")}
              <ArrowRight strokeWidth={1.8} />
            </Link>
            <Link href={NAV_HREF.learn} className="tw-btn tw-btn--outline tw-on-dark">
              {t("home.seeChapters")}
            </Link>
          </div>
        </div>
        <div className="tw-hero__grid">
          <GlassCard eyebrow={t("home.progress")} value={`${data.overallPct}%`} />
          {gamified ? (
            <>
              <GlassCard
                eyebrow={t("home.leaguePosition")}
                value={data.league.position ? `#${data.league.position}` : "—"}
                caption={t("home.leagueStore")}
              />
              <GlassCard eyebrow={t("home.streak")} value={data.streakDays} caption={plural(t, "common.days", data.streakDays)} />
              <GlassCard
                eyebrow={t("home.nextBadge")}
                value={data.nextBadge ? t(`badges.${data.nextBadge.code}` as TwMessageKey) : t(`badges.${data.badge.code}` as TwMessageKey)}
                caption={data.nextBadge ? t("home.nextBadgeMissing", { n: data.nextBadge.remaining.toLocaleString(intl) }) : t("home.nextBadgeMax")}
              />
            </>
          ) : null}
        </div>
      </section>

      <div className="tw-grid-2" style={{ marginTop: 16 }}>
        <section className="tw-card" style={{ display: "grid", gap: 12 }}>
          <div className="tw-section__head">
            <h3 className="tw-title-sm">{t("home.today")}</h3>
          </div>
          <div className="tw-list">
            {today.map((item) => (
              <Link key={item.label} href={item.href} className="tw-list-row">
                <span className="tw-icon-tile">
                  <item.Icon strokeWidth={1.8} />
                </span>
                <span className="tw-list-row__title">{item.label}</span>
                {item.xp ? <XpChip xp={item.xp} /> : <ArrowRight size={16} strokeWidth={1.8} />}
              </Link>
            ))}
          </div>
        </section>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {data.quote ? (
            <section className="tw-card tw-card--black" style={{ display: "grid", gap: 12 }}>
              <Eyebrow tone="yellow">{data.quote.title}</Eyebrow>
              <p className="tw-quote">“{data.quote.text}”</p>
              <p className="tw-small tw-muted">{data.quote.who}</p>
              <Link href={NAV_HREF.inspire} className="tw-link" style={{ color: "#FCCE01" }}>
                {t("nav.inspire")} →
              </Link>
            </section>
          ) : null}

          {data.league.enabled ? (
            <section className="tw-card tw-card--yellow" style={{ display: "grid", gap: 12 }}>
              <div className="tw-section__head">
                <h3 className="tw-title-sm">{t("home.team")}</h3>
                <Link href={NAV_HREF.league} className="tw-link" style={{ color: "#000" }}>
                  {t("home.seeLeague")} →
                </Link>
              </div>
              {data.team.length === 0 ? (
                <p className="tw-small">{t("home.teamEmpty")}</p>
              ) : (
                <div className="tw-list">
                  {data.team.map((member, index) => (
                    <div key={member.userId} className="tw-list-row" style={member.me ? { borderColor: "#000" } : undefined}>
                      <Avatar initials={member.initials} tone={index === 0 ? "dark" : "yellow"} />
                      <span className="tw-list-row__title">{member.name}</span>
                      <span className="tw-display">{member.points.toLocaleString(intl)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
