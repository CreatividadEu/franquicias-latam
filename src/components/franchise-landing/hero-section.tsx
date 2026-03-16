"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { HeroData } from "@/lib/franchise-mapper";

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  GROWTH: { label: "Conversión", cls: "bg-orange-50 text-orange-600 border border-orange-200" },
  ALL_IN: { label: "Aceleración", cls: "bg-[#eef3ff] text-[#2563eb] border border-[#2563eb]/20" },
};

export function HeroSection({ data }: { data: HeroData }) {
  const tier = TIER_BADGE[data.planTier];

  const bgStyle: React.CSSProperties = data.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(248,250,252,0.93), rgba(248,250,252,0.97)), url(${data.heroImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <section
      className="section-grid-bg relative flex flex-col items-center justify-center overflow-hidden bg-white px-6 py-12 text-center md:py-16"
      style={bgStyle}
      aria-label="Hero"
    >
      {/* Plan tier badge */}
      {tier && (
        <div className="absolute right-6 top-6 z-10">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${tier.cls}`}>
            {tier.label}
          </span>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-4xl space-y-4 sm:space-y-5">
        {/* Logo */}
        {data.logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative h-24 w-64 sm:h-28 sm:w-72">
              <Image
                src={data.logoUrl}
                alt={`${data.name} logo`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Credibility badge */}
        {data.credibilityLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center"
          >
            <span className="rounded-full border border-black/10 bg-[#eef3ff] px-4 py-1.5 text-xs font-medium tracking-wide text-[#2563eb]">
              {data.credibilityLine}
            </span>
          </motion.div>
        )}

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold leading-tight tracking-tight text-[#171717] md:text-6xl"
          style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
        >
          {data.headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-slate-600 md:text-xl"
        >
          {data.subheadline}
        </motion.p>

        {/* Verified badge */}
        {data.showVerifiedBadge && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fotos_home/verified_latam.png"
              alt="Verificado por Franquicias LATAM"
              className="h-[120px] w-auto"
            />
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary */}
          <Link
            href={data.cta1Url}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.6)] active:scale-95"
          >
            {data.cta1Label}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Secondary */}
          {data.cta2Url && data.cta2Label && (
            <Link
              href={data.cta2Url}
              target={data.cta2Url.startsWith("http") ? "_blank" : undefined}
              rel={data.cta2Url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-black/10 bg-white px-8 py-4 text-sm font-medium text-[#171717] shadow-sm transition-all hover:border-black/20 hover:shadow-md active:scale-95"
            >
              {data.cta2Label}
              {data.cta2Url.startsWith("http") && (
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              )}
            </Link>
          )}
        </motion.div>
      </div>


    </section>
  );
}
