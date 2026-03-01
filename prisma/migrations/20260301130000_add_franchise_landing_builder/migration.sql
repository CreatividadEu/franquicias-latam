-- CreateEnum
CREATE TYPE "FranchisePlanTier" AS ENUM ('BASIC', 'PLUS', 'PRO');

-- CreateTable
CREATE TABLE "franchise_profiles" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "subheadline" TEXT NOT NULL DEFAULT '',
    "heroImageUrl" TEXT,
    "heroVideoUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brochureUrl" TEXT,
    "investmentMin" DOUBLE PRECISION,
    "investmentMax" DOUBLE PRECISION,
    "countryCoverage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchise_feature_flags" (
    "franchiseId" TEXT NOT NULL,
    "showVideo" BOOLEAN NOT NULL DEFAULT false,
    "showGallery" BOOLEAN NOT NULL DEFAULT true,
    "showTestimonials" BOOLEAN NOT NULL DEFAULT false,
    "showKpis" BOOLEAN NOT NULL DEFAULT true,
    "showBot" BOOLEAN NOT NULL DEFAULT false,
    "showDownloads" BOOLEAN NOT NULL DEFAULT false,
    "showContactForm" BOOLEAN NOT NULL DEFAULT true,
    "planTier" "FranchisePlanTier" NOT NULL DEFAULT 'BASIC',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_feature_flags_pkey" PRIMARY KEY ("franchiseId")
);

-- CreateTable
CREATE TABLE "franchise_bot_configs" (
    "franchiseId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "systemInstructions" TEXT NOT NULL DEFAULT '',
    "fallbackMessage" TEXT NOT NULL DEFAULT '',
    "tone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_bot_configs_pkey" PRIMARY KEY ("franchiseId")
);

-- CreateTable
CREATE TABLE "franchise_bot_faqs" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_bot_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "franchise_profiles_franchiseId_key" ON "franchise_profiles"("franchiseId");

-- CreateIndex
CREATE INDEX "franchise_bot_faqs_franchiseId_idx" ON "franchise_bot_faqs"("franchiseId");

-- CreateIndex
CREATE INDEX "franchise_bot_faqs_franchiseId_priority_idx" ON "franchise_bot_faqs"("franchiseId", "priority");

-- AddForeignKey
ALTER TABLE "franchise_profiles" ADD CONSTRAINT "franchise_profiles_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_feature_flags" ADD CONSTRAINT "franchise_feature_flags_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_bot_configs" ADD CONSTRAINT "franchise_bot_configs_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_bot_faqs" ADD CONSTRAINT "franchise_bot_faqs_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing franchises with editable landing defaults
INSERT INTO "franchise_profiles" (
    "id",
    "franchiseId",
    "headline",
    "subheadline",
    "heroImageUrl",
    "heroVideoUrl",
    "investmentMin",
    "investmentMax",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    f."id",
    f."name",
    f."description",
    f."logo",
    f."video",
    f."investmentMin",
    f."investmentMax",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "franchises" f
WHERE NOT EXISTS (
    SELECT 1
    FROM "franchise_profiles" fp
    WHERE fp."franchiseId" = f."id"
);

INSERT INTO "franchise_feature_flags" (
    "franchiseId",
    "showVideo",
    "showGallery",
    "showTestimonials",
    "showKpis",
    "showBot",
    "showDownloads",
    "showContactForm",
    "planTier",
    "updatedAt"
)
SELECT
    f."id",
    CASE WHEN f."video" IS NOT NULL AND f."video" <> '' THEN true ELSE false END,
    CASE WHEN f."logo" IS NOT NULL AND f."logo" <> '' THEN true ELSE true END,
    false,
    true,
    false,
    false,
    true,
    'BASIC'::"FranchisePlanTier",
    CURRENT_TIMESTAMP
FROM "franchises" f
WHERE NOT EXISTS (
    SELECT 1
    FROM "franchise_feature_flags" ff
    WHERE ff."franchiseId" = f."id"
);

INSERT INTO "franchise_bot_configs" (
    "franchiseId",
    "enabled",
    "systemInstructions",
    "fallbackMessage",
    "tone",
    "updatedAt"
)
SELECT
    f."id",
    false,
    'Responde solo con la informacion cargada para esta franquicia. Si no encuentras una respuesta clara, usa el mensaje de fallback.',
    'Puedo ayudarte con informacion general de esta franquicia. Si quieres detalles especificos, deja tus datos y un asesor te contacta.',
    'consultivo',
    CURRENT_TIMESTAMP
FROM "franchises" f
WHERE NOT EXISTS (
    SELECT 1
    FROM "franchise_bot_configs" bc
    WHERE bc."franchiseId" = f."id"
);
