"use client";

import { motion } from "framer-motion";
import { ChoiceCard } from "../ChoiceCard";
import type { InvestmentRange } from "@prisma/client";

interface InvestmentStepProps {
  onSelect: (range: InvestmentRange, label: string) => void;
}

const OPTIONS: {
  range: InvestmentRange;
  emoji: string;
  label: string;
  description: string;
  popular?: boolean;
}[] = [
  {
    range: "RANGE_50K_100K",
    emoji: "💰",
    label: "$50k - $100k",
    description: "Inversión inicial accesible",
  },
  {
    range: "RANGE_100K_200K",
    emoji: "💎",
    label: "$100k - $200k",
    description: "Opción más popular",
    popular: true,
  },
  {
    range: "RANGE_200K_PLUS",
    emoji: "🏆",
    label: "$200k+",
    description: "Franquicias premium",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

export function InvestmentStep({ onSelect }: InvestmentStepProps) {
  return (
    <div className="p-6">
      <motion.div
        className="flex flex-col gap-3 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {OPTIONS.map((opt) => (
          <motion.div key={opt.range} variants={cardVariants}>
            <div className="relative">
              <ChoiceCard
                emoji={opt.emoji}
                label={opt.label}
                description={opt.description}
                selected={false}
                onClick={() => onSelect(opt.range, `${opt.emoji} ${opt.label}`)}
                size="large"
              />
              {opt.popular && (
                <div className="absolute -top-2 -right-2 bg-[#2F5BFF] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                  POPULAR
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
