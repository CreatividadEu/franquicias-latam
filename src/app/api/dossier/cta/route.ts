import { NextResponse } from "next/server";
import {
  resolveOpenKey,
  trackDossierCta,
  verifyDossierInvite,
} from "@/lib/dossier";

// Dossiers activos; el slug llega en el body y se valida contra esta lista.
// Sin slug se asume pampa-malbec (compatibilidad con links ya emitidos).
const SLUGS = new Set(["pampa-malbec", "the-body-concept"]);

// Beacon de tracking del CTA del dossier. La key o el token firman la
// atribución: sin credencial válida no se registra nada.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = typeof body?.k === "string" ? body.k : "";
    const token = typeof body?.t === "string" ? body.t : "";
    const slug =
      typeof body?.slug === "string" && SLUGS.has(body.slug)
        ? body.slug
        : "pampa-malbec";
    const invite =
      (key && resolveOpenKey(key, slug)) ||
      (token && verifyDossierInvite(token, slug)) ||
      null;
    if (invite) {
      await trackDossierCta(invite);
    }
  } catch {
    /* beacons nunca fallan hacia el cliente */
  }
  return NextResponse.json({ ok: true });
}
