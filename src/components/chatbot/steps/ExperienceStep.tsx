"use client";

import { motion } from "framer-motion";
import { ChoiceCard } from "../ChoiceCard";
import type { ExperienceLevel } from "@prisma/client";

interface ExperienceStepProps {
  onSelect: (level: ExperienceLevel, label: string) => void;
}

const OPTIONS: {
  level: ExperienceLevel;
  emoji: string;
  label: string;
  description: string;
}[] = [
  {
    level: "INVERSOR",
    emoji: "💼",
    label: "Inversor",
    description: "Busco oportunidades de inversión",
  },
  {
    level: "OPERACIONES",
    emoji: "⚙️",
    label: "Operaciones",
    description: "Experiencia en gestión operativa",
  },
  {
    level: "VENTAS",
    emoji: "📊",
    label: "Ventas",
    description: "Enfocado en ventas y marketing",
  },
  {
    level: "OTRO",
    emoji: "🎯",
    label: "Otro",
    description: "Otro tipo de experiencia",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function ExperienceStep({ onSelect }: ExperienceStepProps) {
  return (
    <div className="p-6">
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {OPTIONS.map((opt) => (
          <motion.div key={opt.level} variants={cardVariants}>
            <ChoiceCard
              emoji={opt.emoji}
              label={opt.label}
              description={opt.description}
              selected={false}
              onClick={() => onSelect(opt.level, `${opt.emoji} ${opt.label}`)}
              size="medium"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
