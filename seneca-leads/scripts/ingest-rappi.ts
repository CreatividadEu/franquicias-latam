import { config } from 'dotenv';
config({ path: '.env.local' });

import { runRappiIngest } from '@seneca/ingest-rappi';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const delayArg = process.argv.find((a) => a.startsWith('--delay='));
  const baseDelayMs = delayArg ? Number(delayArg.split('=')[1]) : undefined;

  const result = await runRappiIngest({
    ...(limit !== undefined ? { limit } : {}),
    ...(baseDelayMs !== undefined ? { baseDelayMs } : {}),
  });

  console.log('\n=== Rappi ingest summary ===');
  console.log(`total candidates:     ${result.total}`);
  console.log(`scanned:              ${result.scanned}`);
  console.log(`matched:              ${result.matched}`);
  console.log(`unmatched:            ${result.unmatched}`);
  console.log(`errors:               ${result.errors}`);
  console.log(`duration_seconds:     ${result.durationSeconds.toFixed(1)}`);
  if (result.abortedReason) console.log(`aborted:              ${result.abortedReason}`);
}

main()
  .catch((err: unknown) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'rappi ingest crashed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
