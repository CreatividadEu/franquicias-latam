import { getVerifyServiceSid, getTwilioClient } from "./twilioConfig";

export type TwilioSmsError = {
  code?: string | number;
  message?: string;
};

export type TwilioSmsSendResult = {
  sent: boolean;
  sid?: string;
  error?: {
    code?: string | number;
    message: string;
  };
};

export type TwilioVerifyCheckResult = {
  verified: boolean;
  status?: string;
  error?: {
    code?: string | number;
    message: string;
  };
};

export async function sendVerification(
  phone: string
): Promise<TwilioSmsSendResult> {
  const client = getTwilioClient();
  if (!client) {
    return {
      sent: false,
      error: { message: "Twilio client unavailable" },
    };
  }

  if (!/^\+\d{8,15}$/.test(phone)) {
    return {
      sent: false,
      error: { message: "Invalid phone" },
    };
  }

  try {
    const verification = await client.verify.v2
      .services(getVerifyServiceSid())
      .verifications.create({ to: phone, channel: "sms" });

    return {
      sent: verification.status === "pending",
      sid: verification.sid,
    };
  } catch (error: unknown) {
    const twilioError = error as TwilioSmsError;
    return {
      sent: false,
      error: {
        code: twilioError.code,
        message: twilioError.message ?? "Unknown Twilio error",
      },
    };
  }
}

export async function checkVerification(
  phone: string,
  code: string
): Promise<TwilioVerifyCheckResult> {
  const client = getTwilioClient();
  if (!client) {
    return {
      verified: false,
      error: { message: "Twilio client unavailable" },
    };
  }

  try {
    const result = await client.verify.v2
      .services(getVerifyServiceSid())
      .verificationChecks.create({ to: phone, code });

    return {
      verified: result.status === "approved",
      status: result.status,
    };
  } catch (error: unknown) {
    const twilioError = error as TwilioSmsError;
    return {
      verified: false,
      error: {
        code: twilioError.code,
        message: twilioError.message ?? "Unknown Twilio error",
      },
    };
  }
}
