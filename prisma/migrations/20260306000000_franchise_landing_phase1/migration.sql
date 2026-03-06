-- AlterTable: add hero, reviews, navbar fields to franchise_profiles
ALTER TABLE "franchise_profiles"
  ADD COLUMN IF NOT EXISTS "heroTitle"         TEXT,
  ADD COLUMN IF NOT EXISTS "heroSubtitle"      TEXT,
  ADD COLUMN IF NOT EXISTS "heroCtaLabel"      TEXT,
  ADD COLUMN IF NOT EXISTS "heroStats"         JSONB,
  ADD COLUMN IF NOT EXISTS "showReviewsBadge"  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reviewRating"      DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "reviewBadgeLabel"  TEXT,
  ADD COLUMN IF NOT EXISTS "reviewAvatarUrls"  JSONB,
  ADD COLUMN IF NOT EXISTS "showFranchiseLogo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "franchiseLogoUrl"  TEXT;
