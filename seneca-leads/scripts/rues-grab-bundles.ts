/**
 * Grab the Angular JS bundles via Playwright (CloudFront UA-gates curl).
 * Save them for static analysis to find the AES encryption key.
 */
import { writeFile, mkdir } from 'node:fs/promises';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { chromium as chromiumExtra } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { chromium } from 'playwright';

/* eslint-disable no-console */

chromiumExtra.use(StealthPlugin());

async function main(): Promise<void> {
  const outDir = '/tmp/seneca-rues-investigation/bundles';
  await mkdir(outDir, { recursive: true });

  const browser = await (chromiumExtra as unknown as typeof chromium).launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const saved: Array<{ url: string; size: number; path: string }> = [];

  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (!url.endsWith('.js')) return;
      // Skip 3rd-party noise; keep CloudFront app bundles + rues.org.co
      // micro-frontend bundles.
      if (
        !url.includes('cloudfront.net') &&
        !url.includes('rues.org.co/services/') &&
        !url.includes('rues.org.co/graphics/') &&
        !url.includes('rues.org.co/interno/') &&
        !url.includes('rues.org.co/backoffice/')
      ) {
        return;
      }
      const body = await res.body();
      if (body.length < 1_000) return; // skip empty chunks
      // Make filenames unique across micro-frontends
      const m = url.match(/(?:cloudfront\.net|rues\.org\.co)\/(.*)/);
      const subpath = m?.[1] ?? url.split('/').pop()!;
      const safeName = subpath.replace(/\//g, '__');
      const path = `${outDir}/${safeName}`;
      await writeFile(path, body);
      saved.push({ url, size: body.length, path });
    } catch {
      /* skip */
    }
  });

  await page.goto('https://www.rues.org.co/', { waitUntil: 'networkidle', timeout: 60_000 });
  // Trigger search to load search-route bundles too
  const input = page.locator('input[name="search"]');
  if ((await input.count()) > 0) {
    await input.first().fill('La Puerta Falsa');
    await input.first().press('Enter');
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
    await page.waitForTimeout(3_000);
  }

  await browser.close();

  console.log('Saved bundles:');
  for (const s of saved.sort((a, b) => b.size - a.size)) {
    console.log(`  ${s.size.toString().padStart(8)}  ${s.path}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
