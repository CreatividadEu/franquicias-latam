import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/resend";
import { getAdminUser } from "@/lib/auth";

const ADMIN_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const ADMIN_RATE_MAX_REQUESTS = 30;
const LEAD_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LEAD_RATE_MAX_REQUESTS = 2;
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const attempts = rateLimitStore.get(key) ?? [];
  const recentAttempts = attempts.filter((timestamp) => now - timestamp < windowMs);

  if (recentAttempts.length >= maxRequests) {
    rateLimitStore.set(key, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  rateLimitStore.set(key, recentAttempts);
  return false;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      console.warn("[lead-notification] Unauthorized access attempt");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const leadId = typeof body.leadId === "string" ? body.leadId : "";
    if (!leadId) {
      return NextResponse.json(
        { error: "leadId es requerido" },
        { status: 400 }
      );
    }

    const adminKey = `admin:${admin.id}`;
    if (
      isRateLimited(
        adminKey,
        ADMIN_RATE_MAX_REQUESTS,
        ADMIN_RATE_WINDOW_MS
      )
    ) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta nuevamente mas tarde." },
        { status: 429 }
      );
    }

    const leadKey = `lead:${leadId}`;
    if (
      isRateLimited(
        leadKey,
        LEAD_RATE_MAX_REQUESTS,
        LEAD_RATE_WINDOW_MS
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Ya se enviaron varias notificaciones para este lead. Intenta nuevamente en unos minutos.",
        },
        { status: 429 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        country: true,
        matches: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404 }
      );
    }

    const investmentLabels: Record<string, string> = {
      RANGE_50K_100K: "$50k - $100k",
      RANGE_100K_200K: "$100k - $200k",
      RANGE_200K_PLUS: "$200k+",
    };

    await sendLeadNotification({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      country: lead.country.name,
      investmentRange:
        investmentLabels[lead.investmentRange] || lead.investmentRange,
      matchCount: lead.matches.length,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[lead-notification] unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
