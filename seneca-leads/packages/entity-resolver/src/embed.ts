/**
 * OpenAI text-embedding-3-small wrapper + pgvector persistence.
 *
 * pgvector's text format is the literal `[x.x,x.x,...]`, which is
 * conveniently valid JSON, so reads parse with JSON.parse and writes
 * serialize with `[` + values.join(',') + `]`. Prisma marks the column
 * Unsupported, so we hit it with `$executeRaw` / `$queryRaw` instead of
 * the typed client.
 */
import OpenAI from 'openai';
import PQueue from 'p-queue';
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'embed' });

export const EMBED_MODEL = 'text-embedding-3-small';
export const EMBED_DIMS = 1536;

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing in environment');
  _client = new OpenAI({ apiKey });
  return _client;
}

// OpenAI's embeddings endpoint accepts up to 2048 inputs per request and
// rate-limits at the account level. p-queue with concurrency 3 / 100ms gap is
// well under any tier's limits.
const queue = new PQueue({ concurrency: 3, intervalCap: 1, interval: 100 });

/**
 * Embed a batch of input strings. Returns one Float32 vector per input,
 * in the same order. Caller batches up to ~100 inputs per call to keep
 * tokens-per-request under 8k.
 */
export async function embedBatch(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const result = await queue.add(
    () =>
      client().embeddings.create({
        model: EMBED_MODEL,
        input: inputs,
      }),
    { throwOnTimeout: true },
  );
  if (!result || !('data' in result)) {
    throw new Error('OpenAI embeddings returned no data');
  }
  return result.data.map((d) => d.embedding);
}

export function businessEmbedInput(b: {
  nameCanonical: string;
  address: string | null;
  city: string | null;
}): string {
  const lines: string[] = [b.nameCanonical];
  if (b.address) lines.push(b.address);
  if (b.city) lines.push(b.city);
  return lines.join('\n');
}

function vectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`;
}

export async function persistEmbedding(
  businessId: string,
  inputText: string,
  embedding: number[],
): Promise<void> {
  if (embedding.length !== EMBED_DIMS) {
    throw new Error(`expected ${EMBED_DIMS}-dim vector, got ${embedding.length}`);
  }
  const lit = vectorLiteral(embedding);
  await prisma.$executeRaw`
    INSERT INTO business_embedding (business_id, input_text, model_version, embedding, computed_at)
    VALUES (${businessId}, ${inputText}, ${EMBED_MODEL}, ${lit}::vector, NOW())
    ON CONFLICT (business_id) DO UPDATE
    SET input_text = EXCLUDED.input_text,
        model_version = EXCLUDED.model_version,
        embedding = EXCLUDED.embedding,
        computed_at = NOW()
  `;
}

/** Load all cached embeddings into memory. 207 × 1536 floats ≈ 1.3 MB. */
export async function loadAllEmbeddings(): Promise<Map<string, number[]>> {
  const rows = await prisma.$queryRaw<Array<{ business_id: string; embedding: string }>>`
    SELECT business_id, embedding::text AS embedding FROM business_embedding
  `;
  const out = new Map<string, number[]>();
  for (const r of rows) {
    out.set(r.business_id, JSON.parse(r.embedding) as number[]);
  }
  return out;
}

export async function listBusinessIdsMissingEmbedding(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT b.id FROM business b
    LEFT JOIN business_embedding e ON e.business_id = b.id
    WHERE e.business_id IS NULL
  `;
  return rows.map((r) => r.id);
}

/**
 * Embed and persist all businesses that don't yet have a cached embedding.
 * Batches inputs in groups of 100. Idempotent — skips already-embedded.
 */
export async function backfillBusinessEmbeddings(
  batchSize = 100,
): Promise<{ inserted: number; skipped: number }> {
  const missing = await listBusinessIdsMissingEmbedding();
  if (missing.length === 0) {
    log.info({ skipped: 0, inserted: 0 }, 'business embeddings already up to date');
    return { inserted: 0, skipped: 0 };
  }

  const businesses = await prisma.business.findMany({
    where: { id: { in: missing } },
    select: { id: true, nameCanonical: true, address: true, city: true },
  });

  let inserted = 0;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const inputs = batch.map((b) => businessEmbedInput(b));
    const vectors = await embedBatch(inputs);
    for (let j = 0; j < batch.length; j++) {
      await persistEmbedding(batch[j]!.id, inputs[j]!, vectors[j]!);
      inserted++;
    }
    log.info(
      { batch: i / batchSize + 1, batchSize: batch.length, totalInserted: inserted, totalBusinesses: businesses.length },
      'embed batch persisted',
    );
  }
  return { inserted, skipped: 0 };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
