import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';
import { backfillBusinessEmbeddings, loadAllEmbeddings } from './embed.js';
import { generatePairs, loadCandidates, type BusinessLite } from './pairs.js';
import { decisionOf, scorePair, type PairScore } from './score.js';
import { mergeBusinesses } from './merge.js';

const log = childLogger({ module: 'entity-resolver' });

export interface RunResolverInput {
  /** Skip the embedding step (use cached only). Default: false. */
  skipEmbedding?: boolean;
  /** Don't actually merge — just compute decisions and log them. Default: false. */
  dryRun?: boolean;
}

export interface RunResolverResult {
  businessesScanned: number;
  embeddingsInserted: number;
  pairsGenerated: number;
  autoMerged: number;
  queuedForReview: number;
  rejected: number;
  durationSeconds: number;
}

export async function runEntityResolver(
  input: RunResolverInput = {},
): Promise<RunResolverResult> {
  const startedAt = Date.now();

  let embeddingsInserted = 0;
  if (!input.skipEmbedding) {
    const res = await backfillBusinessEmbeddings();
    embeddingsInserted = res.inserted;
  }

  log.info('loading embeddings + candidates');
  const [embeddings, candidates] = await Promise.all([
    loadAllEmbeddings(),
    loadCandidates(),
  ]);

  const pairs = generatePairs(candidates);
  log.info({ pairs: pairs.length, businesses: candidates.length }, 'generated pairs');

  const scored: PairScore[] = pairs.map((p) => scorePair(p, embeddings));
  scored.sort((a, b) => b.score - a.score);

  let autoMerged = 0;
  let queuedForReview = 0;
  let rejected = 0;

  // After a merge, the loser's id may still appear in subsequent pairs. Track
  // which ids have been merged away so we don't try to merge them twice.
  const dissolved = new Set<string>();

  for (const ps of scored) {
    const decision = decisionOf(ps.score);
    if (decision === 'reject') {
      rejected++;
      continue;
    }

    const a = ps.pair.a;
    const b = ps.pair.b;
    if (dissolved.has(a.id) || dissolved.has(b.id)) {
      // One side already merged away; skip to avoid cascading
      rejected++;
      continue;
    }

    if (decision === 'auto_merge') {
      const { winner, loser } = pickWinner(a, b);
      log.info(
        {
          winnerId: winner.id,
          winnerName: winner.nameNormalized,
          loserId: loser.id,
          loserName: loser.nameNormalized,
          score: ps.score.toFixed(3),
          signals: ps.signals,
          reason: ps.pair.reason,
        },
        'auto-merge candidate',
      );
      if (!input.dryRun) {
        await mergeBusinesses({
          winnerId: winner.id,
          loserId: loser.id,
          loserNameCanonical: loser.nameNormalized,
          decisionScore: ps.score,
          signals: ps.signals as unknown as Record<string, unknown>,
        });
      }
      dissolved.add(loser.id);
      autoMerged++;
    } else {
      // review_queue
      log.info(
        {
          aId: a.id,
          aName: a.nameNormalized,
          bId: b.id,
          bName: b.nameNormalized,
          score: ps.score.toFixed(3),
          signals: ps.signals,
        },
        'queued for review',
      );
      if (!input.dryRun) {
        await prisma.erReviewQueue.create({
          data: {
            businessAId: a.id,
            businessBId: b.id,
            score: ps.score,
            signals: {
              ...ps.signals,
              reason: ps.pair.reason,
              nameA: a.nameNormalized,
              nameB: b.nameNormalized,
            } as unknown as Prisma.InputJsonValue,
          },
        });
      }
      queuedForReview++;
    }
  }

  return {
    businessesScanned: candidates.length,
    embeddingsInserted,
    pairsGenerated: pairs.length,
    autoMerged,
    queuedForReview,
    rejected,
    durationSeconds: (Date.now() - startedAt) / 1000,
  };
}

function pickWinner(
  a: BusinessLite,
  b: BusinessLite,
): { winner: BusinessLite; loser: BusinessLite } {
  // Older createdAt wins. Tiebreak on id for determinism.
  if (a.createdAt.getTime() < b.createdAt.getTime()) return { winner: a, loser: b };
  if (a.createdAt.getTime() > b.createdAt.getTime()) return { winner: b, loser: a };
  return a.id < b.id ? { winner: a, loser: b } : { winner: b, loser: a };
}
