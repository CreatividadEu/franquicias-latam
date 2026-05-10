import { formatInTimeZone } from 'date-fns-tz';
import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger, bogotaTz } from '@seneca/shared';
import { deriveHandleCandidates, type PlaceObservationPayload } from './handle.js';
import { fetchInstagramProfiles, computeEngagementRate, type IgProfile } from './apify.js';

const log = childLogger({ module: 'ingest-instagram' });

export interface RunInstagramIngestInput {
  apifyToken: string;
  /** Smoke-test cap. Default: process all candidates. */
  limit?: number;
  /** How many handles to send to one Apify run (cost+latency knob). Default 50. */
  batchSize?: number;
}

export interface RunInstagramIngestResult {
  total: number;
  derivedHandles: number;
  apifyAttempted: number;
  matched: number;
  errors: number;
  durationSeconds: number;
}

function todayBogotaDate(): Date {
  const ymd = formatInTimeZone(new Date(), bogotaTz, 'yyyy-MM-dd');
  return new Date(`${ymd}T00:00:00.000Z`);
}

export async function runInstagramIngest(
  input: RunInstagramIngestInput,
): Promise<RunInstagramIngestResult> {
  const startedAt = Date.now();
  const today = todayBogotaDate();
  const batchSize = input.batchSize ?? 50;

  // Pull the most recent google_places observation per business so we can
  // mine the website / description for an IG handle.
  const businesses = await prisma.business.findMany({
    // No igHandle filter: businesses with an existing handle (set during
    // Google Places ingest from website/description regex) are also
    // included so we can fetch their profiles; businesses without a handle
    // attempt cheap derivation from the cached Google observation.
    orderBy: { createdAt: 'asc' },
    ...(input.limit ? { take: input.limit } : {}),
    select: {
      id: true,
      domain: true,
      igHandle: true,
      observations: {
        where: { source: 'google_places' },
        orderBy: { observedAt: 'desc' },
        take: 1,
        select: { payload: true },
      },
    },
  });

  log.info({ total: businesses.length }, 'starting Instagram ingest');

  const businessByHandle = new Map<string, string>(); // handle -> businessId
  let derivedHandles = 0;
  for (const b of businesses) {
    let handle = b.igHandle?.toLowerCase() ?? null;
    if (!handle) {
      const payload = b.observations[0]?.payload as
        | PlaceObservationPayload
        | null
        | undefined;
      const candidates = deriveHandleCandidates({
        domain: b.domain,
        observationPayload: payload ?? null,
      });
      if (candidates.length === 0) continue;
      handle = candidates[0]!;
    }
    derivedHandles++;
    if (!businessByHandle.has(handle)) businessByHandle.set(handle, b.id);
  }

  log.info(
    { derivedHandles, uniqueHandles: businessByHandle.size },
    'handle derivation complete',
  );

  let matched = 0;
  let apifyAttempted = 0;
  let errors = 0;

  const handles = Array.from(businessByHandle.keys());
  for (let i = 0; i < handles.length; i += batchSize) {
    const batch = handles.slice(i, i + batchSize);
    apifyAttempted += batch.length;
    try {
      const results = await fetchInstagramProfiles({
        apifyToken: input.apifyToken,
        usernames: batch,
      });
      for (const result of results) {
        if (!result.profile) {
          errors++;
          continue;
        }
        const businessId = businessByHandle.get(result.username);
        if (!businessId) continue;
        try {
          await persistProfile(businessId, result.profile, result.raw, today);
          matched++;
        } catch (err) {
          errors++;
          log.error(
            {
              source: 'instagram',
              sourceId: result.username,
              error: err instanceof Error ? err.message : String(err),
            },
            'failed to persist IG profile',
          );
        }
      }
    } catch (err) {
      errors += batch.length;
      log.error(
        {
          source: 'instagram',
          batchSize: batch.length,
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
        'Apify batch failed',
      );
    }
  }

  return {
    total: businesses.length,
    derivedHandles,
    apifyAttempted,
    matched,
    errors,
    durationSeconds: (Date.now() - startedAt) / 1000,
  };
}

async function persistProfile(
  businessId: string,
  profile: IgProfile,
  raw: unknown,
  today: Date,
): Promise<void> {
  const observedAt = new Date();
  const engagementRate = computeEngagementRate(profile);

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id: businessId },
      data: { igHandle: profile.username },
    });
    await tx.observation.create({
      data: {
        businessId,
        source: 'instagram',
        sourceId: profile.username,
        observedAt,
        payload: raw as Prisma.InputJsonValue,
      },
    });
    await tx.snapshot.upsert({
      where: { businessId_date: { businessId, date: today } },
      create: {
        businessId,
        date: today,
        igFollowers: profile.followersCount ?? null,
        igPostCount: profile.postsCount ?? null,
        igEngagementRate: engagementRate,
      },
      update: {
        igFollowers: profile.followersCount ?? null,
        igPostCount: profile.postsCount ?? null,
        igEngagementRate: engagementRate,
      },
    });
  });
}
