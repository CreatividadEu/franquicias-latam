"use client";

import Link from "next/link";
import type { Alert } from "../_lib/types";
import { POINT_NAMES } from "../_lib/narrative";

const SEVERITY: Record<Alert["severity"], { dot: string; label: string }> = {
  high: { dot: "bg-red-400", label: "Crítico" },
  medium: { dot: "bg-amber-400", label: "Medio" },
  low: { dot: "bg-fl-teal", label: "Bajo" },
};

export function AlertRow({ alert }: { alert: Alert }) {
  const sev = SEVERITY[alert.severity];
  const href = `/demos/don-benitez-os/${alert.suggestedModule}?point=${alert.pointId}&alert=${alert.id}`;
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-fl-border bg-fl-surface p-4 transition-colors hover:border-fl-teal/40">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-fl-text">{alert.title}</p>
          <p className="mt-0.5 truncate text-xs text-fl-muted">
            {POINT_NAMES[alert.pointId]} · {alert.detail}
          </p>
        </div>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-md border border-fl-teal/30 px-3 py-1.5 text-xs font-medium text-fl-teal hover:bg-fl-teal/10"
      >
        Ver plan de acción →
      </Link>
    </div>
  );
}
