"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ReactNode } from "react";

import { CountUp } from "@/components/propuesta/CountUp";
import { fadeUp, VIEWPORT_ONCE } from "@/components/propuesta/motion";
import { formatCompact } from "@/lib/propuestas/format";
import type { VideoCredencial } from "@/lib/propuestas/types";
import { cn } from "@/lib/utils";

const YATRA_FALLBACK: VideoCredencial = {
  titulo: "Sebastián Yatra — la marca detrás del artista",
  handle: "@sebastianyatra",
  vistas: 28_400_000,
};

const formatMarcas = (n: number) =>
  `+${new Intl.NumberFormat("es-CO").format(Math.round(n))}`;

function ProofCard({
  index,
  reduced,
  className,
  children,
}: {
  index: number;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      whileHover={reduced ? undefined : { y: -2 }}
      className={cn(
        "group flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.05]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
      {children}
    </p>
  );
}

export function LogrosSection({ videos }: { videos?: VideoCredencial[] }) {
  const reduced = useReducedMotion() ?? false;
  const video = videos?.[0] ?? YATRA_FALLBACK;

  const videoInner = (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[rgb(var(--acc-rgb)/0.35)] via-[rgb(var(--acc-rgb)/0.10)] to-white/[0.02]">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.titulo}
            fill
            sizes="(max-width: 640px) 90vw, 340px"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
            <Play
              className="h-4 w-4 translate-x-[1px] text-fl-text"
              fill="currentColor"
              aria-hidden
            />
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-fl-text">
          {video.handle}
        </span>
        <span className="shrink-0 text-xs text-fl-muted">
          <span className="font-semibold text-[var(--acc)]">
            {formatCompact(video.vistas)}
          </span>{" "}
          de vistas
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fl-muted">
        {video.titulo}
      </p>
    </>
  );

  return (
    <section
      id="logros"
      className="relative flex min-h-dvh snap-start items-center overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-[rgb(var(--acc-rgb)/0.07)] blur-3xl"
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--acc)]">
            <span className="prop-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
            Lo que hemos logrado
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fl-text sm:text-5xl">
            La evidencia habla
            <span className="text-[var(--acc)]">.</span>
          </h2>
        </motion.div>

        {/* Grid de prueba social */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {/* 1 — Marcas protegidas */}
          <ProofCard index={1} reduced={reduced}>
            <CardLabel>Legal</CardLabel>
            <div className="mt-5 flex-1">
              <CountUp
                value={6000}
                format={formatMarcas}
                className="text-4xl font-bold tracking-tight text-fl-text sm:text-5xl"
              />
              <p className="mt-1 text-base font-semibold text-fl-text">
                marcas protegidas
              </p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-fl-muted">
              Seneor Lawyers · parte del grupo
            </p>
          </ProofCard>

          {/* 2 — Convocatorias de innovación */}
          <ProofCard index={2} reduced={reduced}>
            <CardLabel>Innovación</CardLabel>
            <div className="mt-5 flex-1">
              <span className="text-4xl font-bold tracking-tight text-fl-text sm:text-5xl">
                2
              </span>
              <p className="mt-1 text-base font-semibold text-fl-text">
                convocatorias de innovación
              </p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-fl-muted">
              Gobierno de Colombia · financiadas por el BID
            </p>
          </ProofCard>

          {/* 3 — Video / líderes de industria */}
          <ProofCard index={3} reduced={reduced}>
            <CardLabel>Mercadeo</CardLabel>
            <div className="mt-5">
              <p className="text-2xl font-bold tracking-tight text-fl-text">
                Millones de vistas
              </p>
              <p className="mt-1 text-base font-semibold text-fl-text">
                líderes de industria
              </p>
            </div>
            {video.href ? (
              <motion.a
                href={video.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver video: ${video.titulo}`}
                whileHover={reduced ? undefined : { y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                className="mt-5 block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]"
              >
                {videoInner}
              </motion.a>
            ) : (
              <div className="mt-5">{videoInner}</div>
            )}
          </ProofCard>

          {/* 4 — Prensa */}
          <ProofCard index={4} reduced={reduced} className="lg:col-span-1">
            <CardLabel>Prensa</CardLabel>
            <div className="mt-5 flex flex-1 items-center">
              <Image
                src="/fotos_home/logo_la_republica.png"
                alt="La República"
                width={160}
                height={40}
                className="h-9 w-auto rounded"
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-fl-muted">
              Cobertura en medios especializados de negocios
            </p>
          </ProofCard>

          {/* 5 — Sellos */}
          <ProofCard
            index={5}
            reduced={reduced}
            className="sm:col-span-1 lg:col-span-2"
          >
            <CardLabel>Sellos</CardLabel>
            <div className="mt-5 flex flex-1 flex-wrap items-center gap-2">
              <span className="flex items-center rounded-xl bg-white/95 px-3 py-2">
                <Image
                  src="/logos/logo_mintic_1.png"
                  alt="MinTIC"
                  width={120}
                  height={31}
                  className="h-6 w-auto"
                />
              </span>
              <span className="flex items-center rounded-xl bg-white/95 px-3 py-2">
                <Image
                  src="/logos/logo_bid_3.png"
                  alt="BID"
                  width={120}
                  height={40}
                  className="h-6 w-auto"
                />
              </span>
              <span className="flex h-10 items-center rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800">
                Colciencias
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-fl-muted">
              Instituciones que han respaldado nuestros proyectos
            </p>
          </ProofCard>
        </div>

        {/* Cierre */}
        <motion.p
          variants={fadeUp}
          custom={6}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mt-10 text-sm leading-relaxed text-fl-muted"
        >
          Nada de esto es una promesa. Es historial verificable — el mismo
          equipo que estaría detrás de su marca.
        </motion.p>
      </div>
    </section>
  );
}
