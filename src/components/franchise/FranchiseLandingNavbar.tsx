"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Ventajas", href: "#ventajas" },
  { label: "Proceso", href: "#proceso" },
  { label: "Inversión", href: "#inversion" },
  { label: "Contacto", href: "#apply" },
];

export function FranchiseLandingNavbar({
  // Legacy props kept for compat — no longer rendered
  showFranchiseLogo: _showFranchiseLogo,
  franchiseLogoUrl: _franchiseLogoUrl,
  franchiseName: _franchiseName,
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-[0.3rem] sm:px-6 sm:py-[0.4rem]">
        {/* FL logo */}
        <Link href="/">
          <Image
            src="/logo_latam/franquicias_latam_logo.png"
            alt="Franquicias LATAM"
            width={640}
            height={160}
            className="h-[5.12rem] w-auto sm:h-[6.4rem]"
            priority
          />
        </Link>

        {/* Scroll links */}
        <div className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[19px] font-bold text-stone-800 transition-colors hover:text-stone-950"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
