import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

// Resolve the secret lazily (at request time), not at module load. Importing
// this module during `next build` (page-data collection) must not throw when
// JWT_SECRET is absent; the secret is only required when a token is actually
// signed or verified.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required. Set JWT_SECRET in the environment.");
  }
  return secret;
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(
  token: string
): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}

// ── Totto Way (LMS) ──────────────────────────────────────────────────────────
// Segunda sesión de la plataforma: cookie `tw_token` firmada con el mismo
// secreto y helper hermano de getAdminUser(). La forma de la sesión (scope
// por rol, locale, onboarding) se arma en src/lib/totto-way/auth.ts.

export const TW_TOKEN_COOKIE = "tw_token";
export const ADMIN_TOKEN_COOKIE = "admin_token";

const TOTTO_WAY_ALLOWED_ROLES = new Set<string>([
  "ADMIN",
  "FRANCHISE_OWNER",
  "TW_ASESOR",
  "TW_LIDER_TIENDA",
  "TW_AUX_LOGISTICO",
  "TW_JEFE_COMERCIAL",
  "TW_FORMADOR",
]);

export const tottoWayUserInclude = {
  twEmployee: { include: { store: true } },
  twStoreAccess: { select: { storeId: true } },
} as const;

/**
 * Usuario de Totto Way a partir de la cookie `tw_token`. Devuelve null si no
 * hay cookie, el token no es válido o el rol no tiene acceso al LMS. El JWT
 * solo lleva { userId, role }: el resto se lee de la DB en cada request,
 * igual que getAdminUser(), para que un cambio de rol o de tienda aplique
 * de inmediato.
 */
export async function getTottoWayUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TW_TOKEN_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !TOTTO_WAY_ALLOWED_ROLES.has(payload.role)) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: tottoWayUserInclude,
  });

  if (!user || !TOTTO_WAY_ALLOWED_ROLES.has(user.role)) return null;
  return user;
}

export type TottoWayUser = NonNullable<Awaited<ReturnType<typeof getTottoWayUser>>>;

export function tottoWayCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}
