/**
 * Capa de lectura del Command Center. Sólo se importa desde componentes de
 * servidor y server actions; sale como DTOs serializables (ver `types.ts`).
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { daysFromToday } from "./format";
import type {
  SajuEffortDTO,
  SajuFilters,
  SajuLeadDTO,
  SajuLeadDetailDTO,
  SajuLeadEventDTO,
  SajuMilestoneDTO,
} from "./types";

type LeadRow = Prisma.SajuLeadGetPayload<object>;
type EventRow = Prisma.SajuLeadEventGetPayload<object>;
type EffortRow = Prisma.SajuChannelEffortGetPayload<object>;
type MilestoneRow = Prisma.SajuMilestoneGetPayload<object>;

export function toLeadDTO(lead: LeadRow): SajuLeadDTO {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    role: lead.role,
    country: lead.country,
    city: lead.city,
    type: lead.type,
    stage: lead.stage,
    status: lead.status,
    interest: lead.interest,
    keyInsight: lead.keyInsight,
    nextAction: lead.nextAction,
    nextActionDate: lead.nextActionDate?.toISOString() ?? null,
    source: lead.source,
    notes: lead.notes,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function toEventDTO(event: EventRow): SajuLeadEventDTO {
  return {
    id: event.id,
    leadId: event.leadId,
    type: event.type,
    description: event.description,
    occurredAt: event.occurredAt.toISOString(),
  };
}

function toEffortDTO(effort: EffortRow): SajuEffortDTO {
  return {
    id: effort.id,
    channel: effort.channel,
    country: effort.country,
    title: effort.title,
    outlet: effort.outlet,
    description: effort.description,
    status: effort.status,
    plannedFor: effort.plannedFor?.toISOString() ?? null,
  };
}

function toMilestoneDTO(milestone: MilestoneRow): SajuMilestoneDTO {
  return {
    id: milestone.id,
    title: milestone.title,
    counterpart: milestone.counterpart,
    org: milestone.org,
    country: milestone.country,
    date: milestone.date.toISOString(),
    tentative: milestone.tentative,
    status: milestone.status,
    notes: milestone.notes,
  };
}

function buildLeadWhere(filters: SajuFilters): Prisma.SajuLeadWhereInput {
  const where: Prisma.SajuLeadWhereInput = {};
  if (filters.country) where.country = filters.country;
  if (filters.stage) where.stage = filters.stage;
  if (filters.type) where.type = filters.type;
  if (filters.interest) where.interest = filters.interest;

  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { role: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { keyInsight: { contains: q, mode: "insensitive" } },
      { nextAction: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getLeads(filters: SajuFilters): Promise<SajuLeadDTO[]> {
  const leads = await prisma.sajuLead.findMany({
    where: buildLeadWhere(filters),
    orderBy: [{ stage: "desc" }, { interest: "asc" }, { updatedAt: "desc" }],
  });
  return leads.map(toLeadDTO);
}

/** Países con al menos un lead — alimenta el selector de filtros. */
export async function getLeadCountries(): Promise<string[]> {
  const rows = await prisma.sajuLead.findMany({
    distinct: ["country"],
    select: { country: true },
    orderBy: { country: "asc" },
  });
  return rows.map((row) => row.country);
}

export async function getLeadDetail(id: string): Promise<SajuLeadDetailDTO | null> {
  const lead = await prisma.sajuLead.findUnique({
    where: { id },
    include: { events: { orderBy: { occurredAt: "desc" } } },
  });
  if (!lead) return null;
  return { ...toLeadDTO(lead), events: lead.events.map(toEventDTO) };
}

export async function getEfforts(): Promise<SajuEffortDTO[]> {
  const efforts = await prisma.sajuChannelEffort.findMany({
    orderBy: [{ status: "asc" }, { plannedFor: "asc" }, { createdAt: "asc" }],
  });
  return efforts.map(toEffortDTO);
}

/**
 * Agenda institucional: hitos de los próximos `days` días naturales de Madrid.
 * Se consulta una ventana holgada en UTC y se recorta con aritmética de días
 * en zona Madrid, para no perder el hito del borde por el desfase horario.
 */
export async function getUpcomingMilestones(
  days = 60,
  now: Date = new Date(),
): Promise<SajuMilestoneDTO[]> {
  const from = new Date(now.getTime() - 2 * 86_400_000);
  const to = new Date(now.getTime() + (days + 2) * 86_400_000);

  const milestones = await prisma.sajuMilestone.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  return milestones
    .filter((milestone) => {
      const diff = daysFromToday(milestone.date, now);
      return diff >= 0 && diff <= days;
    })
    .map(toMilestoneDTO);
}
