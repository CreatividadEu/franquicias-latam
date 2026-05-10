import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main(): Promise<void> {
  const [businesses, reviews, snapshots, observations, leads] = await Promise.all([
    prisma.business.count(),
    prisma.review.count(),
    prisma.snapshot.count(),
    prisma.observation.count(),
    prisma.salesLead.count(),
  ]);

  const top = await prisma.snapshot.findMany({
    where: { googleReviewCount: { not: null } },
    orderBy: { googleReviewCount: 'desc' },
    take: 20,
    include: { business: { select: { nameCanonical: true, sector: true, city: true } } },
  });

  const reviewsBySource = await prisma.review.groupBy({
    by: ['source'],
    _count: { _all: true },
  });

  console.log('=== Seneca Leads — DB counts ===');
  console.log(`businesses:   ${businesses}`);
  console.log(`reviews:      ${reviews}`);
  console.log(`snapshots:    ${snapshots}`);
  console.log(`observations: ${observations}`);
  console.log(`sales_leads:  ${leads}`);
  console.log();
  console.log('reviews by source:');
  for (const r of reviewsBySource) {
    console.log(`  ${r.source.padEnd(20)} ${r._count._all}`);
  }
  console.log();
  console.log('top 20 by Google review count:');
  for (const s of top) {
    const rc = (s.googleReviewCount ?? 0).toString().padStart(6);
    console.log(`  ${rc}  ${s.business.nameCanonical}  [${s.business.city ?? '?'} / ${s.business.sector ?? '?'}]`);
  }
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
