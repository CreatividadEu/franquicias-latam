-- Track Twilio provider identifiers and delivery lifecycle for OTP records.
ALTER TABLE "sms_verifications"
ADD COLUMN "providerSid" TEXT,
ADD COLUMN "providerStatus" TEXT,
ADD COLUMN "providerErrorCode" TEXT,
ADD COLUMN "providerErrorMessage" TEXT,
ADD COLUMN "lastStatusAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "sms_verifications_providerSid_key"
ON "sms_verifications"("providerSid");

CREATE INDEX "sms_verifications_phone_createdAt_idx"
ON "sms_verifications"("phone", "createdAt");
