"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Leads",
      value: stats.totalLeads,
      icon: "👥",
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Este Mes",
      value: stats.leadsThisMonth,
      icon: "📈",
      color: "text-green-600",
      bg: "bg-green-50",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      label: "Sin Ver",
      value: stats.unviewedLeads,
      icon: "🔔",
      color: "text-orange-600",
      bg: "bg-orange-50",
      gradient: "from-orange-500 to-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardContent className="p-0">
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center text-2xl`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
