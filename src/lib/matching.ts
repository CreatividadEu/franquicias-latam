import { prisma } from "./prisma";
import type { InvestmentRange, ExperienceLevel } from "@prisma/client";
import type { MatchedFranchise } from "@/types";

interface MatchInput {
  sectors: string[];
  investmentRange: InvestmentRange;
  countryId: string;
  experienceLevel: ExperienceLevel;
}

function getInvestmentBounds(range: InvestmentRange): {
  min: number;
  max: number;
} {
  switch (range) {
    case "RANGE_50K_100K":
      return { min: 50000, max: 100000 };
    case "RANGE_100K_200K":
      return { min: 100000, max: 200000 };
    case "RANGE_200K_PLUS":
      return { min: 200000, max: Infinity };
  }
}

function calculateScore(
  lead: MatchInput,
  franchise: {
    sectorId: string;
    investmentMin: number;
    investmentMax: number;
    coverageCountryIds: string[];
  }
): number {
  let score = 0;

  // Sector match (40 points)
  if (lead.sectors.includes(franchise.sectorId)) {
    score += 40;
  }

  // Investment overlap (30 points full, 15 partial)
  const leadRange = getInvestmentBounds(lead.investmentRange);
  const hasFullOverlap =
    franchise.investmentMin <= leadRange.max &&
    franchise.investmentMax >= leadRange.min;

  if (hasFullOverlap) {
    score += 30;
  } else {
    const tolerance =
      leadRange.max === Infinity
        ? 50000
        : (leadRange.max - leadRange.min) * 0.2;
    const hasPartialOverlap =
      franchise.investmentMin <= leadRange.max + tolerance &&
      franchise.investmentMax >= leadRange.min - tolerance;
    if (hasPartialOverlap) {
      score += 15;
    }
  }

  // Country coverage (20 points)
  if (franchise.coverageCountryIds.includes(lead.countryId)) {
    score += 20;
  }

  // Experience bonus (10 points)
  switch (lead.experienceLevel) {
    case "INVERSOR":
    case "VENTAS":
      score += 10;
      break;
    case "OPERACIONES":
      score += franchise.investmentMin < 150000 ? 10 : 5;
      break;
    case "OTRO":
      score += 5;
      break;
  }

  return score;
}

export async function findMatches(
  input: MatchInput
): Promise<MatchedFranchise[]> {
  const franchises = await prisma.franchise.findMany({
    where: { active: true },
    include: {
      sector: true,
      coverageCountries: true,
    },
  });

  const scored = franchises.map((f) => ({
    franchise: f,
    score: calculateScore(input, {
      sectorId: f.sectorId,
      investmentMin: f.investmentMin,
      investmentMax: f.investmentMax,
      coverageCountryIds: f.coverageCountries.map((c) => c.countryId),
    }),
  }));

  const matches = scored
    .filter((m) => m.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // If no matches above 50, return top 3 regardless
  const finalMatches =
    matches.length > 0
      ? matches
      : scored.sort((a, b) => b.score - a.score).slice(0, 3);

  return finalMatches.map((m) => ({
    id: m.franchise.id,
    name: m.franchise.name,
    description: m.franchise.description,
    logo: m.franchise.logo,
    investmentMin: m.franchise.investmentMin,
    investmentMax: m.franchise.investmentMax,
    sectorName: m.franchise.sector.name,
    sectorEmoji: m.franchise.sector.emoji,
    score: m.score,
  }));
}
