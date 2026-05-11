import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';
import { searchRues } from './search.js';
import { decideMatch } from './match.js';
import type { RuesCandidate } from './match.js';

const log = childLogger({ module: 'ingest-rues' });

async function jitter(baseMs: number, jitterMs: number): Promise<void> {
  const wait = baseMs + Math.floor(Math.random() * jitterMs * 2 - jitterMs);
  await new Promise((r) => setTimeout(r, Math.max(0, wait)));
}

export interface RunRuesIngestInput {
  /** If set, stop after this many businesses (smoke-test mode). */
  limit?: number;
  /** Hard ceiling on consecutive errors before aborting. */
  consecutiveErrorLimit?: number;
  /** Pacing between API calls. Spec: 1 req per 4s ± 1s jitter. */
  baseDelayMs?: number;
  jitterMs?: number;
}

export interface RunRuesIngestResult {
  total: number;
  scanned: number;
  autoAccepted: number;
  queuedForReview: number;
  rejected: number;
  errors: number;
  durationSeconds: number;
  abortedReason?: string;
}

export async function runRuesIngest(
  input: RunRuesIngestInput = {},
): Promise<RunRuesIngestResult> {
  const startedAt = Date.now();
  const consecutiveErrorLimit = input.consecutiveErrorLimit ?? 4;

  const candidates = await prisma.business.findMany({
    where: {
      OR: [{ nit: null }, { ruesMatricula: null }],
    },
    orderBy: { createdAt: 'asc' },
    ...(input.limit ? { take: input.limit } : {}),
    select: {
      id: true,
      nameCanonical: true,
      nameNormalized: true,
      city: true,
      sector: true,
    },
  });

  log.info({ total: candidates.length }, 'starting RUES ingest');

  const baseDelay = input.baseDelayMs ?? 4000;
  const jitterAmount = input.jitterMs ?? 1000;

  const counters = {
    scanned: 0,
    autoAccepted: 0,
    queuedForReview: 0,
    rejected: 0,
    errors: 0,
    consecutiveErrors: 0,
  };
  let abortedReason: string | undefined;

  try {
    for (const business of candidates) {
      if (counters.consecutiveErrors >= consecutiveErrorLimit) {
        abortedReason = `consecutive errors hit limit (${consecutiveErrorLimit})`;
        log.error({ counters }, abortedReason);
        break;
      }

      counters.scanned++;
      try {
        const results = await searchRues(business.nameCanonical);
        counters.consecutiveErrors = 0;

        const decision = decideMatch(
          {
            nameNormalized: business.nameNormalized,
            city: business.city ?? 'Bogotá',
          },
          results,
        );

        await persistDecision(business.id, decision, results);

        if (decision.kind === 'auto_accept') counters.autoAccepted++;
        else if (decision.kind === 'review_queue') counters.queuedForReview++;
        else counters.rejected++;

        log.info(
          {
            scanned: counters.scanned,
            total: candidates.length,
            decision: decision.kind,
            score: decision.best?.score?.toFixed(2),
            name: business.nameCanonical,
            matricula: decision.best?.candidate.matricula,
            nit: decision.best?.candidate.nit,
          },
          'RUES result',
        );
      } catch (err) {
        counters.errors++;
        counters.consecutiveErrors++;
        log.error(
          {
            source: 'rues',
            sourceId: business.id,
            name: business.nameCanonical,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          },
          'RUES query failed',
        );
      }

      await jitter(baseDelay, jitterAmount);
    }
  } finally {
    // No browser to close — fetch-based client.
  }

  return {
    total: candidates.length,
    scanned: counters.scanned,
    autoAccepted: counters.autoAccepted,
    queuedForReview: counters.queuedForReview,
    rejected: counters.rejected,
    errors: counters.errors,
    durationSeconds: (Date.now() - startedAt) / 1000,
    ...(abortedReason ? { abortedReason } : {}),
  };
}

async function persistDecision(
  businessId: string,
  decision: ReturnType<typeof decideMatch>,
  rawCandidates: RuesCandidate[],
): Promise<void> {
  const observedAt = new Date();

  if (decision.kind === 'auto_accept' && decision.best) {
    const c = decision.best.candidate;
    await prisma.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: businessId },
        data: {
          ...(c.nit ? { nit: c.nit } : {}),
          ...(c.matricula ? { ruesMatricula: c.matricula } : {}),
          ...(c.ciiu ? { ciiuPrimary: c.ciiu } : {}),
          ...(c.estado ? { legalStatus: c.estado } : {}),
          ...(c.matriculaDate ? { openedAt: parseRuesDate(c.matriculaDate) } : {}),
        },
      });
      await tx.observation.create({
        data: {
          businessId,
          source: 'rues',
          sourceId: c.matricula || c.nit || `auto:${businessId}`,
          observedAt,
          payload: {
            decision: 'auto_accept',
            score: decision.best!.score,
            signals: decision.best!.signals,
            candidate: c as unknown as Prisma.InputJsonValue,
            allCandidates: rawCandidates as unknown as Prisma.InputJsonValue,
          } as unknown as Prisma.InputJsonValue,
        },
      });
    });
    return;
  }

  if (decision.kind === 'review_queue' && decision.best) {
    await prisma.observation.create({
      data: {
        businessId,
        source: 'rues',
        sourceId: `queue:${businessId}:${observedAt.getTime()}`,
        observedAt,
        payload: {
          decision: 'review_queue',
          score: decision.best.score,
          signals: decision.best.signals,
          candidate: decision.best.candidate as unknown as Prisma.InputJsonValue,
          runnerUp: (decision.runnerUp ?? null) as unknown as Prisma.InputJsonValue,
          allCandidates: rawCandidates as unknown as Prisma.InputJsonValue,
        } as unknown as Prisma.InputJsonValue,
      },
    });
    // Note: ErReviewQueue requires a businessBId (the candidate). Since RUES
    // candidates don't yet exist as Business rows, we skip ErReviewQueue
    // entries for RUES uncertain matches and rely on the Observation row +
    // a future review-queue UI to re-decide. The schema's ER queue is for
    // de-duping internal Business rows, not for external matching candidates.
    return;
  }

  // Rejected matches still leave a paper trail so we don't re-query forever.
  await prisma.observation.create({
    data: {
      businessId,
      source: 'rues',
      sourceId: `reject:${businessId}:${observedAt.getTime()}`,
      observedAt,
      payload: {
        decision: 'reject',
        score: decision.best?.score ?? 0,
        allCandidates: rawCandidates as unknown as Prisma.InputJsonValue,
      } as unknown as Prisma.InputJsonValue,
    },
  });
}

function parseRuesDate(s: string): Date | null {
  if (!s) return null;
  // RUES Elasticsearch returns YYYYMMDD with no separators (e.g. "19940907").
  const compact = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return new Date(`${compact[1]}-${compact[2]}-${compact[3]}T00:00:00.000Z`);
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00.000Z`);
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}T00:00:00.000Z`);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
