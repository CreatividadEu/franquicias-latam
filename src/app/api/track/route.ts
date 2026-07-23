import { NextResponse } from "next/server";

// Beacon del pitch /p/[slug]: (a) vista completada, (b) click en pagar.
// Por ahora basta con dejar el evento en los logs del server
// (en Vercel: proyecto → Logs → filtrar "pitch:track").
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(
      "[pitch:track]",
      JSON.stringify({
        event: typeof body?.event === "string" ? body.event : "unknown",
        slug: typeof body?.slug === "string" ? body.slug : "unknown",
        at: new Date().toISOString(),
        ua: request.headers.get("user-agent") ?? undefined,
      }),
    );
  } catch {
    /* los beacons nunca fallan hacia el cliente */
  }
  return NextResponse.json({ ok: true });
}
