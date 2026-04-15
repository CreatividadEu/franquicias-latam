import { prisma } from "@/lib/prisma";
import { getTwilioEnv } from "@/lib/twilioConfig";
import twilio from "twilio";

export const runtime = "nodejs";

type TwilioCallbackParams = Record<string, string>;

function getFirstString(
  source: FormData,
  key: string
): string | null {
  const value = source.get(key);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed || null;
}

function maskPhone(phone: string | null): string {
  if (!phone) return "***";

  const digits = phone.replace(/\D/g, "");
  const visible = digits.slice(-4);
  return visible ? `***${visible}` : "***";
}

function buildParams(formData: FormData): TwilioCallbackParams {
  const params: TwilioCallbackParams = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      params[key] = value;
    }
  }

  return params;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const params = buildParams(formData);
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const { authToken } = getTwilioEnv();

  if (!authToken || !twilio.validateRequest(authToken, signature, request.url, params)) {
    console.warn("[twilio/status] invalid signature");
    return new Response("invalid signature", { status: 403 });
  }

  const providerSid = getFirstString(formData, "MessageSid");
  const providerStatus = getFirstString(formData, "MessageStatus");
  const providerErrorCode = getFirstString(formData, "ErrorCode");
  const providerErrorMessage = getFirstString(formData, "ErrorMessage");
  const phone = getFirstString(formData, "To");

  const updateData = {
    providerSid,
    providerStatus,
    providerErrorCode,
    providerErrorMessage,
    lastStatusAt: new Date(),
  };

  let updatedCount = 0;

  if (providerSid) {
    const bySid = await prisma.smsVerification.updateMany({
      where: { providerSid },
      data: updateData,
    });
    updatedCount = bySid.count;
  }

  if (!updatedCount && phone) {
    const byPhone = await prisma.smsVerification.updateMany({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      data: updateData,
    });
    updatedCount = byPhone.count;
  }

  console.log("[twilio/status] callback", {
    providerSid,
    providerStatus,
    providerErrorCode,
    phoneMasked: maskPhone(phone),
    updatedCount,
  });

  return new Response("ok");
}
