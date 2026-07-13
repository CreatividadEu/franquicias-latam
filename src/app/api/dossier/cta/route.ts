import { NextResponse } from "next/server";
import { trackDossierCta, verifyDossierInvite } from "@/lib/dossier";

const SLUG = "pampa-malbec";

// Beacon de tracking del CTA del dossier. El token firma la atribución:
// sin token válido no se registra nada (y no filtramos si existe la ruta).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.t === "string" ? body.t : "";
    const invite = token ? verifyDossierInvite(token, SLUG) : null;
    if (invite) {
      await trackDossierCta(invite);
    }
  } catch {
    /* beacons nunca fallan hacia el cliente */
  }
  return NextResponse.json({ ok: true });
}
