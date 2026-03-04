import type { ReactNode } from "react";

type Intensity = "subtle" | "normal" | "clear";

type LatamDepthBackgroundProps = {
  children: ReactNode;
  className?: string;
  intensity?: Intensity;
};

export function LatamDepthBackground({
  children,
  className = "",
  intensity,
}: LatamDepthBackgroundProps) {
  void intensity;

  return (
    <div className={`relative overflow-visible bg-transparent ${className}`.trim()}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
