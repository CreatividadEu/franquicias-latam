import { NextResponse } from "next/server";
import { checkVerificationCode } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const startedAt = Date.now();
    const twilioConfigured =
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_VERIFY_SERVICE_SID;

    const body = await request.json().catch(() => ({}));
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    console.log("[sms/verify] request received", {
      phone,
      codeProvided: !!code,
      twilioConfigured,
      env: process.env.NODE_ENV,
    });

    const phoneValid = /^\+?\d{7,15}$/.test(phone);
    if (!phoneValid || !code) {
      console.log("[sms/verify] invalid input");
      return NextResponse.json(
        { error: "Telefono y codigo son requeridos" },
        { status: 400 }
      );
    }

    if (!twilioConfigured) {
      console.log("[sms/verify] dev fallback path");

      // First, check ALL verifications for this phone for debugging
      const allVerifications = await prisma.smsVerification.findMany({
        where: { phone },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      console.log("[sms/verify] ALL verifications for phone:", {
        phone,
        count: allVerifications.length,
        records: allVerifications.map(v => ({
          id: v.id,
          code: v.code,
          verified: v.verified,
          expires: v.expiresAt.toISOString(),
          expired: v.expiresAt < new Date(),
          createdAt: v.createdAt.toISOString(),
        })),
      });

      const verification = await prisma.smsVerification.findFirst({
        where: {
          phone,
          verified: false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      console.log("[sms/verify] verification lookup", {
        phone,
        codeReceived: code,
        verificationFound: !!verification,
        verificationId: verification?.id,
        expectedCode: verification?.code,
        codeMatch: verification?.code === code,
        currentTime: new Date().toISOString(),
      });

      if (!verification || verification.code !== code) {
        console.error("[sms/verify] ❌ verification failed", {
          reason: !verification ? "no_verification_record" : "code_mismatch",
        });
        return NextResponse.json(
          { error: "Codigo invalido o expirado" },
          { status: 400 }
        );
      }

      await prisma.smsVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      console.log("[sms/verify] ✅ verification successful");
      const response = NextResponse.json({ verified: true });
      console.log("[sms/verify] response sent", { ms: Date.now() - startedAt });
      return response;
    }

    // Check with Twilio
    console.log("[sms/verify] twilio path");
    const isValid = await checkVerificationCode(phone, code);

    if (!isValid) {
      console.log("[sms/verify] twilio code invalid");
      return NextResponse.json(
        { error: "Codigo invalido o expirado" },
        { status: 400 }
      );
    }

    // CRITICAL: Create DB record after Twilio verification succeeds
    // This ensures lead creation can verify the phone was validated
    // Check if already verified to avoid duplicates
    const existingVerification = await prisma.smsVerification.findFirst({
      where: {
        phone,
        verified: true,
        expiresAt: { gte: new Date() },
      },
    });

    if (!existingVerification) {
      console.log("[sms/verify] creating verification record");
      await prisma.smsVerification.create({
        data: {
          phone,
          code: "TWILIO_VERIFIED",
          verified: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    } else {
      console.log("[sms/verify] verification record already exists");
    }

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
