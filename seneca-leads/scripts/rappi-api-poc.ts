/**
 * Rappi API POC — full flow.
 *
 * Auth dance reverse-engineered from headers captured by Playwright:
 *   1. GET  /api/rocket/v2/guest/passport/   with random deviceid → {token}
 *   2. POST /api/rocket/v2/guest             with same deviceid
 *                                              + x-guest-api-key: <token>
 *                                              + x-application-id, app-version
 *                                            → {access_token}
 *   3. POST /api/pns-global-search-api/v1/.. with Authorization: Bearer <token>
 *                                              + deviceid (same throughout)
 *
 * The deviceid is just a random UUIDv4. x-application-id is the front-end
 * commit hash; we mimic the captured "rappi-microfront-web/<hash>".
 */
import { randomUUID } from 'node:crypto';

/* eslint-disable no-console */

const GRABILITY = 'https://services.grability.rappi.com';

const APP_ID = 'rappi-microfront-web/e1de6be43aa29091011474615d7ac0810051c36a';
const APP_VERSION = 'e1de6be43aa29091011474615d7ac0810051c36a';

function baseHeaders(deviceid: string): Record<string, string> {
  return {
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
}

async function getPassport(deviceid: string): Promise<string> {
  const res = await fetch(`${GRABILITY}/api/rocket/v2/guest/passport/`, {
    headers: baseHeaders(deviceid),
  });
  const text = await res.text();
  console.log(`[passport] status=${res.status} body=${text.slice(0, 150)}`);
  const json = JSON.parse(text) as { token: string };
  return json.token;
}

async function getAccessToken(deviceid: string, passport: string): Promise<string> {
  const res = await fetch(`${GRABILITY}/api/rocket/v2/guest`, {
    method: 'POST',
    headers: {
      ...baseHeaders(deviceid),
      'x-guest-api-key': passport,
    },
    body: '{}',
  });
  const text = await res.text();
  console.log(`[guest] status=${res.status} body-preview=${text.slice(0, 120)}`);
  const json = JSON.parse(text) as { access_token: string };
  return json.access_token;
}

async function call(
  deviceid: string,
  accessToken: string,
  path: string,
  body: unknown,
  label: string,
): Promise<void> {
  const res = await fetch(`${GRABILITY}${path}`, {
    method: 'POST',
    headers: {
      ...baseHeaders(deviceid),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`\n[${label}] ${path}\n  status=${res.status}`);
  console.log(`  body-preview: ${text.slice(0, 800).replace(/\s+/g, ' ')}`);
}

async function main(): Promise<void> {
  const deviceid = randomUUID();
  const lat = 4.6755234;
  const lng = -74.0498693;

  console.log(`Using deviceid=${deviceid}`);
  const passport = await getPassport(deviceid);
  console.log(`Got passport (length ${passport.length})`);
  const accessToken = await getAccessToken(deviceid, passport);
  console.log(`Got access_token (length ${accessToken.length})`);

  // First, sanity-check the suggestions endpoint we already know works
  await call(
    deviceid,
    accessToken,
    '/api/pns-global-search-api/v1/unified-suggestions',
    { keyword: 'La Puerta Falsa', lat, lng, suggester_type: 'global' },
    'unified-suggestions',
  );

  // Try the search-results endpoint variants
  for (const path of [
    '/api/pns-global-search-api/v1/unified-search',
    '/api/pns-global-search-api/v1/search',
    '/api/pns-global-search-api/v1/unified-results',
    '/api/pns-global-search-api/v1/global-search',
    '/api/pns-global-search-api/v1/unified-stores',
    '/api/pns-global-search-api/v1/stores',
  ]) {
    await call(
      deviceid,
      accessToken,
      path,
      { keyword: 'La Puerta Falsa', lat, lng, suggester_type: 'global' },
      path.split('/').pop()!,
    );
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
