DO $$
BEGIN
  CREATE TYPE "ListingType" AS ENUM (
    'ACTIVE_FRANCHISE',
    'EXTERNAL_FRANCHISE',
    'IDENTIFIED_BRAND'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM (
    'VERIFIED_BY_FL',
    'NOT_VERIFIED',
    'UNDER_REVIEW'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "InterestCtaMode" AS ENUM (
    'APPLY',
    'REQUEST_INFO',
    'EXPLORE_BRAND',
    'JOIN_INTEREST'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "franchises"
  ADD COLUMN IF NOT EXISTS "listingType" "ListingType" NOT NULL DEFAULT 'ACTIVE_FRANCHISE',
  ADD COLUMN IF NOT EXISTS "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'VERIFIED_BY_FL',
  ADD COLUMN IF NOT EXISTS "editorialBadge" TEXT,
  ADD COLUMN IF NOT EXISTS "publicInterestCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "publicInterestEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publicInterestLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "interestCtaMode" "InterestCtaMode" NOT NULL DEFAULT 'APPLY',
  ADD COLUMN IF NOT EXISTS "availabilityLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "statusDisclaimer" TEXT,
  ADD COLUMN IF NOT EXISTS "showApplicationForm" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showFinancialData" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT false;

UPDATE "franchises" AS f
SET
  "showVerifiedBadge" = COALESCE(cfg."showVerifiedBadge", f."showVerifiedBadge"),
  "showFinancialData" = COALESCE(cfg."financialsEnabled", f."showFinancialData")
FROM "franchise_module_configs" AS cfg
WHERE cfg."franchiseId" = f."id";

ALTER TABLE "form_leads"
  ADD COLUMN IF NOT EXISTS "listingSlug" TEXT,
  ADD COLUMN IF NOT EXISTS "listingType" "ListingType" NOT NULL DEFAULT 'ACTIVE_FRANCHISE',
  ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'franchise_application',
  ADD COLUMN IF NOT EXISTS "editorialBadge" TEXT,
  ADD COLUMN IF NOT EXISTS "cityInterest" TEXT,
  ADD COLUMN IF NOT EXISTS "country" TEXT,
  ADD COLUMN IF NOT EXISTS "message" TEXT;

UPDATE "form_leads"
SET
  "listingSlug" = COALESCE("listingSlug", "franchiseSlug"),
  "cityInterest" = COALESCE("cityInterest", "city");

CREATE INDEX IF NOT EXISTS "form_leads_listingSlug_idx" ON "form_leads"("listingSlug");
CREATE INDEX IF NOT EXISTS "form_leads_listingType_idx" ON "form_leads"("listingType");
CREATE INDEX IF NOT EXISTS "form_leads_sourceType_idx" ON "form_leads"("sourceType");
