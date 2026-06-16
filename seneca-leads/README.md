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

## Phase 4 — dashboard (`apps/web`)

```bash
# Local dev
pnpm -F @seneca/web dev          # http://localhost:3000

# Production build (run before each deploy)
pnpm -F @seneca/web build
pnpm -F @seneca/web start
```

### Auth

Magic-link via Supabase Auth + an explicit email allow-list checked in
middleware (`ALLOWED_EMAILS`, comma-separated). Unrecognized signed-in users
are bounced back to `/login` with `?error=not_allowed&email=…`.

### Required env vars

| Var | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Vercel + local | Pooled (pgbouncer) Postgres URL — server runtime reads |
| `DIRECT_URL` | Vercel + local | Direct Postgres URL for Prisma migrate |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Supabase anon key |
| `ALLOWED_EMAILS` | Vercel + local | Comma-separated allow-list, e.g. `dseneor@franquiciaslatam.co` |

### Deploy to Vercel

1. **Import** the repo into Vercel, set the **Root Directory** to
   `seneca-leads/apps/web`. Framework preset: Next.js. Build command and
   install command can stay on the defaults (Vercel detects pnpm and runs
   `pnpm install` then `next build`).
2. **Environment variables** — copy the five vars above from your local
   `.env.local` into the Vercel project (Production + Preview).
3. **Supabase Auth redirect** — in the Supabase dashboard,
   *Authentication → URL Configuration*, add the deployed Vercel domain
   (and the preview wildcard if you want previews to auth) to the redirect
   allow-list, with `/auth/callback` as the path.
4. **First deploy** — push to the branch wired to Vercel. After it goes
   green, sign in at `https://<your-domain>/login` from an email present in
   `ALLOWED_EMAILS`.

## Phase 5 — workers + bot (`apps/workers`, `apps/bot`)

### Telegram bot (`apps/bot`)

Surfaces leads + lets you update status from your phone.

```bash
pnpm -F @seneca/bot dev     # long-polling, watch mode
pnpm -F @seneca/bot start   # production
```

Commands once running: `/top [n]`, `/cohort <name> [n]`, `/lead <id>`,
`/status <id> <new|qualified|contacted|won|lost>`, `/help`. The dossier
reply includes inline buttons for the four status transitions, so a touch
updates the lead without typing.

**Auth.** Numeric Telegram user IDs in `TELEGRAM_ALLOWED_USER_IDS`. DM
[@userinfobot](https://t.me/userinfobot) to find yours. Anything off-list
gets a polite refusal and a server-side warn log.

**Get the bot token.** DM [@BotFather](https://t.me/BotFather) in Telegram
→ `/newbot` → paste the returned token into `TELEGRAM_BOT_TOKEN`.

### Workers (`apps/workers`)

BullMQ over Upstash Redis. One queue (`seneca-jobs`) with named jobs.

```bash
pnpm -F @seneca/workers dev    # watch mode + auto-restart
pnpm -F @seneca/workers start  # production
# Manual enqueue (skip waiting for the cron):
pnpm -F @seneca/workers enqueue score:leads
```

| Job | Schedule (UTC) | Bogotá-local | Notes |
| --- | --- | --- | --- |
| `refresh:google-places` | `0 8 * * 0` | Sun 03:00 | SerpAPI re-ingest, ~$2/run |
| `refresh:rues` | `15 8 * * 0` | Sun 03:15 | RUES backfill |
| `refresh:rappi` | `30 8 * * 0` | Sun 03:30 | Rappi presence |
| `refresh:instagram` | `45 8 1 * *` | 1st of month 03:45 | Apify, gated |
| `resolve:entities` | `0 8 * * *` | Daily 03:00 | OpenAI embeddings |
| `extract:pains` | `20 8 * * *` | Daily 03:20 | Haiku 4.5 |
| `estimate:revenue` | `40 8 * * *` | Daily 03:40 | Sector heuristic |
| `score:leads` | `50 8 * * *` | Daily 03:50 | Cohort assignment |
| `notify:new-leads` | `0 12-22 * * *` | Hourly 07–17 | Telegram push |

**Get the Redis URL.** Create an Upstash Redis database → *Database details*
→ *TCP / Redis* → copy the `rediss://default:<password>@<host>.upstash.io:6379`
string into `REDIS_URL`. (The REST URL fields in `.env.example` are kept
for future Edge-side rate-limit counters but workers use TCP.)

### Deploy

Both apps are long-running Node processes — they won't fit on Vercel's
serverless model (5-minute execution cap, no persistent state). Pick one:

- **Fly.io** — one machine each (`bot` + `workers`), `flyctl deploy` from
  each app dir. Both are tiny — `shared-cpu-1x@256mb` is sufficient.
- **Railway** — two services pointing at `apps/bot` and `apps/workers`.
- **Render** — two Background Workers. Same deal.

Build command for each: `pnpm install --frozen-lockfile && pnpm -F
@seneca/<app> start`. The workspace install pulls all dependencies; no
build step needed since both apps run via tsx.

Pass through the env vars from `.env.local` to the hosting provider. The
bot needs `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USER_IDS`;
the workers add `REDIS_URL` and every ingest provider key
(`SERPAPI_KEY`, `APIFY_TOKEN`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).

## Phase status

- [x] **Phase 1** — Foundation + Google Places ingest
- [x] **Phase 2** — RUES + Instagram + Rappi
- [x] **Phase 3** — Entity resolution + pain extraction + scoring + revenue
- [x] **Phase 4** — Dashboard (`apps/web`)
- [x] **Phase 5** — Workers + Telegram bot

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
