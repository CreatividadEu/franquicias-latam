"use client";

import { motion } from "framer-motion";
import type { ClientConfig } from "@/config/clients";
import LogoMarquee from "../LogoMarquee";
import { aparecer } from "../motionPresets";

export default function WelcomeSlide({ client }: { client: ClientConfig }) {
  return (
    <div className="pt-scroll relative flex h-full flex-col items-center justify-center gap-7 overflow-y-auto px-6 pb-36 pt-20 text-center">
      <motion.img
        {...aparecer(0.08)}
        src={client.logoSrc}
        alt={client.nombre}
        className="h-14 w-auto max-w-[62vw] object-contain sm:h-16"
        draggable={false}
      />

      <motion.h1
        {...aparecer(0.18)}
        className="max-w-3xl text-balance text-[clamp(1.9rem,7.6vw,3.6rem)] font-extrabold leading-[1.08] tracking-tight"
      >
        <span className="block">{client.headline[0]}</span>
        <span className="block text-[var(--pt-acento)]">{client.headline[1]}</span>
      </motion.h1>

      <motion.p
        {...aparecer(0.3)}
        className="max-w-md text-pretty text-[15px] leading-relaxed text-[var(--pt-muted)]"
      >
        {client.subcopy}
      </motion.p>

      <motion.div {...aparecer(0.42)} className="w-full max-w-2xl">
        <LogoMarquee />
        <p className="mt-4 text-[13px] text-[var(--pt-muted)]">
          Más de <span className="font-semibold text-[var(--pt-blanco)]">750 marcas</span> han
          crecido con nosotros en{" "}
          <span className="font-semibold text-[var(--pt-blanco)]">12 países</span>.
        </p>
      </motion.div>
    </div>
  );
}
