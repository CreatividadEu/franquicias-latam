import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/admin/StatsCards";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { ExportLeadsButton } from "@/components/admin/ExportLeadsButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalLeads, leadsThisMonth, unviewedLeads, leads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { viewed: false } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        country: true,
        sectors: true,
        matches: {
          include: { franchise: { include: { sector: true } } },
          orderBy: { score: "desc" },
        },
      },
    }),
  ]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Resumen de leads y franquicias
        </p>
      </div>

      <StatsCards
        stats={{ totalLeads, leadsThisMonth, unviewedLeads }}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Leads Recientes
          </h2>
          <ExportLeadsButton />
        </div>
        <LeadsTable leads={serializedLeads} />
      </div>
    </div>
  );
}
