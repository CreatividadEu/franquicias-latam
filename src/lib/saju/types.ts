/**
 * DTOs serializables del Command Center.
 *
 * Los componentes cliente reciben fechas como ISO (UTC) y las formatean con
 * `src/lib/saju/format.ts` en Europe/Madrid. Nada de objetos Prisma crudos
 * cruzando la frontera servidor → cliente.
 */
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

export type SajuLeadDTO = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  country: string;
  city: string | null;
  type: SajuLeadType;
  stage: SajuStage;
  status: SajuLeadStatus;
  interest: SajuInterest;
  keyInsight: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  source: SajuChannel | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SajuLeadEventDTO = {
  id: string;
  leadId: string;
  type: SajuEventType;
  description: string;
  occurredAt: string;
};

export type SajuLeadDetailDTO = SajuLeadDTO & { events: SajuLeadEventDTO[] };

export type SajuEffortDTO = {
  id: string;
  channel: SajuChannel;
  country: string | null;
  title: string;
  outlet: string | null;
  description: string | null;
  status: SajuEffortStatus;
  plannedFor: string | null;
};

export type SajuMilestoneDTO = {
  id: string;
  title: string;
  counterpart: string;
  org: string | null;
  country: string | null;
  date: string;
  tentative: boolean;
  status: SajuMilestoneStatus;
  notes: string | null;
};

export type SajuFilters = {
  country: string | null;
  stage: SajuStage | null;
  type: SajuLeadType | null;
  interest: SajuInterest | null;
  q: string | null;
};

export const EMPTY_FILTERS: SajuFilters = {
  country: null,
  stage: null,
  type: null,
  interest: null,
  q: null,
};

/** Resultado uniforme de las server actions; el cliente muestra `error` en toast. */
export type ActionResult = { ok: true } | { ok: false; error: string };
