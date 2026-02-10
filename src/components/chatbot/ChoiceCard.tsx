"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  chatbotOptionCardBaseClass,
  chatbotOptionCardDefaultClass,
  chatbotOptionCardSelectedClass,
  chatbotOptionSubtitleClass,
  chatbotOptionTitleClass,
} from "./uiStyles";

export interface ChoiceCardProps {
  emoji?: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

/**
 * ChoiceCard - Clean neutral selection card
 *
 * Features:
 * - Clean neutral aesthetic with subtle borders
 * - Selected state with darker background
 * - Framer Motion hover/tap animations
 * - Responsive sizing
 */
export function ChoiceCard({
  emoji,
  label,
  description,
  selected,
  onClick,
  size = "medium",
  disabled = false,
}: ChoiceCardProps) {
  const sizeClasses = {
    small: "min-h-[72px] px-4 py-4",
    medium: "min-h-[72px] px-5 py-5",
    large: "min-h-[72px] px-5 py-5",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        chatbotOptionCardBaseClass,
        selected
          ? chatbotOptionCardSelectedClass
          : chatbotOptionCardDefaultClass,
        disabled && "opacity-50 cursor-not-allowed",
        sizeClasses[size]
      )}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        {emoji && (
          <div className="text-2xl flex-shrink-0 leading-none mt-0.5">
            {emoji}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={chatbotOptionTitleClass}>{label}</div>
          {description && (
            <div className={chatbotOptionSubtitleClass}>
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2F5BFF] flex items-center justify-center"
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
}
