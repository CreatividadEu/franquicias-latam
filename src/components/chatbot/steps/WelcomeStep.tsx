"use client";

import { motion } from "framer-motion";
import { chatbotPrimaryButtonClass } from "../uiStyles";

interface WelcomeStepProps {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <motion.p
        className="text-sm sm:text-base text-neutral-600 text-center leading-relaxed"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ⏱️ Solo toma 2 minutos
      </motion.p>
      <motion.button
        onClick={onStart}
        className={`max-w-xs ${chatbotPrimaryButtonClass}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        🚀 Comenzar
      </motion.button>
    </div>
  );
}
