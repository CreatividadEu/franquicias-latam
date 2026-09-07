/**
 * Scoping multi-tenant de Totto Way (PLAN §5.2). Puro: sin Prisma ni React,
 * para poder testearlo. Toda consulta y toda server action recibe un TwScope
 * derivado de la sesión en servidor; el cliente nunca elige el storeId.
 */
import type { UserRole } from "@prisma/client";

export const TW_ROLES = [
  "TW_ASESOR",
  "TW_LIDER_TIENDA",
  "TW_AUX_LOGISTICO",
  "TW_JEFE_COMERCIAL",
  "TW_FORMADOR",
] as const satisfies readonly UserRole[];

/** Roles que pueden entrar a /totto-way. FRANCHISE_OWNER = franquiciado. */
export const TOTTO_WAY_ROLES: readonly UserRole[] = [...TW_ROLES, "FRANCHISE_OWNER", "ADMIN"];

export function isTottoWayRole(role: UserRole | string | null | undefined): role is UserRole {
  return typeof role === "string" && (TOTTO_WAY_ROLES as readonly string[]).includes(role);
}

/** Roles que ven el Panel líder. */
export function canSeeLeaderPanel(role: UserRole): boolean {
  return (
    role === "TW_LIDER_TIENDA" ||
    role === "TW_JEFE_COMERCIAL" ||
    role === "FRANCHISE_OWNER" ||
    role === "TW_FORMADOR" ||
    role === "ADMIN"
  );
}

/** Roles que validan checkpoints (+150 XP al colaborador). */
export function canValidateCheckpoints(role: UserRole): boolean {
  return canSeeLeaderPanel(role);
}

/** Roles con acceso al Estudio de contenido. */
export function canEditContent(role: UserRole): boolean {
  return role === "TW_FORMADOR" || role === "ADMIN";
}

/** Roles que tienen tienda propia (alumno con progreso). */
export function isStoreMember(role: UserRole): boolean {
  return (TW_ROLES as readonly string[]).includes(role) && role !== "TW_FORMADOR";
}

export type TwScope = {
  franchiseId: string;
  role: UserRole;
  /** Tiendas visibles. "all" = todas las de la franquicia. */
  storeIds: string[] | "all";
  /** Tienda donde el usuario trabaja (para Liga/equipo). */
  homeStoreId: string | null;
};

export type ResolveScopeInput = {
  role: UserRole;
  franchiseId: string;
  employeeStoreId?: string | null;
  accessStoreIds?: readonly string[];
};

export function resolveScope(input: ResolveScopeInput): TwScope {
  const { role, franchiseId } = input;
  const home = input.employeeStoreId ?? null;
  const access = Array.from(new Set(input.accessStoreIds ?? []));

  if (role === "ADMIN" || role === "TW_FORMADOR") {
    return { franchiseId, role, storeIds: "all", homeStoreId: home };
  }
  if (role === "TW_JEFE_COMERCIAL" || role === "FRANCHISE_OWNER") {
    const ids = home && !access.includes(home) ? [...access, home] : access;
    return { franchiseId, role, storeIds: ids, homeStoreId: home };
  }
  // Asesor, líder de tienda, auxiliar: solo su tienda.
  return { franchiseId, role, storeIds: home ? [home] : [], homeStoreId: home };
}

export function isAllStores(scope: TwScope): boolean {
  return scope.storeIds === "all";
}

export function storeInScope(scope: TwScope, storeId: string | null | undefined): boolean {
  if (!storeId) return false;
  return scope.storeIds === "all" || scope.storeIds.includes(storeId);
}

export function assertStoreInScope(scope: TwScope, storeId: string | null | undefined): string {
  if (!storeInScope(scope, storeId)) {
    throw new TwScopeError(`Tienda fuera de alcance: ${storeId ?? "(vacía)"}`);
  }
  return storeId as string;
}

export class TwScopeError extends Error {
  readonly code = "TW_SCOPE";
}

/** Filtro Prisma para tiendas visibles. */
export function storeWhere(scope: TwScope): { franchiseId: string; id?: { in: string[] } } {
  return scope.storeIds === "all"
    ? { franchiseId: scope.franchiseId }
    : { franchiseId: scope.franchiseId, id: { in: scope.storeIds } };
}

/** Filtro Prisma para empleados visibles. */
export function employeeWhere(scope: TwScope): { franchiseId: string; storeId?: { in: string[] } } {
  return scope.storeIds === "all"
    ? { franchiseId: scope.franchiseId }
    : { franchiseId: scope.franchiseId, storeId: { in: scope.storeIds } };
}
