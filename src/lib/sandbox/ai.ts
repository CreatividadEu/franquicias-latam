/**
 * Único punto de entrada a Claude del Sandbox (§6): salida estructurada
 * validada con zod, reintento con feedback de esquema, cache por sesión
 * (SandboxAiCache, clave = tipo + hash de inputs) y errores tipados. El
 * modelo lo fija el brief (claude-sonnet-4-6) y puede cambiarse por env.
 */
import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";

export const SANDBOX_AI_MODEL = (process.env.SANDBOX_AI_MODEL ?? "claude-sonnet-4-6").trim();
/** Súbelo cuando cambie un prompt: invalida la cache de todas las sesiones. */
export const PROMPT_VERSION = "2026-09-03.1";

export type AiEffort = "low" | "medium" | "high";

export type SandboxAiErrorCode = "no_api_key" | "api" | "invalid_output" | "truncated" | "refusal";

export class SandboxAiError extends Error {
  constructor(
    public readonly code: SandboxAiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SandboxAiError";
  }
}

let client: Anthropic | null = null;

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    // 4 intentos ante 429/5xx (backoff del SDK); 4 min por request para PDFs
    // grandes con visión. Vercel corta antes según maxDuration de la ruta.
    client = new Anthropic({ apiKey, maxRetries: 3, timeout: 240_000 });
  }
  return client;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}

export function hashInputs(parts: unknown[]): string {
  return createHash("sha256").update(stableStringify(parts)).digest("hex");
}

/** Quita fences ```json ... ``` y texto alrededor del primer objeto JSON. */
export function stripFences(text: string): string {
  const unfenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  return start >= 0 && end > start ? unfenced.slice(start, end + 1) : unfenced;
}

export function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(stripFences(text));
  } catch {
    return undefined;
  }
}

export type GenerateOptions<T extends z.ZodType> = {
  sessionId: string;
  /** Tipo de generación: entra en la clave de cache (offering, pains, ideas…). */
  kind: string;
  schema: T;
  system: string;
  content: Anthropic.ContentBlockParam[];
  /** Hashes/descriptores de los inputs (no el contenido entero) para la cache. */
  cacheKeyParts: unknown[];
  effort?: AiEffort;
  maxTokens?: number;
  /** Ignora la cache y vuelve a generar. */
  force?: boolean;
};

export type AiUsage = { input: number; output: number; cacheRead: number };

export type GenerateResult<D> = {
  data: D;
  cached: boolean;
  model: string;
  usage: AiUsage | null;
};

function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 6)
    .map((i) => `${i.path.map(String).join(".") || "(raíz)"}: ${i.message}`)
    .join("; ");
}

function wrapApiError(error: unknown): SandboxAiError {
  if (error instanceof Anthropic.AuthenticationError) {
    return new SandboxAiError("api", "Claude API rechazó la clave (401): revisa ANTHROPIC_API_KEY en el servidor");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new SandboxAiError("api", "Claude API: límite de uso alcanzado (429). Espera un minuto y reintenta");
  }
  if (error instanceof Anthropic.APIError) {
    const detail = error.message.replace(/\s+/g, " ").slice(0, 300);
    return new SandboxAiError("api", `Claude API ${error.status ?? ""}: ${detail}`.trim());
  }
  return new SandboxAiError("api", error instanceof Error ? error.message : "Error llamando a Claude");
}

type CallMode = "structured+thinking" | "structured" | "json-text";

/**
 * Ante un 400 por incompatibilidad de parámetros (deriva de API), baja de modo:
 * sin thinking → sin structured outputs (JSON en texto + fence-strip).
 */
function downgradeMode(mode: CallMode, error: unknown): CallMode | null {
  if (!(error instanceof Anthropic.BadRequestError)) return null;
  const msg = error.message.toLowerCase();
  if (mode === "structured+thinking" && msg.includes("thinking")) return "structured";
  if (mode !== "json-text" && (msg.includes("output_config") || msg.includes("output_format") || msg.includes("format"))) {
    return "json-text";
  }
  return null;
}

const JSON_TEXT_SUFFIX =
  "\n\nResponde ÚNICAMENTE con un objeto JSON válido que cumpla el esquema descrito, sin texto antes ni después ni fences de código.";

/**
 * Genera JSON validado. Estrategia: structured outputs (`output_config.format`)
 * + adaptive thinking; si el JSON no cumple el esquema zod, un segundo intento
 * con los errores como feedback. El resultado válido se cachea por sesión.
 */
