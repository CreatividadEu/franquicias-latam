"use server";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getProposal } from "./data";

export type IntentAction = "confirmar_cupo" | "solicitar_disponibilidad";

export type IntentResult = { ok: boolean };

const ACCIONES: IntentAction[] = ["confirmar_cupo", "solicitar_disponibilidad"];

/**
 * Persiste la intención del CTA en Supabase (`proposal_intents`).
 * Tabla: supabase/sql/20260703120000_propuestas.sql. Si Supabase no
 * está configurado devuelve ok:false y el cliente degrada a WhatsApp.
 */
export async function registrarIntencion(input: {
  proposalSlug: string;
  action: IntentAction;
  contacto?: string;
}): Promise<IntentResult> {
  const { proposalSlug, action, contacto } = input;

  if (!ACCIONES.includes(action)) {
    return { ok: false };
  }
  const proposal = await getProposal(proposalSlug);
  if (!proposal) {
    return { ok: false };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.warn(
      "[propuestas/registrarIntencion] Supabase no configurado; intención no persistida",
      { proposalSlug, action },
    );
    return { ok: false };
  }

  try {
    const { error } = await supabase.from("proposal_intents").insert({
      proposal_slug: proposalSlug,
      action,
      contacto: contacto ? contacto.trim().slice(0, 200) : null,
    });
    if (error) {
      console.error("[propuestas/registrarIntencion] Error:", error.message);
      return { ok: false };
    }
    console.log("[propuestas/registrarIntencion] Intención registrada", {
      proposalSlug,
      action,
    });
    return { ok: true };
  } catch (error) {
    console.error("[propuestas/registrarIntencion] Error:", error);
    return { ok: false };
  }
}
