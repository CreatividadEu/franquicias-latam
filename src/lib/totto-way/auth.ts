/**
 * Sesión de Totto Way (PLAN §5). Envuelve getTottoWayUser() y arma el scope
 * por rol. Cada página y cada server action vuelve a verificar aquí: el
 * cliente nunca es fuente de autoridad.
 */
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getTottoWayUser, type TottoWayUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveScope, type TwScope } from "./scope";
import { resolveTwLocale, type TwLocale } from "./i18n";

import { TW_LOGIN_PATH, TW_ONBOARDING_PATH } from "./paths";

export { TW_HOME_PATH, TW_LOGIN_PATH, TW_ONBOARDING_PATH, TW_SSO_PATH } from "./paths";

/** Slug de la franquicia que usa el LMS (hoy solo TOTTO). */
export const TW_FRANCHISE_SLUG = (process.env.TOTTO_WAY_FRANCHISE_SLUG ?? "totto").trim();

export type TwSession = {
  user: { id: string; email: string; name: string | null; role: UserRole };
  employee: TottoWayUser["twEmployee"];
  franchiseId: string;
  scope: TwScope;
  locale: TwLocale;
  needsOnboarding: boolean;
};

/** Franquicia por defecto para ADMIN de plataforma (sin franchiseId propio). */
const getDefaultFranchiseId = cache(async (): Promise<string | null> => {
  const franchise = await prisma.franchise.findFirst({
    where: { slug: TW_FRANCHISE_SLUG },
    select: { id: true },
  });
  return franchise?.id ?? null;
});

export function buildSession(user: TottoWayUser, franchiseId: string): TwSession {
  const employee = user.twEmployee;
  const scope = resolveScope({
    role: user.role,
    franchiseId,
    employeeStoreId: employee?.storeId ?? null,
    accessStoreIds: user.twStoreAccess.map((a) => a.storeId),
  });
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    employee,
    franchiseId,
    scope,
    locale: resolveTwLocale(employee?.locale),
    // ADMIN/FORMADOR sin ficha de empleado no pasan por el onboarding.
    needsOnboarding: !!employee && !employee.onboardedAt,
  };
}

/** Sesión actual o null. Cacheada por request (React cache). */
export const getTwSession = cache(async (): Promise<TwSession | null> => {
  const user = await getTottoWayUser();
  if (!user) return null;
  const franchiseId =
    user.twEmployee?.franchiseId ?? user.franchiseId ?? (await getDefaultFranchiseId());
  if (!franchiseId) return null;
  return buildSession(user, franchiseId);
});

type RequireOptions = {
  /** Roles permitidos; sin lista, cualquier rol con acceso al LMS. */
  roles?: readonly UserRole[];
  /** Permite entrar aunque falte el onboarding (solo la propia página de onboarding). */
  allowOnboarding?: boolean;
};

/** Para páginas: sin sesión → login; rol insuficiente → 404. */
export async function requireTwSession(options: RequireOptions = {}): Promise<TwSession> {
  const session = await getTwSession();
  if (!session) redirect(TW_LOGIN_PATH);
  if (options.roles && !options.roles.includes(session.user.role)) notFound();
  if (session.needsOnboarding && !options.allowOnboarding) redirect(TW_ONBOARDING_PATH);
  return session;
}

/** Para server actions y route handlers: null en vez de redirigir. */
export async function getTwSessionOrNull(): Promise<TwSession | null> {
  try {
    return await getTwSession();
  } catch {
    return null;
  }
}
