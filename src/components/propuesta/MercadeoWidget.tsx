"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eye, Landmark, Play } from "lucide-react";
import Image from "next/image";
import { CountUp } from "@/components/propuesta/CountUp";
import { fadeUp, VIEWPORT_ONCE } from "@/components/propuesta/motion";
import { formatCompact } from "@/lib/propuestas/format";
import type { VideoCredencial } from "@/lib/propuestas/types";

/**
 * FASE 05 — Mercadeo. Vender franquicias, vuelto sistema.
 * Tres bloques: diagrama del sistema, credenciales institucionales
 * y franja de prueba social en video. La evidencia habla sola.
 */

const NODOS = [
  {
    paso: "01",
    nombre: "Identificación de perfiles",
    detalle: "Perfil inversionista definido con datos",
  },
  {
    paso: "02",
    nombre: "Embudos",
    detalle: "Contenido y pauta que filtran solos",
  },
  {
    paso: "03",
    nombre: "Conversión",
    detalle: "Candidatos calificados en su agenda",
  },
] as const;

const DEFAULT_VIDEOS: VideoCredencial[] = [
  {
    titulo: "Sebastián Yatra — la marca detrás del artista",
    handle: "@sebastianyatra",
    vistas: 28_400_000,
  },
  {
    titulo: "Cómo franquiciar su negocio en Colombia",
    handle: "@franquiciaslatam",
    vistas: 3_200_000,
  },
  {
    titulo: "Líderes de industria: expansión en LATAM",
    handle: "@franquiciaslatam",
    vistas: 1_800_000,
  },
];

/** Placeholders distintos por card: slate profundo con un matiz del acento. */
const GRADIENTS = [
  "linear-gradient(135deg, #1e293b 0%, #0b1220 55%, rgb(var(--acc-rgb) / 0.38) 140%)",
  "linear-gradient(160deg, #0f172a 0%, rgb(var(--acc-rgb) / 0.16) 62%, #1e293b 100%)",
  "linear-gradient(115deg, rgb(var(--acc-rgb) / 0.2) 0%, #111827 48%, #0b1220 100%)",
];

/** Conexión con flujo animado: vertical en móvil, horizontal en desktop. */
function Conector() {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center self-center py-1 sm:px-0.5 sm:py-0"
    >
      {/* Móvil: flujo vertical */}
      <svg className="h-11 w-4 sm:hidden" viewBox="0 0 16 44" fill="none">
        <line
          x1="8"
          y1="3"
          x2="8"
          y2="33"
          stroke="var(--acc)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          opacity="0.8"
          className="prop-flow"
        />
        <path
          d="M3.5 34 L8 41 L12.5 34"
          stroke="var(--acc)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="8" cy="3" r="2.5" fill="var(--acc)" className="prop-pulse-dot" />
      </svg>
      {/* Desktop: flujo horizontal */}
      <svg className="hidden h-4 w-9 sm:block" viewBox="0 0 36 16" fill="none">
        <line
          x1="3"
          y1="8"
          x2="26"
          y2="8"
          stroke="var(--acc)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          opacity="0.8"
          className="prop-flow"
        />
        <path
          d="M26.5 3.5 L33.5 8 L26.5 12.5"
          stroke="var(--acc)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="3" cy="8" r="2.5" fill="var(--acc)" className="prop-pulse-dot" />
      </svg>
    </div>
  );
}

function VideoCard({
  video,
  index,
  reduced,
}: {
  video: VideoCredencial;
  index: number;
  reduced: boolean;
}) {
  const inner = (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 transition-colors duration-300 group-hover:border-white/15">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.titulo}
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
          >
            <span className="absolute bottom-2 left-3 select-none text-xl font-extrabold tracking-tight text-white/[0.08]">
              {video.handle}
            </span>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition-transform duration-300 group-hover:scale-110">
            <Play
              className="ml-0.5 h-5 w-5 text-fl-text"
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-fl-text">
        {video.titulo}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-fl-muted">{video.handle}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--acc)]">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <CountUp value={video.vistas} format={formatCompact} /> de vistas
        </span>
      </div>
    </>
  );

  if (video.href) {
    return (
      <motion.a
        href={video.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Ver video: ${video.titulo}`}
        className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]"
        variants={reduced ? undefined : fadeUp}
        custom={index}
        whileHover={reduced ? undefined : { y: -2 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div
      className="group"
      variants={reduced ? undefined : fadeUp}
      custom={index}
    >
      {inner}
    </motion.div>
  );
}

export function MercadeoWidget({ videos }: { videos?: VideoCredencial[] }) {
  const reduced = useReducedMotion();
  const lista = videos && videos.length > 0 ? videos : DEFAULT_VIDEOS;

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Bloque 1 — Diagrama del sistema */}
      <motion.section
        aria-label="Sistema de venta de franquicias"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUp}
        custom={0}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
          El sistema
        </p>
        <div className="mt-4 flex flex-col items-stretch sm:flex-row">
          {NODOS.map((nodo, i) => (
            <div key={nodo.paso} className="contents">
              {i > 0 && <Conector />}
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.05] sm:flex-1 sm:py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--acc)]">
                  {nodo.paso}
                </p>
                <p className="mt-1 text-sm font-bold tracking-tight text-fl-text">
                  {nodo.nombre}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-fl-muted">
                  {nodo.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Bloque 2 — Credenciales */}
      <motion.section
        aria-label="Credenciales institucionales"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUp}
        custom={1}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
          Credenciales
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <Landmark
              className="h-4 w-4 shrink-0 text-[var(--acc)]"
              aria-hidden="true"
            />
            <span className="min-w-0 text-xs font-semibold leading-snug text-fl-text sm:text-sm">
              2 convocatorias de innovación
              <span className="font-medium text-fl-muted"> · Gobierno de Colombia</span>
            </span>
          </div>
          <div className="inline-flex max-w-full items-center gap-2.5 rounded-full bg-white/90 px-3 py-1.5">
            <Image
              src="/logos/logo_bid_3.png"
              alt="Logo del BID"
              width={64}
              height={24}
              className="h-4 w-auto"
            />
            <span className="text-xs font-semibold leading-snug text-slate-900 sm:text-sm">
              Financiado por el BID (2 veces)
            </span>
          </div>
        </div>
      </motion.section>

      {/* Bloque 3 — Prueba social en video */}
      <motion.section
        aria-label="Videos con alcance real"
        initial={reduced ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUp}
        custom={2}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
          Alcance real
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {lista.map((video, i) => (
            <VideoCard
              key={`${video.handle}-${video.titulo}`}
              video={video}
              index={i}
              reduced={reduced ?? false}
            />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
