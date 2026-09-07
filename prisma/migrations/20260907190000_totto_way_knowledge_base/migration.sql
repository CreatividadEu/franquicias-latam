-- Totto Way — base de conocimiento del Asistente y analítica de preguntas.
--
-- La recuperación del Asistente va por full-text de Postgres en español
-- (decisión D3 del PLAN: todavía sin proveedor de embeddings). La columna
-- `tsv` es GENERATED ALWAYS, así que se mantiene sola en cada escritura, y su
-- índice GIN es el que sostiene la búsqueda. Prisma no expresa ninguna de las
-- dos cosas, así que viven solo aquí.
--
-- Aditiva e idempotente, como el resto del namespace tw_*.

DO $$
BEGIN
  CREATE TYPE "TwKbSource" AS ENUM ('CHAPTER', 'LESSON', 'BENEFIT', 'INSPIRE', 'SOP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "tw_knowledge_chunks" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "source" "TwKbSource" NOT NULL,
    "sourceId" TEXT,
    "locator" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_knowledge_chunks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tw_assistant_question_stats" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "normalizedQuestion" TEXT NOT NULL,
    "sample" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastAskedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tw_assistant_question_stats_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tw_knowledge_chunks_franchiseId_source_idx" ON "tw_knowledge_chunks"("franchiseId", "source");

CREATE INDEX IF NOT EXISTS "tw_knowledge_chunks_source_sourceId_idx" ON "tw_knowledge_chunks"("source", "sourceId");

CREATE INDEX IF NOT EXISTS "tw_assistant_question_stats_franchiseId_count_idx" ON "tw_assistant_question_stats"("franchiseId", "count");

CREATE UNIQUE INDEX IF NOT EXISTS "tw_assistant_question_stats_franchiseId_normalizedQuestion_key" ON "tw_assistant_question_stats"("franchiseId", "normalizedQuestion");

DO $$
BEGIN
  ALTER TABLE "tw_knowledge_chunks" ADD CONSTRAINT "tw_knowledge_chunks_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "tw_assistant_question_stats" ADD CONSTRAINT "tw_assistant_question_stats_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Full-text en español ────────────────────────────────────────────────────
-- El título pesa más que el cuerpo (setweight A/B) para que "Geovictoria"
-- traiga primero la lección de Geovictoria y no cualquier párrafo que la cite.

ALTER TABLE "tw_knowledge_chunks"
  ADD COLUMN IF NOT EXISTS "tsv" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce("text", '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS "tw_knowledge_chunks_tsv_idx"
  ON "tw_knowledge_chunks" USING GIN ("tsv");

-- ── RLS: habilitado sin políticas (solo el owner / service role) ────────────

ALTER TABLE "tw_knowledge_chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tw_assistant_question_stats" ENABLE ROW LEVEL SECURITY;
