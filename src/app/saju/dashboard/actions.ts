"use server";

/**
 * Mutaciones del Command Center. Cada acción revalida la sesión admin en el
 * servidor antes de tocar la base de datos — el cliente nunca es fuente de
 * autoridad — y devuelve `ActionResult` para que la UI muestre el toast.
 */
import { revalidatePath } from "next/cache";
import type {
  SajuChannel,
  SajuEffortStatus,
  SajuEventType,
  SajuInterest,
  SajuLeadStatus,
  SajuLeadType,
  SajuMilestoneStatus,
  SajuStage,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSajuAdmin } from "@/lib/saju/auth";
import {
  EFFORT_STATUSES,
  EVENT_TYPES,
  MILESTONE_STATUSES,
  SAJU_CHANNELS,
  SAJU_INTERESTS,
  SAJU_LEAD_STATUSES,
  SAJU_LEAD_TYPES,
  SAJU_STAGES,
  STAGE_LABEL,
  isMember,
} from "@/lib/saju/command-center";
import { fromDateInputValue } from "@/lib/saju/format";
import { getLeadDetail } from "@/lib/saju/queries";
import type { ActionResult, SajuLeadDetailDTO } from "@/lib/saju/types";

const DASHBOARD_PATH = "/saju/dashboard";
const MAX_TEXT = 2000;

const UNAUTHORIZED: ActionResult = {
  ok: false,
  error: "Sesión expirada. Vuelve a entrar para guardar los cambios.",
};

function clean(value: string | null | undefined, max = MAX_TEXT): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

function fail(error: unknown, scope: string): ActionResult {
  console.error(`[saju/${scope}]`, error);
  return { ok: false, error: "No pudimos guardar el cambio. Inténtalo de nuevo." };
}

/** ISO alpha-2 en mayúsculas; el resto se rechaza. */
function normalizeCountry(value: string): string | null {
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

// ── Leads ───────────────────────────────────────────────────────────────────

/**
 * Ficha completa con su timeline. La usa el drawer al abrirse (también por
 * deep-link `?lead=`), así que revalida sesión como cualquier otra acción.
 */
export async function loadLeadDetail(id: string): Promise<SajuLeadDetailDTO | null> {
  if (!(await getSajuAdmin())) return null;
  if (!id) return null;
  return getLeadDetail(id);
}

export type CreateLeadInput = {
  name: string;
  country: string;
  company?: string | null;
  role?: string | null;
  city?: string | null;
  type?: SajuLeadType;
  stage?: SajuStage;
  interest?: SajuInterest;
  keyInsight?: string | null;
  nextAction?: string | null;
  nextActionDate?: string | null;
  notes?: string | null;
};

export async function createLead(input: CreateLeadInput): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;

  const name = clean(input.name, 200);
  const country = normalizeCountry(input.country ?? "");
  if (!name) return { ok: false, error: "El lead necesita un nombre." };
  if (!country) return { ok: false, error: "Indica el país con su código ISO (PA, GT, ES…)." };

  const stage = isMember(SAJU_STAGES, input.stage) ? input.stage : "PROSPECTO";

  try {
    const existing = await prisma.sajuLead.findUnique({
      where: { name_country: { name, country } },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: `Ya existe un lead «${name}» en ${country}.` };
    }

    await prisma.sajuLead.create({
      data: {
        name,
        country,
        company: clean(input.company),
        role: clean(input.role, 200),
        city: clean(input.city, 120),
        type: isMember(SAJU_LEAD_TYPES, input.type) ? input.type : "PUNTO_UNICO",
        stage,
        interest: isMember(SAJU_INTERESTS, input.interest) ? input.interest : "MEDIO",
        keyInsight: clean(input.keyInsight),
        nextAction: clean(input.nextAction),
        nextActionDate: input.nextActionDate
          ? fromDateInputValue(input.nextActionDate)
          : null,
        notes: clean(input.notes),
        events: {
          create: {
            type: "NOTA",
            description: `Lead creado en ${STAGE_LABEL[stage]}.`,
          },
        },
      },
    });

    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "createLead");
  }
}

export type UpdateLeadInput = {
  id: string;
  name?: string;
  company?: string | null;
  role?: string | null;
  country?: string;
  city?: string | null;
  type?: SajuLeadType;
  interest?: SajuInterest;
  status?: SajuLeadStatus;
  keyInsight?: string | null;
  nextAction?: string | null;
  /** `YYYY-MM-DD`; cadena vacía borra la fecha. */
  nextActionDate?: string | null;
  notes?: string | null;
};

