import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/**
 * GET /api/leads/export
 * Fetch all leads for export (admin only, no pagination)
 */
export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      console.warn("[leads/export] Unauthorized access attempt");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("[leads/export] Fetching all leads for export");

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        country: true,
        sectors: true,
        matches: {
          include: { franchise: { include: { sector: true } } },
          orderBy: { score: "desc" },
        },
      },
    });

    const serializedLeads = leads.map((lead) => ({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      matches: lead.matches.map((m) => ({
        franchise: { name: m.franchise.name },
        score: m.score,
        contacted: m.contacted,
      })),
    }));

    console.log("[leads/export] Exported", leads.length, "leads");

    return NextResponse.json({ leads: serializedLeads, total: leads.length });
  } catch (error) {
    console.error("[leads/export] Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
