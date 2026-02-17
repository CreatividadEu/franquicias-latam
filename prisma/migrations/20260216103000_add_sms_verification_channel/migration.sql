-- Add optional channel tracking to SMS verifications.
-- Backward compatible: existing and future rows default to "sms".
ALTER TABLE "sms_verifications"
ADD COLUMN "channel" TEXT DEFAULT 'sms';

UPDATE "sms_verifications"
SET "channel" = 'sms'
WHERE "channel" IS NULL;
