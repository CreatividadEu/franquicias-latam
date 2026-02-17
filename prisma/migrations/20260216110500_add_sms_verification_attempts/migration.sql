-- Add attempt counter for OTP brute-force protection.
-- Backward compatible: existing rows default to 0 attempts.
ALTER TABLE "sms_verifications"
ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
