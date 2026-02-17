-- Ensure sms_verifications has channel tracking for OTP delivery source.
-- Idempotent migration to safely patch environments with schema drift.
ALTER TABLE "sms_verifications"
ADD COLUMN IF NOT EXISTS "channel" TEXT DEFAULT 'sms';

UPDATE "sms_verifications"
SET "channel" = 'sms'
WHERE "channel" IS NULL;
