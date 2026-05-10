# Seneca Leads

B2B lead intelligence platform for Colombian SMBs (restaurants, spas, clinics, retail). Surfaces best new and best mature-with-pain businesses with structured pain points, traction signals, and revenue estimates.

## Stack

- **Monorepo:** pnpm workspaces + turbo
- **Lang:** TypeScript strict, Node 20+
- **DB:** Postgres 15 (Supabase) + Prisma + pgvector + pg_trgm + postgis
- **Web:** Next.js 15 + Tailwind + shadcn/ui
- **AI:** Anthropic Claude Haiku 4.5 + Sonnet 4.6 + OpenAI embeddings
- **Scraping:** SerpAPI, Apify, Playwright + stealth

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local   # fill in DATABASE_URL, DIRECT_URL, SERPAPI_KEY (Phase 1)

# 3. Provision Supabase Postgres extensions (one-time, in Supabase SQL editor)
#    CREATE EXTENSION IF NOT EXISTS vector;
#    CREATE EXTENSION IF NOT EXISTS pg_trgm;
#    CREATE EXTENSION IF NOT EXISTS postgis;

# 4. Sync schema to Supabase
#    db push works around the shadow-DB drift Supabase causes with its
#    pre-installed extensions. Use migrate dev for incremental changes
#    after this initial sync.
set -a; source .env.local; set +a
pnpm -F @seneca/db exec prisma db push --skip-generate
pnpm -F @seneca/db exec prisma generate

# 5. Apply cohort views
pnpm -F @seneca/db exec prisma db execute \
  --file prisma/sql/cohort_views.sql \
  --schema prisma/schema.prisma

# 6. Verify
pnpm exec tsx scripts/verify-db.ts
# Expected: 11 tables, v_cohort_new_winner + v_cohort_mature_painful, vector/pg_trgm/postgis active
```

## Phase 1 — runbook

```bash
pnpm ingest:google           # full Bogotá restaurants sweep
pnpm ingest:google -- --pages=3   # extra coverage if dedup is heavy
pnpm ingest:google -- --no-reviews  # skip the second pass (faster, places only)
```

## Phase status

- [x] **Phase 1** — Foundation + Google Places ingest
- [ ] **Phase 2** — RUES + Instagram + Rappi
- [ ] **Phase 3** — Entity resolution + pain extraction + scoring + revenue
- [ ] **Phase 4** — Dashboard (`apps/web`)
- [ ] **Phase 5** — Workers + Telegram bot

## Scripts

```bash
pnpm ingest:google      # Phase 1: Bogotá restaurants from SerpAPI
pnpm ingest:rues        # Phase 2: RUES backfill
pnpm ingest:instagram   # Phase 2: Instagram via Apify
pnpm ingest:rappi       # Phase 2: Rappi presence
pnpm resolve:entities   # Phase 3: dedupe businesses
pnpm extract:pains      # Phase 3: cluster reviews + Claude extraction
pnpm score:leads        # Phase 3: traction + pain + fit scoring
```

## Layout

```
apps/web        — Next.js dashboard (Phase 4)
apps/workers    — BullMQ worker process (Phase 5)
apps/bot        — Telegram bot (Phase 5)
packages/db     — Prisma schema + client
packages/shared — types, zod schemas, normalizers, logger
packages/ingest-* — source-specific ingestors
packages/entity-resolver, pain-extractor, scorer, revenue-estimator — intelligence layer
scripts/        — CLI entry points
```

## Hard rules

1. Never store reviewer PII (names, emails, phones).
2. `Observation` rows are append-only.
3. All currencies COP, stored as `BigInt`.
4. All `DateTime` UTC; convert to `America/Bogota` only at UI layer.
5. Every ingestor must be idempotent.
