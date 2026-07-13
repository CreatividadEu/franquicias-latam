import { NextResponse } from "next/server";
import {
  resolveOpenKey,
  trackDossierCta,
  verifyDossierInvite,
} from "@/lib/dossier";

const SLUG = "pampa-malbec";

// Beacon de tracking del CTA del dossier. La key o el token firman la
// atribución: sin credencial válida no se registra nada.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = typeof body?.k === "string" ? body.k : "";
    const token = typeof body?.t === "string" ? body.t : "";
    const invite =
      (key && resolveOpenKey(key, SLUG)) ||
      (token && verifyDossierInvite(token, SLUG)) ||
      null;
    if (invite) {
      await trackDossierCta(invite);
    }
  } catch {
    /* beacons nunca fallan hacia el cliente */
  }
  return NextResponse.json({ ok: true });
}
