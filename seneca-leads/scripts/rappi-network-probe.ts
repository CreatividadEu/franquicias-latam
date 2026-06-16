/**
 * Rappi network probe — tight version.
 *
 * Hard caps everywhere (no waitForLoadState networkidle — Rappi keeps
 * websockets open forever). Saves network log incrementally so we get
 * partial data even if the script is killed.
 */
import { writeFile, mkdir } from 'node:fs/promises';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { chromium as chromiumExtra } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { chromium } from 'playwright';

/* eslint-disable no-console */

chromiumExtra.use(StealthPlugin());

interface NetworkEntry {
  method: string;
  url: string;
  resourceType: string;
  status?: number;
  contentType?: string;
  responseBytes?: number;
  responsePreview?: string;
  postData?: string;
  startedAt: number;
  durationMs?: number;
}

const OUT_DIR = '/tmp/seneca-rappi-investigation';

async function flush(entries: NetworkEntry[]): Promise<void> {
  await writeFile(
    `${OUT_DIR}/network-probe.json`,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        totalRequests: entries.length,
        entries,
        distinctHosts: Array.from(new Set(entries.map((e) => new URL(e.url).host))).sort(),
      },
      null,
      2,
    ),
    'utf8',
  );
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await (chromiumExtra as unknown as typeof chromium).launch({
    headless: true,
  });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    geolocation: { latitude: 4.6486, longitude: -74.0539 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  page.setDefaultNavigationTimeout(15_000);

  const entries: NetworkEntry[] = [];
  page.on('request', (req) => {
    entries.push({
      method: req.method(),
      url: req.url(),
      resourceType: req.resourceType(),
      ...(req.postData() ? { postData: req.postData()!.slice(0, 1500) } : {}),
      startedAt: Date.now(),
    });
  });
  page.on('response', async (res) => {
    try {
      const url = res.url();
      const matching = entries.findLast((e) => e.url === url && e.status === undefined);
      if (!matching) return;
      matching.status = res.status();
      matching.contentType = res.headers()['content-type'];
      matching.durationMs = Date.now() - matching.startedAt;
      const ct = matching.contentType ?? '';
      if (ct.includes('json') || ct.includes('text')) {
        try {
          const body = await res.body();
          matching.responseBytes = body.length;
          matching.responsePreview = body.toString('utf8').slice(0, 2500);
        } catch {
          /* skip */
        }
      }
    } catch {
      /* skip */
    }
  });

  // Periodic flush so output appears even if we get stuck
  const flushTimer = setInterval(() => {
    flush(entries).catch(() => undefined);
  }, 5_000);

  try {
    console.log('▶ home');
    await page.goto('https://www.rappi.com.co/', {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });
    await page.waitForTimeout(4_000);

    // Try direct search URLs
    for (const url of [
      'https://www.rappi.com.co/buscar?q=la+puerta+falsa',
      'https://www.rappi.com.co/restaurants?q=la+puerta+falsa',
      'https://www.rappi.com.co/restaurantes/buscar?q=la+puerta+falsa',
    ]) {
      try {
        console.log(`▶ trying ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12_000 });
        await page.waitForTimeout(4_000);
        console.log(`  landed: ${page.url()}`);
      } catch (err) {
        console.log(`  err: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Try clicking around on the home page
    console.log('▶ home + interaction');
    await page
      .goto('https://www.rappi.com.co/', { waitUntil: 'domcontentloaded', timeout: 12_000 })
      .catch(() => undefined);
    await page.waitForTimeout(3_000);

    // Find any visible search box and submit
    const searchSel = 'input[type="search"], input[placeholder*="uscar" i], input[name="search"]';
    const search = page.locator(searchSel).first();
    if ((await search.count()) > 0 && (await search.isVisible().catch(() => false))) {
      try {
        await search.fill('La Puerta Falsa', { timeout: 4_000 });
        await search.press('Enter');
        await page.waitForTimeout(5_000);
        console.log(`  search submitted, url: ${page.url()}`);
      } catch (err) {
        console.log(`  search err: ${err instanceof Error ? err.message : err}`);
      }
    } else {
      console.log('  no visible search input');
    }

    await page.screenshot({ path: `${OUT_DIR}/final-state.png`, fullPage: true }).catch(() => undefined);
    await writeFile(`${OUT_DIR}/final-state.html`, await page.content().catch(() => ''), 'utf8');
    console.log(`▶ final url: ${page.url()}`);
  } finally {
    clearInterval(flushTimer);
    await flush(entries);
    await browser.close();
  }

  // Summarize
  console.log('\n=== Distinct hosts ===');
  const hosts = Array.from(new Set(entries.map((e) => new URL(e.url).host))).sort();
  for (const h of hosts) console.log(`  ${h}`);

  console.log('\n=== Rappi-domain API-like calls ===');
  const apiCalls = entries.filter(
    (e) =>
      /rappi/.test(e.url) &&
      (e.resourceType === 'xhr' ||
        e.resourceType === 'fetch' ||
        (e.contentType ?? '').includes('json')),
  );
  for (const e of apiCalls) {
    console.log(`[${e.method}] ${e.status ?? '?'} ${e.url}`);
    if (e.postData) console.log(`  body: ${e.postData.slice(0, 250)}`);
    if (e.responsePreview)
      console.log(`  → ${e.responsePreview.slice(0, 250).replace(/\s+/g, ' ')}`);
    console.log();
  }

  console.log(`\nFull capture: ${OUT_DIR}/network-probe.json`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
