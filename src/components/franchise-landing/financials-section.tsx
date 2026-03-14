"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import type { FinancialsData } from "@/lib/franchise-mapper";

function MetricCard({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: delay ?? 0 }}
      className="rounded-2xl p-6 backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <p className="text-[11px] font-medium uppercase tracking-widest text-[#8A8F9E]">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold leading-tight sm:text-3xl ${
          accent ? "text-[#00F0FF]" : "text-[#F0F0F5]"
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}

export function FinancialsSection({ data }: { data: FinancialsData }) {
  const metrics: { label: string; value: string; accent?: boolean }[] = [
    {
      label: "Inversión mínima",
      value: formatCurrency(data.investmentMin),
    },
    {
      label: "Rango de inversión",
      value: `${formatCurrency(data.investmentMin)} – ${formatCurrency(data.investmentMax)}`,
    },
  ];

  if (data.ebitdaReference) {
    metrics.push({ label: "EBITDA", value: data.ebitdaReference, accent: true });
  }
  if (data.paybackMonths != null) {
    metrics.push({ label: "Retorno estimado", value: `${data.paybackMonths} meses` });
  }
  if (data.royaltyInfo) {
    metrics.push({ label: "Royalty", value: data.royaltyInfo });
  }
  if (data.operatorProfile) {
    metrics.push({ label: "Perfil del operador", value: data.operatorProfile });
  }

  return (
    <section className="bg-[#0A0F1E] py-20 md:py-28" aria-label="Financieros">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-2"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#00F0FF]">
            Modelo financiero
          </p>
          <h2
            className="text-3xl font-bold text-[#F0F0F5] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            Números que hablan
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, i) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={m.value}
              accent={m.accent}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
