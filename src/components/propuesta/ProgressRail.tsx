"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "./motion";

export type RailItem = {
  id: string;
  fase: string; // "01".."05"
  nombre: string;
};

type ProgressRailProps = {
  items: RailItem[];
  activeId: string;
  /** El rail aparece al salir del hero: la portada queda limpia. */
  visible: boolean;
  onJump: (id: string) => void;
};

/**
 * Rail lateral persistente: 5 puntos + nombre de la fase activa.
 * Clickeable para saltar entre mundos. En móvil vive pegado al borde
 * para no pisar el contenido (px-5 de las secciones).
 */
export function ProgressRail({
  items,
  activeId,
  visible,
  onJump,
}: ProgressRailProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.nav
          aria-label="Progreso de la propuesta"
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? undefined : { opacity: 0, x: -8 }}
          transition={{ duration: 0.35 }}
          className="fixed left-0.5 top-1/2 z-40 -translate-y-1/2 sm:left-4"
        >
          <ul className="flex flex-col gap-3 sm:gap-4">
            {items.map((item) => {
              const activo = item.id === activeId;
              return (
                <li key={item.id} className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => onJump(item.id)}
                    aria-label={`Fase ${item.fase} — ${item.nombre}`}
                    aria-current={activo ? "step" : undefined}
                    className="group flex h-4 w-4 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)] sm:h-6 sm:w-6"
                  >
                    <span
                      className={cn(
                        "block rounded-full transition-all duration-300",
                        activo
                          ? "h-2 w-2 sm:h-2.5 sm:w-2.5"
                          : "h-1.5 w-1.5 bg-white/25 group-hover:bg-white/50",
                      )}
                      style={activo ? { background: "var(--acc)" } : undefined}
                    />
                  </button>
                  {activo ? (
                    <motion.span
                      initial={reduced ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={reduced ? { duration: 0 } : SPRING_SNAPPY}
                      className="pointer-events-none absolute left-6 hidden whitespace-nowrap rounded-full border border-white/10 bg-fl-base/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-fl-muted backdrop-blur-md md:block"
                    >
                      {item.nombre}
                    </motion.span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}
