import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatZodIssues, jsonError, readJson, requireAdminApi, unauthorized } from "@/lib/sandbox/admin";
import { sessionCreateSchema } from "@/lib/sandbox/schemas";
import { generateSandboxSlug } from "@/lib/sandbox/slug";

export const runtime = "nodejs";

function parseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// POST — crear sesión (§7 paso 1)
export async function POST(req: Request) {
  if (!(await requireAdminApi())) return unauthorized();

  const parsed = sessionCreateSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Datos inválidos", 400, { issues: formatZodIssues(parsed.error) });
  const input = parsed.data;

  const scheduledAt = parseDate(input.scheduledAt);
  if (scheduledAt === undefined && input.scheduledAt) return jsonError("Fecha de sesión inválida");

  if (input.franchiseId) {
    const exists = await prisma.franchise.findUnique({ where: { id: input.franchiseId }, select: { id: true } });
    if (!exists) return jsonError("La marca seleccionada no existe");
  }

  // Slug no adivinable; reintenta si colisiona (probabilidad ínfima).
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = generateSandboxSlug();
    try {
      const session = await prisma.sandboxSession.create({
        data: {
          slug,
          brandName: input.brandName,
          sector: input.sector.toUpperCase() as "RESTAURANTE" | "RETAIL" | "SERVICIOS" | "OTRO",
          country: input.country,
          city: input.city || null,
          logoUrl: input.logoUrl || null,
          accentColor: input.accentColor,
          consultantName: input.consultantName || null,
          scheduledAt: scheduledAt ?? null,
          locale: input.locale.toUpperCase() as "ES" | "EN",
          pin: input.pin || null,
          franchiseId: input.franchiseId || null,
        },
        select: { id: true, slug: true },
      });
      return NextResponse.json(session, { status: 201 });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "P2002") {
        console.error("[admin/sandbox] create", error);
        return jsonError("No se pudo crear la sesión", 500);
      }
    }
  }
  return jsonError("No se pudo generar un slug único", 500);
}
