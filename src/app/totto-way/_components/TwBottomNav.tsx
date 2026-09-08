"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, MoreHorizontal } from "lucide-react";
import { isNavActive, MOBILE_PRIMARY, type NavItem } from "@/lib/totto-way/nav";
import { logoutTottoWay, NAV_ICONS } from "./TwSidebar";

export function TwBottomNav({ items, moreLabel, logoutLabel }: { items: NavItem[]; moreLabel: string; logoutLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const primary = items.filter((i) => MOBILE_PRIMARY.includes(i.key));
  const rest = items.filter((i) => !MOBILE_PRIMARY.includes(i.key));
  const restActive = rest.some((i) => isNavActive(pathname, i.href));

  // La hoja se cierra con Escape, igual que el panel del Asistente.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="tw-bottomnav" aria-label="Navegación móvil">
        {primary.map((item) => {
          const Icon = NAV_ICONS[item.key];
          const active = isNavActive(pathname, item.href);
          return (
            <Link key={item.key} href={item.href} className={`tw-bottomnav__item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
              <span className="tw-bottomnav__icon">
                <Icon strokeWidth={1.8} />
              </span>
              {item.label}
            </Link>
          );
        })}
        <button type="button" className={`tw-bottomnav__item${restActive || open ? " is-active" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span className="tw-bottomnav__icon">
            <MoreHorizontal strokeWidth={1.8} />
          </span>
          {moreLabel}
        </button>
      </nav>
      {open ? (
        <div className="tw-sheet" onClick={() => setOpen(false)} role="presentation">
          <div className="tw-sheet__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={moreLabel}>
            {rest.map((item) => {
              const Icon = NAV_ICONS[item.key];
              const active = isNavActive(pathname, item.href);
              return (
                <Link key={item.key} href={item.href} className={`tw-nav-item${active ? " is-active" : ""}`} onClick={() => setOpen(false)}>
                  <Icon strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
            <button type="button" className="tw-nav-item" onClick={logoutTottoWay} style={{ background: "none", border: 0, cursor: "pointer", width: "100%", color: "#666" }}>
              <LogOut strokeWidth={1.8} />
              {logoutLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
