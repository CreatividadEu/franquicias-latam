import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { adminSessionInclude, toAdminSessionDTO } from "@/lib/sandbox/admin";
import { hasAnthropicKey } from "@/lib/sandbox/ai";
import { SandboxAssetsPanel } from "@/components/admin/sandbox/SandboxAssetsPanel";
import { SandboxEventsTimeline } from "@/components/admin/sandbox/SandboxEventsTimeline";
import { SandboxMarketingForm } from "@/components/admin/sandbox/SandboxMarketingForm";
import { SandboxPreloadEditor } from "@/components/admin/sandbox/SandboxPreloadEditor";
import { SandboxSessionControls } from "@/components/admin/sandbox/SandboxSessionControls";
import { SandboxSessionForm, type BrandOption } from "@/components/admin/sandbox/SandboxSessionForm";
import { SECTOR_UI, STATUS_UI } from "@/components/admin/sandbox/sandbox-ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {hint && <p className="text-sm text-gray-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** §7: preparar una sesión en 5 minutos. */
export default async function SandboxSessionAdminPage({ params }: Props) {
  const { id } = await params;
  const [row, brands] = await Promise.all([
    prisma.sandboxSession.findUnique({ where: { id }, include: adminSessionInclude }),
    prisma.franchise.findMany({
      where: { active: true },
      select: { id: true, name: true, logoUrl: true, logo: true, sector: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!row) notFound();

  const session = toAdminSessionDTO(row);
  const franchises: BrandOption[] = brands.map((b) => ({ id: b.id, name: b.name, logoUrl: b.logoUrl ?? b.logo ?? null, sectorName: b.sector.name }));
  const status = STATUS_UI[session.status];
  const hasAuditDoc = session.assets.some((a) => a.kind === "marketing_audit" && a.extractionStatus === "done");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/sandbox" className="text-sm text-gray-500 hover:text-gray-700">
            ← Sandbox
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-block h-8 w-8 rounded-full ring-1 ring-gray-200" style={{ background: session.accentColor }} aria-hidden />
            <h1 className="text-2xl font-bold text-gray-900">{session.brandName}</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.classes}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {SECTOR_UI[session.sector]} · {[session.city, session.country].filter(Boolean).join(", ")}
            {session.franchiseName ? ` · marca vinculada: ${session.franchiseName}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Marca y sesión" hint="Lo que el cliente ve en el chrome: nombre, logo y acento.">
          <SandboxSessionForm mode="edit" sessionId={session.id} initial={session} franchises={franchises} />
        </Section>
        <Section title="Enlace, estado y PIN">
          <SandboxSessionControls session={session} />
        </Section>
      </div>

      <Section title="Documentos y procesamiento" hint="Sube menú, OSINT, notas de ventas o gastos y auditoría de marketing. «Procesar» extrae con Claude y arma el preload.">
        <SandboxAssetsPanel
          sessionId={session.id}
          initialAssets={session.assets}
          aiConfigured={hasAnthropicKey()}
          storageConfigured={Boolean(getSupabaseAdminClient())}
          preloadGeneratedAt={session.preload?.generatedAt ?? null}
        />
      </Section>

      <Section title="Marketing en 60 segundos" hint="Si no hay auditoría, estos datos puntúan los cinco ejes de la fase Marketing.">
        <SandboxMarketingForm sessionId={session.id} initial={session.marketingInputs} hasAuditDoc={hasAuditDoc} />
      </Section>

      <Section title="Preload" hint="Lo único que viaja al navegador del cliente. Corrige aquí lo que la extracción haya entendido mal.">
        <SandboxPreloadEditor sessionId={session.id} preload={session.preload} />
      </Section>

      <Section title="Después de la llamada" hint="Eventos del cliente en orden inverso y resultado guardado.">
        <SandboxEventsTimeline events={session.events} result={session.result} />
      </Section>
    </div>
  );
}
