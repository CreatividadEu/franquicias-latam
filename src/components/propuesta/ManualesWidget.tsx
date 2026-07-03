"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  BookOpen,
  ChevronsUpDown,
  ClipboardList,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fadeUp, VIEWPORT_ONCE } from "@/components/propuesta/motion";
import type { ModuloManual } from "@/lib/propuestas/types";
import { cn } from "@/lib/utils";

const MODULOS_DEFAULT: ModuloManual[] = [
  {
    nombre: "Preapertura",
    descripcion: "Del contrato firmado a la apertura, sin improvisación.",
  },
  {
    nombre: "Operaciones",
    descripcion: "Producto y experiencia idénticos, en cada local.",
  },
  {
    nombre: "Talento Humano",
    descripcion: "Selección, formación y evaluación del equipo.",
  },
];

const ICONS: LucideIcon[] = [BookOpen, ClipboardList, Users];

/** Rotaciones del mazo apilado (grados), cíclicas si hay más módulos. */
const ROTATIONS = [-3, 2.5, 7];

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

const COLS_DESKTOP: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

/**
 * FASE 03 — Stack de manuales: cartas apiladas con leve rotación que se
 * despliegan en fila (desktop, hover o clic) o columna (móvil, tap).
 * Solo transform/opacity; degrada a estado final con reduced-motion.
 */
export function ManualesWidget({ modulos }: { modulos?: ModuloManual[] }) {
  const items = modulos && modulos.length > 0 ? modulos : MODULOS_DEFAULT;
  const reduced = useReducedMotion();

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Con reduced-motion el estado final es el abanico desplegado (estático).
  const open = reduced ? true : pinned || hovered;
  const center = Math.floor((items.length - 1) / 2);
  const stackedName = isDesktop ? "stackedRow" : "stackedCol";
  const deckTransition = reduced ? { duration: 0 } : SPRING;

  /**
   * Celda exterior: cada carta viaja (en % de su propio tamaño, las celdas
   * son uniformes) hacia la celda central para formar el mazo.
   */
  const cellVariants: Variants = {
    stackedCol: (i: number) => ({ x: "0%", y: `${(center - i) * 100}%` }),
    stackedRow: (i: number) => ({ x: `${(center - i) * 100}%`, y: "0%" }),
    open: { x: "0%", y: "0%" },
  };

  /** Carta interior: rotación, escala y jitter en px para el efecto mazo. */
  const cardVariants: Variants = {
    stackedCol: (i: number) => ({
      rotate: ROTATIONS[i % ROTATIONS.length],
      scale: 1 - i * 0.04,
      y: i * 10,
    }),
    stackedRow: (i: number) => ({
      rotate: ROTATIONS[i % ROTATIONS.length],
      scale: 1 - i * 0.04,
      y: i * 10,
    }),
    open: { rotate: 0, scale: 1, y: 0 },
  };

  const inViewProps = reduced
    ? { initial: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: VIEWPORT_ONCE,
      };

  return (
    <motion.div
      {...inViewProps}
      variants={fadeUp}
      className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6"
    >
      {/* Encabezado del widget */}
      <div className="flex items-center justify-between gap-3 px-1 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
          Stack de manuales
        </p>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-fl-muted">
          {items.length} módulos
        </span>
      </div>

      {/* Mazo interactivo */}
      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={
          open
            ? "Apilar los módulos de manuales"
            : "Desplegar los módulos de manuales"
        }
        onClick={() => {
          if (!reduced) {
            setPinned((v) => !v);
          }
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={reduced ? undefined : { y: -2 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        className="block w-full cursor-pointer rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]"
      >
        <div
          className={cn(
            "grid auto-rows-fr grid-cols-1",
            COLS_DESKTOP[items.length] ?? "sm:grid-cols-3",
          )}
        >
          {items.map((mod, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={mod.nombre}
                custom={i}
                variants={cellVariants}
                initial={false}
                animate={open ? "open" : stackedName}
                transition={deckTransition}
                style={{ zIndex: items.length - i }}
                className="relative p-1.5 sm:p-2"
              >
                <motion.div
                  custom={i}
                  variants={cardVariants}
                  initial={false}
                  animate={open ? "open" : stackedName}
                  transition={deckTransition}
                  whileHover={reduced ? undefined : { y: -2 }}
                  className="flex h-full min-h-[8.5rem] flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0f1526] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] sm:min-h-[11rem] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--acc-rgb)/0.35)] bg-[rgb(var(--acc-rgb)/0.12)] text-[var(--acc)]">
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
                      Manual {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-fl-text sm:text-lg">
                      {mod.nombre}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-fl-muted">
                      {mod.descripcion}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Afordancia del toggle (sin sentido bajo reduced-motion) */}
        {reduced ? null : (
          <span
            aria-hidden="true"
            className="mt-3 flex items-center justify-center gap-1.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" strokeWidth={2} />
            {open ? "Toque para apilar" : "Toque para desplegar"}
          </span>
        )}
      </motion.button>

      {/* Evidencia bajo el stack */}
      <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
        <motion.div variants={fadeUp} custom={1}>
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
            <span
              aria-hidden="true"
              className="prop-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--acc)]"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fl-text">
              Anexos del contrato
            </span>
            <span aria-hidden="true" className="text-fl-muted">
              ·
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fl-muted">
              enforcement real
            </span>
          </span>
        </motion.div>

        <motion.div variants={fadeUp} custom={2}>
          <p className="text-2xl font-bold tracking-tight text-fl-text sm:text-3xl">
            De caos a <span className="text-[var(--acc)]">estándar</span>.
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-fl-muted">
            La rotación en F&B deja de dictar su operación: menos errores y
            costos desde el día uno.
          </p>
        </motion.div>

        <motion.p
          variants={fadeUp}
          custom={3}
          className="border-l-2 border-[rgb(var(--acc-rgb)/0.35)] pl-4 text-sm leading-relaxed text-fl-muted"
        >
          El valor trasciende la red: estos sistemas se usan desde el día uno
          con su equipo actual y permiten pivotear la estrategia comercial y
          operativa con alta precisión.
        </motion.p>
      </div>
    </motion.div>
  );
}
