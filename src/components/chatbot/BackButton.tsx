"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onBack: () => void;
  disabled?: boolean;
}

export function BackButton({ onBack, disabled = false }: BackButtonProps) {
  if (disabled) return null;

  return (
    <div className="px-6 py-3 border-b border-neutral-200">
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Atrás
      </Button>
    </div>
  );
}
