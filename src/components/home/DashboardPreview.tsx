"use client";

import { PerformanceIndicators } from "@/components/home/PerformanceIndicators";

type DashboardPreviewProps = {
  className?: string;
};

export function DashboardPreview({ className = "" }: DashboardPreviewProps) {
  return (
    <div className={className}>
      <PerformanceIndicators />
    </div>
  );
}
