"use client";

import { motion } from "framer-motion";
import { garantia } from "@/config/clients";
import { aparecer } from "../motionPresets";

export default function GuaranteeSlide() {
  return (
    <div className="pt-scroll relative flex h-full flex-col justify-center overflow-y-auto px-7 pb-36 pt-20">
      {/* glow dramático central */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 38%, color-mix(in srgb, var(--pt-acento) 7%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-xl">
        <motion.p
          {...aparecer(0.06)}
          className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--pt-acento)]"
        >
          La garantía
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.14, type: "spring", stiffness: 150, damping: 19 }}
          className="text-[clamp(3.1rem,15vw,6.4rem)] font-extrabold leading-[0.94] tracking-tight"
        >
          <span className="block">{garantia.titulo[0]}</span>
          <span className="block text-[var(--pt-acento)]">{garantia.titulo[1]}</span>
        </motion.h2>

        <motion.p
          {...aparecer(0.3)}
          className="mt-6 max-w-lg text-pretty text-[14.5px] leading-relaxed text-[var(--pt-muted)]"
        >
          {garantia.texto}{" "}
          <span className="font-semibold text-[var(--pt-blanco)]">{garantia.enfasis}</span>
        </motion.p>

        {/* siguiente paso: 4 micro-pasos */}
        <motion.ol {...aparecer(0.44)} className="mt-8">
          {garantia.pasos.map((paso, i) => (
            <li key={paso} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--pt-acento)]/40 text-[11px] font-bold text-[var(--pt-acento)]">
                  {i + 1}
                </span>
                {i < garantia.pasos.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-gradient-to-b from-[var(--pt-acento)]/40 to-[var(--pt-acento)]/10" />
                )}
              </div>
              <p className="pb-5 pt-1 text-[14px] font-medium text-[var(--pt-blanco)]/90">{paso}</p>
            </li>
          ))}
        </motion.ol>

        <motion.p {...aparecer(0.56)} className="text-[11.5px] leading-relaxed text-[var(--pt-muted)]/85">
          {garantia.nota}
        </motion.p>
      </div>
    </div>
  );
}
