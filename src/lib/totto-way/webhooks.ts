/**
 * Guarda de los webhooks de integración (PLAN §10). Cada proveedor trae su
 * propio secreto: si no está configurado, el endpoint queda cerrado en vez de
 * abierto, que es el fallo seguro.
 *
 * Acepta dos formas, para no depender de lo que sepa mandar el proveedor:
 *   - cabecera `x-totto-way-secret: <secreto>` (comparación en tiempo constante)
 *   - `Authorization: Bearer <secreto>`
 */
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // timingSafeEqual exige la misma longitud; comparar longitudes antes filtra
  // sin revelar nada útil, porque la longitud del secreto no es el secreto.
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type WebhookAuth = { ok: true } | { ok: false; reason: "NOT_CONFIGURED" | "BAD_SECRET" };

export function verifyWebhook(request: Request, envVar: string): WebhookAuth {
  const expected = process.env[envVar]?.trim();
  if (!expected || expected.length < 12) return { ok: false, reason: "NOT_CONFIGURED" };

  const header = request.headers.get("x-totto-way-secret")?.trim();
  const bearer = request.headers.get("authorization")?.trim().replace(/^Bearer\s+/i, "");
  const provided = header || bearer;
  if (!provided) return { ok: false, reason: "BAD_SECRET" };

  return safeEqual(provided, expected) ? { ok: true } : { ok: false, reason: "BAD_SECRET" };
}

/** A partir de este NPS la tienda cobra el bono del mes (§5 del brief). */
export const NPS_THRESHOLD = 9;

/** Mes en formato YYYY-MM, que es la clave de idempotencia del NPS. */
export function monthKey(value: string): string | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return `${match[1]}-${match[2]}`;
}
