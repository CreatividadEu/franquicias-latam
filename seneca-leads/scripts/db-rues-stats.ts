import { config } from 'dotenv';
config({ path: '.env.local' });
import { prisma } from '@seneca/db';

/* eslint-disable no-console */

async function main() {
  const total = await prisma.business.count();
  const withNit = await prisma.business.count({ where: { nit: { not: null } } });
  const withMatricula = await prisma.business.count({ where: { ruesMatricula: { not: null } } });
  const withCiiu = await prisma.business.count({ where: { ciiuPrimary: { not: null } } });
  const withOpenedAt = await prisma.business.count({ where: { openedAt: { not: null } } });
  const ruesObservations = await prisma.observation.count({ where: { source: 'rues' } });
  const ruesByDecision = await prisma.$queryRaw<Array<{ decision: string; count: bigint }>>`
    SELECT (payload->>'decision') AS decision, COUNT(*)::bigint AS count
    FROM observation WHERE source = 'rues' GROUP BY 1 ORDER BY count DESC`;

  const sample = await prisma.business.findMany({
    where: { nit: { not: null } },
    take: 10,
    orderBy: { createdAt: 'asc' },
    select: { nameCanonical: true, nit: true, ruesMatricula: true, ciiuPrimary: true, openedAt: true, legalStatus: true },
  });

  console.log('=== Business enrichment from RUES ===');
  console.log(`total businesses:    ${total}`);
  console.log(`with NIT:            ${withNit}  (${(withNit/total*100).toFixed(0)}%)`);
  console.log(`with RUES matricula: ${withMatricula}  (${(withMatricula/total*100).toFixed(0)}%)`);
  console.log(`with CIIU code:      ${withCiiu}  (${(withCiiu/total*100).toFixed(0)}%)`);
  console.log(`with openedAt:       ${withOpenedAt}  (${(withOpenedAt/total*100).toFixed(0)}%)`);
  console.log(`\nRUES observations: ${ruesObservations}`);
  console.log('decisions breakdown:');
  for (const row of ruesByDecision) console.log(`  ${row.decision}: ${row.count}`);

  console.log('\nFirst 10 enriched businesses:');
  for (const b of sample) {
    const opened = b.openedAt ? b.openedAt.toISOString().slice(0,10) : '?';
    console.log(`  ${b.nameCanonical.padEnd(40)}  NIT=${b.nit}  mat=${b.ruesMatricula}  CIIU=${b.ciiuPrimary ?? '?'}  opened=${opened}  ${b.legalStatus ?? ''}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
