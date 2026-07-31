/**
 * Métricas derivadas del pipeline SAJÚ. Funciones puras sobre DTOs: sin Prisma,
 * sin React — se calculan en el servidor y se testean en aislamiento
 * (tests/saju-metrics.test.ts).
 */
import {
  SAJU_STAGES,
  interestWeight,
  isAdvancedStage,
  stageIndex,
  stagePosition,
} from "./command-center";
import { daysFromToday, pct } from "./format";
import type { SajuLeadDTO } from "./types";
import type { SajuStage } from "@prisma/client";

export type KpiSummary = {
  leadsActivos: number;
  paisesActivos: number;
  enNegociacion: number;
  pctAvanzados: number;
  accionesProximas: number;
  accionesVencidas: number;
};

export type FunnelStage = {
  stage: SajuStage;
  count: number;
  /** Conversión desde la etapa anterior; null en la primera. */
  conversion: number | null;
};

export type CountrySummary = {
  code: string;
  total: number;
  distribution: { stage: SajuStage; count: number }[];
  /** Media de la posición de etapa (1–7). */
  avanceMedio: number;
  hottest: SajuLeadDTO | null;
};

export function activeLeads(leads: SajuLeadDTO[]): SajuLeadDTO[] {
  return leads.filter((lead) => lead.status === "ACTIVO");
}

export function computeKpis(leads: SajuLeadDTO[], now: Date = new Date()): KpiSummary {
  const activos = activeLeads(leads);
  const avanzados = activos.filter((lead) => isAdvancedStage(lead.stage));

  let accionesProximas = 0;
  let accionesVencidas = 0;
  for (const lead of activos) {
    if (!lead.nextActionDate) continue;
    const diff = daysFromToday(new Date(lead.nextActionDate), now);
    if (diff < 0) accionesVencidas += 1;
    else if (diff <= 7) accionesProximas += 1;
  }

  return {
    leadsActivos: activos.length,
    paisesActivos: new Set(activos.map((lead) => lead.country)).size,
    enNegociacion: activos.filter((lead) => lead.stage === "NEGOCIACION").length,
    pctAvanzados: pct(avanzados.length, activos.length),
    accionesProximas,
    accionesVencidas,
  };
}

/**
 * Embudo con conversión etapa a etapa. Cada etapa cuenta los leads que ya la
 * alcanzaron (acumulado hacia adelante), que es como se lee un funnel: si un
 * lead está en NEGOCIACION también pasó por CONTACTADO.
 */
export function computeFunnel(leads: SajuLeadDTO[]): FunnelStage[] {
  const activos = activeLeads(leads);
  const reached = SAJU_STAGES.map(
    (stage) => activos.filter((lead) => stageIndex(lead.stage) >= stageIndex(stage)).length,
  );

  return SAJU_STAGES.map((stage, i) => ({
    stage,
    count: reached[i],
    conversion: i === 0 ? null : pct(reached[i], reached[i - 1]),
  }));
}

/** Leads parados exactamente en cada etapa — lo que pinta el kanban. */
export function groupByStage(leads: SajuLeadDTO[]): Record<SajuStage, SajuLeadDTO[]> {
  const grouped = {} as Record<SajuStage, SajuLeadDTO[]>;
  for (const stage of SAJU_STAGES) grouped[stage] = [];
  for (const lead of leads) grouped[lead.stage].push(lead);
  return grouped;
}

/** El lead más avanzado del país; empate → mayor interés → acción más próxima. */
export function hottestLead(leads: SajuLeadDTO[]): SajuLeadDTO | null {
  if (leads.length === 0) return null;
  return [...leads].sort((a, b) => {
    const byStage = stageIndex(b.stage) - stageIndex(a.stage);
    if (byStage !== 0) return byStage;
    const byInterest = interestWeight(b.interest) - interestWeight(a.interest);
    if (byInterest !== 0) return byInterest;
    const aDate = a.nextActionDate ? Date.parse(a.nextActionDate) : Number.MAX_SAFE_INTEGER;
    const bDate = b.nextActionDate ? Date.parse(b.nextActionDate) : Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  })[0];
}

export function computeCountries(leads: SajuLeadDTO[]): CountrySummary[] {
  const activos = activeLeads(leads);
  const byCountry = new Map<string, SajuLeadDTO[]>();
  for (const lead of activos) {
    const bucket = byCountry.get(lead.country);
    if (bucket) bucket.push(lead);
    else byCountry.set(lead.country, [lead]);
  }

  return [...byCountry.entries()]
    .map(([code, countryLeads]) => {
      const distribution = SAJU_STAGES.map((stage) => ({
        stage,
        count: countryLeads.filter((lead) => lead.stage === stage).length,
      })).filter((entry) => entry.count > 0);

      const avanceMedio =
        countryLeads.reduce((sum, lead) => sum + stagePosition(lead.stage), 0) /
        countryLeads.length;

      return {
        code,
        total: countryLeads.length,
        distribution,
        avanceMedio,
        hottest: hottestLead(countryLeads),
      };
    })
    .sort((a, b) => b.avanceMedio - a.avanceMedio || b.total - a.total);
}
