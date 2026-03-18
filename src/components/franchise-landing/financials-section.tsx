"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { FinancialsData } from "@/lib/franchise-mapper";

// ── Formatters ────────────────────────────────────────────────────────────────

function formatAmountUSD(amount: number): string {
  return (
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount) +
    " USD"
  );
}

function parseRoyaltyParts(royaltyInfo: string | null): {
  royalty: string | null;
  royaltyNum: number | null;
  adFund: string | null;
  adFundNum: number | null;
} {
  if (!royaltyInfo) return { royalty: null, royaltyNum: null, adFund: null, adFundNum: null };
  const nums = royaltyInfo.match(/(\d+(?:\.\d+)?)/g);
  return {
    royalty: nums?.[0] ? `${nums[0]}%` : null,
    royaltyNum: nums?.[0] ? parseFloat(nums[0]) : null,
    adFund: nums?.[1] ? `${nums[1]}%` : null,
    adFundNum: nums?.[1] ? parseFloat(nums[1]) : null,
  };
}

// ── Count-up hook (same pattern as home CalendlyCTASection) ───────────────────

function useCountUp(target: number, active: boolean, duration = 900): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!active) {
      setCount(0); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    if (typeof window === "undefined") {
      setCount(target); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, active, duration]);

  return count;
}

// ── Card ──────────────────────────────────────────────────────────────────────

type MetricCardProps = {
  label: string;
  value: string;
  accent?: boolean;
  delay?: number;
  // Animation — pass numericA (and optionally numericB for ranges) + a formatFn
  numericA?: number;
  numericB?: number;
  formatFn?: (a: number, b: number) => string;
  isVisible: boolean;
};

function MetricCard({
  label,
  value,
  accent,
  delay,
  numericA,
  numericB,
  formatFn,
  isVisible,
}: MetricCardProps) {
  const hasAnimation = numericA !== undefined && formatFn !== undefined;
  const countA = useCountUp(numericA ?? 0, isVisible && hasAnimation);
  const countB = useCountUp(numericB ?? 0, isVisible && hasAnimation && numericB !== undefined);

  const displayValue =
    isVisible && hasAnimation
      ? formatFn!(countA, numericB !== undefined ? countB : 0)
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: delay ?? 0 }}
      className="rounded-2xl p-6"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold leading-tight sm:text-3xl ${
          accent ? "text-[#2563eb]" : "text-[#171717]"
        }`}
      >
        {displayValue}
      </p>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function FinancialsSection({ data }: { data: FinancialsData }) {
  const { royalty, royaltyNum, adFund, adFundNum } = parseRoyaltyParts(data.royaltyInfo);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  type MetricDef = {
    label: string;
    value: string;
    accent?: boolean;
    numericA?: number;
    numericB?: number;
    formatFn?: (a: number, b: number) => string;
  };

  // "desde" appears in every variable metric label (per design spec)
  const metrics: MetricDef[] = [];

  if (data.canonEntrada) {
    metrics.push({
      label: "Canon de entrada",
      value: formatAmountUSD(data.canonEntrada),
      numericA: data.canonEntrada,
      formatFn: (a) => formatAmountUSD(a),
    });
  }

  metrics.push({
    label: "Rango de inversión desde / hasta",
    value: `${formatAmountUSD(data.investmentMin)} – ${formatAmountUSD(data.investmentMax)}`,
    numericA: data.investmentMin,
    numericB: data.investmentMax,
    formatFn: (a, b) => `${formatAmountUSD(a)} – ${formatAmountUSD(b)}`,
  });

  if (data.ebitdaReference) {
    // EBITDA is already a descriptive range string (e.g. "17%-23%"); label conveys "desde"
    metrics.push({ label: "EBITDA desde", value: data.ebitdaReference, accent: true });
  }
  if (data.paybackMonths != null) {
    metrics.push({
      label: "Retorno estimado desde",
      value: `${data.paybackMonths} meses`,
      numericA: data.paybackMonths,
      formatFn: (a) => `${a} meses`,
    });
  }
  if (royalty) {
    metrics.push({
      label: "Royalty desde",
      value: royalty,
      numericA: royaltyNum ?? 0,
      formatFn: (a) => `${a}%`,
    });
  }
  if (adFund) {
    metrics.push({
      label: "Fondo de publicidad desde",
      value: adFund,
      numericA: adFundNum ?? 0,
      formatFn: (a) => `${a}%`,
    });
  }

  return (
    <section ref={sectionRef} className="bg-white py-16 md:py-24" aria-label="Financieros">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
            Modelo financiero
          </p>
          <h2
            className="text-3xl font-bold text-[#171717] sm:text-4xl"
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
              numericA={m.numericA}
              numericB={m.numericB}
              formatFn={m.formatFn}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
