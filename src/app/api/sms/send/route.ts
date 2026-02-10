import { NextResponse } from "next/server";
import { sendVerificationCode } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const startedAt = Date.now();
    const twilioConfigured =
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_VERIFY_SERVICE_SID;

    const body = await request.json().catch(() => ({}));
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    console.log("[sms/send] request received", {
      phone,
      twilioConfigured,
      env: process.env.NODE_ENV,
    });

    const phoneValid = /^\+?\d{7,15}$/.test(phone);
    if (!phoneValid) {
      console.log("[sms/send] invalid phone");
      return NextResponse.json(
        { error: "Numero de telefono invalido" },
        { status: 400 }
      );
    }

    if (!twilioConfigured && process.env.NODE_ENV !== "development") {
      console.log("[sms/send] twilio missing in production");
      return NextResponse.json(
        { error: "Twilio is not configured" },
        { status: 500 }
      );
    }

    // Rate limit: max 3 attempts per phone per hour (only in production)
    if (process.env.NODE_ENV !== "development") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentAttempts = await prisma.smsVerification.count({
        where: {
          phone,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentAttempts >= 3) {
        console.log("[sms/send] rate limited");
        return NextResponse.json(
          { error: "Demasiados intentos. Intenta en 1 hora." },
          { status: 429 }
        );
      }
    } else {
      console.log("[sms/send] rate limit disabled in development");
    }

    if (!twilioConfigured) {
      console.log("[sms/send] dev fallback path");
      // Use hardcoded code for easier testing in development
      const code = process.env.NODE_ENV === "development" ? "123456" : generateOTP();

      // Delete old unverified codes for this phone to prevent confusion
      const deleted = await prisma.smsVerification.deleteMany({
        where: {
          phone,
          verified: false,
        },
      });

      if (deleted.count > 0) {
        console.log("[sms/send] 🗑️ deleted", deleted.count, "old verification(s)");
      }

      const verification = await prisma.smsVerification.create({
        data: {
          phone,
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      console.log("[sms/send] ✅ DEV CODE:", code, "for phone:", phone, "| ID:", verification.id, "| Expires:", verification.expiresAt.toISOString());

      const response = NextResponse.json({
        ok: true,
        ...(process.env.NODE_ENV === "development" ? { code } : {}),
      });
      console.log("[sms/send] response sent", { ms: Date.now() - startedAt });
      return response;
    }

    console.log("[sms/send] twilio path");
    const sent = await sendVerificationCode(phone);

    if (!sent) {
      console.log("[sms/send] twilio send failed");
      return NextResponse.json(
        { error: "No se pudo enviar el SMS" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true });
    console.log("[sms/send] response sent", { ms: Date.now() - startedAt });
    return response;
  } catch (error) {
    console.error("[sms/send] unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
