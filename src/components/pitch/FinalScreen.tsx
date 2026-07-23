"use client";

import { motion } from "framer-motion";
import type { ClientConfig } from "@/config/clients";
import AmbientGolf from "./AmbientGolf";
import LogoMarquee from "./LogoMarquee";
import PayButton from "./PayButton";
import { aparecer } from "./motionPresets";

// Pantalla de cierre. `reducida` es la versión burn-after-viewing (cualquier
// carga posterior): solo logo, "Crezcamos juntos.", la promesa y el botón.
export default function FinalScreen({
  client,
  reducida = false,
}: {
  client: ClientConfig;
  reducida?: boolean;
}) {
  return (
    <div className="pt-scroll relative flex h-full flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-12 text-center">
      <motion.img
        {...aparecer(0.05)}
        src={client.logoSrc}
        alt={client.nombre}
        className="h-16 w-auto max-w-[72vw] object-contain sm:h-20"
        draggable={false}
      />

      <motion.div {...aparecer(0.16)}>
        <h2 className="text-[clamp(2.3rem,9vw,3.8rem)] font-extrabold leading-[1.02] tracking-tight">
          Crezcamos juntos.
        </h2>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.42em] text-[var(--pt-acento)]">
          O crece o crece.
        </p>
      </motion.div>

      {!reducida && (
        <motion.div {...aparecer(0.28)} className="w-full max-w-2xl">
          <LogoMarquee />
          <p className="mt-3 text-xs text-[var(--pt-muted)]">
            Más de <span className="font-semibold text-[var(--pt-blanco)]">750 marcas</span> en{" "}
            <span className="font-semibold text-[var(--pt-blanco)]">12 países</span> ya jugaron esta ronda.
          </p>
        </motion.div>
      )}

      <motion.div {...aparecer(reducida ? 0.28 : 0.4)} className="flex flex-col items-center">
        <PayButton client={client} />
        <AmbientGolf />
        <p className="-mt-1 text-[11px] text-[var(--pt-muted)]">
          Pago seguro vía Stripe · Bootcamp de Franquicias
        </p>
      </motion.div>
    </div>
  );
}
