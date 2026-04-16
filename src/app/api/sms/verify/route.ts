import { NextResponse } from "next/server";
import { checkVerification } from "@/lib/twilio";
import { getTwilioRuntimeFlags } from "@/lib/twilioConfig";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const startedAt = Date.now();
    const { smsConfigured, nodeEnv } = getTwilioRuntimeFlags();

    const body = await request.json().catch(() => ({}));
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    console.log("[sms/verify] request received", {
      codeProvided: !!code,
      env: nodeEnv,
    });

    const phoneValid = /^\+?\d{7,15}$/.test(phone);
    if (!phoneValid || !code) {
      return NextResponse.json(
        { error: "Telefono y codigo son requeridos" },
        { status: 400 }
      );
    }

    if (!smsConfigured) {
      // Dev fallback: no Twilio credentials, accept any code
      await stampVerified(phone);
      const response = NextResponse.json({ verified: true });
      console.log("[sms/verify] dev fallback — bypassed", {
        ms: Date.now() - startedAt,
      });
      return response;
    }

    const { verified, error: twilioError } = await checkVerification(
      phone,
      code
    );

    if (!verified) {
      console.warn("[sms/verify] verification failed", {
        code: twilioError?.code,
        message: twilioError?.message,
      });
      return NextResponse.json(
        { error: "Codigo invalido o expirado" },
        { status: 400 }
      );
    }

    // Persist a verified-phone stamp so /api/leads can confirm the phone was verified
    await stampVerified(phone);

    const response = NextResponse.json({ verified: true });
    console.log("[sms/verify] response sent", { ms: Date.now() - startedAt });
    return response;
  } catch (error) {
    console.error("[sms/verify] unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * Write (or refresh) a verified-phone record so downstream gates (e.g. /api/leads)
 * can confirm the phone was verified within the last hour.
 * The `code` field is a required DB column; we use a sentinel value since no
 * OTP is generated or compared here — Twilio Verify handles that.
 */
async function stampVerified(phone: string): Promise<void> {
  await prisma.smsVerification.deleteMany({ where: { phone } });
  await prisma.smsVerification.create({
    data: {
      phone,
      code: "twilio-verify",
      verified: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });
}
