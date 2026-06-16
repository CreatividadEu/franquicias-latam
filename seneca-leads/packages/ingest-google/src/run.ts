import { formatInTimeZone } from 'date-fns-tz';
import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger, detectLanguage, bogotaTz, type BogotaSeed } from '@seneca/shared';
import { searchMaps, fetchReviews, type SerpLocalResult } from './serpapi.js';
import {
  normalizePlace,
  normalizeReview,
  stripPiiFromPlacePayload,
  type PlaceUpsertPayload,
} from './normalize.js';

const log = childLogger({ module: 'ingest-google' });

export interface RunGooglePlacesIngestInput {
  apiKey: string;
  city: string;
  sector: string;
  query: string;
  seeds: BogotaSeed[];
  pagesPerSeed?: number;
  reviewsPerBusinessMax?: number;
  fetchReviews?: boolean;
}

export interface RunGooglePlacesIngestResult {
  businessesTotal: number;
  businessesNew: number;
  reviewsTotal: number;
  snapshotsToday: number;
  errors: number;
  durationSeconds: number;
  topByReviewCount: Array<{ name: string; reviewCount: number }>;
}

interface Counters {
  businessesNew: number;
  reviewsTotal: number;
  errors: number;
}

function todayBogotaDate(): Date {
  const ymd = formatInTimeZone(new Date(), bogotaTz, 'yyyy-MM-dd');
  return new Date(`${ymd}T00:00:00.000Z`);
}

