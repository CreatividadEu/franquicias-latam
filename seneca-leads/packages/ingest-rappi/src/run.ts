import { formatInTimeZone } from 'date-fns-tz';
import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger, bogotaTz, normalizeBusinessName } from '@seneca/shared';
import { searchRappi, type RappiCandidate } from './search.js';

const log = childLogger({ module: 'ingest-rappi' });

const TRIGRAM_THRESHOLD = 0.45;
const BOGOTA_DEFAULT_LAT = 4.6486; // Zona G centroid
const BOGOTA_DEFAULT_LNG = -74.0539;

export interface RunRappiIngestInput {
  /** Smoke-test cap. */
  limit?: number;
  consecutiveErrorLimit?: number;
  /** Base delay between API calls. Spec: 3s ± 0.75s jitter. */
  baseDelayMs?: number;
  jitterMs?: number;
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

async function jitter(baseMs: number, jitterMs: number): Promise<void> {
  const wait = baseMs + Math.floor(Math.random() * jitterMs * 2 - jitterMs);
  await new Promise((r) => setTimeout(r, Math.max(0, wait)));
}

export async function runRappiIngest(
  input: RunRappiIngestInput = {},
): Promise<RunRappiIngestResult> {
  const startedAt = Date.now();
  const today = todayBogotaDate();
  const consecutiveErrorLimit = input.consecutiveErrorLimit ?? 4;
  const baseDelay = input.baseDelayMs ?? 3000;
  const jitterAmount = input.jitterMs ?? 750;

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

  let matched = 0;
  let unmatched = 0;
  let errors = 0;
  let consecutive = 0;
  let abortedReason: string | undefined;
  let scanned = 0;

  for (const b of businesses) {
    if (consecutive >= consecutiveErrorLimit) {
      abortedReason = `consecutive errors hit limit (${consecutiveErrorLimit})`;
      log.error({ matched, unmatched, errors }, abortedReason);
      break;
    }

    scanned++;
    try {
      const candidates = await searchRappi(b.nameCanonical, {
        lat: b.lat ?? BOGOTA_DEFAULT_LAT,
        lng: b.lng ?? BOGOTA_DEFAULT_LNG,
      });
      consecutive = 0;
      const best = pickBestCandidate(candidates, b);

      await persistRappi(b.id, best, candidates, today);
      if (best) matched++;
      else unmatched++;

      log.info(
        {
          scanned,
          total: businesses.length,
          name: b.nameCanonical,
          matched: !!best,
          storeId: best?.storeId,
          brandName: best?.brandName,
          sim: best ? trigramSimilarity(b.nameNormalized, normalizeBusinessName(best.brandName)).toFixed(2) : undefined,
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

    await jitter(baseDelay, jitterAmount);
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
  business: { nameNormalized: string },
): RappiCandidate | null {
  let best: { c: RappiCandidate; score: number } | null = null;
  for (const c of candidates) {
    if (c.vertical !== 'restaurants') continue;
    const nameNorm = normalizeBusinessName(c.brandName);
    const sim = trigramSimilarity(business.nameNormalized, nameNorm);
    if (sim < TRIGRAM_THRESHOLD) continue;
    // Tiebreak on Rappi's own relevance score when sims are close.
    const composite = sim * 0.85 + Math.min(c.relevance / 10, 1) * 0.15;
    if (!best || composite > best.score) best = { c, score: composite };
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
      await tx.businessSourceLink.upsert({
        where: { source_sourceId: { source: 'rappi', sourceId: best.storeId } },
        create: {
          businessId,
          source: 'rappi',
          sourceId: best.storeId,
          url: `https://www.rappi.com.co/restaurantes/${best.storeId}`,
        },
        update: { url: `https://www.rappi.com.co/restaurantes/${best.storeId}` },
      });
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
