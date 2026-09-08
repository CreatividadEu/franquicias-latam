"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Store, BookOpen, Heart, Headphones, Home, LogOut, PenSquare, Route, Trophy, User, Users, type LucideIcon } from "lucide-react";
import { isNavActive, type NavItem, type NavKey } from "@/lib/totto-way/nav";
import { Avatar } from "./atoms";

export const NAV_ICONS: Record<NavKey, LucideIcon> = {
  home: Home,
  store: Store,
  learn: BookOpen,
  league: Trophy,
  journey: Route,
  inspire: Headphones,
  benefits: Heart,
  profile: User,
  leader: Users,
  studio: PenSquare,
};

export type SidebarUser = {
  name: string;
  initials: string;
  roleLabel: string;
  storeLabel: string | null;
  xpLabel: string;
  levelLabel: string;
  progress: number;
};

export async function logoutTottoWay() {
  try {
    await fetch("/api/totto-way/logout", { method: "POST" });
  } finally {
    window.location.href = "/totto-way/login";
  }
}

export function TwSidebar({ items, user, tagline, logoutLabel }: { items: NavItem[]; user: SidebarUser; tagline: string; logoutLabel: string }) {
  const pathname = usePathname();
  return (
    <aside className="tw-sidebar" aria-label="Navegación">
      <div className="tw-sidebar__brand">
        <Image src="/totto-way/logo-white.png" alt="TOTTO" width={120} height={32} className="tw-sidebar__logo" priority />
        <span className="tw-eyebrow tw-eyebrow--yellow">{tagline}</span>
      </div>
      <nav style={{ display: "grid", gap: 4 }}>
        {items.map((item) => {
          const Icon = NAV_ICONS[item.key];
          const active = isNavActive(pathname, item.href);
          return (
            <Link key={item.key} href={item.href} className={`tw-nav-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
              <Icon strokeWidth={1.8} />
              {item.label}
              {item.badge ? <span className="tw-nav-item__badge">{item.badge}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="tw-user-card">
        <div className="tw-user-card__row">
          <Avatar initials={user.initials} />
          <div style={{ minWidth: 0 }}>
            <div className="tw-user-card__name">{user.name}</div>
            <div className="tw-user-card__meta">
              {user.roleLabel}
              {user.storeLabel ? ` · ${user.storeLabel}` : ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <span className="tw-user-card__meta">{user.levelLabel}</span>
          <span className="tw-user-card__xp">{user.xpLabel}</span>
        </div>
        <div className="tw-progress tw-progress--thin tw-progress--dark" aria-hidden>
          <div className="tw-progress__fill" style={{ width: `${Math.round(user.progress * 100)}%` }} />
        </div>
        <button type="button" className="tw-user-card__logout" onClick={logoutTottoWay}>
          <LogOut strokeWidth={1.8} />
          {logoutLabel}
        </button>
      </div>
    </aside>
  );
}
