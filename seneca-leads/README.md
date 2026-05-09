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
pnpm install
cp .env.example .env.local   # fill in keys
pnpm db:generate
pnpm db:migrate              # run once Supabase is provisioned
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
