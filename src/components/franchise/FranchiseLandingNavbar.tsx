"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function FranchiseLandingNavbar({
  showFranchiseLogo = false,
  franchiseLogoUrl,
  franchiseName,
}: {
  showFranchiseLogo?: boolean;
  franchiseLogoUrl?: string | null;
  franchiseName?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-sm backdrop-blur-md"
          : "border-b border-black/5 bg-white/55 backdrop-blur-[10px]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 sm:py-2">
        {/* FL logo — left */}
        <Link href="/">
          <Image
            src="/logo_latam/franquicias_latam_logo.png"
            alt="Franquicias LATAM"
            width={640}
            height={160}
            className="h-[6.4rem] w-auto sm:h-32"
            priority
          />
        </Link>

        {/* Franchise logo — right, same margin distance, same height */}
        {showFranchiseLogo && franchiseLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={franchiseLogoUrl}
            alt={franchiseName ?? "Logo franquicia"}
            className="h-8 w-auto object-contain"
          />
        )}
      </div>
    </nav>
  );
}
