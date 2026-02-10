"use client";

import { cn } from "@/lib/utils";

interface OptionButtonProps {
  emoji: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
}

export function OptionButton({
  emoji,
  label,
  selected,
  onClick,
  size = "md",
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border-2 box-border border-transparent font-medium transform-gpu will-change-transform transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out",
        "active:scale-[0.98]",
        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-4 py-3 text-sm",
        size === "lg" && "px-5 py-4 text-base",
        selected
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20"
          : "border-gray-200 bg-white text-gray-700 hover:-translate-y-px hover:border-blue-300 hover:bg-blue-50/50 shadow-sm hover:shadow-md"
      )}
    >
      <span className={cn("text-lg", selected && "scale-110")}>{emoji}</span>
      <span>{label}</span>
      {selected && (
        <span className="ml-auto text-blue-500 text-xs">&#10003;</span>
      )}
    </button>
  );
}
