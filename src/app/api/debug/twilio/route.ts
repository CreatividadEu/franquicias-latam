import { NextResponse } from "next/server";
import { getTwilioRuntimeFlags } from "@/lib/twilioConfig";

export async function GET() {
  const { nodeEnv, smsConfigured, usingMessagingServiceSid, providerMode } =
    getTwilioRuntimeFlags();

  if (nodeEnv === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    smsConfigured,
    usingMessagingServiceSid,
    providerMode,
  });
}
