/* eslint-disable @next/next/no-img-element */
// Logo del cliente × Franquicias LATAM. Puro (sin contexto) para poder usarse
// también en el PIN gate, fuera del provider.

type Props = {
  brandName: string;
  logoUrl: string | null;
  size?: "sm" | "lg";
  flLabel?: string;
};

export default function BrandLockup({
  brandName,
  logoUrl,
  size = "sm",
  flLabel = "Franquicias LATAM",
}: Props) {
  const large = size === "lg";
  return (
    <div className={`flex items-center ${large ? "flex-wrap justify-center gap-4 sm:gap-7" : "gap-3"}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={brandName}
          draggable={false}
          className={
            large
              ? "h-14 w-auto max-w-[70vw] object-contain sm:h-24"
              : "h-7 w-auto max-w-[38vw] object-contain sm:h-8"
          }
        />
      ) : (
        <span className={`sb-serif leading-none ${large ? "text-4xl sm:text-6xl" : "text-xl"}`}>
          {brandName}
        </span>
      )}
      <span
        aria-hidden
        className={`${large ? "text-2xl sm:text-4xl" : "text-base"} font-light text-[var(--sb-muted)]`}
      >
        ×
      </span>
      {large ? (
        <img
          src="/logo_latam/franquicias_latam_logo.png"
          alt={flLabel}
          draggable={false}
          className="h-12 w-auto brightness-0 invert sm:h-20"
        />
      ) : (
        <span className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-[var(--sb-text)]/70">
          {flLabel}
        </span>
      )}
    </div>
  );
}
