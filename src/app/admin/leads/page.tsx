import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LISTING_TYPE_OPTIONS } from "@/lib/listing-config";

// ── Filters ───────────────────────────────────────────────────────────────────

function buildWhere(params: {
  franchise?: string;
  investmentRange?: string;
  sourceType?: string;
  listingType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (params.franchise) {
    where.OR = [
      { franchiseSlug: params.franchise },
      { listingSlug: params.franchise },
    ];
  }
  if (params.investmentRange) where.investmentRange = params.investmentRange;
  if (params.sourceType) where.sourceType = params.sourceType;
  if (params.listingType) where.listingType = params.listingType;
  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
    if (params.dateTo) {
      const to = new Date(params.dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }
  return where;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function FormLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    franchise?: string;
    investmentRange?: string;
    sourceType?: string;
    listingType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const where = buildWhere(params);

  const [leads, total, slugRows] = await Promise.all([
    prisma.formLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.formLead.count({ where }),
    prisma.formLead.findMany({
      select: { franchiseSlug: true, listingSlug: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const franchiseSlugs = Array.from(
    new Set(
      slugRows
        .map((row) => row.listingSlug ?? row.franchiseSlug)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const INVESTMENT_LABELS: Record<string, string> = {
    "20k-50k": "$20k – $50k",
    "50k-100k": "$50k – $100k",
    "100k-200k": "$100k – $200k",
    "200k+": "$200k+",
    // Bandas de facturación (Evaluación Privada)
    lt300k: "Factura < $300K",
    "300k-1m": "Factura $300K – $1M",
    "1m-5m": "Factura $1M – $5M",
    "5m+": "Factura $5M+",
    reservado: "Facturación reservada",
  };

  const EXPERIENCE_LABELS: Record<string, string> = {
    yes: "Sí",
    no: "No",
    investor: "Con operador",
  };

  const SOURCE_TYPE_LABELS: Record<string, string> = {
    franchise_application: "Aplicación",
    external_franchise_interest: "Interés externo",
    identified_brand_interest: "Interés marca",
    listing_interest: "Interés listing",
    home_contact: "Contacto Home",
    evaluacion_privada: "Evaluación Privada",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Form Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Leads capturados desde formularios de aplicación e interés en las landing pages.
          {" "}<span className="font-medium text-gray-700">{total} registros</span>
          {where && Object.keys(where).length > 0 && " (filtrados)"}
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Franquicia</label>
          <select
            name="franchise"
            defaultValue={params.franchise ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Todas</option>
            {franchiseSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Capacidad de inversión</label>
          <select
            name="investmentRange"
            defaultValue={params.investmentRange ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Todas</option>
            {Object.entries(INVESTMENT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Tipo de listing</label>
          <select
            name="listingType"
            defaultValue={params.listingType ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Todos</option>
            {LISTING_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Source type</label>
          <select
            name="sourceType"
            defaultValue={params.sourceType ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Todos</option>
            {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Desde</label>
          <input
            type="date"
            name="dateFrom"
            defaultValue={params.dateFrom ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Hasta</label>
          <input
            type="date"
            name="dateTo"
            defaultValue={params.dateTo ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Filtrar
          </button>
          <a
            href="/admin/leads"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Limpiar
          </a>
        </div>
      </form>

      {/* Table */}
      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No hay leads con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1220px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Inversión</th>
                  <th className="px-4 py-3">Ciudad</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Experiencia</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Tipo listing</th>
                  <th className="px-4 py-3">Badge editorial</th>
                  <th className="px-4 py-3">Fuente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {lead.createdAt.toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                    <td className="px-4 py-3">
                      {lead.investmentRange ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {INVESTMENT_LABELS[lead.investmentRange] ?? lead.investmentRange}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.cityInterest ?? lead.city ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.country ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.experience
                        ? EXPERIENCE_LABELS[lead.experience] ?? lead.experience
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {lead.listingSlug ?? lead.franchiseSlug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {LISTING_TYPE_OPTIONS.find((option) => option.value === lead.listingType)?.label ?? lead.listingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.editorialBadge ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          {lead.editorialBadge}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {SOURCE_TYPE_LABELS[lead.sourceType] ?? lead.sourceType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
