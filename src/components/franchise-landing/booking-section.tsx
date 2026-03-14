"use client";

import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import type { BookingData } from "@/lib/franchise-mapper";

export function BookingSection({ data }: { data: BookingData }) {
  return (
    <section className="bg-[#0A0F1E] py-20 md:py-28" aria-label="Reservar llamada">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden p-8 text-center sm:p-12"
          style={{
            background: "rgba(0,240,255,0.04)",
            border: "1px solid rgba(0,240,255,0.15)",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full"
            style={{ background: "rgba(0,240,255,0.08)", filter: "blur(100px)" }}
          />

          <div className="relative space-y-6">
            <div className="flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(0,240,255,0.1)",
                  border: "1px solid rgba(0,240,255,0.25)",
                }}
              >
                <CalendarDays className="h-6 w-6 text-[#00F0FF]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2
                className="text-2xl font-bold text-[#F0F0F5] sm:text-3xl"
                style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
              >
                Agenda una llamada con {data.name}
              </h2>
              <p className="mx-auto max-w-md text-sm text-[#8A8F9E]">
                Valida el encaje, despeja dudas y avanza con el equipo de franquicia en 30 minutos.
              </p>
            </div>

            <a
              href={data.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[#00F0FF] px-8 py-4 text-sm font-semibold text-[#0A0F1E] transition-all hover:brightness-110 active:scale-95"
            >
              Reservar llamada
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
