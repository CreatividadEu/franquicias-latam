"use client";

import { motion } from "framer-motion";
import { FileText, ArrowDownToLine } from "lucide-react";
import type { BrochureData } from "@/lib/franchise-mapper";

export function BrochureSection({ data }: { data: BrochureData }) {
  return (
    <section className="bg-[#f8fafc] py-16 md:py-24" aria-label="Dossier">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
          style={{
            background: "#eef3ff",
            border: "1px solid rgba(37,99,235,0.2)",
            boxShadow: "0 2px 16px rgba(37,99,235,0.08)",
          }}
        >
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.25)",
              }}
            >
              <FileText className="h-7 w-7 text-[#2563eb]" />
            </div>

            <div className="flex-1 space-y-1.5">
              <h2
                className="text-xl font-bold text-[#171717] sm:text-2xl"
                style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
              >
                Dossier de {data.name}
              </h2>
              <p className="text-sm text-slate-500">
                Descarga el dossier completo con modelo financiero, inversión detallada y próximos pasos.
              </p>
            </div>

            <a
              href={data.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_-4px_rgba(37,99,235,0.5)] active:scale-95"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Descargar dossier
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
