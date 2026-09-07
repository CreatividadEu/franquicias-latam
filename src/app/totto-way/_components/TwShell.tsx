import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import type { TwSession } from "@/lib/totto-way/auth";
import { createTranslator, type TwMessageKey } from "@/lib/totto-way/i18n";
import { getHeaderTitles, getNavItems } from "@/lib/totto-way/nav";
import { badgeFor, badgeProgress, currentStreak, nextBadge } from "@/lib/totto-way/xp";
import { initialsOf } from "./atoms";
import { TwBottomNav } from "./TwBottomNav";
import { TwHeader } from "./TwHeader";
import { TwSidebar } from "./TwSidebar";
import { AssistantProvider } from "./AssistantPanel";
import { ToastProvider } from "./TwToast";

/** Shell de la app (sidebar / header / bottom nav). Server component. */
export async function TwShell({ session, children }: { session: TwSession; children: ReactNode }) {
  const t = createTranslator(session.locale);
  const settings = await prisma.twSettings.findUnique({ where: { franchiseId: session.franchiseId } });
  const country = session.employee?.store?.country ?? null;
  const showGamification =
    (settings?.showGamification ?? true) &&
    (!settings?.leagueEnabledCountries?.length || !country || settings.leagueEnabledCountries.includes(country));

  const items = getNavItems(session.user.role, { showGamification }, t);
  const employee = session.employee;
  const xpTotal = employee?.xpTotal ?? 0;
  const badge = badgeFor(xpTotal);
  const next = nextBadge(xpTotal);
  const streak = employee ? currentStreak(employee, new Date(), employee.store?.timezone ?? "America/Bogota") : 0;
  const roleKey = `roles.${session.user.role}` as TwMessageKey;
  const badgeKey = `badges.${badge.code}` as TwMessageKey;

  return (
    <ToastProvider>
      <AssistantProvider
        copy={{
          title: t("assistant.title"),
          subtitle: t("assistant.subtitle"),
          placeholder: t("assistant.placeholder"),
          send: t("assistant.send"),
          close: t("assistant.close"),
          thinking: t("assistant.thinking"),
          intro: t("assistant.intro"),
          sources: t("assistant.sources"),
          errorGeneric: t("assistant.errorGeneric"),
          suggestions: [t("assistant.suggestion1"), t("assistant.suggestion2"), t("assistant.suggestion3")],
        }}
      >
        <div className="tw-shell">
      <TwSidebar
        items={items}
        tagline={t("brand.tagline")}
        logoutLabel={t("common.logout")}
        user={{
          name: session.user.name ?? session.user.email,
          initials: initialsOf(session.user.name, "TW"),
          roleLabel: employee?.roleTitle ?? t(roleKey),
          storeLabel: employee?.store?.name ?? null,
          xpLabel: showGamification ? t("header.xpPill", { n: xpTotal.toLocaleString("es-CO") }) : "",
          levelLabel: showGamification
            ? next
              ? t("user.toNext", { n: next.remaining.toLocaleString("es-CO"), badge: t(`badges.${next.code}` as TwMessageKey) })
              : t(badgeKey)
            : "",
          progress: showGamification ? badgeProgress(xpTotal) : 0,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <TwHeader
          titles={getHeaderTitles(t)}
          streakLabel={employee ? t("header.streakPill", { n: streak }) : null}
          xpLabel={employee ? t("header.xpPill", { n: xpTotal.toLocaleString("es-CO") }) : null}
          assistantLabel={t("nav.assistant")}
          showGamification={showGamification}
        />
        <main className="tw-main">{children}</main>
      </div>
          <TwBottomNav items={items} moreLabel={t("nav.more")} logoutLabel={t("common.logout")} />
        </div>
      </AssistantProvider>
    </ToastProvider>
  );
}
