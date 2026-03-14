import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PLAN_ENTITLEMENTS } from "@/lib/plan-entitlements";

export const dynamic = "force-dynamic";

const PLAN_BADGE: Record<string, { label: string; classes: string }> = {
  BASIC: { label: "Presencia", classes: "bg-slate-100 text-slate-600" },
  GROWTH: { label: "Conversión", classes: "bg-purple-100 text-purple-700" },
  ALL_IN: { label: "Aceleración", classes: "bg-teal-100 text-teal-700" },
};

export default async function LandingFranchisesListPage() {
  const franchises = await prisma.franchise.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      planTier: true,
      published: true,
      updatedAt: true,
      headline: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-sm text-gray-500">
            Franquicias del sistema de landing modular
          </p>
        </div>
        <Link
          href="/admin/franquicias/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Nueva franquicia
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Franquicia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actualizado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {franchises.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay franquicias todavía.{" "}
                  <Link href="/admin/franquicias/new" className="text-blue-600 underline">
                    Crear la primera
                  </Link>
                </td>
              </tr>
            )}
            {franchises.map((f) => {
              const plan = f.planTier as keyof typeof PLAN_ENTITLEMENTS;
              const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.BASIC;
              const slugForUrl = f.slug ?? f.name.toLowerCase().replace(/\s+/g, "-");

              return (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                      {f.headline && (
                        <p className="text-xs text-gray-400 truncate max-w-[260px]">
                          {f.headline}
                        </p>
                      )}
                      {f.slug && (
                        <p className="text-xs text-gray-400 font-mono">/franquicia/{f.slug}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        f.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          f.published ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {f.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Intl.DateTimeFormat("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(f.updatedAt))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/franquicia/${slugForUrl}?preview=true`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Preview ↗
                      </Link>
                      <Link
                        href={`/admin/franquicias/${f.id}/edit`}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Editar
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
