/**
 * Guarda de los jobs programados. Solo el secreto compartido: Vercel Cron lo
 * envía como `Authorization: Bearer $CRON_SECRET`.
 *
 * Antes también valía una sesión de admin, pero eso hacía los jobs
 * disparables por CSRF desde cualquier sitio (son GET y el navegador manda la
 * cookie sola). Para lanzarlos a mano se usa curl con el secreto.
 */
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 12) return false;

  const bearer = request.headers.get("authorization")?.trim().replace(/^Bearer\s+/i, "");
  const header = request.headers.get("x-totto-way-secret")?.trim();
  const provided = bearer || header;
  return !!provided && safeEqual(provided, secret);
}
