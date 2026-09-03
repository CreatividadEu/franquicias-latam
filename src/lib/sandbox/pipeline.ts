/**
 * Orquestación del preload (server): extracción por asset (idempotente,
 * re-ejecutable) y construcción del SandboxPreload a partir de lo extraído +
 * quick-form + fallbacks. Cada paso corre en su propia request del admin para
 * no chocar con los límites de duración de Vercel.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SANDBOX_AI_MODEL, PROMPT_VERSION, describeAiError, generateStructured, hasAnthropicKey } from "./ai";
import { buildAssetContent } from "./extract";
import { downloadAssetBuffer } from "./storage";
import {
  IDEAS_SYSTEM,
  MARKETING_SYSTEM,
  OFFERING_SYSTEM,
  OPEX_SYSTEM,
  PAINS_SYSTEM,
  aiIdeasSchema,
  aiMarketingAuditSchema,
  aiOfferingSchema,
  aiOpexSchema,
  aiPainsSchema,
  ideasUserPrompt,
  marketingUserPrompt,
  offeringUserPrompt,
  opexUserPrompt,
  painsUserPrompt,
  type AiMarketingAudit,
  type AiOffering,
  type AiOpex,
  type AiPains,
  type BrandContext,
} from "./prompts";
import {
  assemblePreload,
  buildMarketing,
  buildOffering,
  buildOpex,
  buildPains,
  heroItemNames,
  ideasFromAi,
} from "./pipeline-core";
import { marketingInputsSchema, type SandboxPreloadData } from "./schemas";
import { toAdminSessionDTO, adminSessionInclude, type AdminAssetDTO } from "./admin";
import type { SandboxSectorId } from "./types";

type PromptKind = "offering" | "pains" | "marketing" | "opex";

const KIND_TO_PROMPT: Record<string, PromptKind | null> = {
  MENU: "offering",
  CATALOG: "offering",
  PRICE_LIST: "offering",
  OSINT: "pains",
  MARKETING_AUDIT: "marketing",
  SALES_NOTES: "opex",
  OPEX_NOTES: "opex",
  OTHER: null,
};

const PROMPTS: Record<PromptKind, { system: string; user: (b: BrandContext) => string; maxTokens: number }> = {
  offering: { system: OFFERING_SYSTEM, user: offeringUserPrompt, maxTokens: 24_000 },
  pains: { system: PAINS_SYSTEM, user: painsUserPrompt, maxTokens: 8_000 },
  marketing: { system: MARKETING_SYSTEM, user: marketingUserPrompt, maxTokens: 6_000 },
  opex: { system: OPEX_SYSTEM, user: opexUserPrompt, maxTokens: 6_000 },
};

const SCHEMAS = {
  offering: aiOfferingSchema,
  pains: aiPainsSchema,
  marketing: aiMarketingAuditSchema,
  opex: aiOpexSchema,
} as const;

/** Sobre que guardamos en SandboxAsset.extractedJson. */
export type ExtractionEnvelope = {
  kind: PromptKind | "other";
  model: string | null;
  promptVersion: string;
  extractedAt: string;
  cached: boolean;
  contentHash: string | null;
  truncated: boolean;
  note?: string;
  data: unknown;
};

/** Un RUNNING más viejo que esto se considera huérfano (función cortada). */
const STALE_RUNNING_MS = 6 * 60 * 1000;

function brandOf(session: { brandName: string; sector: string; country: string; city: string | null }): BrandContext {
  return {
    brandName: session.brandName,
    sector: session.sector.toLowerCase() as SandboxSectorId,
    country: session.country,
    city: session.city,
  };
}

export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "PipelineError";
  }
}

async function assetDTO(sessionId: string, assetId: string): Promise<AdminAssetDTO> {
  const row = await prisma.sandboxSession.findUnique({ where: { id: sessionId }, include: adminSessionInclude });
  const dto = row ? toAdminSessionDTO(row).assets.find((a) => a.id === assetId) : undefined;
  if (!dto) throw new PipelineError("Asset no encontrado", 404);
  return dto;
}

/**
 * Extrae un asset: descarga → bloques → Claude (structured) → extractedJson.
 * Idempotente: DONE se respeta salvo `force`; RUNNING reciente se rechaza.
 */
