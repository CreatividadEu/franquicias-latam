# @seneca/db

Prisma schema, generated client, and migrations.

## Initial setup

1. Provision Supabase project. In SQL Editor enable extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
2. Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in repo root `.env.local`.
3. From repo root:
   ```bash
   pnpm db:generate
   pnpm db:migrate            # creates the init migration
   ```
4. Apply the cohort views migration:
   ```bash
   # rename the manual folder to a timestamped name, then:
   pnpm -F @seneca/db prisma migrate deploy
   ```
   Or, for a quick local apply during development:
   ```bash
   psql "$DIRECT_URL" -f packages/db/prisma/migrations/manual_cohort_views/migration.sql
   ```

## Why two URLs?

Supabase pooled URL is required at runtime (PgBouncer transaction mode). Migrations need the direct URL (full connection, statement mode).

## Vector column

`Review.embedding` and `PainCluster.centroid` are `vector(1536)` columns marked `Unsupported` in Prisma — read/write them via raw SQL in the relevant packages, never through the typed Prisma API.
