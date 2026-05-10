import type { BrowserContext, Page } from 'playwright';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'rappi-search' });

const RAPPI_HOME = 'https://www.rappi.com.co/';

export interface RappiCandidate {
  storeId?: string;
  name: string;
  url?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  raw?: string;
}

export interface SearchOptions {
  navTimeoutMs?: number;
  debugScreenshotDir?: string;
}

export async function searchRappi(
  ctx: BrowserContext,
  query: string,
  opts: SearchOptions = {},
): Promise<RappiCandidate[]> {
  const navTimeoutMs = opts.navTimeoutMs ?? 30_000;
  const page = await ctx.newPage();
  page.setDefaultNavigationTimeout(navTimeoutMs);
  page.setDefaultTimeout(15_000);

  try {
    await page.goto(RAPPI_HOME, { waitUntil: 'domcontentloaded' });
    await detectBlock(page);
    await dismissAddressModal(page);

    const filled = await fillSearch(page, query);
    if (!filled) {
      await dumpDebug(page, 'no-search-input', opts.debugScreenshotDir);
      throw new Error('Rappi search input not found');
    }

    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined);
    await detectBlock(page);

    return await parseCandidates(page);
  } finally {
    await page.close();
  }
}

async function fillSearch(page: Page, query: string): Promise<boolean> {
  const input = page
    .getByPlaceholder(/buscar/i)
    .or(page.getByRole('searchbox'))
    .or(page.locator('input[type="search"]:visible'));
  if ((await input.count()) === 0) return false;
  try {
    await input.first().fill(query, { timeout: 5_000 });
    await input.first().press('Enter');
    return true;
  } catch {
    return false;
  }
}

async function dismissAddressModal(page: Page): Promise<void> {
  const closes = [
    page.getByRole('button', { name: /cerrar|skip|m[áa]s tarde/i }),
    page.locator('[aria-label*="cerrar" i], [aria-label*="close" i]'),
  ];
  for (const close of closes) {
    if ((await close.count()) > 0) {
      try {
        await close.first().click({ timeout: 2_000 });
        await page.waitForTimeout(500);
        return;
      } catch {
        // try next
      }
    }
  }
}

async function detectBlock(page: Page): Promise<void> {
  const url = page.url();
  if (/cloudflare|challenge|captcha/i.test(url)) {
    throw new Error(`Rappi blocked: ${url}`);
  }
  const content = await page.content().catch(() => '');
  if (/access denied|forbidden|cloudflare/i.test(content) && content.length < 3000) {
    throw new Error('Rappi served a block/challenge page');
  }
}

async function parseCandidates(page: Page): Promise<RappiCandidate[]> {
  // Rappi's restaurant cards are typically <a> tags pointing to /restaurantes/.../
  // The structure changes; we look for any anchor whose href contains "/restaurantes/"
  // and read the surrounding card.
  const cards = await page
    .locator('a[href*="/restaurantes/"], a[href*="/store/"]')
    .all();

  const out: RappiCandidate[] = [];
  for (const card of cards.slice(0, 10)) {
    try {
      const href = await card.getAttribute('href');
      const text = (await card.textContent())?.trim() ?? '';
      if (!text) continue;
      const ratingMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:\(|estrella)/i);
      const reviewMatch = text.match(/\((\d+(?:\.\d+)?[Kk]?)\)/);
      const idMatch = href?.match(/\/(?:restaurantes|store)\/(\d+)/);
      out.push({
        ...(idMatch ? { storeId: idMatch[1] } : {}),
        name: text.split('\n')[0]?.trim() ?? text,
        ...(href ? { url: href } : {}),
        ...(ratingMatch ? { rating: Number(ratingMatch[1]!.replace(',', '.')) } : {}),
        ...(reviewMatch ? { reviewCount: parseReviewCount(reviewMatch[1]!) } : {}),
        raw: text,
      });
    } catch (err) {
      log.warn({ err }, 'failed to parse Rappi card');
    }
  }
  return out;
}

function parseReviewCount(s: string): number {
  const num = parseFloat(s);
  if (s.toLowerCase().endsWith('k')) return Math.round(num * 1000);
  return Math.round(num);
}

async function dumpDebug(
  page: Page,
  tag: string,
  dir = '/tmp/seneca-rappi',
): Promise<void> {
  try {
    const fs = await import('node:fs/promises');
    await fs.mkdir(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `${dir}/${stamp}_${tag}.png`, fullPage: true });
    await fs.writeFile(`${dir}/${stamp}_${tag}.html`, await page.content(), 'utf8');
    log.warn({ dir, tag }, 'rappi debug dump written');
  } catch {
    // best-effort
  }
}
