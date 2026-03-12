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
          ? "border-b border-black/8 bg-white/92 backdrop-blur-md"
          : "border-b border-black/8 bg-white/86 backdrop-blur-md"
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
              className="nav-link text-[19px] font-bold"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link
          href="/quiz"
          className="hidden md:inline-flex md:items-center md:justify-center rounded-full bg-white px-7 py-3.5 text-[19px] font-bold text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.18)]"
        >
          Comenzar
        </Link>
      </div>
    </nav>
  );
}
