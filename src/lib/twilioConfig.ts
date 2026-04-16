import twilio from "twilio";

export type TwilioProviderMode =
  | "twilio_verify"
  | "fallback_db"
  | "error_not_configured";

type TwilioEnv = {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
  nodeEnv: string;
};

export type TwilioRuntimeFlags = {
  nodeEnv: string;
  smsConfigured: boolean;
  providerMode: TwilioProviderMode;
  hasSid: boolean;
  hasToken: boolean;
  hasVerifyService: boolean;
};

let cachedClient: ReturnType<typeof twilio> | null | undefined;
let cachedClientKey: string | null = null;

export function getTwilioEnv(): TwilioEnv {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() ?? "",
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID?.trim() ?? "",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}

function resolveProviderMode(env: TwilioEnv): TwilioProviderMode {
  if (!!env.accountSid && !!env.authToken && !!env.verifyServiceSid) {
    return "twilio_verify";
  }

  if (env.nodeEnv === "production") {
    return "error_not_configured";
  }

  return "fallback_db";
}

export function isSmsConfigured(): boolean {
  const env = getTwilioEnv();
  return !!env.accountSid && !!env.authToken && !!env.verifyServiceSid;
}

export function getTwilioClient(): ReturnType<typeof twilio> | null {
  const env = getTwilioEnv();

  if (!env.accountSid || !env.authToken) {
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

export function getVerifyServiceSid(): string {
  const env = getTwilioEnv();

  if (!env.verifyServiceSid) {
    throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured");
  }

  return env.verifyServiceSid;
}

export function getProviderMode(): TwilioProviderMode {
  return resolveProviderMode(getTwilioEnv());
}

export function getTwilioRuntimeFlags(): TwilioRuntimeFlags {
  const env = getTwilioEnv();
  const hasSid = !!env.accountSid;
  const hasToken = !!env.authToken;
  const hasVerifyService = !!env.verifyServiceSid;
  const smsConfigured = hasSid && hasToken && hasVerifyService;

  return {
    nodeEnv: env.nodeEnv,
    smsConfigured,
    providerMode: resolveProviderMode(env),
    hasSid,
    hasToken,
    hasVerifyService,
  };
}
