import { NextResponse } from "next/server";
import { sendSmsOtpWithDetails } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { getTwilioRuntimeFlags } from "@/lib/twilioConfig";
import { generateOTP } from "@/lib/utils";

/**
 * Manual Test Checklist:
 * 1. Restart the server after env changes.
 * 2. GET /api/debug/twilio and confirm providerMode.
 * 3. POST /api/sms/send with a real phone number.
 * 4. Check Twilio Console -> Monitor -> Messaging logs for outgoing SMS.
 * 5. If there are no Twilio Messaging logs, the request never reached Twilio.
 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const visible = digits.slice(-4);
  return visible ? `***${visible}` : "***";
}

export async function POST(request: Request) {
  try {
    const { nodeEnv, smsConfigured, usingMessagingServiceSid, providerMode } =
      getTwilioRuntimeFlags();

    const cleanupResult = await prisma.smsVerification.deleteMany({
      where: {
        verified: false,
        expiresAt: { lt: new Date() },
      },
    });

    const body = await request.json().catch(() => ({}));
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    console.log("[sms/send] request", {
      providerMode,
      nodeEnv,
      smsConfigured,
      usingMessagingServiceSid,
      phoneMasked: maskPhone(phone),
    });

    const phoneValid = /^\+?\d{7,15}$/.test(phone);
    if (!phoneValid) {
      return NextResponse.json(
        { error: "Numero de telefono invalido" },
        { status: 400 }
      );
    }

    if (providerMode === "error_not_configured") {
      console.warn("[sms/send] twilio missing in production");
      return NextResponse.json(
        { error: "Twilio is not configured" },
        { status: 500 }
      );
    }

    // Rate limit: max 3 attempts per phone per hour (only in production)
    if (nodeEnv !== "development") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentAttempts = await prisma.smsVerification.count({
        where: {
          phone,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentAttempts >= 3) {
        console.warn("[sms/send] rate limited");
        return NextResponse.json(
          { error: "Demasiados intentos. Intenta en 1 hora." },
          { status: 429 }
        );
      }
    }

    const latestVerification = await prisma.smsVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (
      latestVerification &&
      Date.now() - latestVerification.createdAt.getTime() < 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Espera unos segundos antes de solicitar otro código" },
        { status: 429 }
      );
    }

    const code = generateOTP();

    // Delete old unverified codes for this phone to prevent confusion
    await prisma.smsVerification.deleteMany({
      where: {
        phone,
        verified: false,
      },
    });

    await prisma.smsVerification.create({
      data: {
        phone,
        code,
        channel: "sms",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    if (!smsConfigured) {
      return NextResponse.json({ ok: true });
    }

    const { sent, error: twilioError } = await sendSmsOtpWithDetails(phone, code);

    if (!sent) {
      console.warn("[sms/send] twilio sms send failed", {
        code: twilioError?.code,
        message: twilioError?.message,
      });
      return NextResponse.json(
        { error: "No se pudo enviar el SMS" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[sms/send] unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
