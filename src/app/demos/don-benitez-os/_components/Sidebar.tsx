"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/demos/don-benitez-os", label: "Panorama", icon: "◐" },
  { href: "/demos/don-benitez-os/talento", label: "Talento", icon: "◉" },
  { href: "/demos/don-benitez-os/academia", label: "Academia", icon: "◎" },
  { href: "/demos/don-benitez-os/pulso", label: "Pulso", icon: "◈" },
  { href: "/demos/don-benitez-os/finanzas", label: "Finanzas", icon: "◆" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-fl-border bg-fl-base/80 md:flex md:flex-col">
      <div className="border-b border-fl-border px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-fl-muted">Demo</p>
        <p className="mt-1 text-sm font-semibold text-fl-text">Don Benítez OS</p>
        <p className="mt-0.5 text-[11px] text-fl-muted">10 puntos · México · Colombia</p>
      </div>
      <nav className="flex-1 p-2">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/demos/don-benitez-os" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-fl-teal/10 text-fl-teal"
                  : "text-fl-muted hover:bg-fl-surface hover:text-fl-text"
              }`}
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-fl-border p-4">
        <div className="flex items-center gap-2 rounded-md bg-fl-surface/80 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fl-teal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fl-teal" />
          </span>
          <span className="text-[11px] text-fl-muted">Clawdbot online</span>
        </div>
      </div>
    </aside>
  );
}
