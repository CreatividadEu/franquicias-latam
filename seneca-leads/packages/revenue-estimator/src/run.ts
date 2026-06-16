/**
 * Run the revenue estimator on every SalesLead. Restaurants today; spa /
 * clinic / retail heuristics are stubs to fill in later.
 *
 * Layers per spec §3.4:
 *   1. SuperSociedades direct (NIT matches a filer)  — deferred: no CSVs
 *      loaded yet. When loaded, this would take precedence and write
 *      confidence=1.0.
 *   2. Sector heuristic                             — running today.
 *   3. Regression baseline                          — needs layer 1's
 *      training data. Stubbed.
 */
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';
import { estimateRestaurantRevenue } from './sector-heuristic.js';

const log = childLogger({ module: 'revenue-estimator' });

interface PlaceObservationPayload {
  photos_link?: string;
  // We didn't store the exact photo count in normalize.ts; we have the link
  // and (optionally) photo arrays in the raw payload. SerpAPI's google_maps
  // place result includes `photos` array. We'll mine it heuristically below.
  photos?: unknown[];
  // Some SerpAPI responses tag photos with `total`:
  photos_meta?: { total?: number };
  [key: string]: unknown;
}

export interface RunEstimatorInput {
  /** Smoke-test cap. */
  limit?: number;
  /** Just log, don't write. */
  dryRun?: boolean;
}

export interface RunEstimatorResult {
  leadsTotal: number;
  estimated: number;
  bySectorDefault: number;
  byPhotoCount: number;
  bySuperSociedades: number;
  durationSeconds: number;
}

function extractPhotoCount(payload: PlaceObservationPayload | null): number | null {
  if (!payload) return null;
  // Direct: photos array length
  if (Array.isArray(payload.photos)) return payload.photos.length;
  // Direct: photos_meta.total
  if (
    typeof payload.photos_meta === 'object' &&
    payload.photos_meta &&
    typeof payload.photos_meta.total === 'number'
  ) {
    return payload.photos_meta.total;
  }
  return null;
}

export async function runRevenueEstimator(
  input: RunEstimatorInput = {},
): Promise<RunEstimatorResult> {
  const startedAt = Date.now();

  const leads = await prisma.salesLead.findMany({
    include: {
      business: {
        select: {
          id: true,
          nameCanonical: true,
          sector: true,
          nit: true,
          observations: {
            where: { source: 'google_places' },
            orderBy: { observedAt: 'desc' },
            take: 1,
            select: { payload: true },
          },
        },
      },
    },
    ...(input.limit ? { take: input.limit } : {}),
  });

  log.info({ leadsTotal: leads.length }, 'starting revenue estimator');

  let estimated = 0;
  let bySectorDefault = 0;
  let byPhotoCount = 0;
  let bySuperSociedades = 0;

  for (const lead of leads) {
    const sector = lead.business.sector;
    if (sector !== 'restaurant') {
      log.debug(
        { sector, business: lead.business.nameCanonical },
        'non-restaurant sector — heuristic not yet implemented',
      );
      continue;
    }

    // Layer 1: SuperSociedades direct (deferred — see super-sociedades_filing
    // table; not loaded yet). When the CSV import lands, query here first.

    // Layer 2: sector heuristic for restaurants
    const obs = lead.business.observations[0];
    const photoCount = extractPhotoCount(
      (obs?.payload ?? null) as PlaceObservationPayload | null,
    );
    const est = estimateRestaurantRevenue({ photoCount });

    if (est.method === 'photo_count') byPhotoCount++;
    else bySectorDefault++;

    log.info(
      {
        name: lead.business.nameCanonical,
        photoCount,
        seats: est.seatsEstimate,
        method: est.method,
        estLow: est.estRevenueLow.toString(),
        estHigh: est.estRevenueHigh.toString(),
        confidence: est.confidence,
      },
      'revenue estimate',
    );

    if (!input.dryRun) {
      await prisma.salesLead.update({
        where: { id: lead.id },
        data: {
          estRevenueLow: est.estRevenueLow,
          estRevenueHigh: est.estRevenueHigh,
          revenueConfidence: est.confidence,
        },
      });
    }
    estimated++;
  }

  return {
    leadsTotal: leads.length,
    estimated,
    bySectorDefault,
    byPhotoCount,
    bySuperSociedades,
    durationSeconds: (Date.now() - startedAt) / 1000,
  };
}
