"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  onJump: (id: string) => void;
};

/**
 * Rail lateral persistente: 5 puntos + nombre de la fase activa.
 * Clickeable para saltar entre mundos.
 */
export function ProgressRail({ items, activeId, onJump }: ProgressRailProps) {
  const reduced = useReducedMotion();

  return (
    <nav
      aria-label="Progreso de la propuesta"
      className="fixed left-3 top-1/2 z-40 -translate-y-1/2 sm:left-5"
    >
      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const activo = item.id === activeId;
          return (
            <li key={item.id} className="relative flex items-center">
              <button
                type="button"
                onClick={() => onJump(item.id)}
                aria-label={`Fase ${item.fase} — ${item.nombre}`}
                aria-current={activo ? "step" : undefined}
                className="group flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    activo
                      ? "h-2.5 w-2.5"
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
                  className="pointer-events-none absolute left-7 hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-fl-muted md:block"
                >
                  {item.nombre}
                </motion.span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
