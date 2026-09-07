-- Totto Way — paso 2/2: LMS de formación en tienda de TOTTO.
-- Crea el namespace `tw_*` (organización, contenido, progreso, gamificación,
-- inspira, beneficios, asistente) y añade `users.franchiseId` para el scoping
-- por marca. Migración aditiva: no altera columnas existentes.
-- Escrita de forma idempotente (IF NOT EXISTS / DO $$) siguiendo la
-- convención del repo, para poder re-aplicarse sobre entornos parciales.
--
-- Seguridad: las tablas quedan con RLS habilitado y SIN políticas. Prisma
-- entra como owner (bypassa RLS); la Data API de Supabase no puede leerlas.
-- Ver docs/totto-way/PLAN.md §3.

-- ── Enums ───────────────────────────────────────────────────────────────────

DO $$
BEGIN
  CREATE TYPE "TwChapterStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwLessonType" AS ENUM ('READING', 'VIDEO', 'CHECKLIST', 'CHECKPOINT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwXpSource" AS ENUM ('LESSON', 'QUIZ', 'CHECKPOINT', 'ATTENDANCE', 'NPS', 'INSPIRE', 'MANUAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwBadgeCode" AS ENUM ('EXPLORADOR', 'GUIA', 'LIDER_RUTA', 'CUMBRE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwLeagueEntity" AS ENUM ('STORE', 'USER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwSeasonStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwMilestoneType" AS ENUM ('JOINED', 'CHAPTER_DONE', 'BADGE', 'NPS', 'STREAK', 'PROMOTION', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwInspireType" AS ENUM ('PODCAST', 'ARTICLE', 'VIDEO', 'MESSAGE', 'STORY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwMediaKind" AS ENUM ('VIDEO', 'POSTER', 'SUBTITLE', 'PDF', 'IMAGE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwMediaStatus" AS ENUM ('UPLOADED', 'READY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TwAssistantRole" AS ENUM ('USER', 'ASSISTANT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── users.franchiseId ───────────────────────────────────────────────────────

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "franchiseId" TEXT;

-- ── Tablas ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "tw_settings" (
    "franchiseId" TEXT NOT NULL,
    "showGamification" BOOLEAN NOT NULL DEFAULT true,
    "sequentialUnlock" BOOLEAN NOT NULL DEFAULT true,
    "dailyReminderHour" INTEGER NOT NULL DEFAULT 9,
    "leagueEnabledCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_settings_pkey" PRIMARY KEY ("franchiseId")
);

CREATE TABLE IF NOT EXISTS "tw_stores" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CO',
    "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_stores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_employees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "storeId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardedAt" TIMESTAMP(3),
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "locale" TEXT NOT NULL DEFAULT 'es',
    "prefs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_store_access" (
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "tw_store_access_pkey" PRIMARY KEY ("userId","storeId")
);

CREATE TABLE IF NOT EXISTS "tw_chapters" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#FCCE01',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "TwChapterStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "publishedSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_chapters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_missions" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tw_missions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_lessons" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "TwLessonType" NOT NULL DEFAULT 'READING',
    "minutes" INTEGER NOT NULL DEFAULT 5,
    "xp" INTEGER NOT NULL DEFAULT 50,
    "order" INTEGER NOT NULL DEFAULT 0,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "keyTakeaway" TEXT NOT NULL DEFAULT '',
    "ruleBanner" TEXT,
    "videoAssetId" TEXT,
    "posterUrl" TEXT,
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "docRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_quizzes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "passScore" INTEGER NOT NULL DEFAULT 3,
    "bonusXp" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "tw_quizzes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_checkpoints" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL DEFAULT '',
    "xp" INTEGER NOT NULL DEFAULT 150,
    "validatorRole" "UserRole" NOT NULL DEFAULT 'TW_LIDER_TIENDA',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tw_checkpoints_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_media_assets" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "kind" "TwMediaKind" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "durationSec" INTEGER,
    "status" "TwMediaStatus" NOT NULL DEFAULT 'UPLOADED',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_media_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_lesson_progress" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "TwProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "videoSeconds" INTEGER NOT NULL DEFAULT 0,
    "videoDuration" INTEGER,
    "quizScore" INTEGER,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_lesson_progress_pkey" PRIMARY KEY ("userId","lessonId")
);

CREATE TABLE IF NOT EXISTS "tw_checkpoint_validations" (
    "checkpointId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validatedBy" TEXT NOT NULL,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpAwarded" INTEGER NOT NULL DEFAULT 150,

    CONSTRAINT "tw_checkpoint_validations_pkey" PRIMARY KEY ("checkpointId","userId")
);

CREATE TABLE IF NOT EXISTS "tw_xp_events" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "source" "TwXpSource" NOT NULL,
    "points" INTEGER NOT NULL,
    "dayKey" TEXT NOT NULL,
    "refId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_xp_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_badges" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "code" "TwBadgeCode" NOT NULL,
    "name" TEXT NOT NULL,
    "minXp" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'compass',

    CONSTRAINT "tw_badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_user_badges" (
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_user_badges_pkey" PRIMARY KEY ("userId","badgeId")
);

CREATE TABLE IF NOT EXISTS "tw_league_seasons" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "prizeText" TEXT NOT NULL DEFAULT '',
    "status" "TwSeasonStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_league_seasons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_league_scores" (
    "seasonId" TEXT NOT NULL,
    "entityType" "TwLeagueEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "prevPosition" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_league_scores_pkey" PRIMARY KEY ("seasonId","entityType","entityId")
);

CREATE TABLE IF NOT EXISTS "tw_league_snapshots" (
    "seasonId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "entityType" "TwLeagueEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "tw_league_snapshots_pkey" PRIMARY KEY ("seasonId","weekKey","entityType","entityId")
);

CREATE TABLE IF NOT EXISTS "tw_journey_milestones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TwMilestoneType" NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT NOT NULL DEFAULT 'flag',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_journey_milestones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_inspire_items" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "type" "TwInspireType" NOT NULL,
    "title" TEXT NOT NULL,
    "who" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',
    "lengthMin" INTEGER NOT NULL DEFAULT 0,
    "mediaUrl" TEXT,
    "externalUrl" TEXT,
    "quote" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tw_inspire_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_benefits" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'star',
    "eligibilityRoles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tw_benefits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_assistant_threads" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_assistant_threads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_assistant_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "TwAssistantRole" NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "toolCalls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_assistant_messages_pkey" PRIMARY KEY ("id")
);

-- ── Índices ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "tw_stores_franchiseId_idx" ON "tw_stores"("franchiseId");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_stores_franchiseId_code_key" ON "tw_stores"("franchiseId", "code");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_employees_userId_key" ON "tw_employees"("userId");
CREATE INDEX IF NOT EXISTS "tw_employees_storeId_idx" ON "tw_employees"("storeId");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_employees_franchiseId_employeeCode_key" ON "tw_employees"("franchiseId", "employeeCode");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_chapters_franchiseId_number_key" ON "tw_chapters"("franchiseId", "number");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_chapters_franchiseId_slug_key" ON "tw_chapters"("franchiseId", "slug");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_missions_chapterId_code_key" ON "tw_missions"("chapterId", "code");
CREATE INDEX IF NOT EXISTS "tw_lessons_missionId_idx" ON "tw_lessons"("missionId");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_lessons_chapterId_slug_key" ON "tw_lessons"("chapterId", "slug");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_quizzes_lessonId_key" ON "tw_quizzes"("lessonId");
CREATE INDEX IF NOT EXISTS "tw_checkpoints_chapterId_idx" ON "tw_checkpoints"("chapterId");
CREATE INDEX IF NOT EXISTS "tw_media_assets_franchiseId_kind_idx" ON "tw_media_assets"("franchiseId", "kind");
CREATE INDEX IF NOT EXISTS "tw_lesson_progress_lessonId_idx" ON "tw_lesson_progress"("lessonId");
CREATE INDEX IF NOT EXISTS "tw_xp_events_userId_source_dayKey_idx" ON "tw_xp_events"("userId", "source", "dayKey");
CREATE INDEX IF NOT EXISTS "tw_xp_events_franchiseId_createdAt_idx" ON "tw_xp_events"("franchiseId", "createdAt");
CREATE INDEX IF NOT EXISTS "tw_xp_events_storeId_createdAt_idx" ON "tw_xp_events"("storeId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "tw_badges_franchiseId_code_key" ON "tw_badges"("franchiseId", "code");
CREATE INDEX IF NOT EXISTS "tw_league_seasons_franchiseId_status_idx" ON "tw_league_seasons"("franchiseId", "status");
CREATE INDEX IF NOT EXISTS "tw_journey_milestones_userId_date_idx" ON "tw_journey_milestones"("userId", "date");
CREATE INDEX IF NOT EXISTS "tw_inspire_items_franchiseId_publishedAt_idx" ON "tw_inspire_items"("franchiseId", "publishedAt");
CREATE INDEX IF NOT EXISTS "tw_benefits_franchiseId_idx" ON "tw_benefits"("franchiseId");
CREATE INDEX IF NOT EXISTS "tw_assistant_threads_userId_createdAt_idx" ON "tw_assistant_threads"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "tw_assistant_messages_threadId_createdAt_idx" ON "tw_assistant_messages"("threadId", "createdAt");
CREATE INDEX IF NOT EXISTS "users_franchiseId_idx" ON "users"("franchiseId");

-- ── Claves foráneas ─────────────────────────────────────────────────────────

DO $$
BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_settings" ADD CONSTRAINT "tw_settings_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_stores" ADD CONSTRAINT "tw_stores_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_employees" ADD CONSTRAINT "tw_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_employees" ADD CONSTRAINT "tw_employees_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_employees" ADD CONSTRAINT "tw_employees_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tw_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_store_access" ADD CONSTRAINT "tw_store_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_store_access" ADD CONSTRAINT "tw_store_access_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tw_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_chapters" ADD CONSTRAINT "tw_chapters_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_missions" ADD CONSTRAINT "tw_missions_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "tw_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_lessons" ADD CONSTRAINT "tw_lessons_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "tw_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_lessons" ADD CONSTRAINT "tw_lessons_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "tw_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_lessons" ADD CONSTRAINT "tw_lessons_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "tw_media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_quizzes" ADD CONSTRAINT "tw_quizzes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "tw_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_checkpoints" ADD CONSTRAINT "tw_checkpoints_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "tw_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_media_assets" ADD CONSTRAINT "tw_media_assets_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_lesson_progress" ADD CONSTRAINT "tw_lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_lesson_progress" ADD CONSTRAINT "tw_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "tw_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_checkpoint_validations" ADD CONSTRAINT "tw_checkpoint_validations_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "tw_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_checkpoint_validations" ADD CONSTRAINT "tw_checkpoint_validations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_checkpoint_validations" ADD CONSTRAINT "tw_checkpoint_validations_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_xp_events" ADD CONSTRAINT "tw_xp_events_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_xp_events" ADD CONSTRAINT "tw_xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_xp_events" ADD CONSTRAINT "tw_xp_events_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tw_stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_badges" ADD CONSTRAINT "tw_badges_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_user_badges" ADD CONSTRAINT "tw_user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_user_badges" ADD CONSTRAINT "tw_user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "tw_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_league_seasons" ADD CONSTRAINT "tw_league_seasons_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_league_scores" ADD CONSTRAINT "tw_league_scores_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "tw_league_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_league_snapshots" ADD CONSTRAINT "tw_league_snapshots_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "tw_league_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_journey_milestones" ADD CONSTRAINT "tw_journey_milestones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_inspire_items" ADD CONSTRAINT "tw_inspire_items_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_benefits" ADD CONSTRAINT "tw_benefits_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_assistant_threads" ADD CONSTRAINT "tw_assistant_threads_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_assistant_threads" ADD CONSTRAINT "tw_assistant_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_assistant_messages" ADD CONSTRAINT "tw_assistant_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "tw_assistant_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── RLS: habilitado sin políticas (solo el owner / service role) ────────────

ALTER TABLE "tw_assistant_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_assistant_threads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_benefits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_chapters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_checkpoint_validations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_checkpoints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_inspire_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_journey_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_league_scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_league_seasons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_league_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_lesson_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_missions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_quizzes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_store_access" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_stores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_user_badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_xp_events" ENABLE ROW LEVEL SECURITY;
