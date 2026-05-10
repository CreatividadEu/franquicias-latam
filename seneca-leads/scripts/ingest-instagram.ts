import { config } from 'dotenv';
config({ path: '.env.local' });

import { runInstagramIngest } from '@seneca/ingest-instagram';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken) {
    logger.error('APIFY_TOKEN missing in environment — set it in .env.local');
    process.exit(1);
  }

  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const batchArg = process.argv.find((a) => a.startsWith('--batch='));
  const batchSize = batchArg ? Number(batchArg.split('=')[1]) : 50;

  const result = await runInstagramIngest({
    apifyToken,
    ...(limit !== undefined ? { limit } : {}),
    batchSize,
  });

  console.log('\n=== Instagram ingest summary ===');
  console.log(`total candidates:     ${result.total}`);
  console.log(`derived_handles:      ${result.derivedHandles}`);
  console.log(`apify_attempted:      ${result.apifyAttempted}`);
  console.log(`matched:              ${result.matched}`);
  console.log(`errors:               ${result.errors}`);
  console.log(`duration_seconds:     ${result.durationSeconds.toFixed(1)}`);
}

main()
  .catch((err: unknown) => {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      'instagram ingest crashed',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
