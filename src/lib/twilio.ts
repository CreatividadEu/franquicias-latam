import {
  getMessagingServiceSid,
  getTwilioClient,
  getTwilioStatusCallbackUrl,
} from "./twilioConfig";

export type TwilioSmsError = {
  code?: string | number;
  message?: string;
};

export type TwilioSmsSendResult = {
  sent: boolean;
  sid?: string;
  status?: string;
  error?: {
    code?: string | number;
    message: string;
  };
};

export async function sendSmsOtpWithDetails(
  phone: string,
  code: string
): Promise<TwilioSmsSendResult> {
  const client = getTwilioClient();
  if (!client) {
    return {
      sent: false,
      error: { message: "Twilio client unavailable" },
    };
  }

  // Light validation before calling Twilio API.
  if (!/^\+\d{8,15}$/.test(phone)) {
    return {
      sent: false,
      error: { message: "Invalid phone" },
    };
  }

  const messagingServiceSid = getMessagingServiceSid();
  const statusCallback = getTwilioStatusCallbackUrl();

  try {
    const message = await client.messages.create({
      to: phone,
      messagingServiceSid,
      body: `Tu código de verificación de Franquicias LATAM es: ${code}`,
      ...(statusCallback ? { statusCallback } : {}),
    });

    return {
      sent: !!message.sid,
      sid: message.sid,
      status: message.status,
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
