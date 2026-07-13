import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { clampTtl, signDossierInvite, TTL_DEFAULT_HOURS } from "@/lib/dossier";

// Genera el link de invitación firmado para un dossier privado.
// Solo admins (sesión existente). Uso:
//   /api/admin/dossier-invite?email=juan@x.com&name=Juan%20Martín&ttl=72
export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  const name = (url.searchParams.get("name") ?? "").trim();
  const slug = (url.searchParams.get("slug") ?? "pampa-malbec").trim();
  const ttlHours = clampTtl(
    Number.parseInt(url.searchParams.get("ttl") ?? "", 10) || TTL_DEFAULT_HOURS,
  );

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Parámetro 'email' inválido o ausente" },
      { status: 400 },
    );
  }

  const token = signDossierInvite({ slug, email, name, ttlHours });
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.franquiciaslatam.com";
  const link = `${base}/dossier/${slug}?t=${encodeURIComponent(token)}`;

  return NextResponse.json({ slug, email, name: name || null, ttlHours, link });
}
