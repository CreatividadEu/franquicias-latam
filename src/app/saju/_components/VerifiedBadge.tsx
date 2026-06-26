import Image from "next/image";

/**
 * "Verificado por Franquicias LATAM" trust pill.
 * Intentionally styled in the PARENT platform's language (brand blue + the
 * Franquicias LATAM monogram) — this is the co-brand seam, not Sajú chrome.
 */
export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`saju-fl-pill ${className}`} role="img" aria-label="Verificado por Franquicias LATAM">
      <Image
        src="/saju/fl-monogram.png"
        alt=""
        aria-hidden
        width={28}
        height={28}
        className="saju-fl-pill__mono"
      />
      <span className="saju-fl-pill__text">
        <span className="saju-fl-pill__label">Verificado por</span>
        <span className="saju-fl-pill__brand">Franquicias LATAM</span>
      </span>
      <span className="saju-fl-pill__check" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
          <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}