async function persistPlace(
  rawPlace: SerpLocalResult,
  payload: PlaceUpsertPayload,
  observedAt: Date,
  today: Date,
  counters: Counters,
): Promise<string | null> {
  try {
    const safePayload = stripPiiFromPlacePayload(rawPlace);

    return await prisma.$transaction(async (tx) => {
      const existingLink = await tx.businessSourceLink.findUnique({
        where: {
          source_sourceId: { source: 'google_places', sourceId: payload.placeId },
        },
      });

      let businessId: string;
      if (existingLink) {
        businessId = existingLink.businessId;
        await tx.business.update({
          where: { id: businessId },
          data: {
            nameCanonical: payload.nameCanonical,
            nameNormalized: payload.nameNormalized,
            sector: payload.sector,
            city: payload.city,
            address: payload.address,
            lat: payload.lat,
            lng: payload.lng,
            phone: payload.phone,
            domain: payload.domain,
            igHandle: payload.igHandle,
          },
        });
      } else {
        const created = await tx.business.create({
          data: {
            nameCanonical: payload.nameCanonical,
            nameNormalized: payload.nameNormalized,
            sector: payload.sector,
            city: payload.city,
            address: payload.address,
            lat: payload.lat,
            lng: payload.lng,
            phone: payload.phone,
            domain: payload.domain,
            igHandle: payload.igHandle,
          },
        });
        businessId = created.id;
        counters.businessesNew++;
        await tx.businessSourceLink.create({
          data: {
            businessId,
            source: 'google_places',
            sourceId: payload.placeId,
            url: rawPlace.reviews_link ?? null,
          },
        });
      }

      await tx.observation.upsert({
        where: {
          source_sourceId_observedAt: {
            source: 'google_places',
            sourceId: payload.placeId,
            observedAt,
          },
        },
        create: {
          businessId,
          source: 'google_places',
          sourceId: payload.placeId,
          payload: safePayload as unknown as Prisma.InputJsonValue,
          observedAt,
        },
        update: {},
      });

      await tx.snapshot.upsert({
        where: { businessId_date: { businessId, date: today } },
        create: {
          businessId,
          date: today,
          googleReviewCount: payload.reviewCount,
          googleRating: payload.rating,
        },
        update: {
          googleReviewCount: payload.reviewCount,
          googleRating: payload.rating,
        },
      });

      return businessId;
    });
  } catch (err) {
    counters.errors++;
    log.error(
      {
        source: 'google_places',
        sourceId: payload.placeId,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      'failed to persist place',
    );
    return null;
  }
}

async function persistReviewsForBusiness(
  apiKey: string,
  businessId: string,
  placeId: string,
  maxReviews: number,
  counters: Counters,
): Promise<void> {
  let pageToken: string | undefined;
  let collected = 0;
  let pageGuard = 0;

  while (collected < maxReviews && pageGuard < 4) {
    pageGuard++;
    let response;
    try {
      response = await fetchReviews({
        apiKey,
        placeId,
        nextPageToken: pageToken,
        sortBy: 'newestFirst',
      });
    } catch (err) {
      counters.errors++;
      log.error(
        {
          source: 'google_places_reviews',
          sourceId: placeId,
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
        'failed to fetch reviews',
      );
      return;
    }

    const reviews = response.reviews ?? [];
    if (reviews.length === 0) return;

    for (const review of reviews) {
      if (collected >= maxReviews) break;
      try {
        const normalized = normalizeReview(review, placeId);
        if (!normalized) continue;

        await persistOneReview(businessId, normalized);
        collected++;
        counters.reviewsTotal++;
      } catch (err) {
        counters.errors++;
        log.error(
          {
            source: 'google_places_reviews',
            sourceId: placeId,
            externalId: review.review_id,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          },
          'failed to persist review',
        );
      }
    }

    pageToken = response.serpapi_pagination?.next_page_token;
    if (!pageToken) return;
  }
}

async function persistOneReview(
  businessId: string,
  normalized: NonNullable<ReturnType<typeof normalizeReview>>,
): Promise<void> {
  const language = detectLanguage(normalized.textOriginal);

  await prisma.review.upsert({
    where: {
      source_externalId: {
        source: 'google_places',
        externalId: normalized.externalId,
      },
    },
    create: {
      businessId,
      source: 'google_places',
      externalId: normalized.externalId,
      rating: normalized.rating,
      textOriginal: normalized.textOriginal,
      language,
      postedAt: normalized.postedAt,
    },
    update: {
      rating: normalized.rating,
      textOriginal: normalized.textOriginal,
      language,
      postedAt: normalized.postedAt,
    },
  });
}

export async function runGooglePlacesIngest(
  input: RunGooglePlacesIngestInput,
): Promise<RunGooglePlacesIngestResult> {
  const startedAt = Date.now();
  const observedAt = new Date();
  const today = todayBogotaDate();
  const pagesPerSeed = input.pagesPerSeed ?? 2;
  const reviewsPerBusinessMax = input.reviewsPerBusinessMax ?? 16;
  const shouldFetchReviews = input.fetchReviews !== false;

  const counters: Counters = { businessesNew: 0, reviewsTotal: 0, errors: 0 };
  const seenPlaceIds = new Set<string>();
  const businessIdToReviewCount = new Map<string, { businessId: string; placeId: string }>();

  log.info(
    {
      seeds: input.seeds.length,
      pagesPerSeed,
      query: input.query,
      city: input.city,
      sector: input.sector,
    },
    'starting Google Places ingest',
  );

  for (const seed of input.seeds) {
    log.info({ seed: seed.name, ll: seed.ll }, 'processing seed');

    for (let page = 0; page < pagesPerSeed; page++) {
      const start = page * 20;
      let result;
      try {
        result = await searchMaps({
          apiKey: input.apiKey,
          query: input.query,
          ll: seed.ll,
          ...(start > 0 ? { start } : {}),
        });
      } catch (err) {
        counters.errors++;
        log.error(
          {
            source: 'google_places',
            sourceId: `${seed.name}:${start}`,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          },
          'failed to search maps',
        );
        continue;
      }

      const places = result.local_results ?? [];
      if (places.length === 0) break;

      let newOnPage = 0;
      for (const rawPlace of places) {
        const normalized = normalizePlace(rawPlace, {
          sector: input.sector,
          city: input.city,
        });
        if (!normalized) continue;
        if (seenPlaceIds.has(normalized.placeId)) continue;
        seenPlaceIds.add(normalized.placeId);
        newOnPage++;

        const businessId = await persistPlace(
          rawPlace,
          normalized,
          observedAt,
          today,
          counters,
        );
        if (businessId && (normalized.reviewCount ?? 0) > 0) {
          businessIdToReviewCount.set(businessId, {
            businessId,
            placeId: normalized.placeId,
          });
        }
      }

      log.info(
        {
          seed: seed.name,
          page,
          pageSize: places.length,
          newOnPage,
          dedupedSize: seenPlaceIds.size,
        },
        'seed page processed',
      );

      if (newOnPage === 0) break;
    }
  }

  log.info(
    { uniquePlaces: seenPlaceIds.size, businessesNew: counters.businessesNew },
    'place sweep complete; fetching reviews',
  );

  if (shouldFetchReviews) {
    let processed = 0;
    for (const { businessId, placeId } of businessIdToReviewCount.values()) {
      processed++;
      await persistReviewsForBusiness(
        input.apiKey,
        businessId,
        placeId,
        reviewsPerBusinessMax,
        counters,
      );
      if (processed % 25 === 0) {
        log.info(
          {
            processed,
            total: businessIdToReviewCount.size,
            reviewsSoFar: counters.reviewsTotal,
          },
          'review sweep progress',
        );
      }
    }
  }

  const businessesTotal = await prisma.business.count();
  const snapshotsToday = await prisma.snapshot.count({ where: { date: today } });

  const topByReviewCount = await prisma.snapshot.findMany({
    where: { date: today, googleReviewCount: { not: null } },
    orderBy: { googleReviewCount: 'desc' },
    take: 20,
    include: { business: { select: { nameCanonical: true } } },
  });

  return {
    businessesTotal,
    businessesNew: counters.businessesNew,
    reviewsTotal: counters.reviewsTotal,
    snapshotsToday,
    errors: counters.errors,
    durationSeconds: (Date.now() - startedAt) / 1000,
    topByReviewCount: topByReviewCount.map((s) => ({
      name: s.business.nameCanonical,
      reviewCount: s.googleReviewCount ?? 0,
    })),
  };
}
