import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { runRevenueEstimator } from '@seneca/revenue-estimator';
import { logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const result = await runRevenueEstimator({ dryRun });

  console.log('\n=== Revenue estimator summary ===');
  console.log(`leads_total:           ${result.leadsTotal}`);
  console.log(`estimated:             ${result.estimated}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`by_photo_count:        ${result.byPhotoCount}`);
  console.log(`by_sector_default:     ${result.bySectorDefault}`);
  console.log(`by_super_sociedades:   ${result.bySuperSociedades}  (CSV not loaded — layer 1 deferred)`);
  console.log(`duration_seconds:      ${result.durationSeconds.toFixed(1)}`);
}

main()
  .catch((err: unknown) => {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      'revenue estimator crashed',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
