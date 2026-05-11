/**
 * Run the Sonnet 4.6 service-angle synthesis pass on every business that
 * already has ≥3 PainExtraction rows. Idempotent: skips businesses that
 * already have a "service_angle" Observation written by a prior run.
 */
import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { synthesizeServiceAngle } from '@seneca/pain-extractor';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const force = process.argv.includes('--force');

  // Businesses with ≥3 pains and no existing service angle (unless --force).
  const candidates = await prisma.business.findMany({
    where: {
      painClusters: {
        some: { extractions: { some: {} } },
      },
    },
    select: {
      id: true,
      nameCanonical: true,
      sector: true,
      city: true,
      painClusters: {
        select: {
          extractions: {
            select: {
              category: true,
              subcategory: true,
              severity: true,
              frequencyInSample: true,
              representativeQuote: true,
            },
          },
        },
      },
    },
  });

  let synthesized = 0;
  let skipped = 0;
  let errors = 0;

  for (const biz of candidates) {
    const pains = biz.painClusters.flatMap((c) => c.extractions);
    if (pains.length < 3) {
      skipped++;
      continue;
    }
    if (!force) {
      const existing = await prisma.observation.findFirst({
        where: {
          businessId: biz.id,
          source: 'pain_extractor',
          sourceId: { startsWith: 'service_angle:' },
        },
      });
      if (existing) {
        console.log(`[skip — already has angle]  ${biz.nameCanonical}`);
        skipped++;
        continue;
      }
    }

    try {
      const angle = await synthesizeServiceAngle({
        nameCanonical: biz.nameCanonical,
        sector: biz.sector ?? 'restaurant',
        city: biz.city ?? 'Bogotá',
        pains: pains.map((p) => ({
          category: p.category,
          subcategory: p.subcategory,
          severity: p.severity,
          frequency: p.frequencyInSample,
          representativeQuote: p.representativeQuote,
        })),
      });
      if (!angle) {
        console.log(`[empty]  ${biz.nameCanonical}`);
        errors++;
        continue;
      }
      await prisma.observation.create({
        data: {
          businessId: biz.id,
          source: 'pain_extractor',
          sourceId: `service_angle:${biz.id}:${Date.now()}`,
          observedAt: new Date(),
          payload: {
            kind: 'service_angle',
            modelVersion: 'sonnet-4.6',
            text: angle,
            painsConsidered: pains.length,
          },
        },
      });
      synthesized++;
      console.log(`\n=== ${biz.nameCanonical} ===\n${angle}\n`);
    } catch (err) {
      errors++;
      console.error(`[error]  ${biz.nameCanonical}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\n=== Synthesis summary ===');
  console.log(`candidates:    ${candidates.length}`);
  console.log(`synthesized:   ${synthesized}`);
  console.log(`skipped:       ${skipped}`);
  console.log(`errors:        ${errors}`);
}

main()
  .catch((err: unknown) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'synthesis crashed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
