import { NextResponse } from "next/server";
import { sendVerification } from "@/lib/twilio";
import { getTwilioRuntimeFlags } from "@/lib/twilioConfig";

export const runtime = "nodejs";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const visible = digits.slice(-4);
  return visible ? `***${visible}` : "***";
}

export async function POST(request: Request) {
  try {
    const { nodeEnv, smsConfigured, providerMode } = getTwilioRuntimeFlags();

    const body = await request.json().catch(() => ({}));
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    console.log("[sms/send] request", {
      providerMode,
      nodeEnv,
      smsConfigured,
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
        {
          error: "Twilio is not configured",
          providerMode,
          nodeEnv,
          smsConfigured,
        },
        { status: 500 }
      );
    }

    if (!smsConfigured) {
      // Dev fallback: no Twilio credentials, skip sending
      return NextResponse.json({ ok: true });
    }

    const { sent, error: twilioError } = await sendVerification(phone);

    if (!sent) {
      console.warn("[sms/send] twilio verify send failed", {
        code: twilioError?.code,
        message: twilioError?.message,
        phoneMasked: maskPhone(phone),
      });
      return NextResponse.json(
        { error: "No se pudo enviar el SMS" },
        { status: 500 }
      );
    }

    console.log("[sms/send] twilio verify accepted", {
      phoneMasked: maskPhone(phone),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[sms/send] unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
