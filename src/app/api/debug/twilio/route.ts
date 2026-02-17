import { NextResponse } from "next/server";
import { getTwilioRuntimeFlags } from "@/lib/twilioConfig";

export const runtime = "nodejs";

function suffix(value: string, size: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > size ? trimmed.slice(-size) : trimmed;
}

export async function GET() {
  const {
    nodeEnv,
    smsConfigured,
    usingMessagingServiceSid,
    providerMode,
    hasSid,
    hasToken,
    hasService,
  } = getTwilioRuntimeFlags();
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const serviceSid = process.env.TWILIO_MESSAGING_SERVICE_SID ?? "";

  return NextResponse.json({
    providerMode,
    nodeEnv,
    smsConfigured,
    hasSid,
    hasToken,
    hasService,
    usingMessagingServiceSid,
    accountSidLast4: suffix(accountSid, 4),
    serviceSidLast6: suffix(serviceSid, 6),
  });
}
