/**
 * Pain-point extraction via Claude Haiku 4.5.
 *
 * The system + user prompts are taken verbatim from the Seneca Leads spec
 * §3.2 — they are calibrated. Do not modify them. If the response fails
 * zod validation, retry once with a stricter "JSON only, no markdown
 * fences" reminder; on second failure, log and skip.
 *
 * Settings per spec: model "claude-haiku-4-5-20251001", temperature 0.2,
 * max_tokens 1500. modelVersion tag stored on PainExtraction rows is
 * "haiku-4.5-2025-10-01".
 */
import Anthropic from '@anthropic-ai/sdk';
import PQueue from 'p-queue';
import {
  HaikuPainExtractionSchema,
  childLogger,
  type HaikuPainExtraction,
} from '@seneca/shared';

const log = childLogger({ module: 'pain-extract' });

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
export const MODEL_VERSION_TAG = 'haiku-4.5-2025-10-01';

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing in environment');
  _client = new Anthropic({ apiKey });
  return _client;
}

// Spec rate-limit floor: "Anthropic 50 RPM cap on Haiku."
// One Haiku call per cluster, ~70 clusters total — well under cap. Be
// conservative anyway: 4 concurrent, 1200ms gap = ~50 RPM.
const queue = new PQueue({ concurrency: 4, intervalCap: 1, interval: 1200 });

const SYSTEM_PROMPT = `You are a pain-point extraction analyst for a B2B services firm in Colombia.
You analyze clusters of customer reviews (Spanish and English) for a single business and return
structured pain points. You never invent pains the reviews don't support. You quote customers verbatim
in their original language. You return valid JSON matching the schema. No prose outside the JSON.`;

const RETRY_REMINDER =
  '\n\nIMPORTANT: Return JSON only, no markdown fences, no commentary outside the JSON object.';

export interface ExtractInput {
  sector: string;
  city: string;
  nameCanonical: string;
  /** Reviews sorted most-negative first. Caller is responsible for sort + PII strip. */
  reviews: Array<{ rating: number; text: string }>;
}

export interface ExtractResult {
  ok: true;
  extraction: HaikuPainExtraction;
  modelVersion: string;
  rawResponse: string;
}

export interface ExtractFailure {
  ok: false;
  reason: 'parse_failed' | 'api_error' | 'refusal' | 'empty';
  rawResponses: string[];
  error?: string;
}

function buildUserPrompt(input: ExtractInput, retry = false): string {
  const numbered = input.reviews
    .map((r, i) => `${i + 1}. (${r.rating}★) ${r.text}`)
    .join('\n');
  const base = `Sector: ${input.sector}
City: ${input.city}
Business name: ${input.nameCanonical}
Cluster size: ${input.reviews.length} reviews

Reviews (most negative first):
${numbered}

Allowed pain categories (use "other" only if none fit, and explain in subcategory):
service_speed | service_quality | food_quality | food_portion_price |
hygiene | ambience_noise | reservation_booking | delivery_timing |
order_accuracy | pricing_value | payment_systems | staff_turnover |
facility_condition | digital_experience | communication | other

Return JSON only:
{
  "pains": [
    {
      "category": "<one of the allowed categories>",
      "subcategory": "<short label>",
      "severity": <integer 1-5>,
      "frequency_in_sample": <float 0.0-1.0>,
      "representative_quote": "<verbatim, original language>",
      "evidence_count": <integer>,
      "solution_hint": "<one sentence on what would fix this>"
    }
  ],
  "overall_sentiment": <float -1.0 to 1.0>,
  "notable_strength": "<string or null>"
}`;
  return retry ? base + RETRY_REMINDER : base;
}

function stripFences(s: string): string {
  // Claude sometimes wraps JSON in ```json fences despite instructions.
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) return fence[1]!.trim();
  return s.trim();
}

function tryParse(raw: string): HaikuPainExtraction | null {
  try {
    const unfenced = stripFences(raw);
    const parsed = JSON.parse(unfenced) as unknown;
    const validated = HaikuPainExtractionSchema.safeParse(parsed);
    if (validated.success) return validated.data;
    log.debug(
      { issues: validated.error.issues.slice(0, 3) },
      'zod validation failed',
    );
    return null;
  } catch (err) {
    log.debug({ err: err instanceof Error ? err.message : String(err) }, 'json.parse failed');
    return null;
  }
}

async function callHaiku(userPrompt: string): Promise<{
  ok: true;
  text: string;
} | { ok: false; reason: 'refusal' | 'api_error' | 'empty'; error?: string }> {
  try {
    const res = await client().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1500,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (res.stop_reason === 'refusal') {
      return { ok: false, reason: 'refusal' };
    }

    const textBlocks = res.content.filter(
      (b): b is Anthropic.TextBlock => b.type === 'text',
    );
    if (textBlocks.length === 0) {
      return { ok: false, reason: 'empty' };
    }
    return { ok: true, text: textBlocks.map((b) => b.text).join('') };
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      log.error(
        { status: err.status, message: err.message },
        'Anthropic API error',
      );
      return { ok: false, reason: 'api_error', error: err.message };
    }
    throw err;
  }
}

/**
 * Extract pain points from a single review cluster. Retries once on parse
 * failure with a stricter reminder; gives up after the second attempt.
 */
export async function extractPains(
  input: ExtractInput,
): Promise<ExtractResult | ExtractFailure> {
  const userPrompt = buildUserPrompt(input);
  const rawResponses: string[] = [];

  return (
    (await queue.add(async () => {
      // First attempt
      const r1 = await callHaiku(userPrompt);
      if (!r1.ok) {
        return {
          ok: false,
          reason: r1.reason,
          rawResponses,
          ...(r1.error ? { error: r1.error } : {}),
        } satisfies ExtractFailure;
      }
      rawResponses.push(r1.text);
      const parsed1 = tryParse(r1.text);
      if (parsed1) {
        return {
          ok: true,
          extraction: parsed1,
          modelVersion: MODEL_VERSION_TAG,
          rawResponse: r1.text,
        } satisfies ExtractResult;
      }

      // Retry with stricter reminder
      log.info({ business: input.nameCanonical }, 'pain extraction retry');
      const r2 = await callHaiku(buildUserPrompt(input, true));
      if (!r2.ok) {
        return {
          ok: false,
          reason: r2.reason,
          rawResponses,
          ...(r2.error ? { error: r2.error } : {}),
        } satisfies ExtractFailure;
      }
      rawResponses.push(r2.text);
      const parsed2 = tryParse(r2.text);
      if (parsed2) {
        return {
          ok: true,
          extraction: parsed2,
          modelVersion: MODEL_VERSION_TAG,
          rawResponse: r2.text,
        } satisfies ExtractResult;
      }

      return {
        ok: false,
        reason: 'parse_failed',
        rawResponses,
      } satisfies ExtractFailure;
    }, { throwOnTimeout: true })) as ExtractResult | ExtractFailure
  );
}
