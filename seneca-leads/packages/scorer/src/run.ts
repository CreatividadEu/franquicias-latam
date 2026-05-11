/**
 * Score every business and persist SalesLead rows.
 *
 * Pipeline per spec §3.3:
 *   1. Load all businesses + their snapshot + reviews + pain extractions
 *   2. Compute traction inputs (reviews/month recent, rating trend, IG, rappi)
 *   3. Compute z-score stats across all eligible businesses
 *   4. Embed service catalog, compute pain-service cosine similarity per business
 *   5. Assign cohort from v_cohort_new_winner / v_cohort_mature_painful
 *   6. Score traction / pain / fit, upsert SalesLead (skip if cohort is null)
 */
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';
import { getServiceEmbeddings } from './service-catalog.js';
import {
  computeTractionStats,
  fitScore,
  painScore,
  tractionScore,
  type FitInputs,
  type PainItem,
  type TractionInputs,
} from './scores.js';

const log = childLogger({ module: 'scorer' });

interface CohortViewRow {
  id: string;
}

interface ReviewSlice {
  rating: number;
  postedAt: Date;
}

export interface RunScorerInput {
  /** Smoke-test cap. */
  limit?: number;
  /** Skip writing SalesLead rows, just compute + log. */
  dryRun?: boolean;
}

export interface RunScorerResult {
  total: number;
  scored: number;
  newWinnerLeads: number;
  maturePainfulLeads: number;
  maturePainfulInferredLeads: number;
  skippedNoCohort: number;
  serviceAnglesAttached: number;
  durationSeconds: number;
}

