"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { SectorOption } from "@/types";
import { cn } from "@/lib/utils";
import {
  chatbotHelperTextClass,
  chatbotOptionSubtitleClass,
  chatbotOptionTitleClass,
  chatbotPrimaryButtonClass,
} from "../uiStyles";

interface SectorStepProps {
  onSelect: (sectors: string[], sectorNames: string[]) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function SectorStep({ onSelect }: SectorStepProps) {
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then(setSectors)
      .catch(console.error);
  }, []);

  const toggleSector = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const names = sectors
      .filter((s) => selected.includes(s.id))
      .map((s) => `${s.emoji} ${s.name}`);
    onSelect(selected, names);
  };

  if (sectors.length === 0) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <p className={cn(chatbotHelperTextClass, "text-center")}>
        Puedes seleccionar varios sectores
      </p>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sectors.map((sector) => {
          const isSelected = selected.includes(sector.id);
          return (
            <motion.button
              key={sector.id}
              variants={cardVariants}
              onClick={() => toggleSector(sector.id)}
              className={`flex items-center gap-3 px-5 py-5 min-h-[72px] rounded-xl border-2 box-border transform-gpu will-change-transform transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out text-left shadow-sm ${
                isSelected
                  ? "bg-[#EEF3FF] border-[#2F5BFF] text-neutral-900 ring-1 ring-[#2F5BFF]/25"
                  : "bg-white border-neutral-200 text-neutral-900 hover:-translate-y-px hover:border-[#2F5BFF]/40 hover:bg-[#F6F8FF] hover:shadow-md"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{sector.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className={chatbotOptionTitleClass}>{sector.name}</p>
                <p className={chatbotOptionSubtitleClass}>Sector disponible</p>
              </div>
              {isSelected && (
                <motion.div
                  className="ml-auto w-5 h-5 rounded-full bg-[#2F5BFF] flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
      {selected.length > 0 && (
        <motion.button
          onClick={handleSubmit}
          className={chatbotPrimaryButtonClass}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          Continuar ({selected.length} seleccionado
          {selected.length > 1 ? "s" : ""})
        </motion.button>
      )}
    </div>
  );
}