export async function generateStructured<T extends z.ZodType>(
  opts: GenerateOptions<T>,
): Promise<GenerateResult<z.infer<T>>> {
  const inputHash = hashInputs([PROMPT_VERSION, SANDBOX_AI_MODEL, opts.kind, opts.system, ...opts.cacheKeyParts]);

  if (!opts.force) {
    const hit = await prisma.sandboxAiCache.findUnique({
      where: { sessionId_kind_inputHash: { sessionId: opts.sessionId, kind: opts.kind, inputHash } },
    });
    if (hit) {
      const parsed = opts.schema.safeParse(hit.response);
      if (parsed.success) return { data: parsed.data, cached: true, model: hit.model, usage: null };
    }
  }

  const anthropic = getAnthropic();
  if (!anthropic) throw new SandboxAiError("no_api_key", "ANTHROPIC_API_KEY no configurada en el servidor");

  const baseMessages: Anthropic.MessageParam[] = [{ role: "user", content: opts.content }];
  let messages = baseMessages;
  let lastIssues = "";
  let mode: CallMode = "structured+thinking";

  for (let attempt = 0; attempt < 4; attempt++) {
    let response: Anthropic.Message & { parsed_output?: unknown };
    try {
      if (mode === "json-text") {
        response = await anthropic.messages.create({
          model: SANDBOX_AI_MODEL,
          max_tokens: opts.maxTokens ?? 16_000,
          system: opts.system + JSON_TEXT_SUFFIX + "\n\nEsquema JSON:\n" + JSON.stringify(zodOutputFormat(opts.schema).schema),
          output_config: { effort: opts.effort ?? "medium" },
          messages,
        });
      } else {
        response = await anthropic.messages.parse({
          model: SANDBOX_AI_MODEL,
          max_tokens: opts.maxTokens ?? 16_000,
          system: opts.system,
          ...(mode === "structured+thinking" ? { thinking: { type: "adaptive" as const } } : {}),
          output_config: { format: zodOutputFormat(opts.schema), effort: opts.effort ?? "medium" },
          messages,
        });
      }
    } catch (error) {
      const next = downgradeMode(mode, error);
      if (next) {
        console.warn(`[sandbox/ai] ${mode} → ${next}:`, error instanceof Error ? error.message.slice(0, 200) : error);
        mode = next;
        continue;
      }
      throw wrapApiError(error);
    }

    if (response.stop_reason === "refusal") {
      throw new SandboxAiError("refusal", "Claude declinó procesar este documento");
    }
    if (response.stop_reason === "max_tokens") {
      throw new SandboxAiError("truncated", "La salida se cortó por longitud: divide el documento o reduce su tamaño");
    }

    const raw = textOf(response);
    const candidate: unknown = response.parsed_output ?? tryParseJson(raw);
    const parsed = opts.schema.safeParse(candidate);
    if (!parsed.success && lastIssues) {
      // Ya hubo un reintento con feedback: no insistir más en el mismo modo.
      lastIssues = formatIssues(parsed.error);
      break;
    }

    if (parsed.success) {
      const usage: AiUsage = {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cacheRead: response.usage.cache_read_input_tokens ?? 0,
      };
      const cacheValue = parsed.data as unknown as Prisma.InputJsonObject;
      await prisma.sandboxAiCache.upsert({
        where: { sessionId_kind_inputHash: { sessionId: opts.sessionId, kind: opts.kind, inputHash } },
        update: { response: cacheValue, model: SANDBOX_AI_MODEL },
        create: { sessionId: opts.sessionId, kind: opts.kind, inputHash, model: SANDBOX_AI_MODEL, response: cacheValue },
      });
      return { data: parsed.data, cached: false, model: SANDBOX_AI_MODEL, usage };
    }

    lastIssues = formatIssues(parsed.error);
    // Segundo intento: la salida anterior como turno del asistente + feedback.
    messages = [
      ...baseMessages,
      { role: "assistant", content: raw || JSON.stringify(candidate ?? {}) },
      {
        role: "user",
        content: `El JSON anterior no cumple el esquema requerido (${lastIssues}). Devuelve el objeto completo corregido, sin comentarios.`,
      },
    ];
  }

  throw new SandboxAiError("invalid_output", `La salida de Claude no cumplió el esquema: ${lastIssues}`);
}

export function describeAiError(error: unknown): string {
  if (error instanceof SandboxAiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Error desconocido";
}
