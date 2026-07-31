-- SAJÚ Franchise Command Center — migración aditiva.
-- Crea el namespace `saju_*` (CRM de leads, esfuerzos por canal, agenda
-- institucional). No renombra ni altera ningún modelo existente. Escrita de
-- forma idempotente (DO $$ + IF NOT EXISTS) siguiendo la convención del repo,
-- para poder re-aplicarse sobre entornos parcialmente migrados.

-- ── Enums ───────────────────────────────────────────────────────────────────

DO $$
BEGIN
  CREATE TYPE "SajuStage" AS ENUM (
    'PROSPECTO',
    'CONTACTADO',
    'MATERIAL_ENVIADO',
    'PRESENTADO',
    'EVALUACION_INTERNA',
    'NEGOCIACION',
    'FIRMADO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuLeadStatus" AS ENUM ('ACTIVO', 'PAUSADO', 'GANADO', 'PERDIDO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuLeadType" AS ENUM ('PUNTO_UNICO', 'MULTI_UNIDAD', 'MASTER_FRANQUICIA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuInterest" AS ENUM ('ALTO', 'MEDIO', 'BAJO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuChannel" AS ENUM (
    'OUTREACH_SELECTIVO',
    'PR',
    'REELS_ADS',
    'LINKEDIN',
    'LANDING_FORM'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuEffortStatus" AS ENUM ('PLANEADO', 'EN_CURSO', 'COMPLETADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuEventType" AS ENUM ('NOTA', 'TOUCHPOINT', 'CAMBIO_ETAPA', 'REUNION');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SajuMilestoneStatus" AS ENUM ('PROXIMO', 'REALIZADO', 'REPROGRAMADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Tablas ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "saju_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "type" "SajuLeadType" NOT NULL DEFAULT 'PUNTO_UNICO',
    "stage" "SajuStage" NOT NULL DEFAULT 'PROSPECTO',
    "status" "SajuLeadStatus" NOT NULL DEFAULT 'ACTIVO',
    "interest" "SajuInterest" NOT NULL DEFAULT 'MEDIO',
    "keyInsight" TEXT,
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "source" "SajuChannel",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saju_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "saju_lead_events" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "SajuEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saju_lead_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "saju_channel_efforts" (
    "id" TEXT NOT NULL,
    "channel" "SajuChannel" NOT NULL,
    "country" TEXT,
    "title" TEXT NOT NULL,
    "outlet" TEXT,
    "description" TEXT,
    "status" "SajuEffortStatus" NOT NULL DEFAULT 'PLANEADO',
    "plannedFor" TIMESTAMP(3),
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saju_channel_efforts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "saju_milestones" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "counterpart" TEXT NOT NULL,
    "org" TEXT,
    "country" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "tentative" BOOLEAN NOT NULL DEFAULT false,
    "status" "SajuMilestoneStatus" NOT NULL DEFAULT 'PROXIMO',
    "notes" TEXT,

    CONSTRAINT "saju_milestones_pkey" PRIMARY KEY ("id")
);

-- ── Índices ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "saju_leads_country_stage_idx" ON "saju_leads"("country", "stage");
CREATE UNIQUE INDEX IF NOT EXISTS "saju_leads_name_country_key" ON "saju_leads"("name", "country");
CREATE INDEX IF NOT EXISTS "saju_lead_events_leadId_occurredAt_idx" ON "saju_lead_events"("leadId", "occurredAt");
CREATE INDEX IF NOT EXISTS "saju_channel_efforts_channel_status_idx" ON "saju_channel_efforts"("channel", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "saju_channel_efforts_channel_title_key" ON "saju_channel_efforts"("channel", "title");
CREATE INDEX IF NOT EXISTS "saju_milestones_date_idx" ON "saju_milestones"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "saju_milestones_title_date_key" ON "saju_milestones"("title", "date");

-- ── Claves foráneas ─────────────────────────────────────────────────────────

DO $$
BEGIN
  ALTER TABLE "saju_lead_events"
    ADD CONSTRAINT "saju_lead_events_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "saju_leads"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
