import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { runScorer } from '@seneca/scorer';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  const result = await runScorer({ dryRun });

  console.log('\n=== Lead scoring summary ===');
  console.log(`businesses_total:        ${result.total}`);
  console.log(`scored:                  ${result.scored}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`new_winner_leads:        ${result.newWinnerLeads}`);
  console.log(`mature_painful_leads:    ${result.maturePainfulLeads}  (strict view)`);
  console.log(`mature_painful_inferred: ${result.maturePainfulInferredLeads}  (≥3 pain extractions)`);
  console.log(`skipped_no_cohort:       ${result.skippedNoCohort}`);
  console.log(`service_angles_attached: ${result.serviceAnglesAttached}`);
  console.log(`duration_seconds:        ${result.durationSeconds.toFixed(1)}`);
}

main()
  .catch((err: unknown) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'scorer crashed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
