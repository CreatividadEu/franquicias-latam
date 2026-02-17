import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const startedAt = Date.now();

    const body = await request.json().catch(() => ({}));
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    console.log("[sms/verify] request received", {
      codeProvided: !!code,
      env: process.env.NODE_ENV,
    });

    const phoneValid = /^\+?\d{7,15}$/.test(phone);
    if (!phoneValid || !code) {
      return NextResponse.json(
        { error: "Telefono y codigo son requeridos" },
        { status: 400 }
      );
    }

    const verification = await prisma.smsVerification.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification || verification.attempts >= 5) {
      console.warn("[sms/verify] verification failed");
      return NextResponse.json(
        { error: "Codigo invalido o expirado" },
        { status: 400 }
      );
    }

    if (verification.code !== code) {
      await prisma.smsVerification.update({
        where: { id: verification.id },
        data: {
          attempts: { increment: 1 },
        },
      });

      console.warn("[sms/verify] verification failed");
      return NextResponse.json(
        { error: "Codigo invalido o expirado" },
        { status: 400 }
      );
    }

    await prisma.smsVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

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
