import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '@seneca/db';

async function main(): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`;
  const views = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.views
    WHERE table_schema = 'public' ORDER BY table_name`;
  const exts = await prisma.$queryRaw<Array<{ extname: string }>>`
    SELECT extname FROM pg_extension WHERE extname IN ('vector','pg_trgm','postgis') ORDER BY extname`;

  /* eslint-disable no-console */
  console.log(`TABLES (${tables.length}):`);
  for (const t of tables) console.log(`  ${t.table_name}`);
  console.log(`\nVIEWS (${views.length}):`);
  for (const v of views) console.log(`  ${v.table_name}`);
  console.log(`\nKEY EXTENSIONS:`);
  for (const e of exts) console.log(`  ${e.extname}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
