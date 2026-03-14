"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { HeroData } from "@/lib/franchise-mapper";

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  GROWTH: { label: "Conversión", cls: "bg-[#7B61FF]/20 text-[#7B61FF] border border-[#7B61FF]/30" },
  ALL_IN: { label: "Aceleración", cls: "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25" },
};

export function HeroSection({ data }: { data: HeroData }) {
  const tier = TIER_BADGE[data.planTier];

  const bgStyle: React.CSSProperties = data.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(10,15,30,0.6), rgba(10,15,30,0.95)), url(${data.heroImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0F1E] px-6 py-24 text-center"
      style={bgStyle}
      aria-label="Hero"
    >
      {/* Ambient glow when no hero image */}
      {!data.heroImageUrl && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00F0FF]/5 blur-[120px]" />
        </div>
      )}

      {/* Plan tier badge */}
      {tier && (
        <div className="absolute right-6 top-6 z-10">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${tier.cls}`}>
            {tier.label}
          </span>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        {/* Logo */}
        {data.logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative h-16 w-48">
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
            <span className="rounded-full border border-[#00F0FF]/25 bg-[#00F0FF]/8 px-4 py-1.5 text-xs font-medium tracking-wide text-[#00F0FF]">
              {data.credibilityLine}
            </span>
          </motion.div>
        )}

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold leading-tight tracking-tight text-[#F0F0F5] md:text-6xl"
          style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
        >
          {data.headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto max-w-2xl text-lg leading-relaxed font-normal text-[#8A8F9E] md:text-xl"
        >
          {data.subheadline}
        </motion.p>

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
            className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[#00F0FF] px-8 py-4 text-sm font-semibold text-[#0A0F1E] transition-all hover:brightness-110 active:scale-95"
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
              className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-[#00F0FF]/30 px-8 py-4 text-sm font-medium text-[#00F0FF] transition-all hover:bg-[#00F0FF]/10 active:scale-95"
            >
              {data.cta2Label}
              {data.cta2Url.startsWith("http") && (
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              )}
            </Link>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-[#00F0FF]/70"
          />
        </div>
      </motion.div>
    </section>
  );
}
