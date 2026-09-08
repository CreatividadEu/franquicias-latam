import { defineConfig, devices } from "@playwright/test";

/**
 * E2E de Totto Way. Usa el Chrome instalado en la máquina (`channel: "chrome"`)
 * para no tener que descargar navegadores en CI ni en local.
 *
 * Antes de correrlo: `npm run seed:totto-way` (repone los datos demo) y
 * `npm run dev`. Si no hay servidor levantado, Playwright arranca uno.
 */
const PORT = Number(process.env.TW_E2E_PORT ?? 3100);
const BASE_URL = process.env.TW_E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1360, height: 900 } } },
    { name: "movil", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: process.env.TW_E2E_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${PORT}`,
        url: `${BASE_URL}/totto-way/login`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
