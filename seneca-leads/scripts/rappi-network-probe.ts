/**
 * Rappi network probe: discover the real data API behind rappi.com.co.
 * Same pattern as the RUES investigation — open the SPA, capture every XHR /
 * fetch request and response, save to JSON, surface anything that looks
 * API-like for analysis.
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

async function main(): Promise<void> {
  const outDir = '/tmp/seneca-rappi-investigation';
  await mkdir(outDir, { recursive: true });

  const browser = await (chromiumExtra as unknown as typeof chromium).launch({
    headless: true,
  });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    geolocation: { latitude: 4.6486, lng: -74.0539 } as never, // Zona G area
    permissions: ['geolocation'],
  });

  const page = await context.newPage();
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
      const matching = entries.findLast(
        (e) => e.url === url && e.status === undefined,
      );
      if (!matching) return;
      matching.status = res.status();
      matching.contentType = res.headers()['content-type'];
      matching.durationMs = Date.now() - matching.startedAt;
      const ct = matching.contentType ?? '';
      if (ct.includes('json') || ct.includes('text')) {
        try {
          const body = await res.body();
          matching.responseBytes = body.length;
          matching.responsePreview = body.toString('utf8').slice(0, 2000);
        } catch {
          /* skip */
        }
      }
    } catch {
      /* skip */
    }
  });

  console.log('▶ home');
  await page.goto('https://www.rappi.com.co/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
  await page.waitForTimeout(2_000);

  console.log('▶ trying to navigate to restaurants section');
  // Common Rappi paths
  for (const path of [
    '/restaurantes',
    '/restaurants',
    '/comidas',
    '/pedir-domicilio/restaurantes',
  ]) {
    try {
      await page.goto(`https://www.rappi.com.co${path}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
      await page.waitForTimeout(2_000);
      const url = page.url();
      console.log(`  tried ${path} → landed at ${url}`);
      if (url.includes('restaur') || url.includes('comida')) break;
    } catch {
      /* skip */
    }
  }

  console.log('▶ inspecting page for inputs');
  const inputs = await page.locator('input').all();
  for (let i = 0; i < Math.min(inputs.length, 5); i++) {
    const inp = inputs[i]!;
    try {
      const placeholder = await inp.getAttribute('placeholder');
      const name = await inp.getAttribute('name');
      const type = await inp.getAttribute('type');
      const visible = await inp.isVisible();
      console.log(`  [${i}] type=${type} name="${name}" placeholder="${placeholder}" visible=${visible}`);
    } catch {
      /* skip */
    }
  }

  console.log('▶ looking for restaurant cards / links');
  const cardCount = await page.locator('a[href*="/restaurantes/"], a[href*="/store/"]').count();
  console.log(`  restaurant-like links found: ${cardCount}`);

  console.log('▶ trying a search input fill if visible');
  const searchInputs = [
    page.getByPlaceholder(/buscar/i),
    page.getByRole('searchbox'),
    page.locator('input[type="search"]:visible'),
  ];
  for (const candidate of searchInputs) {
    if ((await candidate.count()) > 0 && (await candidate.first().isVisible())) {
      try {
        await candidate.first().fill('La Puerta Falsa');
        await candidate.first().press('Enter');
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
        await page.waitForTimeout(3_000);
        console.log('  search submitted');
        break;
      } catch {
        /* skip */
      }
    }
  }

  await page.screenshot({
    path: `${outDir}/final-state.png`,
    fullPage: true,
  });
  await writeFile(`${outDir}/final-state.html`, await page.content(), 'utf8');
  console.log(`▶ final url: ${page.url()}`);

  await browser.close();

  await writeFile(
    `${outDir}/network-probe.json`,
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

  console.log('\n=== Distinct hosts ===');
  const hosts = Array.from(new Set(entries.map((e) => new URL(e.url).host))).sort();
  for (const h of hosts) console.log('  ' + h);

  console.log('\n=== Calls to rappi.com.co or rappi.com hosts ===');
  const rappiCalls = entries.filter(
    (e) =>
      /rappi\.com/.test(e.url) &&
      (e.resourceType === 'xhr' ||
        e.resourceType === 'fetch' ||
        (e.contentType ?? '').includes('json')),
  );
  for (const e of rappiCalls) {
    console.log(`[${e.method}] ${e.status ?? '?'} ${e.url}`);
    if (e.postData) console.log(`  body: ${e.postData.slice(0, 200)}`);
    if (e.responsePreview)
      console.log(`  → ${e.responsePreview.slice(0, 250).replace(/\s+/g, ' ')}`);
    console.log();
  }

  console.log(`\nFull capture: ${outDir}/network-probe.json`);
  console.log(`Final HTML:   ${outDir}/final-state.html`);
  console.log(`Screenshot:   ${outDir}/final-state.png`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
