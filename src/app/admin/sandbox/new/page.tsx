import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SandboxSessionForm, type BrandOption } from "@/components/admin/sandbox/SandboxSessionForm";

export const dynamic = "force-dynamic";

async function loadBrands(): Promise<BrandOption[]> {
  const rows = await prisma.franchise.findMany({
    where: { active: true },
    select: { id: true, name: true, logoUrl: true, logo: true, sector: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({ id: r.id, name: r.name, logoUrl: r.logoUrl ?? r.logo ?? null, sectorName: r.sector.name }));
}

export default async function NewSandboxSessionPage() {
  const franchises = await loadBrands();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/sandbox" className="text-sm text-gray-500 hover:text-gray-700">
          ← Sandbox
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Nueva sesión</h1>
        <p className="text-sm text-gray-500">Elige una marca del marketplace o escribe los datos. Después subes los documentos y procesas.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SandboxSessionForm mode="create" franchises={franchises} />
      </div>
    </div>
  );
}
