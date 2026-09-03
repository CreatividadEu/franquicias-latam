/**
 * Carga de sesiones para la ruta pública y guardas de PIN. Solo se importa
 * desde server components y server actions.
 */
import { cache } from "react";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAccent } from "./color";
import { isSandboxLocale, type SandboxLocale } from "./i18n";
import {
  capPreload,
  readinessScoresSchema,
  routeMilestoneSchema,
  sandboxPreloadSchema,
  type SandboxPreloadData,
} from "./schemas";
import type {
  SandboxClientSession,
  SandboxResultData,
  SandboxSectorId,
  SandboxStatusId,
} from "./types";
import { z } from "zod";

export const sandboxSessionInclude = {
  preload: true,
  result: true,
} satisfies Prisma.SandboxSessionInclude;

export type SandboxSessionRow = Prisma.SandboxSessionGetPayload<{
  include: typeof sandboxSessionInclude;
}>;

/** Una sola consulta por request aunque la usen metadata y página. */
export const getSandboxSessionBySlug = cache(
  async (slug: string): Promise<SandboxSessionRow | null> => {
    if (!slug || slug.length > 64) return null;
    return prisma.sandboxSession.findUnique({
      where: { slug },
      include: sandboxSessionInclude,
    });
  },
);

export function parsePreload(row: SandboxSessionRow["preload"]): SandboxPreloadData | null {
  if (!row) return null;
  const parsed = sandboxPreloadSchema.safeParse({
    offering: row.offering,
    pains: row.pains,
    marketing: row.marketing,
    opexSkeleton: row.opexSkeleton,
  });
  if (!parsed.success) {
    console.warn("[sandbox] preload inválido; la sesión corre con fallbacks", {
      sessionId: row.sessionId,
      issues: parsed.error.issues.slice(0, 5),
    });
    return null;
  }
  return capPreload(parsed.data);
}

function parseResult(row: SandboxSessionRow["result"]): SandboxResultData | null {
  if (!row) return null;
  const scores = readinessScoresSchema.safeParse(row.readinessScores);
  const route = z.array(routeMilestoneSchema).safeParse(row.route);
  return {
    readinessScores: scores.success ? scores.data : null,
    headline: row.headline,
    route: route.success ? route.data : null,
    financials: row.financials ?? null,
    chosenPain: row.chosenPain ?? null,
    chosenIdea: row.chosenIdea ?? null,
    manual: row.manual ?? null,
    legalChecklist: row.legalChecklist ?? null,
    sentToEmail: row.sentToEmail,
  };
}

/** Proyección pública: lo único que viaja al navegador del cliente (§8). */
export function toClientSession(row: SandboxSessionRow): SandboxClientSession {
  const locale = row.locale.toLowerCase();
  return {
    slug: row.slug,
    brandName: row.brandName,
    sector: row.sector.toLowerCase() as SandboxSectorId,
    country: row.country,
    city: row.city,
    logoUrl: row.logoUrl,
    accent: resolveAccent(row.accentColor),
    consultantName: row.consultantName,
    locale: (isSandboxLocale(locale) ? locale : "es") as SandboxLocale,
    status: row.status.toLowerCase() as SandboxStatusId,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    preload: parsePreload(row.preload),
    result: parseResult(row.result),
  };
}

// ── PIN ──────────────────────────────────────────────────────────────────────

export const PIN_COOKIE_MAX_AGE_SEC = 12 * 60 * 60;

export function pinCookieName(slug: string): string {
  return `sb_pin_${slug}`;
}

function pinSecret(): string {
  // El PIN es fricción de enlace, no autenticación: sin JWT_SECRET (solo
  // entornos locales) se firma con una clave fija en vez de romper la ruta.
  return process.env.JWT_SECRET || "sandbox-pin-dev-secret";
}

/** Token de cookie: HMAC(slug:pin). No revela el PIN y es distinto por sesión. */
export function pinToken(slug: string, pin: string): string {
  return createHmac("sha256", pinSecret()).update(`${slug}:${pin}`).digest("hex");
}

export function pinTokenMatches(slug: string, pin: string, candidate: string | undefined): boolean {
  if (!candidate) return false;
  const expected = Buffer.from(pinToken(slug, pin));
  const given = Buffer.from(candidate);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function hasValidPinCookie(slug: string, pin: string): Promise<boolean> {
  const store = await cookies();
  return pinTokenMatches(slug, pin, store.get(pinCookieName(slug))?.value);
}
