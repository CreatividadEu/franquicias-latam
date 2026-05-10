import { chromium, type BrowserContext } from 'playwright';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { chromium as chromiumExtra } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'rues-browser' });

// playwright-extra + stealth: make headless chromium look like a real browser.
// The stealth plugin patches navigator.webdriver, plugins, languages, chrome.runtime, etc.
chromiumExtra.use(StealthPlugin());

export interface BrowserOptions {
  headless?: boolean;
  slowMo?: number;
  userAgent?: string;
}

export async function launchContext(opts: BrowserOptions = {}): Promise<BrowserContext> {
  const browser = await (chromiumExtra as unknown as typeof chromium).launch({
    headless: opts.headless ?? true,
    slowMo: opts.slowMo ?? 0,
  });

  const context = await browser.newContext({
    userAgent:
      opts.userAgent ??
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    extraHTTPHeaders: {
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
    },
  });

  // Block heavy resources to keep bandwidth low and look less bot-like-fast.
  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (type === 'image' || type === 'font' || type === 'media') {
      void route.abort();
      return;
    }
    void route.continue();
  });

  log.info({ headless: opts.headless ?? true }, 'browser context launched');
  return context;
}

export async function jitter(baseMs: number, jitterMs: number): Promise<void> {
  const wait = baseMs + Math.floor(Math.random() * jitterMs * 2 - jitterMs);
  await new Promise((r) => setTimeout(r, Math.max(0, wait)));
}
