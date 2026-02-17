import twilio from "twilio";

export type TwilioProviderMode =
  | "twilio_sms"
  | "fallback_db"
  | "error_not_configured";

const nodeEnv = process.env.NODE_ENV ?? "development";
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
const twilioMessagingServiceSid =
  process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() ?? "";

let cachedClient: ReturnType<typeof twilio> | null | undefined;

export function isSmsConfigured(): boolean {
  return !!twilioAccountSid && !!twilioAuthToken && !!twilioMessagingServiceSid;
}

export function getTwilioClient(): ReturnType<typeof twilio> | null {
  if (!isSmsConfigured()) {
    return null;
  }

  if (cachedClient === undefined) {
    cachedClient = twilio(twilioAccountSid, twilioAuthToken);
  }

  return cachedClient;
}

export function getMessagingServiceSid(): string {
  if (!twilioMessagingServiceSid) {
    throw new Error("TWILIO_MESSAGING_SERVICE_SID is not configured");
  }

  return twilioMessagingServiceSid;
}

export function getProviderMode(): TwilioProviderMode {
  if (isSmsConfigured()) {
    return "twilio_sms";
  }

  if (nodeEnv === "production") {
    return "error_not_configured";
  }

  return "fallback_db";
}

export function getTwilioRuntimeFlags(): {
  nodeEnv: string;
  smsConfigured: boolean;
  usingMessagingServiceSid: boolean;
  providerMode: TwilioProviderMode;
} {
  const smsConfigured = isSmsConfigured();
  return {
    nodeEnv,
    smsConfigured,
    usingMessagingServiceSid: !!twilioMessagingServiceSid,
    providerMode: getProviderMode(),
  };
}
