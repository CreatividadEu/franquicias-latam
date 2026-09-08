/** Navegación del shell (PLAN §4). Puro: el icono se resuelve en el cliente por `key`. */
import type { UserRole } from "@prisma/client";
import { canEditContent, canSeeLeaderPanel } from "./scope";
import type { TwTranslator } from "./i18n";

export type NavKey =
  | "home"
  | "learn"
  | "store"
  | "league"
  | "journey"
  | "inspire"
  | "benefits"
  | "profile"
  | "leader"
  | "studio";

export type NavItem = { key: NavKey; href: string; label: string; badge?: number };

export const NAV_HREF: Record<NavKey, string> = {
  home: "/totto-way",
  learn: "/totto-way/aprender",
  store: "/totto-way/mi-tienda",
  league: "/totto-way/liga",
  journey: "/totto-way/mi-viaje",
  inspire: "/totto-way/inspira",
  benefits: "/totto-way/beneficios",
  profile: "/totto-way/perfil",
  leader: "/totto-way/lider",
  studio: "/totto-way/estudio",
};

/** Ítems del bottom nav móvil (5). El resto va en "Más". */
export const MOBILE_PRIMARY: readonly NavKey[] = ["home", "learn", "league", "journey", "profile"];

export function getNavItems(role: UserRole, options: { showGamification: boolean; pendingLessons?: number }, t: TwTranslator): NavItem[] {
  const items: NavItem[] = [
    { key: "store", href: NAV_HREF.store, label: t("nav.store") },
    { key: "home", href: NAV_HREF.home, label: t("nav.home") },
    { key: "learn", href: NAV_HREF.learn, label: t("nav.learn"), badge: options.pendingLessons || undefined },
  ];
  if (options.showGamification) items.push({ key: "league", href: NAV_HREF.league, label: t("nav.league") });
  items.push(
    { key: "journey", href: NAV_HREF.journey, label: t("nav.journey") },
    { key: "inspire", href: NAV_HREF.inspire, label: t("nav.inspire") },
    { key: "benefits", href: NAV_HREF.benefits, label: t("nav.benefits") },
    { key: "profile", href: NAV_HREF.profile, label: t("nav.profile") },
  );
  if (canSeeLeaderPanel(role)) items.push({ key: "leader", href: NAV_HREF.leader, label: t("nav.leader") });
  if (canEditContent(role)) items.push({ key: "studio", href: NAV_HREF.studio, label: t("nav.studio") });
  return items;
}

/** Cabecera por ruta: eyebrow + título. Se elige el href más largo que prefije el pathname. */
export type HeaderTitle = { href: string; eyebrow: string; title: string };

export function getHeaderTitles(t: TwTranslator): HeaderTitle[] {
  return [
    { href: NAV_HREF.store, eyebrow: t("brand.name"), title: t("nav.store") },
    { href: NAV_HREF.home, eyebrow: t("brand.name"), title: t("nav.home") },
    { href: NAV_HREF.learn, eyebrow: t("brand.name"), title: t("nav.learn") },
    { href: NAV_HREF.league, eyebrow: t("brand.name"), title: t("nav.league") },
    { href: NAV_HREF.journey, eyebrow: t("brand.name"), title: t("nav.journey") },
    { href: NAV_HREF.inspire, eyebrow: t("brand.name"), title: t("nav.inspire") },
    { href: NAV_HREF.benefits, eyebrow: t("brand.name"), title: t("nav.benefits") },
    { href: NAV_HREF.profile, eyebrow: t("brand.name"), title: t("nav.profile") },
    { href: NAV_HREF.leader, eyebrow: t("brand.name"), title: t("nav.leader") },
    { href: NAV_HREF.studio, eyebrow: t("brand.name"), title: t("nav.studio") },
  ];
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === NAV_HREF.home) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pickHeaderTitle(pathname: string, titles: HeaderTitle[]): HeaderTitle | null {
  let best: HeaderTitle | null = null;
  for (const title of titles) {
    if (isNavActive(pathname, title.href) && (!best || title.href.length > best.href.length)) best = title;
  }
  return best;
}
