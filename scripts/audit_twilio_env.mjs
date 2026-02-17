#!/usr/bin/env node

import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local"), quiet: true });
loadEnv({ path: resolve(process.cwd(), ".env"), override: false, quiet: true });

const nodeEnv = process.env.NODE_ENV ?? "development";

const hasAccountSid = Boolean(process.env.TWILIO_ACCOUNT_SID);
const hasAuthToken = Boolean(process.env.TWILIO_AUTH_TOKEN);
const hasMessagingServiceSid = Boolean(process.env.TWILIO_MESSAGING_SERVICE_SID);

const isSmsConfigured = () =>
  hasAccountSid && hasAuthToken && hasMessagingServiceSid;
const smsConfigured = isSmsConfigured();
const usingMessagingServiceSid = hasMessagingServiceSid;
const getProviderMode = () => {
  if (smsConfigured) return "twilio_sms";
  if (nodeEnv === "production") return "error_not_configured";
  return "fallback_db";
};
const providerMode = getProviderMode();

const effectiveOtpSendMode =
  providerMode === "twilio_sms" ? "sms" : providerMode;

console.log(
  JSON.stringify(
    {
      nodeEnv,
      hasAccountSid,
      hasAuthToken,
      hasMessagingServiceSid,
      smsConfigured,
      usingMessagingServiceSid,
      providerMode,
      effectiveOtpSendMode,
    },
    null,
    2
  )
);
