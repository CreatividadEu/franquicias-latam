/**
 * Score formulas per spec §3.3.
 *
 *   tractionScore = w1*z(reviews_per_month_recent)
 *                 + w2*z(rating_recent - rating_prior)
 *                 + w3*z(ig_engagement_rate)
 *                 + w4*z(ig_followers_30d_growth)
 *                 + w5*(rappi_present ? 1 : 0)
 *
 *   painScore = mean(severity * frequency_in_sample) across all extractions
 *               for the business
 *
 *   fitScore = 0.4*cohort_match
 *            + 0.3*pain_match_to_service_catalog
 *            + 0.2*geo_reachable
 *            + 0.1*sector_priority
 *
 * Z-score is computed within (sector, city). With all businesses in
 * Bogotá restaurants today, that's effectively a single bucket — but the
 * code handles arbitrary segmentation for future use.
 */

export const TRACTION_WEIGHTS = {
  reviewsPerMonth: 0.3,
  ratingTrend: 0.25,
  igEngagement: 0.2,
  igFollowerGrowth: 0.15,
  rappiPresent: 0.1,
};

export const FIT_WEIGHTS = {
  cohortMatch: 0.4,
  painMatch: 0.3,
  geoReachable: 0.2,
  sectorPriority: 0.1,
};

export const GEO_REACHABLE_CITIES = new Set(
  ['bogota', 'medellin', 'cali', 'barranquilla', 'cartagena'].map((c) => c.toLowerCase()),
);

export const SECTOR_PRIORITY: Record<string, number> = {
  restaurant: 1,
  spa: 0.9,
  clinic: 0.85,
  retail: 0.7,
};

export function zScore(value: number | null, mean: number, std: number): number {
  if (value === null || value === undefined) return 0;
  if (std === 0) return 0;
  return (value - mean) / std;
}

export function meanStd(values: Array<number | null>): { mean: number; std: number } {
  const numeric = values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (numeric.length === 0) return { mean: 0, std: 0 };
  const mean = numeric.reduce((s, v) => s + v, 0) / numeric.length;
  const sqDiff = numeric.reduce((s, v) => s + (v - mean) ** 2, 0);
  const std = Math.sqrt(sqDiff / numeric.length);
  return { mean, std };
}

export interface TractionInputs {
  reviewsPerMonth: number | null;
  ratingTrend: number | null;
  igEngagement: number | null;
  igFollowerGrowth: number | null;
  rappiPresent: boolean;
}

export interface TractionStats {
  reviewsPerMonth: { mean: number; std: number };
  ratingTrend: { mean: number; std: number };
  igEngagement: { mean: number; std: number };
  igFollowerGrowth: { mean: number; std: number };
}

export function computeTractionStats(all: TractionInputs[]): TractionStats {
  return {
    reviewsPerMonth: meanStd(all.map((b) => b.reviewsPerMonth)),
    ratingTrend: meanStd(all.map((b) => b.ratingTrend)),
    igEngagement: meanStd(all.map((b) => b.igEngagement)),
    igFollowerGrowth: meanStd(all.map((b) => b.igFollowerGrowth)),
  };
}

export function tractionScore(t: TractionInputs, stats: TractionStats): number {
  const w = TRACTION_WEIGHTS;
  return (
    w.reviewsPerMonth * zScore(t.reviewsPerMonth, stats.reviewsPerMonth.mean, stats.reviewsPerMonth.std) +
    w.ratingTrend * zScore(t.ratingTrend, stats.ratingTrend.mean, stats.ratingTrend.std) +
    w.igEngagement * zScore(t.igEngagement, stats.igEngagement.mean, stats.igEngagement.std) +
    w.igFollowerGrowth * zScore(t.igFollowerGrowth, stats.igFollowerGrowth.mean, stats.igFollowerGrowth.std) +
    w.rappiPresent * (t.rappiPresent ? 1 : 0)
  );
}

export interface PainItem {
  severity: number;
  frequencyInSample: number;
}

export function painScore(items: PainItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((s, p) => s + p.severity * p.frequencyInSample, 0);
  return sum / items.length;
}

export interface FitInputs {
  cohort: 'new_winner' | 'mature_painful' | null;
  painMatchSim: number; // 0-1 cosine similarity to best-matching service
  city: string | null;
  sector: string | null;
}

export function fitScore(f: FitInputs): number {
  const cohortMatch = f.cohort ? 1 : 0;
  const painMatch = Math.max(0, Math.min(1, f.painMatchSim));
  const normalizedCity = (f.city ?? '').toLowerCase().replace(/[^a-z]/g, '');
  const geoReachable = GEO_REACHABLE_CITIES.has(normalizedCity) ? 1 : 0;
  const sectorPriority = SECTOR_PRIORITY[f.sector ?? ''] ?? 0;
  const w = FIT_WEIGHTS;
  return (
    w.cohortMatch * cohortMatch +
    w.painMatch * painMatch +
    w.geoReachable * geoReachable +
    w.sectorPriority * sectorPriority
  );
}
