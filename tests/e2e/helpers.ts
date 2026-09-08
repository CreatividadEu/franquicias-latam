import { expect, type Page } from "@playwright/test";

/** Usuarios que siembra `npm run seed:totto-way`. */
export const DEMO = {
  asesora: { id: "TA-0412", name: "Camila Rojas" },
  lider: { id: "andres.molina@totto-way.demo", name: "Andrés Molina" },
  franquiciada: { id: "laura.perez@totto-way.demo", name: "Laura Pérez" },
  formador: { id: "formador@totto-way.demo", name: "Formador Totto Way" },
} as const;

export const PASSWORD = process.env.TOTTO_WAY_SEED_PASSWORD ?? "totto2026";

export async function login(page: Page, identifier: string, password = PASSWORD) {
  // Con sesión abierta, /totto-way/login redirige al inicio y el formulario no
  // aparece: hay que limpiar antes para poder entrar con otro usuario.
  await page.context().clearCookies();
  await page.goto("/totto-way/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#tw-identifier", identifier);
  await page.fill("#tw-password", password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 60_000 }),
    page.click("button[type=submit]"),
  ]);
}

/** Salta el onboarding cuando el usuario aún no lo ha visto. */
export async function skipOnboardingIfShown(page: Page) {
  if (page.url().includes("/onboarding")) {
    await page.click("text=Saltar");
    await page.waitForURL((url) => !url.pathname.includes("onboarding"), { timeout: 30_000 });
  }
}

/** Espera al toast amarillo y devuelve su texto. */
export async function toastText(page: Page): Promise<string> {
  const toast = page.locator(".tw-toast");
  await expect(toast).toBeVisible({ timeout: 30_000 });
  return (await toast.textContent()) ?? "";
}

export async function waitForToastToClear(page: Page) {
  await page.locator(".tw-toast").waitFor({ state: "detached", timeout: 20_000 }).catch(() => {});
}
