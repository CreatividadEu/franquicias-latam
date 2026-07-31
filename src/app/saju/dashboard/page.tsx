import Image from "next/image";
import Link from "next/link";
import {
  SAJU_INTERESTS,
  SAJU_LEAD_TYPES,
  SAJU_STAGES,
  isMember,
} from "@/lib/saju/command-center";
import { requireSajuAdmin } from "@/lib/saju/auth";
import { activeLeads, computeCountries, computeFunnel, computeKpis } from "@/lib/saju/metrics";
import {
  getEfforts,
  getLeadCountries,
  getLeadDetail,
  getLeads,
  getUpcomingMilestones,
} from "@/lib/saju/queries";
import type { SajuFilters } from "@/lib/saju/types";
import { ChannelBoard } from "./_components/ChannelBoard";
import { CountryGrid } from "./_components/CountryGrid";
import { FiltersBar } from "./_components/FiltersBar";
import { KanbanBoard } from "./_components/KanbanBoard";
import { KpiBand } from "./_components/KpiBand";
import { LeadDrawerProvider } from "./_components/LeadDrawerProvider";
import { MilestoneTimeline } from "./_components/MilestoneTimeline";
import { NewLeadButton } from "./_components/NewLeadButton";
import { PipelineFunnel } from "./_components/PipelineFunnel";
import { Section } from "./_components/atoms";
import { ToastProvider } from "./_components/ToastProvider";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

/** Los filtros viven en la URL con nombres en español: deep-link legible. */
function parseFilters(params: SearchParams): SajuFilters {
  const stage = single(params.etapa);
  const type = single(params.tipo);
  const interest = single(params.interes);
  const country = single(params.pais);

  return {
    country: country && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null,
    stage: isMember(SAJU_STAGES, stage) ? stage : null,
    type: isMember(SAJU_LEAD_TYPES, type) ? type : null,
    interest: isMember(SAJU_INTERESTS, interest) ? interest : null,
    q: single(params.q),
  };
}

export default async function SajuCommandCenterPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Doble verificación: el layout ya guarda el segmento, la página no confía.
  await requireSajuAdmin();

  const params = await searchParams;
  const filters = parseFilters(params);
  const showArchived = single(params.archivados) === "1";
  const openLeadId = single(params.lead);

  // El deep-link `?lead=` se resuelve aquí: el drawer llega renderizado desde
  // el servidor, sin parpadeo ni ida y vuelta extra al abrir el enlace.
  const [leads, countryCodes, efforts, milestones, openLeadDetail] = await Promise.all([
    getLeads(filters),
    getLeadCountries(),
    getEfforts(),
    getUpcomingMilestones(60),
    openLeadId ? getLeadDetail(openLeadId) : Promise.resolve(null),
  ]);

  const activos = activeLeads(leads);
  const archivados = leads.length - activos.length;
  const boardLeads = showArchived ? leads : activos;

  const kpis = computeKpis(leads);
  const funnel = computeFunnel(leads);
  const countries = computeCountries(leads);

  const archivedHref = showArchived
    ? buildHref(params, { archivados: null })
    : buildHref(params, { archivados: "1" });

  return (
    <ToastProvider>
      <LeadDrawerProvider initialLeadId={openLeadId} initialDetail={openLeadDetail}>
        <div className="cc-shell">
          <header className="cc-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image
                src="/saju/saju-mono.png"
                alt="Sajú"
                width={40}
                height={40}
                style={{ height: 32, width: "auto" }}
                priority
              />
              <div>
                <h1 className="cc-topbar__title">Centro de mando · expansión</h1>
                <p className="cc-hint">
                  Pipeline internacional de franquicia Sajú · fechas en hora de Madrid
                </p>
              </div>
            </div>
            <NewLeadButton />
          </header>

          <FiltersBar filters={filters} countries={countryCodes} />

          <div style={{ marginTop: 16 }}>
            <KpiBand kpis={kpis} />
          </div>

          <Section id="embudo" title="Embudo del pipeline">
            <PipelineFunnel funnel={funnel} />
          </Section>

          <Section
            id="kanban"
            title="Tablero por etapa"
            action={
              archivados > 0 ? (
                <Link className="cc-btn cc-btn--ghost cc-btn--sm" href={archivedHref} scroll={false}>
                  {showArchived ? "Ocultar archivados" : `Ver archivados (${archivados})`}
                </Link>
              ) : null
            }
          >
            <KanbanBoard leads={boardLeads} />
          </Section>

          <Section id="paises" title="Por país">
            <CountryGrid countries={countries} />
          </Section>

          <Section id="canales" title="Esfuerzos por canal">
            <ChannelBoard efforts={efforts} />
          </Section>

          <Section id="agenda" title="Agenda institucional · 60 días">
            <MilestoneTimeline milestones={milestones} />
          </Section>
        </div>
      </LeadDrawerProvider>
    </ToastProvider>
  );
}

/** Reconstruye la URL actual cambiando un solo parámetro. */
function buildHref(params: SearchParams, patch: Record<string, string | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const flat = single(value);
    if (flat) search.set(key, flat);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) search.delete(key);
    else search.set(key, value);
  }
  const query = search.toString();
  return query ? `/saju/dashboard?${query}` : "/saju/dashboard";
}
