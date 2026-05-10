import type { BrowserContext, Page } from 'playwright';
import { childLogger } from '@seneca/shared';
import type { RuesCandidate } from './match.js';

const log = childLogger({ module: 'rues-search' });

const RUES_HOME = 'https://www.rues.org.co/';
const RUES_QUERY_PATH = '/RM_PorRazonSocial';

export interface SearchOptions {
  /** Department filter; e.g. "BOGOTA D.C.". Falls back to no filter if not selectable. */
  department?: string;
  /** Page-load timeout (ms). */
  navTimeoutMs?: number;
  /** Path to dump screenshots when selectors miss. Defaults to /tmp/seneca-rues. */
  debugScreenshotDir?: string;
}

/**
 * Search RUES for businesses matching a normalized name. Returns up to 5
 * candidates parsed from the result table. Throws on hard failures (CAPTCHA,
 * blank page) so the runner can decide whether to abort the whole sweep.
 */
export async function searchRues(
  ctx: BrowserContext,
  query: string,
  opts: SearchOptions = {},
): Promise<RuesCandidate[]> {
  const navTimeoutMs = opts.navTimeoutMs ?? 30_000;
  const page = await ctx.newPage();
  page.setDefaultNavigationTimeout(navTimeoutMs);
  page.setDefaultTimeout(15_000);

  try {
    // RUES is an Angular SPA — networkidle gives the bundle time to hydrate.
    await page.goto(RUES_HOME, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined);
    // Belt-and-suspenders: wait for *any* input to appear (signals hydration).
    await page.waitForSelector('input, button', { timeout: 15_000 }).catch(() => undefined);
    await detectCaptcha(page);

    const opened = await tryClickConsultLink(page);
    if (!opened) {
      await page.goto(`${RUES_HOME}${RUES_QUERY_PATH.replace(/^\//, '')}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined);
      await page.waitForSelector('input, button', { timeout: 15_000 }).catch(() => undefined);
    }
    await detectCaptcha(page);

    const filled = await fillSearchInput(page, query);
    if (!filled) {
      await dumpDebug(page, 'no-search-input', opts.debugScreenshotDir);
      throw new Error('RUES search input not found');
    }

    if (opts.department) {
      await trySelectDepartment(page, opts.department);
    }

    await submitSearch(page);
    await detectCaptcha(page);

    return await parseResultTable(page);
  } finally {
    await page.close();
  }
}

async function tryClickConsultLink(page: Page): Promise<boolean> {
  const link = page
    .getByRole('link', { name: /raz[oó]n\s*social/i })
    .or(page.getByRole('link', { name: /consultar?\s+por\s+nombre/i }))
    .or(page.locator('a[href*="RazonSocial" i], a[href*="razon" i]'));
  if ((await link.count()) === 0) return false;
  try {
    await link.first().click({ timeout: 5_000 });
    await page.waitForLoadState('domcontentloaded');
    return true;
  } catch {
    return false;
  }
}

async function fillSearchInput(page: Page, query: string): Promise<boolean> {
  const candidates = [
    page.getByPlaceholder(/raz[oó]n\s*social/i),
    page.getByPlaceholder(/nombre/i),
    page.getByLabel(/raz[oó]n\s*social/i),
    page.locator('input[type="text"]:visible').first(),
  ];
  for (const candidate of candidates) {
    if ((await candidate.count()) > 0) {
      try {
        await candidate.first().fill(query, { timeout: 5_000 });
        return true;
      } catch {
        // try next
      }
    }
  }
  return false;
}

async function trySelectDepartment(page: Page, department: string): Promise<void> {
  const dept = page
    .getByLabel(/departamento/i)
    .or(page.locator('select:has(option:has-text("BOGOTA"))'));
  if ((await dept.count()) === 0) return;
  try {
    await dept.first().selectOption({ label: department });
  } catch {
    // ignore — search without filter is still useful
  }
}

async function submitSearch(page: Page): Promise<void> {
  const submit = page
    .getByRole('button', { name: /consultar|buscar/i })
    .or(page.locator('input[type="submit"], button[type="submit"]'));
  if ((await submit.count()) > 0) {
    await submit.first().click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
}

async function detectCaptcha(page: Page): Promise<void> {
  const url = page.url();
  if (/captcha|challenge|cloudflare/i.test(url)) {
    throw new Error(`RUES CAPTCHA gate at ${url}`);
  }
  const content = await page.content();
  if (/g-recaptcha|recaptcha\/api\.js|hcaptcha/i.test(content)) {
    throw new Error('RUES served a CAPTCHA page');
  }
}

async function parseResultTable(page: Page): Promise<RuesCandidate[]> {
  const table = page.locator('table:has(th), table.table, table.dataTable').first();
  if ((await table.count()) === 0) return [];

  const rows = await table.locator('tbody tr').all();
  const candidates: RuesCandidate[] = [];
  for (const row of rows.slice(0, 5)) {
    const cellsText = await row.evaluate((el) =>
      Array.from(el.querySelectorAll('td')).map((td) => (td.textContent ?? '').trim()),
    );
    if (cellsText.length < 3) continue;
    const allText = cellsText.join(' | ');

    const matricula = cellsText.find((t) => /^\d{6,}$/.test(t)) ?? cellsText[0] ?? '';
    const nitMatch = allText.match(/\b(\d{8,11})-\d\b/);
    const razonIdx = cellsText.findIndex((t) => /[a-z]/i.test(t) && t.length >= 3);
    const razonSocial = razonIdx >= 0 ? (cellsText[razonIdx] ?? '') : '';

    const estadoMatch = allText.match(/\b(ACTIVA|CANCELADA|LIQUIDAD\w*|INACTIVA)\b/i);
    const ciudadMatch = allText.match(/\b(BOGOT[AÁ]\s*D\.?C\.?|BOGOT[AÁ])\b/i);
    const deptMatch = allText.match(/\b(CUNDINAMARCA|BOGOT[AÁ]\s*D\.?C\.?)\b/i);

    candidates.push({
      matricula: matricula || '',
      nit: nitMatch?.[1],
      razonSocial,
      estado: estadoMatch?.[1],
      ciudad: ciudadMatch?.[1],
      departamento: deptMatch?.[1],
      rawHtml: allText,
    });
  }
  return candidates;
}

async function dumpDebug(
  page: Page,
  tag: string,
  dir = '/tmp/seneca-rues',
): Promise<void> {
  try {
    const fs = await import('node:fs/promises');
    await fs.mkdir(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const png = `${dir}/${stamp}_${tag}.png`;
    const html = `${dir}/${stamp}_${tag}.html`;
    await page.screenshot({ path: png, fullPage: true });
    await fs.writeFile(html, await page.content(), 'utf8');
    log.warn({ png, html, tag }, 'RUES debug dump written');
  } catch {
    // best-effort
  }
}
