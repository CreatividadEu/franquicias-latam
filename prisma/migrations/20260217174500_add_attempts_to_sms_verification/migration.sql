-- Ensure sms_verifications includes brute-force attempt tracking.
-- Idempotent migration to safely patch environments with schema drift.
ALTER TABLE "sms_verifications"
ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;
