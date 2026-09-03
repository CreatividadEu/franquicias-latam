import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatZodIssues, jsonError, readJson, requireAdminApi, unauthorized } from "@/lib/sandbox/admin";
import { PipelineError, buildSessionPreload } from "@/lib/sandbox/pipeline";
import { capPreload, sandboxPreloadSchema } from "@/lib/sandbox/schemas";

export const runtime = "nodejs";
export const maxDuration = 120;

type Ctx = { params: Promise<{ id: string }> };

/** POST — construye el preload desde lo extraído + quick-form + fallbacks (§3, §7 paso 4). */
export async function POST(_req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id } = await params;
  try {
    const result = await buildSessionPreload(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PipelineError) return jsonError(error.message, error.status);
    console.error("[admin/sandbox] preload build", error);
    return jsonError(error instanceof Error ? error.message : "Error construyendo el preload", 500);
  }
}

/** PUT — guarda el preload editado a mano por el consultor (validado con zod). */
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await requireAdminApi())) return unauthorized();
  const { id } = await params;
  const parsed = sandboxPreloadSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("El JSON no cumple el esquema", 400, { issues: formatZodIssues(parsed.error) });
  const preload = capPreload(parsed.data);

  const session = await prisma.sandboxSession.findUnique({ where: { id }, select: { id: true } });
  if (!session) return jsonError("Sesión no encontrada", 404);

  const data = {
    offering: preload.offering as unknown as Prisma.InputJsonObject,
    pains: preload.pains as unknown as Prisma.InputJsonObject,
    marketing: preload.marketing as unknown as Prisma.InputJsonObject,
    opexSkeleton: preload.opexSkeleton as unknown as Prisma.InputJsonObject,
  };
  const row = await prisma.sandboxPreload.upsert({
    where: { sessionId: id },
    update: data,
    create: { sessionId: id, ...data },
  });
  return NextResponse.json({ preload, updatedAt: row.updatedAt.toISOString() });
}
