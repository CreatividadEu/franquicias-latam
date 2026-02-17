import twilio from "twilio";

export type TwilioProviderMode =
  | "twilio_sms"
  | "fallback_db"
  | "error_not_configured";

type TwilioEnv = {
  accountSid: string;
  authToken: string;
  messagingServiceSid: string;
  nodeEnv: string;
};

export type TwilioRuntimeFlags = {
  nodeEnv: string;
  smsConfigured: boolean;
  usingMessagingServiceSid: boolean;
  providerMode: TwilioProviderMode;
  hasSid: boolean;
  hasToken: boolean;
  hasService: boolean;
};

let cachedClient: ReturnType<typeof twilio> | null | undefined;
let cachedClientKey: string | null = null;

export function getTwilioEnv(): TwilioEnv {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() ?? "",
    messagingServiceSid:
      process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() ?? "",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}

function resolveProviderMode(env: TwilioEnv): TwilioProviderMode {
  if (!!env.accountSid && !!env.authToken && !!env.messagingServiceSid) {
    return "twilio_sms";
  }

  if (env.nodeEnv === "production") {
    return "error_not_configured";
  }

  return "fallback_db";
}

export function isSmsConfigured(): boolean {
  const env = getTwilioEnv();
  return !!env.accountSid && !!env.authToken && !!env.messagingServiceSid;
}

export function getTwilioClient(): ReturnType<typeof twilio> | null {
  const env = getTwilioEnv();

  if (!env.accountSid || !env.authToken || !env.messagingServiceSid) {
    cachedClient = null;
    cachedClientKey = null;
    return null;
  }

  const nextKey = `${env.accountSid}:${env.authToken}`;

  if (cachedClient === undefined || cachedClientKey !== nextKey) {
    cachedClient = twilio(env.accountSid, env.authToken);
    cachedClientKey = nextKey;
  }

  return cachedClient;
}

export function getMessagingServiceSid(): string {
  const env = getTwilioEnv();

  if (!env.messagingServiceSid) {
    throw new Error("TWILIO_MESSAGING_SERVICE_SID is not configured");
  }

  return env.messagingServiceSid;
}

export function getProviderMode(): TwilioProviderMode {
  return resolveProviderMode(getTwilioEnv());
}

export function getTwilioRuntimeFlags(): TwilioRuntimeFlags {
  const env = getTwilioEnv();
  const hasSid = !!env.accountSid;
  const hasToken = !!env.authToken;
  const hasService = !!env.messagingServiceSid;
  const smsConfigured = hasSid && hasToken && hasService;

  return {
    nodeEnv: env.nodeEnv,
    smsConfigured,
    usingMessagingServiceSid: hasService,
    providerMode: resolveProviderMode(env),
    hasSid,
    hasToken,
    hasService,
  };
}
