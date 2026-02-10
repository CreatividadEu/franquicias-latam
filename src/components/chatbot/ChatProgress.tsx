"use client";

import { motion } from "framer-motion";
import { getStepNumber } from "@/hooks/useChatbot";
import type { ChatStep } from "@/types";

interface ChatProgressProps {
  currentStep: ChatStep;
}

const TOTAL_STEPS = 8;

const STEP_LABELS: Record<ChatStep, string> = {
  welcome: "Bienvenida",
  sector: "Sectores",
  investment: "Inversion",
  country: "Pais",
  experience: "Experiencia",
  contact: "Contacto",
  verification: "Verificacion",
  results: "Resultados",
};

export function ChatProgress({ currentStep }: ChatProgressProps) {
  const stepNumber = getStepNumber(currentStep);
  const progress = (stepNumber / TOTAL_STEPS) * 100;

  return (
    <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-900">
          {STEP_LABELS[currentStep]}
        </span>
        <span className="text-sm text-neutral-600">
          Paso {stepNumber}/{TOTAL_STEPS}
        </span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#2F5BFF]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
