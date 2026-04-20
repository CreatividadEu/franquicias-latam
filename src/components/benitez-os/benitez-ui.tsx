import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/benitez-os";

type WorkspaceHeaderProps = {
  badge: string;
  title: string;
  description: string;
  meta?: string[];
  actions?: ReactNode;
};

type MetricCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  delta?: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

type InsightListCardProps = {
  title: string;
  description?: string;
  items: Array<{
    title: string;
    detail: string;
    impact?: string;
  }>;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

const toneClasses = {
  default: {
    icon: "bg-slate-950 text-white",
    bar: "from-slate-900 via-slate-700 to-slate-500",
  },
  success: {
    icon: "bg-emerald-600 text-white",
    bar: "from-emerald-600 via-emerald-500 to-emerald-300",
  },
  warning: {
    icon: "bg-amber-500 text-slate-950",
    bar: "from-amber-500 via-orange-400 to-yellow-200",
  },
  danger: {
    icon: "bg-rose-600 text-white",
    bar: "from-rose-600 via-red-500 to-orange-300",
  },
  accent: {
    icon: "bg-cyan-600 text-white",
    bar: "from-cyan-600 via-sky-500 to-teal-300",
  },
};

export function formatCop(value: number, compact = false) {
  if (compact) {
    if (value >= 1_000_000_000) {
      return `COP ${(value / 1_000_000_000).toFixed(1)}B`;
    }

    return `COP ${(value / 1_000_000).toFixed(0)}M`;
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, suffix = true) {
  return `${value}${suffix ? "%" : ""}`;
}

export function formatMinutes(value: number) {
  return `${value.toFixed(1)} min`;
}

export function getRiskBadgeClass(risk: RiskLevel) {
  switch (risk) {
    case "high":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

export function getRiskLabel(risk: RiskLevel) {
  switch (risk) {
    case "high":
      return "Riesgo alto";
    case "medium":
      return "Atención media";
    default:
      return "Operación estable";
  }
}

export function WorkspaceHeader({
  badge,
  title,
  description,
  meta,
  actions,
}: WorkspaceHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(28,25,23,0.96)_48%,rgba(120,53,15,0.88))] px-6 py-7 text-white shadow-[0_36px_90px_-34px_rgba(15,23,42,0.55)] sm:px-8 sm:py-9">
      <div className="absolute inset-y-0 right-0 w-[40%] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.28),transparent_52%),radial-gradient(circle_at_bottom,rgba(45,212,191,0.2),transparent_40%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge className="border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90">
            {badge}
          </Badge>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.06em] sm:text-4xl lg:text-[2.9rem]">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/74 sm:text-base">
              {description}
            </p>
          </div>
          {meta?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {meta.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/78"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {actions ? <div className="relative flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  delta,
  tone = "default",
}: MetricCardProps) {
  const toneStyle = toneClasses[tone];

  return (
    <Card className="relative overflow-hidden border-white/70 bg-white/88 py-0 shadow-[0_28px_60px_-32px_rgba(15,23,42,0.24)] backdrop-blur">
      <div className={cn("h-1 w-full bg-gradient-to-r", toneStyle.bar)} />
      <CardHeader className="gap-3 px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardDescription className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              {title}
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-[-0.06em] text-slate-950">
              {value}
            </CardTitle>
          </div>
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner",
              toneStyle.icon
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="leading-5 text-slate-600">{hint}</p>
          {delta ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
              {delta}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightListCard({
  title,
  description,
  items,
  tone = "default",
}: InsightListCardProps) {
  const toneStyle = toneClasses[tone];

  return (
    <Card className="h-full overflow-hidden border-white/70 bg-white/88 py-0 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.22)] backdrop-blur">
      <div className={cn("h-1.5 w-full bg-gradient-to-r", toneStyle.bar)} />
      <CardHeader className="px-6 pt-5 pb-4">
        <CardTitle className="text-xl tracking-[-0.05em] text-slate-950">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-sm leading-6 text-slate-600">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="px-6 pt-0 pb-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/85 bg-slate-50/85 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
                {item.impact ? (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-slate-700">
                    {item.impact}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function InfoPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
