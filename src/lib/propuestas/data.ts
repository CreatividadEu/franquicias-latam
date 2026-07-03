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
export async function getProposal(slug: string): Promise<Proposal | null> {
  const local = PROPOSAL_REGISTRY[slug];
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
