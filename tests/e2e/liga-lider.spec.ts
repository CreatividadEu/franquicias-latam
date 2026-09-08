import { expect, test } from "@playwright/test";
import { DEMO, login, skipOnboardingIfShown, toastText, waitForToastToClear } from "./helpers";

test.describe("Liga, viaje y panel líder", () => {
  test("la Liga muestra el ranking completo con deltas", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/liga");

    await expect(page.locator(".tw-table__row")).toHaveCount(6);
    await expect(page.locator(".tw-table__row--me")).toHaveCount(1);
    await expect(page.locator(".tw-rank--first")).toHaveCount(1);
    await expect(page.locator(".tw-countdown")).toContainText("Termina en");
    await expect(page.locator(".tw-scoring__row")).toHaveCount(6);

    await page.click("text=Individual");
    await page.waitForURL(/vista=individual/);
    await expect(page.locator(".tw-delta--up, .tw-delta--down")).not.toHaveCount(0);
    await expect(page.locator(".tw-table__row--me")).toContainText("Camila");
  });

  test("el franquiciado ve solo sus tiendas y su posición global", async ({ page }) => {
    await login(page, DEMO.franquiciada.id);
    await skipOnboardingIfShown(page);
    await page.goto("/totto-way/liga");

    await expect(page.locator(".tw-table__row")).toHaveCount(1);
    await expect(page.locator("body")).toContainText("posición global es #");
  });

  test("Mi viaje ordena los hitos y marca el actual", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/mi-viaje");

    await expect(page.locator(".tw-milestone")).toHaveCount(5);
    await expect(page.locator(".tw-milestone--current")).toHaveCount(1);
    await expect(page.locator(".tw-career__step")).toHaveCount(4);
    await expect(page.locator(".tw-career__step--current")).toHaveCount(1);
  });

  test("el líder valida un checkpoint y el colaborador cobra su XP", async ({ page }) => {
    await login(page, DEMO.lider.id);
    await page.goto("/totto-way/lider");

    // Solo su tienda.
    await expect(page.locator(".tw-team-row")).toHaveCount(3);
    await expect(page.locator(".tw-kpis")).toContainText("Checkpoints por validar");

    const validar = page.locator("text=/Validar checkpoint/");
    await expect(validar).toHaveCount(1);
    await validar.click();
    expect(await toastText(page)).toContain("+150 XP");
    await expect(page.locator("text=/Validar checkpoint/")).toHaveCount(0);
    await waitForToastToClear(page);

    // Reconocimiento manual.
    await page.locator(".tw-team-row").first().locator("button[aria-label=Reconocimiento]").click();
    await page.fill(".tw-team-row input.tw-input", "Mejor NPS del mes");
    await page.click("text=Añadir");
    expect(await toastText(page)).toContain("Reconocimiento añadido");
  });

  test("el CSV del equipo solo lo descarga un líder", async ({ page }) => {
    await login(page, DEMO.lider.id);
    const asLeader = await page.evaluate(async () => {
      const res = await fetch("/api/totto-way/leader/export");
      return { status: res.status, body: (await res.text()).slice(0, 60) };
    });
    expect(asLeader.status).toBe(200);
    expect(asLeader.body).toContain("Nombre,Rol,Tienda");

    await login(page, DEMO.asesora.id);
    const asAdvisor = await page.evaluate(async () => (await fetch("/api/totto-way/leader/export")).status);
    expect(asAdvisor).toBe(403);
  });
});
