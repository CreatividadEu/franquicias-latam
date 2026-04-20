"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  LayoutDashboard,
  MapPinned,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { benitezDashboardStats, benitezLocations } from "@/data/benitez-os";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/benitez-os", label: "Overview", icon: Sparkles },
  { href: "/benitez-os/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/benitez-os/recruitment", label: "Recruitment", icon: BriefcaseBusiness },
  { href: "/benitez-os/academy", label: "Academy", icon: BookOpen },
  { href: "/benitez-os/operations", label: "Operations", icon: MapPinned },
];

function isActive(pathname: string, href: string) {
  if (href === "/benitez-os") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BenitezShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ee_0%,#f5f2ea_32%,#f8fafc_100%)] text-slate-950">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_26%),radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.12),transparent_28%)]" />
      <div className="flex min-h-screen">
        <aside className="hidden w-[290px] shrink-0 border-r border-white/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(28,25,23,0.96))] px-6 py-6 text-white shadow-[24px_0_80px_-48px_rgba(15,23,42,0.72)] lg:flex lg:flex-col">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#f97316_55%,#0f172a)] text-lg font-semibold tracking-[-0.08em]">
                B
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.05em]">Benítez OS</p>
                <p className="text-sm text-white/60">
                  Talento, formación, operación y rentabilidad
                </p>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/6 p-4 backdrop-blur">
              <Badge className="border-white/15 bg-white/10 text-white/80">
                Demo privada
              </Badge>
              <p className="mt-3 text-xl font-semibold tracking-[-0.05em]">
                {benitezLocations.length} puntos conectados
              </p>
              <p className="mt-1 text-sm leading-6 text-white/68">
                Controla reclutamiento, formación y desempeño desde una sola capa
                ejecutiva.
              </p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1.5">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
                    active
                      ? "bg-white text-slate-950 shadow-[0_22px_46px_-26px_rgba(255,255,255,0.55)]"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                      active ? "bg-slate-950 text-white" : "bg-white/8 text-white/72"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[26px] border border-amber-400/18 bg-amber-400/10 p-4">
            <p className="text-sm font-semibold tracking-[-0.03em] text-white">
              Señal del día
            </p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Pereira y Barranquilla concentran la mayor urgencia operativa por
              mezcla de vacantes, formación rezagada y servicio lento.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-200/80">
              Intervenir primero
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/60 bg-[rgba(248,245,238,0.86)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 lg:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#f97316_55%,#0f172a)] text-sm font-semibold text-white">
                      B
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold tracking-[-0.04em] text-slate-950">
                        Benítez OS
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Demo premium para cadena multi-sede
                      </p>
                    </div>
                  </div>
                  <div className="hidden flex-wrap items-center gap-2 sm:flex">
                    <Badge className="border-slate-200 bg-white text-slate-700">
                      Cadena demo · Colombia
                    </Badge>
                    <Badge className="border-slate-200 bg-white text-slate-700">
                      {benitezDashboardStats.globalScore} score global
                    </Badge>
                    <Badge className="border-slate-200 bg-white text-slate-700">
                      {benitezDashboardStats.pointsAtRisk} puntos con intervención
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/benitez-os">
                      Overview
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/benitez-os/operations">
                      Solicitar demo privada
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
                {navigation.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-white bg-white/80 text-slate-700"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
