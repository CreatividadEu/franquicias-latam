import PQueue from 'p-queue';
import pRetry, { AbortError } from 'p-retry';
import { z } from 'zod';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'serpapi' });

const SERPAPI_BASE = 'https://serpapi.com/search.json';
const queue = new PQueue({ concurrency: 2, intervalCap: 1, interval: 250 });

export const SerpGpsSchema = z
  .object({
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
  })
  .optional();

export const SerpLocalResultSchema = z
  .object({
    position: z.number().optional(),
    title: z.string().optional(),
    place_id: z.string().optional(),
    data_id: z.string().optional(),
    data_cid: z.string().optional(),
    reviews_link: z.string().optional(),
    photos_link: z.string().optional(),
    gps_coordinates: SerpGpsSchema,
    rating: z.number().optional(),
    reviews: z.number().optional(),
    type: z.string().optional(),
    types: z.array(z.string()).optional(),
    address: z.string().optional(),
    open_state: z.string().optional(),
    hours: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    description: z.string().optional(),
    service_options: z.record(z.unknown()).optional(),
    thumbnail: z.string().optional(),
  })
  .passthrough();

export const SerpMapsSearchSchema = z
  .object({
    search_metadata: z.record(z.unknown()).optional(),
    search_information: z.record(z.unknown()).optional(),
    local_results: z.array(SerpLocalResultSchema).optional(),
    place_results: SerpLocalResultSchema.optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type SerpLocalResult = z.infer<typeof SerpLocalResultSchema>;
export type SerpMapsSearch = z.infer<typeof SerpMapsSearchSchema>;

export const SerpReviewUserSchema = z
  .object({
    name: z.string().optional(),
    link: z.string().optional(),
    thumbnail: z.string().optional(),
    reviews: z.number().optional(),
    photos: z.number().optional(),
  })
  .passthrough()
  .optional();

export const SerpReviewSchema = z
  .object({
    user: SerpReviewUserSchema,
    rating: z.number().optional(),
    date: z.string().optional(),
    iso_date: z.string().optional(),
    iso_date_of_last_edit: z.string().optional(),
    snippet: z.string().optional(),
    review_id: z.string().optional(),
    link: z.string().optional(),
  })
  .passthrough();

export const SerpReviewsResponseSchema = z
  .object({
    place_info: z.record(z.unknown()).optional(),
    reviews: z.array(SerpReviewSchema).optional(),
    serpapi_pagination: z
      .object({
        next: z.string().optional(),
        next_page_token: z.string().optional(),
      })
      .optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type SerpReview = z.infer<typeof SerpReviewSchema>;
export type SerpReviewsResponse = z.infer<typeof SerpReviewsResponseSchema>;

interface FetchOptions {
  apiKey: string;
  params: Record<string, string>;
}

async function rawFetch<T>(opts: FetchOptions, schema: z.ZodSchema<T>): Promise<T> {
  const url = new URL(SERPAPI_BASE);
  for (const [k, v] of Object.entries(opts.params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set('api_key', opts.apiKey);

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (res.status === 429 || res.status >= 500) {
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v;
    });
    log.warn(
      { status: res.status, headers, params: { ...opts.params, api_key: '[redacted]' } },
      'SerpAPI transient error',
    );
    const err = new Error(`SerpAPI ${res.status}`);
    throw err;
  }

  if (!res.ok) {
    const body = await res.text();
    log.error({ status: res.status, body: body.slice(0, 500) }, 'SerpAPI permanent error');
    throw new AbortError(`SerpAPI ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as unknown;
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    log.error({ issues: parsed.error.issues.slice(0, 5) }, 'SerpAPI response did not match schema');
    throw new AbortError(`SerpAPI schema mismatch: ${parsed.error.issues[0]?.message}`);
  }
  return parsed.data;
}

async function fetchWithRetry<T>(opts: FetchOptions, schema: z.ZodSchema<T>): Promise<T> {
  return queue.add(
    () =>
      pRetry(() => rawFetch(opts, schema), {
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30_000,
        onFailedAttempt: (err) => {
          log.warn(
            { attempt: err.attemptNumber, retriesLeft: err.retriesLeft, message: err.message },
            'SerpAPI retrying',
          );
        },
      }),
    { throwOnTimeout: true },
  ) as Promise<T>;
}

export interface MapsSearchInput {
  apiKey: string;
  query: string;
  ll: string;
  start?: number;
  hl?: string;
  gl?: string;
}

export async function searchMaps(input: MapsSearchInput): Promise<SerpMapsSearch> {
  const params: Record<string, string> = {
    engine: 'google_maps',
    q: input.query,
    ll: input.ll,
    type: 'search',
    hl: input.hl ?? 'es',
    gl: input.gl ?? 'co',
  };
  if (typeof input.start === 'number') params.start = String(input.start);
  return fetchWithRetry({ apiKey: input.apiKey, params }, SerpMapsSearchSchema);
}

export interface MapsReviewsInput {
  apiKey: string;
  placeId: string;
  nextPageToken?: string;
  hl?: string;
  sortBy?: 'qualityScore' | 'newestFirst' | 'ratingHigh' | 'ratingLow';
}

export async function fetchReviews(input: MapsReviewsInput): Promise<SerpReviewsResponse> {
  const params: Record<string, string> = {
    engine: 'google_maps_reviews',
    place_id: input.placeId,
    hl: input.hl ?? 'es',
  };
  if (input.nextPageToken) params.next_page_token = input.nextPageToken;
  if (input.sortBy) params.sort_by = input.sortBy;
  return fetchWithRetry({ apiKey: input.apiKey, params }, SerpReviewsResponseSchema);
}
