"use client";

import { motion } from "framer-motion";
import { formatUsd } from "@/lib/propuestas/format";
import type { ProposalInversion } from "@/lib/propuestas/types";
import { fadeUp, VIEWPORT_ONCE } from "./motion";
import type { CountdownState } from "./useCountdown";

type InversionSectionProps = {
  inversion: ProposalInversion;
  descuentoPct: number;
  countdown: CountdownState;
  diasVentana: number;
};

/**
 * Inversión: monto total en 3 pagos. El cupo (pago 1) separa el
 * arranque; pagado dentro de la ventana del deadline aplica el
 * descuento sobre el monto total. Al expirar, degrada a precio pleno.
 */
export function InversionSection({
  inversion,
  descuentoPct,
  countdown,
  diasVentana,
}: InversionSectionProps) {
  const { totalUsd, cupoUsd } = inversion;
  const conDescuento = !countdown.expired;

  const totalDcto = Math.round(totalUsd * (1 - descuentoPct / 100));
  const totalVigente = conDescuento ? totalDcto : totalUsd;
  const pagoRestante = Math.round((totalVigente - cupoUsd) / 2);
  const pagoRestantePleno = Math.round((totalUsd - cupoUsd) / 2);

  const noMotion = {
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: VIEWPORT_ONCE,
  };

  const pagos = [
    {
      numero: "01",
      momento: "Hoy — separa su cupo",
      monto: cupoUsd,
      nota: conDescuento
        ? `Pagado dentro de los ${diasVentana} ${diasVentana === 1 ? "día" : "días"} siguientes a esta presentación, aplica el ${descuentoPct}% de descuento sobre el monto total.`
        : "Separa el cupo y arrancamos de inmediato con la recolección de información.",
      destacado: true,
    },
    {
      numero: "02",
      momento: "Al mes del pago del cupo",
      monto: pagoRestante,
      nota: conDescuento ? `${formatUsd(pagoRestantePleno)} sin descuento` : undefined,
      destacado: false,
    },
    {
      numero: "03",
      momento: "30 días después",
      monto: pagoRestante,
      nota: conDescuento ? `${formatUsd(pagoRestantePleno)} sin descuento` : undefined,
      destacado: false,
    },
  ];

  return (
    <section
      id="inversion"
      className="relative flex min-h-dvh snap-start items-center overflow-hidden"
    >
      <div className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-8">
        <motion.p
          {...noMotion}
          variants={fadeUp}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fl-muted"
        >
          <span className="text-[var(--acc)]">Inversión</span> · Consultoría
          integral de franquicia
        </motion.p>

        <motion.h2
          {...noMotion}
          variants={fadeUp}
          custom={1}
          className="mt-4 text-3xl font-bold leading-[1.05] tracking-tight text-fl-text sm:text-5xl"
        >
          Todo lo que acaba de ver. Un solo número.
        </motion.h2>

        {/* Total */}
        <motion.div
          {...noMotion}
          variants={fadeUp}
          custom={2}
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fl-muted">
            Monto total · en 3 pagos
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {conDescuento ? (
              <>
                <span className="text-4xl font-bold tabular-nums tracking-tight text-[var(--acc)] sm:text-6xl">
                  {formatUsd(totalDcto)}
                </span>
                <span className="text-lg font-semibold text-fl-muted">
                  + IVA
                </span>
                <span className="text-base font-medium text-fl-muted line-through opacity-70">
                  {formatUsd(totalUsd)} + IVA
                </span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold tabular-nums tracking-tight text-fl-text sm:text-6xl">
                  {formatUsd(totalUsd)}
                </span>
                <span className="text-lg font-semibold text-fl-muted">
                  + IVA
                </span>
              </>
            )}
          </div>
          {conDescuento ? (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-fl-muted">
              Con el {descuentoPct}% de descuento por separar su cupo dentro de
              los {diasVentana} {diasVentana === 1 ? "día" : "días"} siguientes
              a esta presentación.
            </p>
          ) : null}
        </motion.div>

        {/* Timeline de pagos */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {pagos.map((p, i) => (
            <motion.div
              key={p.numero}
              {...noMotion}
              variants={fadeUp}
              custom={3 + i}
              whileHover={{ y: -2 }}
              className="flex flex-col rounded-2xl border bg-white/[0.03] p-5"
              style={{
                borderColor: p.destacado
                  ? "rgb(var(--acc-rgb) / 0.4)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: p.destacado ? "var(--acc)" : undefined }}
                >
                  Pago {p.numero}
                </span>
                {p.destacado ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      color: "var(--acc)",
                      background: "rgb(var(--acc-rgb) / 0.12)",
                    }}
                  >
                    Separa el cupo
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-fl-text">
                {p.momento}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-fl-text">
                {formatUsd(p.monto)}{" "}
                <span className="text-sm font-semibold text-fl-muted">
                  + IVA
                </span>
              </p>
              {p.nota ? (
                <p className="mt-3 text-xs leading-relaxed text-fl-muted">
                  {p.nota}
                </p>
              ) : null}
            </motion.div>
          ))}
        </div>

        <motion.p
          {...noMotion}
          variants={fadeUp}
          custom={6}
          className="mt-6 text-sm leading-relaxed text-fl-muted"
        >
          El cupo es el primero de los 3 pagos: separa su lugar y arrancamos de
          inmediato con la recolección de información.
        </motion.p>
      </div>
    </section>
  );
}
