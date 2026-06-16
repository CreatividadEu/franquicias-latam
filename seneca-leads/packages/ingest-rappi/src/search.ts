/**
 * Rappi search via the Grability backend, plain fetch + JSON.
 *
 * Auth flow (reverse-engineered from the rappi.com.co web bundle):
 *
 *   1. GET  /api/rocket/v2/guest/passport/   {deviceid: <UUIDv4>}
 *      → { token: "<passport>" }
 *
 *   2. POST /api/rocket/v2/guest             {deviceid, x-guest-api-key: <passport>}
 *      body: {}
 *      → { access_token: "ft.<long-base64-ish>" }
 *
 *   3. POST /api/pns-global-search-api/v1/unified-suggestions
 *      headers: Authorization: Bearer <access_token>, deviceid, x-application-id
 *      body: { keyword, lat, lng, suggester_type: "global" }
 *      → { brands: [{ brand_name, brand_id, store_id, vertical, store_type, ... }], ... }
 *
 * One deviceid + access_token per process lifetime; tokens are minted on demand.
 */
import { randomUUID } from 'node:crypto';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'rappi-search' });

const GRABILITY = 'https://services.grability.rappi.com';
const APP_VERSION = 'e1de6be43aa29091011474615d7ac0810051c36a';
const APP_ID = `rappi-microfront-web/${APP_VERSION}`;

interface SessionState {
  deviceid: string;
  accessToken: string;
  mintedAt: number;
}

let session: SessionState | null = null;
const SESSION_TTL_MS = 30 * 60 * 1000; // re-mint after 30 min to be safe

function baseHeaders(deviceid: string, accessToken?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'es-CO,es;q=0.9',
    'Content-Type': 'application/json',
    Origin: 'https://www.rappi.com.co',
    Referer: 'https://www.rappi.com.co/',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    deviceid,
    'app-version': APP_VERSION,
    'x-application-id': APP_ID,
    needappsflyerid: 'false',
  };
  if (accessToken) h.Authorization = `Bearer ${accessToken}`;
  return h;
}

async function mintSession(): Promise<SessionState> {
  const deviceid = randomUUID();
  const passportRes = await fetch(`${GRABILITY}/api/rocket/v2/guest/passport/`, {
    headers: baseHeaders(deviceid),
  });
  if (!passportRes.ok) {
    throw new Error(`Rappi passport ${passportRes.status}`);
  }
  const passportJson = (await passportRes.json()) as { token: string };

  const tokenRes = await fetch(`${GRABILITY}/api/rocket/v2/guest`, {
    method: 'POST',
    headers: { ...baseHeaders(deviceid), 'x-guest-api-key': passportJson.token },
    body: '{}',
  });
  if (!tokenRes.ok) {
    throw new Error(`Rappi guest ${tokenRes.status}`);
  }
  const tokenJson = (await tokenRes.json()) as { access_token: string };

  log.info({ deviceid }, 'Rappi session minted');
  return { deviceid, accessToken: tokenJson.access_token, mintedAt: Date.now() };
}

async function getSession(): Promise<SessionState> {
  if (session && Date.now() - session.mintedAt < SESSION_TTL_MS) return session;
  session = await mintSession();
  return session;
}

export interface RappiCandidate {
  storeId: string;
  brandId: string;
  brandName: string;
  vertical: string;
  storeType: string;
  relevance: number;
  /** Rappi suggestions don't include rating/reviews; per-store endpoint TBD. */
  rating?: number;
  reviewCount?: number;
  /** Optional lat/lng — suggestions endpoint doesn't include it, but the
   *  per-store endpoint usually does. */
  lat?: number;
  lng?: number;
}

interface SuggestionsResponse {
  brands?: Array<{
    brand_name?: string;
    brand_id?: number;
    store_id?: number;
    vertical?: string;
    store_type?: string;
    relevance_v2?: number;
  }>;
  categories?: unknown[];
  verticals?: unknown[];
  keywords?: unknown[];
}

/**
 * Suggestions API: returns brand-level matches for a keyword scoped to a
 * lat/lng. We filter to vertical="restaurants" so we don't accidentally match
 * a CPG store named after the restaurant.
 */
export async function searchRappi(
  query: string,
  ctx: { lat: number; lng: number },
): Promise<RappiCandidate[]> {
  const { deviceid, accessToken } = await getSession();
  const res = await fetch(
    `${GRABILITY}/api/pns-global-search-api/v1/unified-suggestions`,
    {
      method: 'POST',
      headers: baseHeaders(deviceid, accessToken),
      body: JSON.stringify({
        keyword: query,
        lat: ctx.lat,
        lng: ctx.lng,
        suggester_type: 'global',
      }),
    },
  );

  if (!res.ok) {
    // 401 = token expired; re-mint and retry once
    if (res.status === 401) {
      session = null;
      const retry = await fetch(
        `${GRABILITY}/api/pns-global-search-api/v1/unified-suggestions`,
        {
          method: 'POST',
          headers: baseHeaders((await getSession()).deviceid, (await getSession()).accessToken),
          body: JSON.stringify({
            keyword: query,
            lat: ctx.lat,
            lng: ctx.lng,
            suggester_type: 'global',
          }),
        },
      );
      if (!retry.ok) throw new Error(`Rappi suggestions ${retry.status} (after re-mint)`);
      return parseSuggestions(((await retry.json()) as SuggestionsResponse) ?? {});
    }
    throw new Error(`Rappi suggestions ${res.status}`);
  }

  const json = (await res.json()) as SuggestionsResponse;
  return parseSuggestions(json);
}

function parseSuggestions(json: SuggestionsResponse): RappiCandidate[] {
  const brands = json.brands ?? [];
  return brands
    .filter(
      (b) =>
        b.vertical === 'restaurants' &&
        typeof b.brand_name === 'string' &&
        typeof b.store_id === 'number',
    )
    .map((b) => ({
      storeId: String(b.store_id),
      brandId: String(b.brand_id ?? ''),
      brandName: b.brand_name ?? '',
      vertical: b.vertical ?? '',
      storeType: b.store_type ?? '',
      relevance: typeof b.relevance_v2 === 'number' ? b.relevance_v2 : 0,
    }));
}
