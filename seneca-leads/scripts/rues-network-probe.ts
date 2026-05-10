/**
 * RUES network probe v2: navigate the SPA aggressively to trigger a real
 * search and capture the actual API endpoint. We log every request to
 * elasticprd.rues.org.co so we can replay them with plain fetch.
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
  requestHeaders?: Record<string, string>;
  startedAt: number;
  durationMs?: number;
}

async function main(): Promise<void> {
  const outDir = '/tmp/seneca-rues-investigation';
  await mkdir(outDir, { recursive: true });

  const browser = await (chromiumExtra as unknown as typeof chromium).launch({
    headless: true,
  });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  });
  const page = await context.newPage();

  const entries: NetworkEntry[] = [];

  page.on('request', (req) => {
    entries.push({
      method: req.method(),
      url: req.url(),
      resourceType: req.resourceType(),
      ...(req.postData() ? { postData: req.postData()!.slice(0, 1000) } : {}),
      requestHeaders: req.headers(),
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
          matching.responsePreview = body.toString('utf8').slice(0, 1500);
        } catch {
          /* skip */
        }
      }
    } catch {
      /* skip */
    }
  });

  console.log('▶ home');
  await page.goto('https://www.rues.org.co/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

  // Close any modal popups
  console.log('▶ dismiss modals');
  for (const sel of [
    'button:has-text("Aceptar")',
    'button:has-text("Cerrar")',
    'button:has-text("Continuar")',
    '[aria-label="Close"]',
    'button.close',
  ]) {
    try {
      const loc = page.locator(sel);
      if ((await loc.count()) > 0 && (await loc.first().isVisible())) {
        await loc.first().click({ timeout: 2_000 });
        await page.waitForTimeout(500);
      }
    } catch {
      /* skip */
    }
  }

  // Try to navigate to a search page via menu
  console.log('▶ navigating menu');
  for (const linkText of [
    'Razón Social',
    'Razon Social',
    'Por Razón Social',
    'Consultas',
    'Consulta',
    'Buscar',
  ]) {
    try {
      const link = page.getByRole('link', { name: new RegExp(linkText, 'i') });
      if ((await link.count()) > 0) {
        await link.first().click({ timeout: 3_000 });
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
        await page.waitForTimeout(2_000);
        console.log(`  clicked: ${linkText}`);
        break;
      }
    } catch {
      /* skip */
    }
  }

  console.log('▶ current url:', page.url());

  // Find ANY input now and submit a search
  console.log('▶ inputs found:');
  const inputs = await page.locator('input').all();
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i]!;
    try {
      const placeholder = await inp.getAttribute('placeholder');
      const name = await inp.getAttribute('name');
      const id = await inp.getAttribute('id');
      const type = await inp.getAttribute('type');
      const visible = await inp.isVisible();
      console.log(
        `  [${i}] type=${type} placeholder="${placeholder}" name="${name}" id="${id}" visible=${visible}`,
      );
    } catch {
      /* skip */
    }
  }

  // Try to fill the first visible text input
  for (const inp of inputs) {
    try {
      const type = await inp.getAttribute('type');
      const visible = await inp.isVisible();
      if (visible && (type === 'text' || type === null || type === 'search')) {
        console.log('▶ filling input with "La Puerta Falsa"');
        await inp.fill('La Puerta Falsa');
        await page.waitForTimeout(1500);
        await inp.press('Enter').catch(() => undefined);
        break;
      }
    } catch {
      /* skip */
    }
  }

  // Try clicking any submit button
  for (const sel of [
    'button:has-text("Consultar")',
    'button:has-text("Buscar")',
    'button[type="submit"]',
    'input[type="submit"]',
  ]) {
    try {
      const btn = page.locator(sel);
      if ((await btn.count()) > 0 && (await btn.first().isVisible())) {
        console.log('▶ clicking submit:', sel);
        await btn.first().click({ timeout: 3_000 });
        break;
      }
    } catch {
      /* skip */
    }
  }

  // Give it time to fire the API call
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
  await page.waitForTimeout(5_000);

  // Final state — dump the page so we can see what RUES served
  await page.screenshot({
    path: `${outDir}/final-state.png`,
    fullPage: true,
  });
  await writeFile(`${outDir}/final-state.html`, await page.content(), 'utf8');
  console.log('▶ final url:', page.url());

  await browser.close();

  // Save full network log
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

  // Print API-like requests
  console.log('\n=== Calls to elasticprd.rues.org.co ===');
  const elastic = entries.filter((e) => e.url.includes('elasticprd.rues.org.co'));
  for (const e of elastic) {
    console.log(`[${e.method}] ${e.status ?? '?'} ${e.url}`);
    if (e.postData) console.log(`  body: ${e.postData.slice(0, 300)}`);
    if (e.responsePreview)
      console.log(`  → ${e.responsePreview.slice(0, 200).replace(/\s+/g, ' ')}`);
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
