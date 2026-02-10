import type { ReactNode } from "react";

type Intensity = "subtle" | "normal" | "clear";

type LatamDepthBackgroundProps = {
  children: ReactNode;
  className?: string;
  intensity?: Intensity;
};

const VEIL_ALPHA = {
  mobile: 0.7,
  desktop: 0.62,
} as const;

const RADIAL_ALPHA_MULTIPLIER = 1;
const BOTTOM_COLOR = "#F3F7FF";

const INTENSITY_PROFILE: Record<
  Intensity,
  { radial: number; veilShift: number; noiseOpacity: number }
> = {
  subtle: { radial: 0.82, veilShift: 0.06, noiseOpacity: 0.035 },
  normal: { radial: 1, veilShift: 0, noiseOpacity: 0.042 },
  clear: { radial: 1.18, veilShift: -0.06, noiseOpacity: 0.052 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const alpha = (base: number, mult: number) =>
  clamp(Number((base * mult).toFixed(3)), 0, 1);

export function LatamDepthBackground({
  children,
  className = "",
  intensity = "normal",
}: LatamDepthBackgroundProps) {
  const profile = INTENSITY_PROFILE[intensity];
  const radialMult = RADIAL_ALPHA_MULTIPLIER * profile.radial;

  const topRightAlpha = alpha(0.1, radialMult);
  const leftMidAlpha = alpha(0.08, radialMult);
  const bottomAlpha = alpha(0.14, radialMult);

  const veilMobile = clamp(VEIL_ALPHA.mobile + profile.veilShift, 0.5, 0.82);
  const veilDesktop = clamp(VEIL_ALPHA.desktop + profile.veilShift, 0.46, 0.78);

  return (
    <div className={`relative overflow-visible bg-transparent ${className}`.trim()}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 48%, ${BOTTOM_COLOR} 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(760px 760px at 86% 9%, rgba(107, 124, 255, ${topRightAlpha}), transparent 63%),
              radial-gradient(820px 820px at 14% 46%, rgba(47, 91, 255, ${leftMidAlpha}), transparent 66%),
              radial-gradient(980px 980px at 52% 100%, rgba(207, 227, 255, ${bottomAlpha}), transparent 72%)
            `,
          }}
        />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute inset-0 md:hidden"
          style={{ backgroundColor: `rgba(255, 255, 255, ${veilMobile})` }}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{ backgroundColor: `rgba(255, 255, 255, ${veilDesktop})` }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
          mixBlendMode: "multiply",
          opacity: profile.noiseOpacity,
        }}
      />

      <div className="relative z-30">{children}</div>
    </div>
  );
}

