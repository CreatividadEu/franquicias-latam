-- Sandbox — microsite interactivo por cliente (/sandbox/[slug]).
-- Migración aditiva: crea el namespace `sandbox_*` (sesión, assets, preload,
-- eventos, resultado, cache de IA) y una FK opcional hacia `franchises` para
-- reutilizar la marca del marketplace. No altera ningún modelo existente.
-- Escrita de forma idempotente (DO $$ + IF NOT EXISTS) siguiendo la
-- convención del repo, para poder re-aplicarse sobre entornos parciales.
--
-- Seguridad: las tablas quedan con RLS habilitado y SIN políticas. Prisma
-- entra como owner (bypassa RLS); la Data API de Supabase (anon/authenticated)
-- no puede leer nada — los documentos crudos jamás salen por PostgREST.

-- ── Enums ───────────────────────────────────────────────────────────────────

DO $$
BEGIN
  CREATE TYPE "SandboxStatus" AS ENUM ('DRAFT', 'READY', 'LIVE', 'DONE', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SandboxSector" AS ENUM ('RESTAURANTE', 'RETAIL', 'SERVICIOS', 'OTRO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SandboxLocale" AS ENUM ('ES', 'EN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SandboxAssetKind" AS ENUM (
    'MENU',
    'CATALOG',
    'PRICE_LIST',
    'SALES_NOTES',
    'OPEX_NOTES',
    'OSINT',
    'MARKETING_AUDIT',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SandboxExtractionStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'ERROR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SandboxPhase" AS ENUM (
    'INTRO',
    'ESTRATEGIA',
    'FINANZAS',
    'OPERACIONES',
    'LEGAL',
    'MARKETING',
    'REPORTE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Tablas ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "sandbox_sessions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pin" TEXT,
    "status" "SandboxStatus" NOT NULL DEFAULT 'DRAFT',
    "franchiseId" TEXT,
    "brandName" TEXT NOT NULL,
    "sector" "SandboxSector" NOT NULL DEFAULT 'RESTAURANTE',
    "country" TEXT NOT NULL,
    "city" TEXT,
    "logoUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#00F0FF',
    "consultantName" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "locale" "SandboxLocale" NOT NULL DEFAULT 'ES',
    "marketingInputs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sandbox_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sandbox_assets" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kind" "SandboxAssetKind" NOT NULL DEFAULT 'OTHER',
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedJson" JSONB,
    "extractionStatus" "SandboxExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "extractionError" TEXT,

    CONSTRAINT "sandbox_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sandbox_preloads" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "offering" JSONB NOT NULL,
    "pains" JSONB NOT NULL,
    "marketing" JSONB NOT NULL,
    "opexSkeleton" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sandbox_preloads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sandbox_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phase" "SandboxPhase" NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sandbox_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sandbox_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "readinessScores" JSONB,
    "headline" TEXT,
    "route" JSONB,
    "financials" JSONB,
    "chosenPain" JSONB,
    "chosenIdea" JSONB,
    "manual" JSONB,
    "legalChecklist" JSONB,
    "reportPdfPath" TEXT,
    "sentToEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sandbox_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sandbox_ai_cache" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sandbox_ai_cache_pkey" PRIMARY KEY ("id")
);

-- ── Índices ─────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "sandbox_sessions_slug_key" ON "sandbox_sessions"("slug");
CREATE INDEX IF NOT EXISTS "sandbox_sessions_status_idx" ON "sandbox_sessions"("status");
CREATE INDEX IF NOT EXISTS "sandbox_sessions_franchiseId_idx" ON "sandbox_sessions"("franchiseId");
CREATE INDEX IF NOT EXISTS "sandbox_assets_sessionId_idx" ON "sandbox_assets"("sessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "sandbox_preloads_sessionId_key" ON "sandbox_preloads"("sessionId");
CREATE INDEX IF NOT EXISTS "sandbox_events_sessionId_createdAt_idx" ON "sandbox_events"("sessionId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "sandbox_results_sessionId_key" ON "sandbox_results"("sessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "sandbox_ai_cache_sessionId_kind_inputHash_key"
  ON "sandbox_ai_cache"("sessionId", "kind", "inputHash");

-- ── Claves foráneas ─────────────────────────────────────────────────────────

DO $$
BEGIN
  ALTER TABLE "sandbox_sessions"
    ADD CONSTRAINT "sandbox_sessions_franchiseId_fkey"
    FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "sandbox_assets"
    ADD CONSTRAINT "sandbox_assets_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "sandbox_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "sandbox_preloads"
    ADD CONSTRAINT "sandbox_preloads_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "sandbox_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "sandbox_events"
    ADD CONSTRAINT "sandbox_events_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "sandbox_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "sandbox_results"
    ADD CONSTRAINT "sandbox_results_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "sandbox_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "sandbox_ai_cache"
    ADD CONSTRAINT "sandbox_ai_cache_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "sandbox_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── RLS: habilitado sin políticas (solo el owner / service role) ────────────

ALTER TABLE "sandbox_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sandbox_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sandbox_preloads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sandbox_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sandbox_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sandbox_ai_cache" ENABLE ROW LEVEL SECURITY;
