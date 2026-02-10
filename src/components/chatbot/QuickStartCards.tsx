"use client";

import { Target, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuickStartCardsProps {
  onSelect: (title: string) => void;
}

const CARDS = [
  {
    id: "ideal",
    icon: Target,
    title: "Encontrar mi franquicia ideal",
    description:
      "Responde 6–8 preguntas rápidas y te mostramos opciones que encajan contigo.",
    buttonText: "Empezar",
  },
  {
    id: "investment",
    icon: TrendingUp,
    title: "¿Qué inversión tiene sentido?",
    description:
      "Define tu rango de inversión y te filtramos oportunidades realistas.",
    buttonText: "Definir inversión",
  },
  {
    id: "best",
    icon: Star,
    title: "Ver las que mejor convierten",
    description:
      "Explora oportunidades destacadas por demanda y facilidad de operación.",
    buttonText: "Ver opciones",
  },
];

export function QuickStartCards({ onSelect }: QuickStartCardsProps) {
  return (
    <div className="px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="p-5 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Icon */}
              <div className="mb-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-neutral-700" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-neutral-600 mb-4 flex-1">
                {card.description}
              </p>

              {/* Button */}
              <Button
                onClick={() => onSelect(card.title)}
                variant="outline"
                className="w-full border-neutral-200 hover:bg-neutral-50"
              >
                {card.buttonText}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
