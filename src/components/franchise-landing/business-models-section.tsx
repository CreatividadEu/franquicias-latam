"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import type { BusinessModelData } from "@/lib/franchise-mapper";

// ── Styles ────────────────────────────────────────────────────────────────────

const solidCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "16px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
};

const innerCell: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "12px",
};

// ── Compact model card (left column) ─────────────────────────────────────────

function ModelCard({
  model,
  index,
}: {
  model: BusinessModelData;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex flex-col overflow-hidden"
      style={solidCard}
    >
      {model.imageUrl && (
        <div className="relative h-[220px] w-full overflow-hidden rounded-t-2xl">
          <Image
            src={model.imageUrl}
            alt={model.name}
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.28), transparent)" }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Title + size badge */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-xl font-semibold text-[#171717]"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            {model.name}
          </h3>
          {model.size && (
            <span
              className="mt-0.5 shrink-0 rounded-full px-3 py-1 text-xs font-medium text-[#2563eb]"
              style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}
            >
              {model.size}
            </span>
          )}
        </div>

        {model.description && (
          <p className="text-[14px] leading-relaxed text-slate-500">
            {model.description}
          </p>
        )}

        {/* Stats grid */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          {(model.investmentMin != null || model.investmentMax != null) && (
            <div className="p-4" style={innerCell}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Inversión
              </p>
              <p className="mt-1 text-sm font-semibold text-[#171717]">
                {model.investmentMin != null && model.investmentMax != null
                  ? `${formatCurrency(model.investmentMin)} – ${formatCurrency(model.investmentMax)}`
                  : model.investmentMin != null
                  ? `Desde ${formatCurrency(model.investmentMin)}`
                  : `Hasta ${formatCurrency(model.investmentMax!)}`}
              </p>
            </div>
          )}
          {model.ebitda && (
            <div className="p-4" style={innerCell}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                EBITDA
              </p>
              <p className="mt-1 text-sm font-semibold text-[#2563eb]">
                {model.ebitda}
              </p>
            </div>
          )}
          {model.paybackMonths != null && (
            <div className="p-4" style={innerCell}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Retorno
              </p>
              <p className="mt-1 text-sm font-semibold text-[#171717]">
                {model.paybackMonths} meses
              </p>
            </div>
          )}
          {model.roiAnnual != null && (
            <div className="p-4" style={innerCell}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                ROI Anual
              </p>
              <p className="mt-1 text-sm font-semibold text-[#2563eb]">
                {model.roiAnnual}%
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function BusinessModelsSection({
  data,
  sidePanel,
}: {
  data: BusinessModelData[];
  sidePanel?: React.ReactNode;
}) {
  const hasSidePanel = Boolean(sidePanel);

  return (
    <section className="bg-[#f8fafc] py-16 md:py-24" aria-label="Modelos de negocio">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
            Modelos de negocio
          </p>
          <h2
            className="text-3xl font-bold text-[#171717] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            Elige tu formato de inversión
          </h2>
        </motion.div>

        {/* Two-column grid: LEFT model cards / RIGHT form */}
        <div
          className={
            hasSidePanel
              ? "grid grid-cols-1 gap-12 lg:grid-cols-[420px_1fr]"
              : "grid grid-cols-1 gap-12"
          }
        >

          {/* LEFT — model cards */}
          <div
            className={
              hasSidePanel
                ? "space-y-6"
                : "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            }
          >
            {data.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>

          {hasSidePanel && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {sidePanel}
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
