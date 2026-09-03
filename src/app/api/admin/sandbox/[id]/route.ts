import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  adminSessionInclude,
  formatZodIssues,
  jsonError,
  readJson,
  requireAdminApi,
  toAdminSessionDTO,
  unauthorized,
} from "@/lib/sandbox/admin";
import { sessionUpdateSchema } from "@/lib/sandbox/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id } = await params;
  const row = await prisma.sandboxSession.findUnique({ where: { id }, include: adminSessionInclude });
  if (!row) return jsonError("Sesión no encontrada", 404);
  return NextResponse.json(toAdminSessionDTO(row));
}

// PATCH — marca, estado, PIN, idioma, quick-form de marketing (§7 pasos 1, 3 y 5)
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id } = await params;

  const parsed = sessionUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Datos inválidos", 400, { issues: formatZodIssues(parsed.error) });
  const input = parsed.data;

  const data: Prisma.SandboxSessionUpdateInput = {};
  if (input.brandName !== undefined) data.brandName = input.brandName;
  if (input.sector !== undefined) data.sector = input.sector.toUpperCase() as "RESTAURANTE" | "RETAIL" | "SERVICIOS" | "OTRO";
  if (input.country !== undefined) data.country = input.country;
  if (input.city !== undefined) data.city = input.city || null;
  if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl || null;
  if (input.accentColor !== undefined) data.accentColor = input.accentColor;
  if (input.consultantName !== undefined) data.consultantName = input.consultantName || null;
  if (input.locale !== undefined) data.locale = input.locale.toUpperCase() as "ES" | "EN";
  if (input.pin !== undefined) data.pin = input.pin || null;
  if (input.status !== undefined) data.status = input.status.toUpperCase() as "DRAFT" | "READY" | "LIVE" | "DONE" | "ARCHIVED";
  if (input.scheduledAt !== undefined) {
    if (!input.scheduledAt) data.scheduledAt = null;
    else {
      const d = new Date(input.scheduledAt);
      if (Number.isNaN(d.getTime())) return jsonError("Fecha de sesión inválida");
      data.scheduledAt = d;
    }
  }
  if (input.franchiseId !== undefined) {
    if (!input.franchiseId) data.franchise = { disconnect: true };
    else {
      const exists = await prisma.franchise.findUnique({ where: { id: input.franchiseId }, select: { id: true } });
      if (!exists) return jsonError("La marca seleccionada no existe");
      data.franchise = { connect: { id: input.franchiseId } };
    }
  }
  if (input.marketingInputs !== undefined) {
    data.marketingInputs = input.marketingInputs === null ? Prisma.JsonNull : (input.marketingInputs as Prisma.InputJsonObject);
  }

  try {
    const row = await prisma.sandboxSession.update({ where: { id }, data, include: adminSessionInclude });
    return NextResponse.json(toAdminSessionDTO(row));
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2025") return jsonError("Sesión no encontrada", 404);
    console.error("[admin/sandbox] update", error);
    return jsonError("No se pudo guardar la sesión", 500);
  }
}
