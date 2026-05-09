import 'dotenv/config';
import { runGooglePlacesIngest } from '@seneca/ingest-google';
import { BOGOTA_SEEDS, logger } from '@seneca/shared';
import { prisma } from '@seneca/db';

async function main(): Promise<void> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    logger.error('SERPAPI_KEY missing in environment — set it in .env.local');
    process.exit(1);
  }

  const noReviews = process.argv.includes('--no-reviews');
  const pagesArg = process.argv.find((a) => a.startsWith('--pages='));
  const pagesPerSeed = pagesArg ? Number(pagesArg.split('=')[1]) : 2;

  const result = await runGooglePlacesIngest({
    apiKey,
    city: 'Bogotá',
    sector: 'restaurant',
    query: 'restaurantes',
    seeds: BOGOTA_SEEDS,
    pagesPerSeed,
    fetchReviews: !noReviews,
  });

  // eslint-disable-next-line no-console
  console.log('\n=== Google Places ingest summary ===');
  // eslint-disable-next-line no-console
  console.log(`businesses_total:     ${result.businessesTotal}`);
  // eslint-disable-next-line no-console
  console.log(`businesses_new:       ${result.businessesNew}`);
  // eslint-disable-next-line no-console
  console.log(`reviews_total:        ${result.reviewsTotal}`);
  // eslint-disable-next-line no-console
  console.log(`snapshots_today:      ${result.snapshotsToday}`);
  // eslint-disable-next-line no-console
  console.log(`errors:               ${result.errors}`);
  // eslint-disable-next-line no-console
  console.log(`duration_seconds:     ${result.durationSeconds.toFixed(1)}`);
  // eslint-disable-next-line no-console
  console.log('top_20_by_review_count:');
  for (const row of result.topByReviewCount) {
    // eslint-disable-next-line no-console
    console.log(`  - ${row.reviewCount.toString().padStart(6, ' ')}  ${row.name}`);
  }
}

main()
  .catch((err) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'ingest crashed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
