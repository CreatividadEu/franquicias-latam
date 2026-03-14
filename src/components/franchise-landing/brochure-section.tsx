"use client";

import { motion } from "framer-motion";
import { FileText, ArrowDownToLine } from "lucide-react";
import type { BrochureData } from "@/lib/franchise-mapper";

export function BrochureSection({ data }: { data: BrochureData }) {
  return (
    <section className="bg-[#0A0F1E] py-20 md:py-28" aria-label="Dossier">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden p-8 sm:p-12"
          style={{
            background: "rgba(123,97,255,0.05)",
            border: "1px solid rgba(123,97,255,0.2)",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full"
            style={{ background: "rgba(123,97,255,0.1)", filter: "blur(80px)" }}
          />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(123,97,255,0.1)",
                border: "1px solid rgba(123,97,255,0.3)",
              }}
            >
              <FileText className="h-7 w-7 text-[#7B61FF]" />
            </div>

            <div className="flex-1 space-y-1.5">
              <h2
                className="text-xl font-bold text-[#F0F0F5] sm:text-2xl"
                style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
              >
                Dossier de {data.name}
              </h2>
              <p className="text-sm text-[#8A8F9E]">
                Descarga el dossier completo con modelo financiero, inversión detallada y próximos pasos.
              </p>
            </div>

            <a
              href={data.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] flex-shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#7B61FF] transition-all active:scale-95"
              style={{
                background: "rgba(123,97,255,0.15)",
                border: "1px solid rgba(123,97,255,0.4)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(123,97,255,0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(123,97,255,0.15)")
              }
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
