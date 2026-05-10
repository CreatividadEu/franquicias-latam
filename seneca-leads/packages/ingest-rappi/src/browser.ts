import { chromium, type BrowserContext } from 'playwright';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { chromium as chromiumExtra } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'rappi-browser' });
chromiumExtra.use(StealthPlugin());

export interface BrowserOptions {
  headless?: boolean;
  /** Geo override; default Bogotá centro (Plaza de Bolívar). */
  geo?: { lat: number; lng: number };
}

export async function launchContext(opts: BrowserOptions = {}): Promise<BrowserContext> {
  const browser = await (chromiumExtra as unknown as typeof chromium).launch({
    headless: opts.headless ?? true,
  });

  const geo = opts.geo ?? { lat: 4.5981, lng: -74.0758 }; // Plaza de Bolívar

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    geolocation: { latitude: geo.lat, longitude: geo.lng },
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
    },
  });

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (type === 'image' || type === 'font' || type === 'media') {
      void route.abort();
      return;
    }
    void route.continue();
  });

  log.info({ headless: opts.headless ?? true, geo }, 'rappi browser context launched');
  return context;
}

export async function jitter(baseMs: number, jitterMs: number): Promise<void> {
  const wait = baseMs + Math.floor(Math.random() * jitterMs * 2 - jitterMs);
  await new Promise((r) => setTimeout(r, Math.max(0, wait)));
}

/** Haversine distance in meters between two lat/lng points. */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