// Pragmatic fallback: a business that produced ≥3 clustered pain extractions
// has the substantive "mature_painful" signal (durable, repeated complaints
// across negative reviews) even if it misses the strict view criteria
// (which require ≥5 reviews/month in last 90 days — unachievable with the
// 16-reviews-per-business cap on the SerpAPI free tier we used in Phase 1).
const MIN_PAINS_FOR_INFERRED_COHORT = 3;

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function runScorer(input: RunScorerInput = {}): Promise<RunScorerResult> {
  const startedAt = Date.now();
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const twelveMonthsAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

  // 1. Pull businesses with their latest snapshot.
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      nameCanonical: true,
      sector: true,
      city: true,
      snapshots: {
        orderBy: { date: 'desc' },
        take: 1,
        select: {
          rappiPresent: true,
          igEngagementRate: true,
          googleReviewCount: true,
          googleRating: true,
        },
      },
    },
    ...(input.limit ? { take: input.limit } : {}),
  });

  // 2. Cohort views — businesses in v_cohort_new_winner and v_cohort_mature_painful.
  const [newWinnerRows, maturePainfulRows] = await Promise.all([
    prisma.$queryRaw<CohortViewRow[]>`SELECT id FROM v_cohort_new_winner`,
    prisma.$queryRaw<CohortViewRow[]>`SELECT id FROM v_cohort_mature_painful`,
  ]);
  const newWinnerSet = new Set(newWinnerRows.map((r) => r.id));
  const maturePainfulSet = new Set(maturePainfulRows.map((r) => r.id));

  // 3. Pull reviews for traction (reviews/month recent + rating trend).
  const reviewSliceByBiz = new Map<string, ReviewSlice[]>();
  const reviews = await prisma.review.findMany({
    where: {
      businessId: { in: businesses.map((b) => b.id) },
      postedAt: { gte: twelveMonthsAgo },
    },
    select: { businessId: true, rating: true, postedAt: true },
  });
  for (const r of reviews) {
    const arr = reviewSliceByBiz.get(r.businessId) ?? [];
    arr.push({ rating: r.rating, postedAt: r.postedAt });
    reviewSliceByBiz.set(r.businessId, arr);
  }

  // 4. Pain extractions for pain score + pain-service match.
  const painsByBiz = new Map<string, PainItem[]>();
  const painTextsByBiz = new Map<string, string[]>();
  const allExtractions = await prisma.painExtraction.findMany({
    select: {
      severity: true,
      frequencyInSample: true,
      representativeQuote: true,
      subcategory: true,
      cluster: { select: { businessId: true } },
    },
  });
  for (const e of allExtractions) {
    const bizId = e.cluster.businessId;
    const items = painsByBiz.get(bizId) ?? [];
    items.push({ severity: e.severity, frequencyInSample: e.frequencyInSample });
    painsByBiz.set(bizId, items);
    const texts = painTextsByBiz.get(bizId) ?? [];
    texts.push(`${e.subcategory ?? ''}: ${e.representativeQuote}`);
    painTextsByBiz.set(bizId, texts);
  }

  // 5. Service-angle observations (from the synthesize-angles pass).
  const angleByBiz = new Map<string, string>();
  const angleObs = await prisma.observation.findMany({
    where: {
      source: 'pain_extractor',
      sourceId: { startsWith: 'service_angle:' },
    },
    orderBy: { observedAt: 'desc' },
    select: { businessId: true, payload: true },
  });
  for (const obs of angleObs) {
    if (!obs.businessId || angleByBiz.has(obs.businessId)) continue;
    const payload = obs.payload as { text?: string } | null;
    if (payload?.text) angleByBiz.set(obs.businessId, payload.text);
  }

  // 6. Embed each business's combined pain text and compute max similarity to
  //    the service catalog. Businesses with no pains get painMatchSim = 0.
  const serviceEmbeddings = await getServiceEmbeddings();
  const painMatchByBiz = new Map<string, number>();
  const businessesWithPains = Array.from(painTextsByBiz.entries()).filter(
    ([, texts]) => texts.length > 0,
  );
  if (businessesWithPains.length > 0) {
    // Batch-embed all per-business pain summaries in one call (≤100 inputs/business)
    const OpenAI = (await import('openai')).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY missing');
    const oai = new OpenAI({ apiKey });
    const inputs = businessesWithPains.map(([, texts]) => texts.join('\n'));
    const res = await oai.embeddings.create({
      model: 'text-embedding-3-small',
      input: inputs,
    });
    for (let i = 0; i < businessesWithPains.length; i++) {
      const bizId = businessesWithPains[i]![0];
      const vec = res.data[i]!.embedding;
      let best = 0;
      for (const sv of serviceEmbeddings.values()) {
        const sim = cosine(vec, sv);
        if (sim > best) best = sim;
      }
      painMatchByBiz.set(bizId, best);
    }
  }

  // 7. Compute traction inputs for all businesses.
  const tractionByBiz = new Map<string, TractionInputs>();
  for (const b of businesses) {
    const snap = b.snapshots[0];
    const slices = reviewSliceByBiz.get(b.id) ?? [];

    const recent = slices.filter((r) => r.postedAt >= ninetyDaysAgo);
    const prior = slices.filter(
      (r) => r.postedAt < ninetyDaysAgo && r.postedAt >= twelveMonthsAgo,
    );

    const reviewsPerMonth = recent.length > 0 ? recent.length / 3 : null;
    const recentAvg =
      recent.length > 0 ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : null;
    const priorAvg =
      prior.length > 0 ? prior.reduce((s, r) => s + r.rating, 0) / prior.length : null;
    const ratingTrend = recentAvg !== null && priorAvg !== null ? recentAvg - priorAvg : null;

    tractionByBiz.set(b.id, {
      reviewsPerMonth,
      ratingTrend,
      igEngagement: snap?.igEngagementRate ?? null,
      igFollowerGrowth: null, // need historical snapshots; not yet
      rappiPresent: !!snap?.rappiPresent,
    });
  }
  const stats = computeTractionStats(Array.from(tractionByBiz.values()));

  // 8. Score and upsert SalesLead.
  let newWinnerLeads = 0;
  let maturePainfulLeads = 0;
  let maturePainfulInferredLeads = 0;
  let skippedNoCohort = 0;
  let scored = 0;
  let serviceAnglesAttached = 0;

  for (const b of businesses) {
    const inNew = newWinnerSet.has(b.id);
    const inMature = maturePainfulSet.has(b.id);
    const painCount = (painsByBiz.get(b.id) ?? []).length;
    // Spec: in both → mature_painful wins
    // Fallback: businesses with ≥3 pain extractions but no strict cohort
    // → mature_painful_inferred (see comment on MIN_PAINS_FOR_INFERRED_COHORT)
    const cohort: 'new_winner' | 'mature_painful' | 'mature_painful_inferred' | null =
      inMature
        ? 'mature_painful'
        : inNew
          ? 'new_winner'
          : painCount >= MIN_PAINS_FOR_INFERRED_COHORT
            ? 'mature_painful_inferred'
            : null;

    if (!cohort) {
      skippedNoCohort++;
      continue;
    }

    const t = tractionByBiz.get(b.id)!;
    const pains = painsByBiz.get(b.id) ?? [];
    const traction = tractionScore(t, stats);
    const pain = painScore(pains);
    // For fit-score purposes, the inferred cohort still counts as
    // "cohort matched" — it earns the 0.4 cohortMatch component, just
    // tagged so a future review can distinguish view-validated leads.
    const fitInputs: FitInputs = {
      cohort: cohort === 'mature_painful_inferred' ? 'mature_painful' : cohort,
      painMatchSim: painMatchByBiz.get(b.id) ?? 0,
      city: b.city,
      sector: b.sector,
    };
    const fit = fitScore(fitInputs);
    const angle = angleByBiz.get(b.id) ?? null;
    scored++;

    if (input.dryRun) {
      log.info(
        {
          name: b.nameCanonical,
          cohort,
          traction: traction.toFixed(3),
          pain: pain.toFixed(3),
          fit: fit.toFixed(3),
          hasAngle: !!angle,
        },
        'scored (dry run)',
      );
    } else {
      await prisma.salesLead.upsert({
        where: { businessId: b.id },
        create: {
          businessId: b.id,
          cohort,
          tractionScore: traction,
          painScore: pain,
          fitScore: fit,
          ...(angle ? { serviceAngle: angle } : {}),
        },
        update: {
          cohort,
          tractionScore: traction,
          painScore: pain,
          fitScore: fit,
          ...(angle ? { serviceAngle: angle } : {}),
        },
      });
      if (angle) serviceAnglesAttached++;
    }

    if (cohort === 'new_winner') newWinnerLeads++;
    else if (cohort === 'mature_painful') maturePainfulLeads++;
    else if (cohort === 'mature_painful_inferred') maturePainfulInferredLeads++;
  }

  return {
    total: businesses.length,
    scored,
    newWinnerLeads,
    maturePainfulLeads,
    maturePainfulInferredLeads,
    skippedNoCohort,
    serviceAnglesAttached,
    durationSeconds: (Date.now() - startedAt) / 1000,
  };
}