export async function runAssetExtraction(
  sessionId: string,
  assetId: string,
  opts: { force?: boolean } = {},
): Promise<{ asset: AdminAssetDTO; cached: boolean; skipped: boolean }> {
  const asset = await prisma.sandboxAsset.findFirst({
    where: { id: assetId, sessionId },
    include: { session: { select: { id: true, brandName: true, sector: true, country: true, city: true, updatedAt: true } } },
  });
  if (!asset) throw new PipelineError("Asset no encontrado", 404);

  if (asset.extractionStatus === "DONE" && !opts.force) {
    return { asset: await assetDTO(sessionId, assetId), cached: true, skipped: true };
  }
  if (asset.extractionStatus === "RUNNING" && !opts.force) {
    const startedAt = extractedAtOfEnvelope(asset.extractedJson);
    const fresh = startedAt && Date.now() - startedAt.getTime() < STALE_RUNNING_MS;
    if (fresh) throw new PipelineError("Este archivo ya se está procesando", 409);
  }

  const promptKind = KIND_TO_PROMPT[asset.kind] ?? null;
  const startedEnvelope: Partial<ExtractionEnvelope> = { extractedAt: new Date().toISOString() };
  await prisma.sandboxAsset.update({
    where: { id: asset.id },
    data: { extractionStatus: "RUNNING", extractionError: null, extractedJson: startedEnvelope as Prisma.InputJsonObject },
  });

  try {
    if (!promptKind) {
      const envelope: ExtractionEnvelope = {
        kind: "other",
        model: null,
        promptVersion: PROMPT_VERSION,
        extractedAt: new Date().toISOString(),
        cached: false,
        contentHash: null,
        truncated: false,
        note: "Tipo «otro»: se guarda como referencia, no se extrae automáticamente.",
        data: null,
      };
      await prisma.sandboxAsset.update({
        where: { id: asset.id },
        data: { extractionStatus: "DONE", extractedJson: envelope as unknown as Prisma.InputJsonObject },
      });
      return { asset: await assetDTO(sessionId, assetId), cached: false, skipped: false };
    }

    if (!hasAnthropicKey()) throw new PipelineError("ANTHROPIC_API_KEY no configurada en el servidor", 500);

    const buffer = await downloadAssetBuffer(asset.storagePath);
    const content = await buildAssetContent(buffer, asset.mime, asset.originalName);
    const prompt = PROMPTS[promptKind];
    const brand = brandOf(asset.session);

    const result = await generateStructured({
      sessionId,
      kind: `extract:${promptKind}`,
      schema: SCHEMAS[promptKind],
      system: prompt.system,
      content: [...content.blocks, { type: "text", text: prompt.user(brand) }],
      cacheKeyParts: [content.contentHash, brand],
      effort: "medium",
      maxTokens: prompt.maxTokens,
      force: opts.force,
    });

    const envelope: ExtractionEnvelope = {
      kind: promptKind,
      model: result.model,
      promptVersion: PROMPT_VERSION,
      extractedAt: new Date().toISOString(),
      cached: result.cached,
      contentHash: content.contentHash,
      truncated: content.truncated,
      data: result.data,
    };
    await prisma.sandboxAsset.update({
      where: { id: asset.id },
      data: { extractionStatus: "DONE", extractionError: null, extractedJson: envelope as unknown as Prisma.InputJsonObject },
    });
    return { asset: await assetDTO(sessionId, assetId), cached: result.cached, skipped: false };
  } catch (error) {
    const message = describeAiError(error).slice(0, 500);
    await prisma.sandboxAsset.update({
      where: { id: asset.id },
      data: { extractionStatus: "ERROR", extractionError: message },
    });
    if (error instanceof PipelineError) throw error;
    throw new PipelineError(message, 502);
  }
}

function extractedAtOfEnvelope(value: unknown): Date | null {
  if (!value || typeof value !== "object") return null;
  const at = (value as { extractedAt?: unknown }).extractedAt;
  if (typeof at !== "string") return null;
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? null : d;
}

function envelopesOf<T>(assets: { extractedJson: unknown; extractionStatus: string }[], kind: PromptKind, parse: (v: unknown) => T | null): T[] {
  const out: T[] = [];
  for (const asset of assets) {
    if (asset.extractionStatus !== "DONE") continue;
    const env = asset.extractedJson as Partial<ExtractionEnvelope> | null;
    if (!env || env.kind !== kind || !env.data) continue;
    const parsed = parse(env.data);
    if (parsed) out.push(parsed);
  }
  return out;
}

