import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

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
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
