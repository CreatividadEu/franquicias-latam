import { config } from 'dotenv';
config({ path: '.env.local' });

import { runEntityResolver } from '@seneca/entity-resolver';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const skipEmbedding = process.argv.includes('--skip-embedding');

  const result = await runEntityResolver({ dryRun, skipEmbedding });

  console.log('\n=== Entity resolver summary ===');
  console.log(`businesses_scanned:    ${result.businessesScanned}`);
  console.log(`embeddings_inserted:   ${result.embeddingsInserted}`);
  console.log(`pairs_generated:       ${result.pairsGenerated}`);
  console.log(`auto_merged:           ${result.autoMerged}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`queued_for_review:     ${result.queuedForReview}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`rejected:              ${result.rejected}`);
  console.log(`duration_seconds:      ${result.durationSeconds.toFixed(1)}`);
}

main()
  .catch((err: unknown) => {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      'entity resolver crashed',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
