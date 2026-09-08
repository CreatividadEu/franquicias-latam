import { expect, test } from "@playwright/test";
import { DEMO, login, toastText, waitForToastToClear } from "./helpers";

/**
 * Ruta crítica del alumno: entrar, ver dónde iba, abrir la lección, fallar el
 * quiz, acertarlo, completar y ver el progreso reflejado.
 */
test.describe("Aprendizaje", () => {
  test("login, capítulo, quiz y completar una lección", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await expect(page).toHaveURL(/\/totto-way$/);

    // Inicio: hero con la lección donde iba.
    await expect(page.locator(".tw-hero")).toContainText("Continúa donde ibas");
    await expect(page.locator(".tw-hero")).toContainText("Ecosistema SER");
    await expect(page.locator(".tw-glass").first()).toContainText("63%");

    // Capítulo 01: cinco de ocho hechas.
    await page.goto("/totto-way/aprender/01-introduccion");
    await expect(page.locator(".tw-banner")).toContainText("5 de 8 lecciones");
    await expect(page.locator(".tw-lesson-row")).toHaveCount(8);
    await expect(page.locator(".tw-check:not(.tw-check--empty)")).toHaveCount(5);

    // Lección de video sin archivo: se ve el póster del manual, no un player roto.
    await page.click("text=Ecosistema SER: las 8 herramientas");
    await expect(page.locator(".tw-video__missing")).toBeVisible();
    await expect(page.locator(".tw-simple")).toHaveCount(1);
    await expect(page.locator(".tw-quiz__q")).toHaveCount(3);

    // Quiz fallado: no paga bonus y marca lo correcto y lo equivocado.
    for (let q = 0; q < 3; q += 1) {
      await page.locator(".tw-quiz__q").nth(q).locator(".tw-quiz__option").first().click();
    }
    await page.click("text=Revisar respuestas");
    await expect(page.locator(".tw-quiz__score")).toContainText("0 de 3");
    await expect(page.locator(".tw-quiz__option.is-correct")).toHaveCount(3);
    await expect(page.locator(".tw-toast")).toHaveCount(0);

    // Reintento perfecto: bonus de 40 XP.
    await page.click("text=Intentar de nuevo");
    for (const [q, option] of [
      [0, 1],
      [1, 2],
      [2, 1],
    ] as const) {
      await page.locator(".tw-quiz__q").nth(q).locator(".tw-quiz__option").nth(option).click();
    }
    await page.click("text=Revisar respuestas");
    expect(await toastText(page)).toContain("+40 XP");
    await waitForToastToClear(page);

    // Completar: 120 XP y vuelta al capítulo.
    await page.click("text=/Completar · \\+120 XP/");
    await page.waitForURL(/\/aprender\/01-introduccion$/);
    await expect(page.locator(".tw-banner")).toContainText("6 de 8 lecciones");
    await expect(page.locator(".tw-pill--black")).toContainText("2.610");

    // Idempotencia: reabrirla ya no ofrece cobrar de nuevo.
    await page.click("text=Ecosistema SER: las 8 herramientas");
    await expect(page.locator("aside.tw-aside")).toContainText("Lección completada");
  });

  test("el perfil refleja insignias y deja cambiar el idioma", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/perfil");

    await expect(page.locator(".tw-profile")).toContainText("Asesor comercial");
    await expect(page.locator(".tw-profile")).toContainText("Totto Andino");
    await expect(page.locator(".tw-medallion")).toHaveCount(4);
    await expect(page.locator(".tw-medallion--locked")).toHaveCount(3);

    // Cambiar a portugués traduce el cromo de inmediato. Los nombres van
    // exactos porque "Español" también es prefijo de "Español (MX)".
    await page.getByRole("button", { name: "Português", exact: true }).click();
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    expect(await toastText(page)).toContain("Preferencias guardadas");
    await waitForToastToClear(page);
    await page.reload();
    await expect(page.locator(".tw-sidebar")).toContainText("Minha jornada");

    // Y se puede volver al español.
    await page.getByRole("button", { name: "Español", exact: true }).click();
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    expect(await toastText(page)).toContain("Preferências salvas");
    await waitForToastToClear(page);
    await page.reload();
    await expect(page.locator(".tw-sidebar")).toContainText("Mi viaje");
  });

  test("un capítulo en borrador no es accesible", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/aprender/02-ser-totto");
    // Se comprueba la página renderizada, no el status: el layout de (app) es
    // dinámico, así que Next ya empezó a transmitir cuando la página llama a
    // notFound() y la respuesta sale con 200 aunque el contenido sea el 404.
    await expect(page.locator("body")).toContainText(/no encontrada|not be found/i);
    await expect(page.locator(".tw-banner")).toHaveCount(0);
  });
});
