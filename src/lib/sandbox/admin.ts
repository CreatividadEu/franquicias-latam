/**
 * Helpers del admin del Sandbox: guarda de API, respuestas JSON y la
 * proyección de una sesión hacia el panel (DTO serializable). Solo server.
 */
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import type { SandboxAssetKindId } from "./schemas";

export async function requireAdminApi() {
  try {
    return await getAdminUser();
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function jsonError(error: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues
    .slice(0, 8)
    .map((issue) => `${issue.path.map(String).join(".") || "(raíz)"}: ${issue.message}`);
}

// ── DTO del panel ────────────────────────────────────────────────────────────

export const adminSessionInclude = {
  assets: { orderBy: { uploadedAt: "asc" } },
  preload: true,
  result: true,
  franchise: { select: { id: true, name: true } },
  events: { orderBy: { createdAt: "desc" }, take: 300 },
} satisfies Prisma.SandboxSessionInclude;

export type AdminSessionRow = Prisma.SandboxSessionGetPayload<{
  include: typeof adminSessionInclude;
}>;

export type AdminAssetDTO = {
  id: string;
  kind: SandboxAssetKindId;
  originalName: string;
  mime: string;
  sizeBytes: number;
  uploadedAt: string;
  extractionStatus: "pending" | "running" | "done" | "error";
  extractionError: string | null;
  hasExtraction: boolean;
  extractedSummary: string | null;
  extractedAt: string | null;
};

export type AdminEventDTO = {
  id: string;
  phase: string;
  type: string;
  payload: unknown;
  createdAt: string;
};

export type AdminPreloadDTO = {
  offering: unknown;
  pains: unknown;
  marketing: unknown;
  opexSkeleton: unknown;
  generatedAt: string;
  updatedAt: string;
};

export type AdminResultDTO = {
  headline: string | null;
  readinessScores: unknown;
  route: unknown;
  chosenPain: unknown;
  chosenIdea: unknown;
  sentToEmail: string | null;
  reportPdfPath: string | null;
  updatedAt: string;
};

export type AdminSessionDTO = {
  id: string;
  slug: string;
  pin: string | null;
  status: "draft" | "ready" | "live" | "done" | "archived";
  franchiseId: string | null;
  franchiseName: string | null;
  brandName: string;
  sector: "restaurante" | "retail" | "servicios" | "otro";
  country: string;
  city: string | null;
  logoUrl: string | null;
  accentColor: string;
  consultantName: string | null;
  scheduledAt: string | null;
  locale: "es" | "en";
  marketingInputs: unknown;
  createdAt: string;
  updatedAt: string;
  assets: AdminAssetDTO[];
  preload: AdminPreloadDTO | null;
  result: AdminResultDTO | null;
  events: AdminEventDTO[];
};

/** Resumen humano de lo extraído de un asset (para la tabla del panel). */
export function summarizeExtraction(extracted: unknown): string | null {
  if (!extracted || typeof extracted !== "object") return null;
  const env = extracted as { kind?: string; data?: unknown; note?: string };
  const data = env.data as Record<string, unknown> | null | undefined;
  if (!data) return env.note ?? null;
  const count = (key: string) => (Array.isArray(data[key]) ? (data[key] as unknown[]).length : 0);
  switch (env.kind) {
    case "offering":
      return `${count("items")} ítems · moneda ${String(data.currency ?? "?")}`;
    case "pains":
      return `${count("pains")} dolores · ${count("strengths")} fortalezas`;
    case "marketing":
      return "5 ejes puntuados";
    case "opex": {
      const sales = typeof data.monthlySales === "number" ? ` · ventas/mes ${data.monthlySales}` : "";
      return `${count("lines")} líneas OPEX${sales}`;
    }
    default:
      return env.note ?? null;
  }
}

function extractedAtOf(extracted: unknown): string | null {
  if (!extracted || typeof extracted !== "object") return null;
  const at = (extracted as { extractedAt?: unknown }).extractedAt;
  return typeof at === "string" ? at : null;
}

export function toAdminSessionDTO(row: AdminSessionRow): AdminSessionDTO {
  return {
    id: row.id,
    slug: row.slug,
    pin: row.pin,
    status: row.status.toLowerCase() as AdminSessionDTO["status"],
    franchiseId: row.franchiseId,
    franchiseName: row.franchise?.name ?? null,
    brandName: row.brandName,
    sector: row.sector.toLowerCase() as AdminSessionDTO["sector"],
    country: row.country,
    city: row.city,
    logoUrl: row.logoUrl,
    accentColor: row.accentColor,
    consultantName: row.consultantName,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    locale: row.locale.toLowerCase() as AdminSessionDTO["locale"],
    marketingInputs: row.marketingInputs ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    assets: row.assets.map((a) => ({
      id: a.id,
      kind: a.kind.toLowerCase() as SandboxAssetKindId,
      originalName: a.originalName,
      mime: a.mime,
      sizeBytes: a.sizeBytes,
      uploadedAt: a.uploadedAt.toISOString(),
      extractionStatus: a.extractionStatus.toLowerCase() as AdminAssetDTO["extractionStatus"],
      extractionError: a.extractionError,
      hasExtraction: a.extractedJson !== null && a.extractedJson !== undefined,
      extractedSummary: summarizeExtraction(a.extractedJson),
      extractedAt: extractedAtOf(a.extractedJson),
    })),
    preload: row.preload
      ? {
          offering: row.preload.offering,
          pains: row.preload.pains,
          marketing: row.preload.marketing,
          opexSkeleton: row.preload.opexSkeleton,
          generatedAt: row.preload.generatedAt.toISOString(),
          updatedAt: row.preload.updatedAt.toISOString(),
        }
      : null,
    result: row.result
      ? {
          headline: row.result.headline,
          readinessScores: row.result.readinessScores ?? null,
          route: row.result.route ?? null,
          chosenPain: row.result.chosenPain ?? null,
          chosenIdea: row.result.chosenIdea ?? null,
          sentToEmail: row.result.sentToEmail,
          reportPdfPath: row.result.reportPdfPath,
          updatedAt: row.result.updatedAt.toISOString(),
        }
      : null,
    events: row.events.map((e) => ({
      id: e.id,
      phase: e.phase.toLowerCase(),
      type: e.type,
      payload: e.payload ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
