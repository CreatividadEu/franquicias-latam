/**
 * Límite por usuario del Asistente. En memoria, como `api/business-intel`:
 * suficiente para una tienda y para frenar un bucle accidental. En Vercel no
 * se comparte entre lambdas; si hace falta de verdad, va a una tabla.
 */
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = Number(process.env.TOTTO_WAY_ASSISTANT_LIMIT ?? 30);

const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, now = Date.now()): { ok: boolean; retryAfter: number } {
  const entry = hits.get(userId);
  if (!entry || entry.resetAt <= now) {
    hits.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    // Barrido ocasional para que el mapa no crezca sin límite.
    if (Math.random() < 0.05) {
      for (const [key, value] of hits) if (value.resetAt <= now) hits.delete(key);
    }
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= LIMIT) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function resetRateLimit(userId?: string) {
  if (userId) hits.delete(userId);
  else hits.clear();
}
