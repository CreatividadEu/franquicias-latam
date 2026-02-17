"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { MatchedFranchise } from "@/types";
import { Star } from "lucide-react";

interface FranchiseCardProps {
  franchise: MatchedFranchise;
  backToResultsUrl?: string;
}

function getMatchBadgeStyle(score: number) {
  if (score >= 80) return "bg-green-500 text-white";
  if (score >= 60) return "bg-yellow-500 text-white";
  return "bg-gray-500 text-white";
}

export function FranchiseCard({ franchise, backToResultsUrl }: FranchiseCardProps) {
  // Generate a nice gradient fallback if no logo
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-purple-600",
  ];
  const gradientIndex = Math.abs(franchise.name.charCodeAt(0)) % gradients.length;
  const fallbackGradient = gradients[gradientIndex];

  // Mock rating (since we don't have it in the data)
  const rating = Math.min(5, Math.max(3.5, 3 + (franchise.score / 100) * 2));
  const ratingDisplay = rating.toFixed(1);
  const franchiseHref = backToResultsUrl
    ? {
        pathname: `/franquicia/${franchise.slug}`,
        query: { backTo: backToResultsUrl },
      }
    : `/franquicia/${franchise.slug}`;

  return (
    <Card className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Header with Overlay */}
      <div className="relative h-48 overflow-hidden">
        {franchise.logo ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={franchise.logo}
              alt={franchise.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
            <span className="text-7xl opacity-90 group-hover:scale-110 transition-transform duration-300">
              {franchise.sectorEmoji}
            </span>
          </div>
        )}

        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Match Score Badge - Top Right */}
        {franchise.score >= 60 && (
          <div className="absolute top-3 right-3">
            <Badge className={`${getMatchBadgeStyle(franchise.score)} px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm`}>
              {franchise.score}% Match
            </Badge>
          </div>
        )}

        {/* Title on Image (bottom overlay) */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg line-clamp-2">
            {franchise.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 space-y-3">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {franchise.description}
        </p>

        {/* Rating & Metadata Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">{ratingDisplay}</span>
          </div>

          {/* Sector Badge */}
          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
            {franchise.sectorEmoji} {franchise.sectorName}
          </Badge>

          {/* Top Match Badge */}
          {franchise.score >= 80 && (
            <Badge className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700">
              Top Match
            </Badge>
          )}
        </div>

        {/* Investment Range */}
        <div className="pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Inversión requerida</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(franchise.investmentMin)} - {formatCurrency(franchise.investmentMax)}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all"
        >
          <Link href={franchiseHref}>Ver Franquicia</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
