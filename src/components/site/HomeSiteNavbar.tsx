"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { homeNavbarLinks } from "@/components/home/homeBrandData";

type HomeSiteNavbarProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function HomeSiteNavbar({
  ctaHref = "/quiz",
  ctaLabel = "Comenzar",
}: HomeSiteNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/8 bg-white/92 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-[0.3rem] sm:px-6 sm:py-[0.4rem]">
        <div className="flex items-center justify-between">
          <Image
            src="/logo_latam/franquicias_latam_logo.png"
            alt="Franquicias LATAM"
            width={640}
            height={160}
            className="h-[5.12rem] w-auto sm:h-[6.4rem]"
            priority
          />

          <div className="hidden items-center gap-8 md:flex">
            {homeNavbarLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link text-[19px] font-bold"
              >
                {item.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 -mr-2 md:hidden"
            aria-label="Toggle menu"
          >
            {!mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </button>

          <Link
            href={ctaHref}
            className="hidden rounded-full bg-white px-7 py-3.5 text-[19px] font-bold text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.18)] md:inline-flex md:items-center md:justify-center"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      <div
        className={`mobile-menu fixed inset-y-0 right-0 z-50 w-64 border-l border-black/5 bg-white/86 shadow-xl backdrop-blur-xl md:hidden ${
          mobileMenuOpen ? "open" : ""
        }`}
      >
        <div className="p-6 pt-20">
          <div className="flex flex-col gap-6">
            {homeNavbarLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[22px] font-bold"
              >
                {item.label}
              </a>
            ))}
            <Link
              href={ctaHref}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[16px] font-semibold text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.18)]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}
    </nav>
  );
}
