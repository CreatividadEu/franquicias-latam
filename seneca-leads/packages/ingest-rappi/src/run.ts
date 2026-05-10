import { formatInTimeZone } from 'date-fns-tz';
import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger, bogotaTz, normalizeBusinessName } from '@seneca/shared';
import { launchContext, distanceMeters, jitter } from './browser.js';
import { searchRappi, type RappiCandidate } from './search.js';

const log = childLogger({ module: 'ingest-rappi' });

const TRIGRAM_THRESHOLD = 0.45;
const GEO_THRESHOLD_METERS = 500;

export interface RunRappiIngestInput {
  limit?: number;
  headless?: boolean;
  consecutiveErrorLimit?: number;
}

export interface RunRappiIngestResult {
  total: number;
  scanned: number;
  matched: number;
  unmatched: number;
  errors: number;
  durationSeconds: number;
  abortedReason?: string;
}

function todayBogotaDate(): Date {
  const ymd = formatInTimeZone(new Date(), bogotaTz, 'yyyy-MM-dd');
  return new Date(`${ymd}T00:00:00.000Z`);
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s.toLowerCase()}  `;
  const out = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3));
  return out;
}
function trigramSimilarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export async function runRappiIngest(
  input: RunRappiIngestInput = {},
): Promise<RunRappiIngestResult> {
  const startedAt = Date.now();
  const today = todayBogotaDate();
  const consecutiveErrorLimit = input.consecutiveErrorLimit ?? 4;

  const businesses = await prisma.business.findMany({
    where: { sector: 'restaurant' },
    orderBy: { createdAt: 'asc' },
    ...(input.limit ? { take: input.limit } : {}),
    select: {
      id: true,
      nameCanonical: true,
      nameNormalized: true,
      lat: true,
      lng: true,
    },
  });

  log.info({ total: businesses.length }, 'starting Rappi ingest');

  const ctx = await launchContext({ headless: input.headless ?? true });
  let matched = 0;
  let unmatched = 0;
  let errors = 0;
  let consecutive = 0;
  let abortedReason: string | undefined;
  let scanned = 0;

  try {
    for (const b of businesses) {
      if (consecutive >= consecutiveErrorLimit) {
        abortedReason = `consecutive errors hit limit (${consecutiveErrorLimit})`;
        log.error({ matched, unmatched, errors }, abortedReason);
        break;
      }

      scanned++;
      try {
        const candidates = await searchRappi(ctx, b.nameCanonical);
        consecutive = 0;
        const best = pickBestCandidate(candidates, b);

        await persistRappi(b.id, best, candidates, today);
        if (best) {
          matched++;
        } else {
          unmatched++;
        }

        log.info(
          {
            scanned,
            total: businesses.length,
            name: b.nameCanonical,
            matched: !!best,
            store: best?.storeId,
            rating: best?.rating,
            reviews: best?.reviewCount,
          },
          'rappi scan',
        );
      } catch (err) {
        errors++;
        consecutive++;
        log.error(
          {
            source: 'rappi',
            sourceId: b.id,
            name: b.nameCanonical,
            error: err instanceof Error ? err.message : String(err),
          },
          'rappi search failed',
        );
      }

      await jitter(3000, 750);
    }
  } finally {
    await ctx.close().catch(() => undefined);
  }

  return {
    total: businesses.length,
    scanned,
    matched,
    unmatched,
    errors,
    durationSeconds: (Date.now() - startedAt) / 1000,
    ...(abortedReason ? { abortedReason } : {}),
  };
}

function pickBestCandidate(
  candidates: RappiCandidate[],
  business: { nameNormalized: string; lat: number | null; lng: number | null },
): RappiCandidate | null {
  let best: { c: RappiCandidate; score: number } | null = null;
  for (const c of candidates) {
    const nameNorm = normalizeBusinessName(c.name);
    const sim = trigramSimilarity(business.nameNormalized, nameNorm);
    if (sim < TRIGRAM_THRESHOLD) continue;

    let geoOk = true;
    if (business.lat != null && business.lng != null && c.lat != null && c.lng != null) {
      const d = distanceMeters(
        { lat: business.lat, lng: business.lng },
        { lat: c.lat, lng: c.lng },
      );
      geoOk = d <= GEO_THRESHOLD_METERS;
    }
    if (!geoOk) continue;

    if (!best || sim > best.score) best = { c, score: sim };
  }
  return best?.c ?? null;
}

async function persistRappi(
  businessId: string,
  best: RappiCandidate | null,
  allCandidates: RappiCandidate[],
  today: Date,
): Promise<void> {
  const observedAt = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.observation.create({
      data: {
        businessId,
        source: 'rappi',
        sourceId: best?.storeId ?? `nomatch:${businessId}:${observedAt.getTime()}`,
        observedAt,
        payload: {
          best: (best ?? null) as unknown as Prisma.InputJsonValue,
          allCandidates: allCandidates as unknown as Prisma.InputJsonValue,
        } as unknown as Prisma.InputJsonValue,
      },
    });
    if (best) {
      if (best.storeId) {
        await tx.businessSourceLink.upsert({
          where: { source_sourceId: { source: 'rappi', sourceId: best.storeId } },
          create: {
            businessId,
            source: 'rappi',
            sourceId: best.storeId,
            url: best.url ?? null,
          },
          update: { url: best.url ?? null },
        });
      }
      await tx.snapshot.upsert({
        where: { businessId_date: { businessId, date: today } },
        create: {
          businessId,
          date: today,
          rappiPresent: true,
          rappiRating: best.rating ?? null,
          rappiReviewCount: best.reviewCount ?? null,
        },
        update: {
          rappiPresent: true,
          rappiRating: best.rating ?? null,
          rappiReviewCount: best.reviewCount ?? null,
        },
      });
    } else {
      await tx.snapshot.upsert({
        where: { businessId_date: { businessId, date: today } },
        create: { businessId, date: today, rappiPresent: false },
        update: { rappiPresent: false },
      });
    }
  });
}
