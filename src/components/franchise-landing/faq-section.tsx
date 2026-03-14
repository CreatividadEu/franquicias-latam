"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import type { FaqData } from "@/lib/franchise-mapper";

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

function FaqItem({ faq, index }: { faq: FaqData; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={cardStyle}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
        style={{ minHeight: "44px" }}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#171717] sm:text-base">
          {faq.question}
        </span>
        <span className="flex-shrink-0 text-[#2563eb]">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div
              className="px-6 pb-5 pt-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <p className="text-sm leading-relaxed text-slate-500">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection({ data }: { data: FaqData[] }) {
  return (
    <section className="bg-white py-16 md:py-24" aria-label="Preguntas frecuentes">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-2 text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
            FAQ
          </p>
          <h2
            className="text-3xl font-bold text-[#171717] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            Preguntas frecuentes
          </h2>
        </motion.div>

        <div className="space-y-3">
          {data.map((faq, i) => (
            <FaqItem key={faq.id} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
