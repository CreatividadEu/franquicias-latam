# Franquicias LATAM

Marketplace app to match investors with franchise opportunities in LatAm.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma + PostgreSQL (Supabase compatible)
- Tailwind CSS
- Twilio Verify (SMS)
- Resend (email notifications)

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL database

## Environment Variables

Create `.env.local` from `.env.example` and set real credentials:

```bash
cp .env.example .env.local
```

## Local Setup

1. Install dependencies
```bash
npm ci
```
2. Generate Prisma client
```bash
npm run db:generate
```
3. Run database migrations
```bash
npm run db:migrate
```
4. Seed sample data (dev)
```bash
npm run db:seed
```
5. Start app
```bash
npm run dev
```

## Scripts

- `npm run dev`: start local development server
- `npm run build`: production build using webpack (stable in restricted CI/sandboxes)
- `npm run build:ci`: alias of `npm run build` for CI workflows
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks
- `npm run test`: run automated tests (`node:test`)
- `npm run test:watch`: run tests in watch mode
- `npm run db:generate`: generate Prisma client
- `npm run db:migrate`: create/apply local migration
- `npm run db:migrate:deploy`: apply committed migrations (CI/prod)
- `npm run db:push`: direct schema push (prototype only; avoid in shared/prod envs)
- `npm run db:seed`: seed baseline data
- `npm run db:studio`: open Prisma Studio

## Database Workflow

This repo now uses migration files under `prisma/migrations/`.

- For schema changes in development:
```bash
npm run db:migrate -- --name your_change_name
```
- In CI/production:
```bash
npm run db:migrate:deploy
```

## Testing and CI

- Tests live under `tests/`.
- GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
  - lint
  - typecheck
  - tests
  - build

## Notes

- Seed script is idempotent for sample franchises/country coverage.
- Default seeded admin user is only allowed when `NODE_ENV=development` or `ALLOW_DEV_SEED=true`.
