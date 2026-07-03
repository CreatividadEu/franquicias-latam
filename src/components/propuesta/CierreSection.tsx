"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Check, MessageCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { registrarIntencion } from "@/lib/propuestas/actions";
import type { Proposal } from "@/lib/propuestas/types";
import { fadeUp, VIEWPORT_ONCE } from "./motion";
import type { CountdownState } from "./useCountdown";

type CierreSectionProps = {
  proposal: Proposal;
  countdown: CountdownState;
};

type EstadoCta = "idle" | "done" | "error";

function waLink(whatsapp: string, mensaje: string): string {
  return `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Cierre: countdown grande anclado al deadline fijo + oferta + CTA doble.
 * Al expirar oculta el descuento con gracia y cambia el CTA a
 * "Solicitar disponibilidad". Nunca un estado roto.
 */
export function CierreSection({ proposal, countdown }: CierreSectionProps) {
  const reduced = useReducedMotion();
  const [estado, setEstado] = useState<EstadoCta>("idle");
  const [pending, startTransition] = useTransition();

  const { mesObjetivo, descuentoPct, cliente, whatsapp, calUrl, slug } =
    proposal;
  const expired = countdown.expired;

  const confirmar = () => {
    startTransition(async () => {
      const res = await registrarIntencion({
        proposalSlug: slug,
        action: expired ? "solicitar_disponibilidad" : "confirmar_cupo",
      });
      setEstado(res.ok ? "done" : "error");
    });
  };

  const noMotion = reduced
    ? { initial: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: VIEWPORT_ONCE,
      };

  const tiles: { valor: number; label: string }[] = [
    { valor: countdown.dias, label: "días" },
    { valor: countdown.horas, label: "horas" },
    { valor: countdown.minutos, label: "min" },
  ];

  return (
    <section
      id="cierre"
      className="relative flex min-h-dvh snap-start items-center overflow-hidden"
    >
      {/* Eco sutil de la aurora del hero para cerrar el círculo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute bottom-[-30%] left-1/2 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--acc-rgb) / 0.5), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <motion.p
          {...noMotion}
          variants={fadeUp}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fl-muted"
        >
          <span className="text-[var(--acc)]">Cupo {mesObjetivo}</span> ·{" "}
          {cliente}
        </motion.p>

        <motion.h2
          {...noMotion}
          variants={fadeUp}
          custom={1}
          className="mt-4 text-3xl font-bold leading-[1.05] tracking-tight text-fl-text sm:text-5xl"
        >
          {expired
            ? `El cupo de ${mesObjetivo} cerró.`
            : "Su cupo está reservado. Por ahora."}
        </motion.h2>

        <motion.p
          {...noMotion}
          variants={fadeUp}
          custom={2}
          className="mt-4 max-w-xl text-base leading-relaxed text-fl-muted sm:text-lg"
        >
          {expired
            ? "Podemos revisar disponibilidad para el siguiente ciclo. Solicítela y le respondemos el mismo día."
            : `Confirme su cupo para ${mesObjetivo} en los próximos 7 días y obtenga ${descuentoPct}% de descuento. Arrancamos de inmediato con la recolección de información.`}
        </motion.p>

        {/* Countdown grande — anclado al deadline fijo, no se reinicia */}
        {!expired ? (
          <motion.div
            {...noMotion}
            variants={fadeUp}
            custom={3}
            className="mt-10 w-full max-w-md"
          >
            <div className="grid grid-cols-3 gap-3">
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5"
                >
                  <p className="text-4xl font-bold tabular-nums tracking-tight text-fl-text sm:text-5xl">
                    {countdown.ready ? String(t.valor).padStart(2, "0") : "··"}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-fl-muted">
                    {t.label}
                  </p>
                </div>
              ))}
            </div>
            {/* Anillo de progreso, versión lineal: lo que queda de la ventana */}
            <div
              className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]"
              role="progressbar"
              aria-label="Tiempo restante de la oferta"
              aria-valuenow={Math.round(countdown.fraccion * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full origin-left rounded-full transition-transform duration-1000 ease-linear"
                style={{
                  background: "var(--acc)",
                  transform: `scaleX(${countdown.ready ? countdown.fraccion : 1})`,
                }}
              />
            </div>
          </motion.div>
        ) : null}

        {/* CTA doble */}
        <motion.div
          {...noMotion}
          variants={fadeUp}
          custom={4}
          className="mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          {estado === "done" ? (
            <div className="w-full rounded-2xl border px-5 py-4 text-left"
              style={{
                borderColor: "rgb(var(--acc-rgb) / 0.35)",
                background: "rgb(var(--acc-rgb) / 0.08)",
              }}
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-fl-text">
                <Check className="h-4 w-4" style={{ color: "var(--acc)" }} aria-hidden="true" />
                Listo. Le escribimos por WhatsApp para arrancar la recolección
                de información.
              </p>
              {whatsapp ? (
                <a
                  href={waLink(
                    whatsapp,
                    `Hola, soy ${cliente}. ${expired ? "Quiero consultar disponibilidad." : `Confirmo mi cupo para ${mesObjetivo}.`}`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-fl-muted underline-offset-4 hover:text-fl-text hover:underline"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  O escríbanos ahora mismo
                </a>
              ) : null}
            </div>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={confirmar}
                disabled={pending}
                whileHover={reduced || pending ? undefined : { y: -2 }}
                whileTap={reduced || pending ? undefined : { scale: 0.97 }}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-fl-base transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)] disabled:opacity-60 sm:w-auto"
                style={{
                  background: "var(--acc)",
                  boxShadow: "0 8px 32px -8px rgb(var(--acc-rgb) / 0.55)",
                }}
              >
                {pending
                  ? "Enviando…"
                  : expired
                    ? "Solicitar disponibilidad"
                    : `Confirmar cupo para ${mesObjetivo}`}
              </motion.button>
              {calUrl ? (
                <motion.a
                  href={calUrl}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={reduced ? undefined : { y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.97 }}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-sm font-medium text-fl-text hover:border-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)] sm:w-auto"
                >
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Agendar llamada
                </motion.a>
              ) : null}
            </>
          )}
        </motion.div>

        {estado === "error" ? (
          <p className="mt-4 max-w-md text-sm text-fl-muted">
            No pudimos registrar su confirmación en este momento.
            {whatsapp ? (
              <>
                {" "}
                <a
                  href={waLink(
                    whatsapp,
                    `Hola, soy ${cliente}. ${expired ? "Quiero consultar disponibilidad." : `Confirmo mi cupo para ${mesObjetivo}.`}`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-fl-text underline underline-offset-4"
                >
                  Escríbanos directo por WhatsApp
                </a>{" "}
                y lo resolvemos ya.
              </>
            ) : (
              " Inténtelo de nuevo en unos minutos."
            )}
          </p>
        ) : null}

        <motion.p
          {...noMotion}
          variants={fadeUp}
          custom={5}
          className="mt-12 text-[11px] font-medium uppercase tracking-[0.18em] text-fl-muted/60"
        >
          Franquicias LATAM · Propuesta privada para {cliente}
        </motion.p>
      </div>
    </section>
  );
}
