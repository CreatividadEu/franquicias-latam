import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SECTOR_UI, STATUS_UI, formatDate } from "@/components/admin/sandbox/sandbox-ui";

export const dynamic = "force-dynamic";

/** §1 Admin: lista de sesiones Sandbox. */
export default async function SandboxAdminListPage() {
  const sessions = await prisma.sandboxSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { assets: true, events: true } },
      preload: { select: { generatedAt: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sandbox</h1>
          <p className="text-sm text-gray-500">Sesiones interactivas por prospecto · 12–15 minutos en llamada</p>
        </div>
        <Link href="/admin/sandbox/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          + Nueva sesión
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-3">Marca</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Preparación</th>
              <th className="px-6 py-3">Sesión</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  Sin sesiones todavía.{" "}
                  <Link href="/admin/sandbox/new" className="text-blue-600 underline">
                    Crear la primera
                  </Link>
                  {" · "}o corre <code className="rounded bg-gray-100 px-1">npm run sandbox:seed</code> para la demo.
                </td>
              </tr>
            )}
            {sessions.map((s) => {
              const status = STATUS_UI[s.status.toLowerCase() as keyof typeof STATUS_UI];
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block h-6 w-6 shrink-0 rounded-full ring-1 ring-gray-200" style={{ background: s.accentColor }} aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.brandName}</p>
                        <p className="text-xs text-gray-400">
                          {SECTOR_UI[s.sector.toLowerCase() as keyof typeof SECTOR_UI]} · {[s.city, s.country].filter(Boolean).join(", ")}
                        </p>
                        <p className="font-mono text-xs text-gray-400">/sandbox/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.classes}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    {s.pin && <p className="mt-1 font-mono text-xs text-gray-400">PIN {s.pin}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>
                      {s._count.assets} documento{s._count.assets !== 1 ? "s" : ""}
                    </p>
                    <p className={`text-xs ${s.preload ? "text-green-600" : "text-amber-600"}`}>{s.preload ? `Preload ${formatDate(s.preload.generatedAt.toISOString())}` : "Sin preload"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{s.scheduledAt ? formatDate(s.scheduledAt.toISOString()) : "Sin fecha"}</p>
                    <p className="text-xs text-gray-400">
                      {s._count.events} evento{s._count.events !== 1 ? "s" : ""} · {s.consultantName ?? "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/sandbox/${s.slug}?presenter=1`} target="_blank" className="text-xs text-gray-500 transition-colors hover:text-gray-700">
                        Presentar ↗
                      </Link>
                      <Link href={`/admin/sandbox/${s.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                        Abrir
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
