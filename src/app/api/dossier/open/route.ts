import { NextResponse } from "next/server";
import { ensureOpenedAt, resolveOpenKey } from "@/lib/dossier";

// Dossiers activos; el slug llega en el body y se valida contra esta lista.
// Sin slug se asume pampa-malbec (compatibilidad con links ya emitidos).
const SLUGS = new Set(["pampa-malbec", "the-body-concept"]);

// Beacon de consumo de un link abierto: lo dispara el cliente al montar la
// página (los bots de preview no ejecutan JS, así que un prefetch no quema
// el link). Registra la primera apertura y arranca la ventana única de
// lectura; llamadas repetidas son idempotentes.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = typeof body?.k === "string" ? body.k : "";
    const slug =
      typeof body?.slug === "string" && SLUGS.has(body.slug)
        ? body.slug
        : "pampa-malbec";
    const invite = key ? resolveOpenKey(key, slug) : null;
    if (invite) {
      await ensureOpenedAt(invite);
    }
  } catch {
    /* los beacons nunca fallan hacia el cliente */
  }
  return NextResponse.json({ ok: true });
}