export async function updateLead(input: UpdateLeadInput): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;
  if (!input.id) return { ok: false, error: "Lead no encontrado." };

  const data: {
    name?: string;
    company?: string | null;
    role?: string | null;
    country?: string;
    city?: string | null;
    type?: SajuLeadType;
    interest?: SajuInterest;
    status?: SajuLeadStatus;
    keyInsight?: string | null;
    nextAction?: string | null;
    nextActionDate?: Date | null;
    notes?: string | null;
  } = {};

  if (input.name !== undefined) {
    const name = clean(input.name, 200);
    if (!name) return { ok: false, error: "El lead necesita un nombre." };
    data.name = name;
  }
  if (input.country !== undefined) {
    const country = normalizeCountry(input.country);
    if (!country) return { ok: false, error: "País inválido: usa el código ISO (PA, GT, ES…)." };
    data.country = country;
  }
  if (input.company !== undefined) data.company = clean(input.company);
  if (input.role !== undefined) data.role = clean(input.role, 200);
  if (input.city !== undefined) data.city = clean(input.city, 120);
  if (input.keyInsight !== undefined) data.keyInsight = clean(input.keyInsight);
  if (input.nextAction !== undefined) data.nextAction = clean(input.nextAction);
  if (input.notes !== undefined) data.notes = clean(input.notes);
  if (input.nextActionDate !== undefined) {
    data.nextActionDate = input.nextActionDate
      ? fromDateInputValue(input.nextActionDate)
      : null;
  }
  if (input.type !== undefined) {
    if (!isMember(SAJU_LEAD_TYPES, input.type)) return { ok: false, error: "Tipo inválido." };
    data.type = input.type;
  }
  if (input.interest !== undefined) {
    if (!isMember(SAJU_INTERESTS, input.interest)) return { ok: false, error: "Interés inválido." };
    data.interest = input.interest;
  }
  if (input.status !== undefined) {
    if (!isMember(SAJU_LEAD_STATUSES, input.status)) return { ok: false, error: "Estado inválido." };
    data.status = input.status;
  }

  if (Object.keys(data).length === 0) return { ok: true };

  try {
    await prisma.sajuLead.update({ where: { id: input.id }, data });
    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "updateLead");
  }
}

/**
 * Movimiento de etapa (kanban, drawer o menú de teclado). Escribe siempre un
 * evento CAMBIO_ETAPA en la misma transacción que el update.
 */
export async function moveLeadStage(id: string, stage: SajuStage): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;
  if (!isMember(SAJU_STAGES, stage)) return { ok: false, error: "Etapa inválida." };

  try {
    const lead = await prisma.sajuLead.findUnique({
      where: { id },
      select: { stage: true },
    });
    if (!lead) return { ok: false, error: "Lead no encontrado." };
    if (lead.stage === stage) return { ok: true };

    await prisma.$transaction([
      prisma.sajuLead.update({ where: { id }, data: { stage } }),
      prisma.sajuLeadEvent.create({
        data: {
          leadId: id,
          type: "CAMBIO_ETAPA",
          description: `${STAGE_LABEL[lead.stage]} → ${STAGE_LABEL[stage]}`,
        },
      }),
    ]);

    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "moveLeadStage");
  }
}

/** Archivar = sacar de ACTIVO (pausado, ganado o perdido). */
export async function setLeadStatus(
  id: string,
  status: SajuLeadStatus,
): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;
  if (!isMember(SAJU_LEAD_STATUSES, status)) return { ok: false, error: "Estado inválido." };

  try {
    const lead = await prisma.sajuLead.findUnique({ where: { id }, select: { status: true } });
    if (!lead) return { ok: false, error: "Lead no encontrado." };
    if (lead.status === status) return { ok: true };

    await prisma.$transaction([
      prisma.sajuLead.update({ where: { id }, data: { status } }),
      prisma.sajuLeadEvent.create({
        data: {
          leadId: id,
          type: "NOTA",
          description: `Estado: ${lead.status.toLowerCase()} → ${status.toLowerCase()}`,
        },
      }),
    ]);

    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "setLeadStatus");
  }
}

export async function addLeadEvent(input: {
  leadId: string;
  type: SajuEventType;
  description: string;
}): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;
  if (!isMember(EVENT_TYPES, input.type)) return { ok: false, error: "Tipo de evento inválido." };

  const description = clean(input.description);
  if (!description) return { ok: false, error: "Escribe algo antes de guardar." };

  try {
    await prisma.sajuLeadEvent.create({
      data: { leadId: input.leadId, type: input.type, description },
    });
    // Toca updatedAt para que el lead suba en el orden de actividad.
    await prisma.sajuLead.update({ where: { id: input.leadId }, data: {} });

    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "addLeadEvent");
  }
}

// ── Esfuerzos por canal ─────────────────────────────────────────────────────

