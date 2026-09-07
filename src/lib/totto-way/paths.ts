/** Rutas del módulo (puro, sin Next) para que route handlers y tests compartan. */
export const TW_HOME_PATH = "/totto-way";
export const TW_LOGIN_PATH = "/totto-way/login";
export const TW_ONBOARDING_PATH = "/totto-way/onboarding";
export const TW_LEARN_PATH = "/totto-way/aprender";
export const TW_SSO_PATH = "/api/totto-way/auth/sso";

/** Solo rutas internas del LMS; nunca un redirect abierto ni el propio login. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/totto-way") || next.startsWith("//")) return null;
  if (next.startsWith(TW_LOGIN_PATH) || next.startsWith(TW_ONBOARDING_PATH)) return null;
  if (next.includes("://") || next.includes("\\")) return null;
  return next;
}
