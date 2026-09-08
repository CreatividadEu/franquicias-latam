import { expect, test } from "@playwright/test";
import { DEMO, login, toastText, waitForToastToClear } from "./helpers";

/** El Asistente solo puede probarse de verdad con una clave real de Anthropic. */
const HAS_AI_KEY = (process.env.ANTHROPIC_API_KEY ?? "").length > 30;

test.describe("Inspira, Beneficios y Asistente", () => {
  test("consumir un contenido de Inspira paga una vez al día", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/inspira");

    await expect(page.locator(".tw-inspire-hero")).toContainText("Hecho para durar");
    await expect(page.locator(".tw-inspire-card")).toHaveCount(5);

    await page.click("text=De 12 referencias a 39.800");
    await page.click("text=Marcar como visto");
    expect(await toastText(page)).toContain("+20 XP");
    await waitForToastToClear(page);

    // Un segundo contenido el mismo día ya no paga.
    await page.goto("/totto-way/inspira");
    await page.click("text=Vender en 10 segundos");
    await expect(page.locator("text=Ya lo viste hoy")).toHaveCount(1);
  });

  test("los beneficios se filtran por rol y país", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/beneficios");

    await expect(page.locator(".tw-benefit")).toHaveCount(8);
    await page.locator(".tw-benefit").nth(1).locator("summary").click();
    await expect(page.locator(".tw-benefit[open]")).toHaveCount(1);
  });

  test("el Asistente abre y responde o avisa con elegancia", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way");

    await page.click("button[aria-label=Asistente]");
    await expect(page.locator(".tw-assistant")).toBeVisible();
    await expect(page.locator(".tw-assistant__chips .tw-chip")).toHaveCount(3);

    await page.fill(".tw-assistant__composer input", "¿Cómo marco mi jornada en Geovictoria?");
    await page.click(".tw-assistant__send");

    // Espera a que la burbuja deje el estado "Consultando el manual…".
    await page.waitForFunction(
      () => {
        const bubbles = document.querySelectorAll(".tw-bubble--assistant");
        const last = bubbles[bubbles.length - 1];
        return !!last?.textContent && !last.textContent.includes("Consultando");
      },
      undefined,
      { timeout: 60_000 },
    );
    const reply = (await page.locator(".tw-bubble--assistant").last().textContent()) ?? "";

    if (HAS_AI_KEY) {
      expect(reply.length).toBeGreaterThan(20);
      // La respuesta debe venir citada: es el requisito del brief.
      await expect(page.locator(".tw-assistant__cites")).toBeVisible();
      await expect(page.locator(".tw-assistant__cite")).not.toHaveCount(0);
    } else {
      expect(reply).toMatch(/no está configurado|no pude responder/i);
    }
  });
});

test.describe("Estudio de contenido", () => {
  test("editar, republicar y ver la analítica", async ({ page }) => {
    await login(page, DEMO.formador.id);
    await page.goto("/totto-way/estudio");

    await expect(page.locator(".tw-studio-row")).toHaveCount(7);
    await expect(page.locator(".tw-studio-row").first()).toContainText("Publicado");
    // Los capítulos vacíos no se pueden publicar.
    expect(await page.locator("button:has-text('Publicar'):disabled").count()).toBeGreaterThanOrEqual(5);

    await page.goto("/totto-way/estudio/01-introduccion");
    await expect(page.locator(".tw-mission")).toHaveCount(6);

    await page.click("text=Protocolo de antena y seguridad");
    await expect(page.locator(".tw-block-edit")).not.toHaveCount(0);
    // El editor solo ofrece los ocho bloques del manual.
    await expect(page.locator(".tw-block-add .tw-chip")).toHaveCount(8);

    await page.locator(".tw-form-grid input.tw-input").last().fill("DOC-01-09");
    await page.click("text=Guardar lección");
    expect(await toastText(page)).toContain("Lección guardada");
    await waitForToastToClear(page);

    await page.goto("/totto-way/estudio/01-introduccion");
    await page.click("button:has-text('Republicar')");
    expect(await toastText(page)).toMatch(/v\d+ · \d+ fragmentos indexados/);

    await page.goto("/totto-way/estudio/analitica");
    await expect(page.locator(".tw-kpis")).toContainText("Fragmentos en el Asistente");
    await expect(page.locator(".tw-team-row")).toHaveCount(8);
  });

  test("una asesora no entra al Estudio", async ({ page }) => {
    await login(page, DEMO.asesora.id);
    await page.goto("/totto-way/estudio/01-introduccion");
    // Igual que con un capítulo bloqueado: se comprueba lo que se renderiza,
    // porque el layout dinámico ya transmitió la cabecera antes del notFound().
    await expect(page.locator("body")).toContainText(/no encontrada|not be found/i);
    await expect(page.locator(".tw-block-add")).toHaveCount(0);
  });
});
