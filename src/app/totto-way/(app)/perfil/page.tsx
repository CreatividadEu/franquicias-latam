import type { Metadata } from "next";
import { Award, Check, Compass, Flag, Map as MapIcon, Mountain } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, type TwMessageKey } from "@/lib/totto-way/i18n";
import { getProfileView } from "@/lib/totto-way/queries";
import { Avatar, Chip, Eyebrow, TwProgress, initialsOf } from "../../_components/atoms";
import { PreferencesForm } from "../../_components/PreferencesForm";

export const metadata: Metadata = { title: "Perfil" };
export const dynamic = "force-dynamic";

const BADGE_ICON = { compass: Compass, map: MapIcon, flag: Flag, mountain: Mountain } as const;

export default async function ProfilePage() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  const view = await getProfileView(session);
  const employee = session.employee;
  const roleKey = `roles.${session.user.role}` as TwMessageKey;
  const monthYear = new Intl.DateTimeFormat(session.locale === "en" ? "en-US" : "es-CO", { month: "short", year: "numeric" });
  const since = employee?.since
    ? new Intl.DateTimeFormat(session.locale === "en" ? "en-US" : "es-CO", { month: "long", year: "numeric" }).format(employee.since)
    : null;

  return (
    <div className="tw-profile">
      <section className="tw-card tw-profile__head">
        <Avatar initials={initialsOf(session.user.name)} size="lg" />
        <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
          <Eyebrow>{employee?.roleTitle ?? t(roleKey)}</Eyebrow>
          <h1 style={{ fontSize: 30 }}>{session.user.name ?? session.user.email}</h1>
          <p className="tw-small tw-muted">
            {[employee?.store?.name, employee?.store?.city, since ? t("profile.since", { date: since }) : null].filter(Boolean).join(" · ")}
          </p>
        </div>
        {view.gamification ? (
          <div className="tw-profile__xp">
            <span className="tw-stat">{view.xpTotal.toLocaleString("es-CO")}</span>
            <div className="tw-eyebrow tw-eyebrow--muted">{t("common.xp")}</div>
          </div>
        ) : null}
      </section>

      {view.gamification ? (
        <section className="tw-card tw-card--black" style={{ display: "grid", gap: 14 }}>
          <div className="tw-section__head">
            <h2 className="tw-title-sm" style={{ color: "#fff" }}>
              {t("profile.badges")}
            </h2>
            <span className="tw-small tw-muted">
              {view.nextBadge ? t("profile.badgeLocked", { n: view.nextBadge.remaining.toLocaleString("es-CO") }) : t("home.nextBadgeMax")}
            </span>
          </div>
          <TwProgress value={view.badgeProgress * 100} track="dark" thin label={t("profile.badges")} />
          <div className="tw-medallions">
            {view.badges.map((badge) => {
              const Icon = BADGE_ICON[badge.icon as keyof typeof BADGE_ICON] ?? Award;
              const earned = !!badge.earnedAt;
              return (
                <div key={badge.code} className={`tw-medallion${earned ? "" : " tw-medallion--locked"}`}>
                  <span className="tw-medallion__disc">
                    <Icon strokeWidth={1.8} />
                  </span>
                  <span className="tw-medallion__name">{badge.name}</span>
                  <span className="tw-medallion__meta">
                    {earned
                      ? t("profile.badgeEarned", { date: monthYear.format(badge.earnedAt as Date) })
                      : t("profile.badgeLocked", { n: (badge.minXp - view.xpTotal).toLocaleString("es-CO") })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="tw-card" style={{ display: "grid", gap: 12 }}>
        <h2 className="tw-title-sm">{t("profile.certificates")}</h2>
        <div className="tw-list">
          {view.certificates.map((certificate) => (
            <div key={certificate.number} className="tw-list-row">
              <span className="tw-icon-tile">
                <Award strokeWidth={1.8} />
              </span>
              <span className="tw-list-row__title">
                {String(certificate.number).padStart(2, "0")} · {certificate.chapter}
              </span>
              {certificate.complete ? (
                <Chip tone="yellow">
                  <Check size={12} strokeWidth={2.4} /> {t("profile.certificateReady")}
                </Chip>
              ) : (
                <Chip tone="soft">{certificate.pct}%</Chip>
              )}
            </div>
          ))}
        </div>
        <p className="tw-small tw-muted">{t("profile.certificatesHint")}</p>
      </section>

      {employee ? (
        <section className="tw-card" style={{ display: "grid", gap: 8 }}>
          <h2 className="tw-title-sm">{t("profile.prefs")}</h2>
          <PreferencesForm
            initial={{
              locale: view.prefs.locale === "en" ? "en" : "es",
              dailyReminder: view.prefs.dailyReminder,
              leagueAlerts: view.prefs.leagueAlerts,
            }}
            copy={{
              locale: t("profile.prefsLocale"),
              reminder: t("profile.prefsReminder"),
              reminderHint: t("profile.prefsReminderHint"),
              league: t("profile.prefsLeague"),
              leagueHint: t("profile.prefsLeagueHint"),
              save: t("common.save"),
              saving: t("common.loading"),
              saved: t("profile.saved"),
            }}
          />
        </section>
      ) : null}
    </div>
  );
}
