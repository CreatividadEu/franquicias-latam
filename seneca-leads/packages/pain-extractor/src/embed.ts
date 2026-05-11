/**
 * Review embedding via OpenAI text-embedding-3-small.
 * Persists to review.embedding (pgvector) so the clusterer can reuse them.
 */
import OpenAI from 'openai';
import PQueue from 'p-queue';
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'review-embed' });

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

const queue = new PQueue({ concurrency: 3, intervalCap: 1, interval: 100 });

export async function embedBatch(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const result = await queue.add(
    () => client().embeddings.create({ model: EMBED_MODEL, input: inputs }),
    { throwOnTimeout: true },
  );
  if (!result || !('data' in result)) {
    throw new Error('OpenAI embeddings returned no data');
  }
  return result.data.map((d) => d.embedding);
}

function vectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`;
}

export async function persistReviewEmbedding(
  reviewId: string,
  embedding: number[],
): Promise<void> {
  if (embedding.length !== EMBED_DIMS) {
    throw new Error(`expected ${EMBED_DIMS}-dim, got ${embedding.length}`);
  }
  const lit = vectorLiteral(embedding);
  await prisma.$executeRaw`
    UPDATE review SET embedding = ${lit}::vector WHERE id = ${reviewId}
  `;
}

/**
 * Embed all reviews for a given business that don't already have an
 * embedding. Returns the list of (reviewId, embedding) pairs for the
 * caller to use without re-fetching from the DB.
 */
export async function embedBusinessReviews(
  businessId: string,
  batchSize = 100,
): Promise<Array<{ id: string; embedding: number[] }>> {
  // Pull only reviews that don't have an embedding yet.
  const rows = await prisma.$queryRaw<Array<{ id: string; text: string }>>`
    SELECT id, text_original AS text
    FROM review
    WHERE business_id = ${businessId} AND embedding IS NULL
    ORDER BY posted_at ASC
  `;
  if (rows.length === 0) {
    log.debug({ businessId, inserted: 0 }, 'no missing review embeddings');
    return [];
  }

  const out: Array<{ id: string; embedding: number[] }> = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const inputs = batch.map((r) => r.text);
    const vectors = await embedBatch(inputs);
    for (let j = 0; j < batch.length; j++) {
      await persistReviewEmbedding(batch[j]!.id, vectors[j]!);
      out.push({ id: batch[j]!.id, embedding: vectors[j]! });
    }
  }
  log.info({ businessId, inserted: out.length }, 'review embeddings persisted');
  return out;
}

export async function loadReviewEmbeddings(
  businessId: string,
): Promise<Map<string, number[]>> {
  const rows = await prisma.$queryRaw<
    Array<{ id: string; embedding: string | null }>
  >`
    SELECT id, embedding::text AS embedding
    FROM review
    WHERE business_id = ${businessId} AND embedding IS NOT NULL
  `;
  const out = new Map<string, number[]>();
  for (const r of rows) {
    if (r.embedding) out.set(r.id, JSON.parse(r.embedding) as number[]);
  }
  return out;
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
