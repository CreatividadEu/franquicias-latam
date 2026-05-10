import { config } from 'dotenv';
config({ path: '.env.local' });

import { runRuesIngest } from '@seneca/ingest-rues';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const headless = !process.argv.includes('--headed');

  const result = await runRuesIngest({
    ...(limit !== undefined ? { limit } : {}),
    headless,
  });

  console.log('\n=== RUES ingest summary ===');
  console.log(`total candidates:     ${result.total}`);
  console.log(`scanned:              ${result.scanned}`);
  console.log(`auto_accepted:        ${result.autoAccepted}`);
  console.log(`queued_for_review:    ${result.queuedForReview}`);
  console.log(`rejected:             ${result.rejected}`);
  console.log(`errors:               ${result.errors}`);
  console.log(`duration_seconds:     ${result.durationSeconds.toFixed(1)}`);
  if (result.abortedReason) console.log(`aborted:              ${result.abortedReason}`);
}

main()
  .catch((err: unknown) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'rues ingest crashed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
