"use client";

import { motion } from "framer-motion";
import { SANDBOX_METHOD_PHASES } from "@/lib/sandbox/phases";
import BrandLockup from "./BrandLockup";
import { rise } from "./motion";
import { useSandbox } from "./SandboxProvider";

/** 4.0 Intro (1'): logo × FL, encuadre y las cinco fases entrando una a una. */
export default function IntroScreen() {
  const { session, t, messages, next, track } = useSandbox();

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center sm:pb-20">
      <motion.div {...rise(0.05)}>
        <BrandLockup
          brandName={session.brandName}
          logoUrl={session.logoUrl}
          size="lg"
          flLabel={t("common.franquiciasLatam")}
        />
      </motion.div>

      <motion.p {...rise(0.22)} className="sb-kicker mt-12">
        {t("intro.kicker")}
      </motion.p>

      <motion.h1 {...rise(0.32)} className="sb-display mt-4 max-w-4xl">
        {t("intro.headline")}
      </motion.h1>

      <motion.p {...rise(0.44)} className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--sb-muted)]">
        {t("intro.body")}
      </motion.p>

      <ul aria-label={t("intro.chipsLabel")} className="mt-10 flex flex-wrap justify-center gap-2.5">
        {SANDBOX_METHOD_PHASES.map((p, i) => (
          <motion.li key={p.id} {...rise(0.7 + i * 0.13, 10)} className="sb-chip sb-chip-accent px-3.5 py-1.5 text-[13px]">
            <span className="sb-num font-semibold text-[var(--sb-accent)]">0{i + 1}</span>
            {messages.phases[p.id].label}
          </motion.li>
        ))}
      </ul>

      <motion.div {...rise(1.45)} className="mt-12">
        <button
          type="button"
          className="sb-btn sb-btn-primary h-14 px-10 text-base"
          onClick={() => {
            track("intro_start");
            next();
          }}
        >
          {t("intro.cta")}
          <span aria-hidden>→</span>
        </button>
      </motion.div>
    </div>
  );
}
