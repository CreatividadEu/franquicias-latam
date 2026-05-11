import { config } from 'dotenv';
config({ path: '.env.local' });

import { runPainExtractor } from '@seneca/pain-extractor';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const skipSynthesis = process.argv.includes('--skip-synthesis');

  const result = await runPainExtractor({
    ...(limit !== undefined ? { limit } : {}),
    skipSynthesis,
  });

  console.log('\n=== Pain extraction summary ===');
  console.log(`eligible_businesses:    ${result.eligibleBusinesses}`);
  console.log(`reviews_embedded:       ${result.reviewsEmbedded}`);
  console.log(`clusters_created:       ${result.clustersCreated}`);
  console.log(`pains_extracted:        ${result.painsExtracted}`);
  console.log(`service_angles_written: ${result.serviceAnglesWritten}`);
  console.log(`errors:                 ${result.errors}`);
  console.log(`duration_seconds:       ${result.durationSeconds.toFixed(1)}`);
}

main()
  .catch((err: unknown) => {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      'pain extractor crashed',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