export type PreloadSummary = {
  items: number;
  heroes: string[];
  pains: number;
  strengths: number;
  ideas: number;
  sources: { offering: string; pains: string; marketing: string; opex: string };
  ideasFrom: "ai" | "cache" | "fallback";
};

/** Construye (o reconstruye) el SandboxPreload de la sesión. */
export async function buildSessionPreload(sessionId: string): Promise<{ preload: SandboxPreloadData; summary: PreloadSummary }> {
  const session = await prisma.sandboxSession.findUnique({
    where: { id: sessionId },
    include: { assets: { select: { extractedJson: true, extractionStatus: true } } },
  });
  if (!session) throw new PipelineError("Sesión no encontrada", 404);

  const sector = session.sector.toLowerCase() as SandboxSectorId;
  const brand = brandOf(session);

  const offeringRecords = envelopesOf<AiOffering>(session.assets, "offering", (v) => aiOfferingSchema.safeParse(v).data ?? null);
  const painRecords = envelopesOf<AiPains>(session.assets, "pains", (v) => aiPainsSchema.safeParse(v).data ?? null);
  const auditRecords = envelopesOf<AiMarketingAudit>(session.assets, "marketing", (v) => aiMarketingAuditSchema.safeParse(v).data ?? null);
  const opexRecords = envelopesOf<AiOpex>(session.assets, "opex", (v) => aiOpexSchema.safeParse(v).data ?? null);

  const offering = buildOffering(offeringRecords, sector);
  const pains = buildPains(painRecords, sector);
  const heroes = heroItemNames(offering);

  const inputsParsed = marketingInputsSchema.partial().safeParse(session.marketingInputs ?? undefined);
  const inputs = inputsParsed.success && session.marketingInputs ? inputsParsed.data : null;

  // Ideas: IA con cache; si no hay clave o falla, plantillas.
  let ideasFrom: PreloadSummary["ideasFrom"] = "fallback";
  let aiIdeas = null;
  if (hasAnthropicKey()) {
    try {
      const ideasInput = {
        brand,
        heroItems: heroes,
        pains: pains.pains.slice(0, 5).map((p) => p.title),
        strengths: pains.strengths.map((s) => s.title),
      };
      const result = await generateStructured({
        sessionId,
        kind: "ideas",
        schema: aiIdeasSchema,
        system: IDEAS_SYSTEM,
        content: [{ type: "text", text: ideasUserPrompt(ideasInput) }],
        cacheKeyParts: [ideasInput],
        effort: "low",
        maxTokens: 3_000,
      });
      aiIdeas = result.data;
      ideasFrom = result.cached ? "cache" : "ai";
    } catch (error) {
      console.warn("[sandbox/preload] ideas: usando plantillas —", describeAiError(error));
    }
  }
  const ideas = ideasFromAi(aiIdeas, session.brandName, heroes);
  const marketing = buildMarketing(auditRecords, inputs, ideas);
  const opexSkeleton = buildOpex(opexRecords, sector, session.country, offering.currency);

  const preload = assemblePreload({ offering, pains, marketing, opexSkeleton });

  await prisma.sandboxPreload.upsert({
    where: { sessionId },
    update: {
      offering: preload.offering as unknown as Prisma.InputJsonObject,
      pains: preload.pains as unknown as Prisma.InputJsonObject,
      marketing: preload.marketing as unknown as Prisma.InputJsonObject,
      opexSkeleton: preload.opexSkeleton as unknown as Prisma.InputJsonObject,
      generatedAt: new Date(),
    },
    create: {
      sessionId,
      offering: preload.offering as unknown as Prisma.InputJsonObject,
      pains: preload.pains as unknown as Prisma.InputJsonObject,
      marketing: preload.marketing as unknown as Prisma.InputJsonObject,
      opexSkeleton: preload.opexSkeleton as unknown as Prisma.InputJsonObject,
    },
  });

  return {
    preload,
    summary: {
      items: preload.offering.items.length,
      heroes,
      pains: preload.pains.pains.length,
      strengths: preload.pains.strengths.length,
      ideas: preload.marketing.ideas.length,
      sources: {
        offering: preload.offering.source,
        pains: preload.pains.source,
        marketing: preload.marketing.source,
        opex: preload.opexSkeleton.source,
      },
      ideasFrom,
    },
  };
}

export const PIPELINE_MODEL = SANDBOX_AI_MODEL;
