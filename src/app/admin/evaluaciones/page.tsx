import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Evaluaciones Privadas — vista de guerra para ventas ─────────────────────
// Cada lead llega con el resumen estructurado en `message` (líneas "Clave: valor").

const PROGRAM_STYLES: Record<string, { badge: string; ring: string }> = {
  "Franchise Bootcamp": {
    badge: "bg-emerald-100 text-emerald-800",
    ring: "border-l-emerald-400",
  },
  "Franchise Development": {
    badge: "bg-blue-100 text-blue-800",
    ring: "border-l-blue-400",
  },
  "Franchise Ecosystem": {
    badge: "bg-amber-100 text-amber-800",
    ring: "border-l-amber-500",
  },
};

const FACT_LABELS: Record<string, string> = {
  lt300k: "< USD $300K",
  "300k-1m": "USD $300K – $1M",
  "1m-5m": "USD $1M – $5M",
  "5m+": "USD $5M+",
  reservado: "Lo dirá en la llamada",
};

function parseMessage(message: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!message) return out;
  for (const line of message.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return out;
}

function waLink(phone: string, nombre: string, empresa: string) {
  const digits = phone.replace(/\D/g, "");
  const first = nombre.trim().split(/\s+/)[0] || "";
  const text = encodeURIComponent(
    `Hola ${first} 👋 Recibimos la Evaluación Privada de ${empresa || "tu empresa"}. ¿Agendamos tu llamada de 10 minutos?`,
  );
  return `https://wa.me/${digits}?text=${text}`;
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function EvaluacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ programa?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const { programa } = await searchParams;

  const leads = await prisma.formLead.findMany({
    where: { sourceType: "evaluacion_privada" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const parsed = leads.map((lead) => ({
    lead,
    data: parseMessage(lead.message),
  }));

  const counts = parsed.reduce<Record<string, number>>((acc, { data }) => {
    const p = data["Programa"] ?? "—";
    acc[p] = (acc[p] ?? 0) + 1;
    return acc;
  }, {});

  const visible = programa
    ? parsed.filter(({ data }) => data["Programa"] === programa)
    : parsed;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Evaluaciones Privadas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Leads calificados del funnel de empresarios · {leads.length} en
            total · listos para la llamada de 10 minutos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/evaluaciones"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              !programa
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos ({leads.length})
          </a>
          {Object.entries(counts).map(([name, count]) => (
            <a
              key={name}
              href={`/admin/evaluaciones?programa=${encodeURIComponent(name)}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                programa === name
                  ? "bg-gray-900 text-white"
                  : (PROGRAM_STYLES[name]?.badge ?? "bg-gray-100 text-gray-600") +
                    " hover:opacity-80"
              }`}
            >
              {name} ({count})
            </a>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            Aún no hay evaluaciones{programa ? ` para ${programa}` : ""}. Cada
            una que entre aparecerá aquí con todo el contexto para la llamada.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(({ lead, data }) => {
            const programName = data["Programa"] ?? "—";
            const style =
              PROGRAM_STYLES[programName] ?? {
                badge: "bg-gray-100 text-gray-700",
                ring: "border-l-gray-300",
              };
            const empresa = data["Empresa"] ?? "—";
            const facturacion = lead.investmentRange
              ? FACT_LABELS[lead.investmentRange] ?? lead.investmentRange
              : data["Facturación"] ?? "—";

            return (
              <div
                key={lead.id}
                className={`rounded-2xl border border-gray-200 border-l-4 bg-white p-5 shadow-sm ${style.ring}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {empresa}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
                      >
                        {programName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {lead.name}
                      {data["Rol"] && data["Rol"] !== "—"
                        ? ` · ${data["Rol"]}`
                        : ""}{" "}
                      · {data["Operación"] ?? lead.city ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {fmtDate(lead.createdAt)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {[
                    ["Unidades", data["Unidades"]],
                    ["Facturación", facturacion],
                    ["Objetivo", data["Objetivo"]],
                    ["Horizonte", data["Horizonte"]],
                  ]
                    .filter(([, v]) => v && v !== "—")
                    .map(([k, v]) => (
                      <span
                        key={k as string}
                        className="rounded-md bg-gray-100 px-2.5 py-1 text-gray-700"
                      >
                        <span className="font-semibold">{k}:</span> {v}
                      </span>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                  <a
                    href={waLink(lead.phone, lead.name, empresa)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    WhatsApp →
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    {lead.phone}
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
