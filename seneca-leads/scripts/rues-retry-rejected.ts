/**
 * Enhancement 2: re-query RUES for businesses that were rejected on the
 * first sweep, after stripping common Spanish hospitality prefixes
 * ("Restaurante", "Café", "Bar", "Pizzería", "Cocina", articles).
 *
 * Many rejects were due to brand-name vs RUES razón social mismatch where
 * Google Places carries the marketing prefix and RUES carries the bare name.
 * Stripping the prefix frequently lifts the trigram score above 0.85.
 *
 * Idempotent — only updates businesses that don't already have a matrícula.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { childLogger } from '@seneca/shared';
import { searchRues, decideMatch } from '@seneca/ingest-rues';
import { normalizeBusinessName } from '@seneca/shared';

/* eslint-disable no-console */

const log = childLogger({ module: 'rues-retry' });

const STRIP_PATTERNS: RegExp[] = [
  /^restaurante\s+(?:&\s+bar\s+)?/i,
  /^restaurant\s+(?:&\s+bar\s+)?/i,
  /^cafe(?:ter[ií]a)?\s+/i,
  /^café(?:ter[ií]a)?\s+/i,
  /^bar\s+(?!&)/i,
  /^pizzer[ií]a\s+/i,
  /^cocina\s+/i,
  /^comidas?\s+/i,
  /^bistro\s+/i,
  /^panader[ií]a\s+/i,
  /^heleder[ií]a\s+/i,
  /^heladeria\s+/i,
  /\s+restaurante$/i,
  /\s+restaurant$/i,
  /,\s*cocina.*$/i, // "LONDO, cocina al carbón" → "LONDO"
  /,\s*[a-záéíóúüñ\s]+$/i, // generic comma-suffix tagline
];

function stripBrandName(name: string): string {
  let result = name;
  for (const pat of STRIP_PATTERNS) {
    result = result.replace(pat, ' ');
  }
  return result.replace(/\s+/g, ' ').trim();
}

async function jitter(baseMs: number, jitterMs: number): Promise<void> {
  const wait = baseMs + Math.floor(Math.random() * jitterMs * 2 - jitterMs);
  await new Promise((r) => setTimeout(r, Math.max(0, wait)));
}

async function main(): Promise<void> {
  // Find businesses where the latest RUES observation was a reject.
  const observations = await prisma.observation.findMany({
    where: { source: 'rues' },
    orderBy: { observedAt: 'desc' },
    select: { businessId: true, payload: true, observedAt: true },
  });
  const latestByBusiness = new Map<string, string>();
  for (const obs of observations) {
    if (!obs.businessId) continue;
    if (latestByBusiness.has(obs.businessId)) continue;
    const decision = (obs.payload as { decision?: string } | null)?.decision;
    if (decision) latestByBusiness.set(obs.businessId, decision);
  }
  const candidateIds = Array.from(latestByBusiness.entries())
    .filter(([, decision]) => decision === 'reject' || decision === 'review_queue')
    .map(([id]) => id);

  const rejected = await prisma.business.findMany({
    where: {
      id: { in: candidateIds },
      ruesMatricula: null,
    },
    select: {
      id: true,
      nameCanonical: true,
      nameNormalized: true,
      city: true,
    },
  });

  // Filter to those whose stripped name actually differs (no point re-querying
  // identical strings).
  const retryable = rejected
    .map((b) => ({ ...b, stripped: stripBrandName(b.nameCanonical) }))
    .filter(
      (b) =>
        b.stripped.length >= 3 &&
        b.stripped.toLowerCase() !== b.nameCanonical.toLowerCase(),
    );

  log.info(
    {
      totalRejected: rejected.length,
      retryable: retryable.length,
    },
    'starting retry sweep',
  );

  let scanned = 0;
  let newAccepts = 0;
  let stillRejected = 0;
  let queuedForReview = 0;
  let errors = 0;

  for (const b of retryable) {
    scanned++;
    try {
      const results = await searchRues(b.stripped);
      // Score against the *stripped* name (what we actually queried) — using
      // the original brand-prefixed name drags the trigram score below 0.85
      // even when the SAS legal name is a perfect match for the bare brand.
      const strippedNormalized = normalizeBusinessName(b.stripped);
      const decision = decideMatch(
        { nameNormalized: strippedNormalized, city: b.city ?? 'Bogotá' },
        results,
      );

      const observedAt = new Date();
      if (decision.kind === 'auto_accept' && decision.best) {
        const c = decision.best.candidate;
        await prisma.$transaction([
          prisma.business.update({
            where: { id: b.id },
            data: {
              ...(c.nit ? { nit: c.nit } : {}),
              ...(c.matricula ? { ruesMatricula: c.matricula } : {}),
              ...(c.ciiu ? { ciiuPrimary: c.ciiu } : {}),
              ...(c.estado ? { legalStatus: c.estado } : {}),
              ...(c.matriculaDate ? { openedAt: parseRuesDate(c.matriculaDate) } : {}),
            },
          }),
          prisma.observation.create({
            data: {
              businessId: b.id,
              source: 'rues',
              sourceId: c.matricula || c.nit || `retry:${b.id}:${observedAt.getTime()}`,
              observedAt,
              payload: {
                decision: 'auto_accept',
                source_strategy: 'strip_and_retry',
                strippedTerm: b.stripped,
                originalTerm: b.nameCanonical,
                score: decision.best.score,
                signals: decision.best.signals,
                candidate: c,
                allCandidates: results,
              } as unknown as Prisma.InputJsonValue,
            },
          }),
        ]);
        newAccepts++;
        log.info(
          {
            scanned,
            total: retryable.length,
            name: b.nameCanonical,
            stripped: b.stripped,
            matricula: c.matricula,
            score: decision.best.score.toFixed(2),
          },
          'retry hit',
        );
      } else if (decision.kind === 'review_queue') {
        queuedForReview++;
        await prisma.observation.create({
          data: {
            businessId: b.id,
            source: 'rues',
            sourceId: `retry_queue:${b.id}:${observedAt.getTime()}`,
            observedAt,
            payload: {
              decision: 'review_queue',
              source_strategy: 'strip_and_retry',
              strippedTerm: b.stripped,
              score: decision.best?.score ?? 0,
              candidate: decision.best?.candidate ?? null,
              allCandidates: results,
            } as unknown as Prisma.InputJsonValue,
          },
        });
      } else {
        stillRejected++;
      }
    } catch (err) {
      errors++;
      log.error(
        {
          name: b.nameCanonical,
          stripped: b.stripped,
          error: err instanceof Error ? err.message : String(err),
        },
        'retry query failed',
      );
    }

    await jitter(2000, 500);
  }

  console.log('\n=== Strip-and-retry summary ===');
  console.log(`rejected on first sweep:   ${rejected.length}`);
  console.log(`retryable (name changed):  ${retryable.length}`);
  console.log(`scanned:                   ${scanned}`);
  console.log(`new auto-accepts:          ${newAccepts}`);
  console.log(`new review-queue:          ${queuedForReview}`);
  console.log(`still rejected:            ${stillRejected}`);
  console.log(`errors:                    ${errors}`);
}

function parseRuesDate(s: string): Date | null {
  if (!s) return null;
  const compact = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return new Date(`${compact[1]}-${compact[2]}-${compact[3]}T00:00:00.000Z`);
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00.000Z`);
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}T00:00:00.000Z`);
  return null;
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