export async function createEffort(input: {
  channel: SajuChannel;
  title: string;
  country?: string | null;
  outlet?: string | null;
  description?: string | null;
  status?: SajuEffortStatus;
  plannedFor?: string | null;
}): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;
  if (!isMember(SAJU_CHANNELS, input.channel)) return { ok: false, error: "Canal inválido." };

  const title = clean(input.title, 300);
  if (!title) return { ok: false, error: "El esfuerzo necesita un título." };

  const country = input.country ? normalizeCountry(input.country) : null;
  if (input.country && !country) {
    return { ok: false, error: "País inválido: usa el código ISO (PA, GT, ES…)." };
  }

  try {
    // El mismo título puede repetirse en otro país (una pauta que corre en
    // varios mercados); sólo se bloquea el duplicado exacto canal+país+título.
    const existing = await prisma.sajuChannelEffort.findFirst({
      where: { channel: input.channel, title, country },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: "Ya hay un esfuerzo igual en ese canal y país." };
    }

    await prisma.sajuChannelEffort.create({
      data: {
        channel: input.channel,
        title,
        country,
        outlet: clean(input.outlet, 200),
        description: clean(input.description),
        status: isMember(EFFORT_STATUSES, input.status) ? input.status : "PLANEADO",
        plannedFor: input.plannedFor ? fromDateInputValue(input.plannedFor) : null,
      },
    });

    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "createEffort");
  }
}

export async function updateEffort(input: {
  id: string;
  status?: SajuEffortStatus;
  plannedFor?: string | null;
  outlet?: string | null;
}): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;

  const data: {
    status?: SajuEffortStatus;
    plannedFor?: Date | null;
    outlet?: string | null;
  } = {};

  if (input.status !== undefined) {
    if (!isMember(EFFORT_STATUSES, input.status)) return { ok: false, error: "Estado inválido." };
    data.status = input.status;
  }
  if (input.plannedFor !== undefined) {
    data.plannedFor = input.plannedFor ? fromDateInputValue(input.plannedFor) : null;
  }
  if (input.outlet !== undefined) data.outlet = clean(input.outlet, 200);

  if (Object.keys(data).length === 0) return { ok: true };

  try {
    await prisma.sajuChannelEffort.update({ where: { id: input.id }, data });
    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "updateEffort");
  }
}

export async function deleteEffort(id: string): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;
  try {
    await prisma.sajuChannelEffort.delete({ where: { id } });
    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "deleteEffort");
  }
}

// ── Agenda institucional ────────────────────────────────────────────────────

export async function createMilestone(input: {
  title: string;
  counterpart: string;
  date: string;
  org?: string | null;
  country?: string | null;
  tentative?: boolean;
  notes?: string | null;
}): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;

  const title = clean(input.title, 300);
  const counterpart = clean(input.counterpart, 300);
  const date = fromDateInputValue(input.date ?? "");
  if (!title) return { ok: false, error: "El hito necesita un título." };
  if (!counterpart) return { ok: false, error: "Indica con quién es el hito." };
  if (!date) return { ok: false, error: "Indica la fecha del hito." };

  const country = input.country ? normalizeCountry(input.country) : null;
  if (input.country && !country) {
    return { ok: false, error: "País inválido: usa el código ISO (PA, GT, ES…)." };
  }

  try {
    const existing = await prisma.sajuMilestone.findUnique({
      where: { title_date: { title, date } },
      select: { id: true },
    });
    if (existing) return { ok: false, error: "Ya hay un hito con ese título en esa fecha." };

    await prisma.sajuMilestone.create({
      data: {
        title,
        counterpart,
        date,
        org: clean(input.org, 200),
        country,
        tentative: input.tentative === true,
        notes: clean(input.notes),
      },
    });

    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "createMilestone");
  }
}

export async function updateMilestone(input: {
  id: string;
  status?: SajuMilestoneStatus;
  date?: string;
  tentative?: boolean;
}): Promise<ActionResult> {
  if (!(await getSajuAdmin())) return UNAUTHORIZED;

  const data: { status?: SajuMilestoneStatus; date?: Date; tentative?: boolean } = {};

  if (input.status !== undefined) {
    if (!isMember(MILESTONE_STATUSES, input.status)) return { ok: false, error: "Estado inválido." };
    data.status = input.status;
  }
  if (input.date !== undefined) {
    const date = fromDateInputValue(input.date);
    if (!date) return { ok: false, error: "Fecha inválida." };
    data.date = date;
  }
  if (input.tentative !== undefined) data.tentative = input.tentative === true;

  if (Object.keys(data).length === 0) return { ok: true };

  try {
    await prisma.sajuMilestone.update({ where: { id: input.id }, data });
    revalidatePath(DASHBOARD_PATH);
    return { ok: true };
  } catch (error) {
    return fail(error, "updateMilestone");
  }
}
