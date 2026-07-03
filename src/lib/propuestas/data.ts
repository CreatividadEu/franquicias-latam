import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { PROPOSAL_REGISTRY } from "./registry";
import type { Proposal } from "./types";

const DEADLINE_DIAS_DEFAULT = 7;

/** Deadline fijo por cliente: `deadline` explícito o createdAt + 7 días. */
export function resolveDeadline(
  proposal: Pick<Proposal, "createdAt" | "deadline">,
): Date {
  if (proposal.deadline) {
    return new Date(proposal.deadline);
  }
  const deadline = new Date(proposal.createdAt);
  deadline.setUTCDate(deadline.getUTCDate() + DEADLINE_DIAS_DEFAULT);
  return deadline;
}

/**
 * Resuelve la propuesta de un slug. Primero el registro tipado
 * (default, sin DB); si no está, intenta la tabla `proposals` de
 * Supabase (misma shape, guardada como jsonb en `data`).
 */
/** ¿La ventana de la oferta ya cerró? (evaluado por request en el server) */
export function deadlineVencido(deadline: Date): boolean {
  return deadline.getTime() <= Date.now();
}

const SLUG_VALIDO = /^[a-z0-9-]{1,80}$/;

export async function getProposal(slug: string): Promise<Proposal | null> {
  // Own-property + formato: sin esto, slugs como "constructor" o
  // "__proto__" devuelven valores heredados del prototipo y revientan.
  if (!SLUG_VALIDO.test(slug)) {
    return null;
  }
  const local = Object.hasOwn(PROPOSAL_REGISTRY, slug)
    ? PROPOSAL_REGISTRY[slug]
    : undefined;
  if (local) {
    return local;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("proposals")
      .select("data")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data?.data) {
      return null;
    }

    return { ...(data.data as Proposal), slug };
  } catch {
    return null;
  }
}
