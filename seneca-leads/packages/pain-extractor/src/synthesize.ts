/**
 * Optional service-angle synthesis via Claude Sonnet 4.6.
 *
 * Per spec §3.2: for businesses with ≥3 extracted pains, generate a
 * single-paragraph "service angle" that maps top pains to the
 * Franquicias / Seneor / Stoika / FranquiciaOS / AI Transformation
 * service catalog. Persisted to salesLead.serviceAngle.
 */
import Anthropic from '@anthropic-ai/sdk';
import PQueue from 'p-queue';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'service-angle' });

export const SONNET_MODEL = 'claude-sonnet-4-6';

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing in environment');
  _client = new Anthropic({ apiKey });
  return _client;
}

const queue = new PQueue({ concurrency: 2, intervalCap: 1, interval: 1500 });

const SERVICE_CATALOG = `Service catalog (Seneca Leads' parent firms):
- Franquicias LATAM: franchise model design, multi-unit ops, expansion playbook
- Seneor Lawyers IP: trademark protection, brand monitoring, contracts
- Stoika: margin intelligence, pricing optimization
- FranquiciaOS: SaaS for franchise development
- AI Transformation: bespoke pipelines, ops automation, customer data`;

const SYSTEM_PROMPT = `You are a B2B sales strategist for a Colombian services firm.
Given a list of customer pain points for a single business, write a single concise paragraph
(80-120 words, Spanish) that:
  1. Names 1-2 of the most acute pains in plain language.
  2. Maps each named pain to the most relevant service from the catalog.
  3. Suggests a concrete next step the sales rep could open with.
Do not invent pains beyond what's listed. Do not pitch services unrelated to the pains.
Return plain prose only, no preamble, no bullet points, no markdown.`;

export interface SynthesizeInput {
  nameCanonical: string;
  sector: string;
  city: string;
  pains: Array<{
    category: string;
    subcategory: string | null;
    severity: number;
    frequency: number;
    representativeQuote: string;
  }>;
}

export async function synthesizeServiceAngle(
  input: SynthesizeInput,
): Promise<string | null> {
  if (input.pains.length < 3) return null;

  // Take the top 5 pains by severity * frequency (most actionable signal)
  const topPains = [...input.pains]
    .sort((a, b) => b.severity * b.frequency - a.severity * a.frequency)
    .slice(0, 5);

  const painList = topPains
    .map(
      (p, i) =>
        `${i + 1}. [${p.category}/${p.subcategory ?? ''}] severity=${p.severity}/5 frequency=${(p.frequency * 100).toFixed(0)}% — "${p.representativeQuote}"`,
    )
    .join('\n');

  const userPrompt = `Business: ${input.nameCanonical}
Sector: ${input.sector}
City: ${input.city}

Top pain points:
${painList}

${SERVICE_CATALOG}

Write the service-angle paragraph now.`;

  const text = await queue.add(
    async () => {
      try {
        const res = await client().messages.create({
          model: SONNET_MODEL,
          max_tokens: 400,
          temperature: 0.3,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        });
        // The Anthropic SDK type no longer lists "refusal" in stop_reason
        // (refusals now surface via separate fields), but we keep the
        // defensive check in case the API returns it for older models.
        if ((res.stop_reason as string) === 'refusal') {
          log.warn(
            { business: input.nameCanonical },
            'Sonnet refused synthesis — skipping',
          );
          return null;
        }
        const blocks = res.content.filter(
          (b): b is Anthropic.TextBlock => b.type === 'text',
        );
        return blocks.map((b) => b.text).join('').trim() || null;
      } catch (err) {
        if (err instanceof Anthropic.APIError) {
          log.error(
            { status: err.status, message: err.message, business: input.nameCanonical },
            'Sonnet API error',
          );
          return null;
        }
        throw err;
      }
    },
    { throwOnTimeout: true },
  );

  return (text ?? null) as string | null;
}
