import { expect, test } from "@playwright/test";
import { DEMO, login } from "./helpers";

test.describe("Integraciones y entregables", () => {
  test("los webhooks rechazan a quien no trae el secreto", async ({ request }) => {
    for (const path of ["/api/totto-way/webhooks/geovictoria", "/api/totto-way/webhooks/nps"]) {
      const sinSecreto = await request.post(path, { data: { events: [], scores: [], month: "2026-09" } });
      // 503 si la integración no está configurada, 401 si lo está y el secreto no cuadra.
      expect([401, 503]).toContain(sinSecreto.status());
    }
  });

  test("el certificado exige haber completado el capítulo", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    // Camila no ha terminado el Capítulo 01 al arrancar la suite.
    const denied = await page.evaluate(async () => {
      const res = await fetch("/api/totto-way/certificate/01-introduccion");
      return { status: res.status, body: await res.text() };
    });
    expect(denied.status).toBe(403);
    expect(denied.body).toContain("faltan lecciones");
  });

  test("la vista imprimible del manual sale del mismo contenido publicado", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/manual/01-introduccion");

    // Portada más una página por lección.
    await expect(page.locator(".tw-manual__page")).toHaveCount(9);
    await expect(page.locator(".tw-manual__page--cover")).toContainText("Introducción");
    await expect(page.locator(".tw-manual__page").nth(1)).toContainText("Bienvenida a la expedición");
    // El mismo vocabulario visual que la lección.
    await expect(page.locator(".tw-manual__content .tw-simple")).not.toHaveCount(0);
    await expect(page.locator(".tw-manual__foot").last()).toContainText("Pág. 09 / 9");
  });

  test("sin sesión, todo el módulo redirige al login", async ({ page }) => {
    for (const path of ["/totto-way", "/totto-way/liga", "/totto-way/manual/01-introduccion"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/totto-way\/login/);
    }
  });
});
