"use client";

import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import type { BookingData } from "@/lib/franchise-mapper";

export function BookingSection({ data }: { data: BookingData }) {
  return (
    <section className="bg-white py-16 md:py-24" aria-label="Reservar llamada">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-2xl p-8 text-center sm:p-12"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          }}
        >
          <div className="relative space-y-6">
            <div className="flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.2)",
                }}
              >
                <CalendarDays className="h-6 w-6 text-[#2563eb]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2
                className="text-2xl font-bold text-[#171717] sm:text-3xl"
                style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
              >
                Agenda una llamada con {data.name}
              </h2>
              <p className="mx-auto max-w-md text-sm text-slate-500">
                Valida el encaje, despeja dudas y avanza con el equipo de franquicia en 30 minutos.
              </p>
            </div>

            <a
              href={data.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.6)] active:scale-95"
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
