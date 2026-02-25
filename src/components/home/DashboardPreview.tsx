"use client";

import { ExpressDiagnosisWidget } from "@/components/ExpressDiagnosisWidget";
import { PerformanceIndicators } from "@/components/home/PerformanceIndicators";

type DashboardPreviewProps = {
  className?: string;
  showQuiz?: boolean;
};

export function DashboardPreview({ className = "", showQuiz = false }: DashboardPreviewProps) {
  return (
    <div className={className}>
      {showQuiz ? (
        <div
          id="diagnostico"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.55)] sm:p-7"
        >
          <ExpressDiagnosisWidget />
        </div>
      ) : (
        <PerformanceIndicators />
      )}
    </div>
  );
}
