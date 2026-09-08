import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken, TW_TOKEN_COOKIE, tottoWayCookieOptions, tottoWayUserInclude } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/totto-way/api";
import { isTottoWayRole } from "@/lib/totto-way/scope";
import { safeNextPath, TW_HOME_PATH, TW_ONBOARDING_PATH } from "@/lib/totto-way/paths";

/**
 * Login de Totto Way: correo o código de colaborador + contraseña. Mismo
 * mecanismo que /api/admin/auth (bcrypt + JWT), cookie `tw_token`.
 */

const BodySchema = z.object({
  identifier: z.string().trim().min(2).max(160),
  password: z.string().min(1).max(200),
  next: z.string().max(300).nullish(),
});

async function findUser(identifier: string) {
  if (identifier.includes("@")) {
    return prisma.user.findUnique({
      where: { email: identifier.toLowerCase() },
      include: tottoWayUserInclude,
    });
  }
  const employee = await prisma.twEmployee.findFirst({
    where: { employeeCode: { equals: identifier, mode: "insensitive" } },
    select: { userId: true },
  });
  if (!employee) return null;
  return prisma.user.findUnique({ where: { id: employee.userId }, include: tottoWayUserInclude });
}

export async function POST(request: Request) {
  try {
    const parsed = BodySchema.safeParse(await readJson(request));
    if (!parsed.success) return jsonError("Correo o código y contraseña son requeridos", 400);

    const { identifier, password } = parsed.data;
    const user = await findUser(identifier);

    if (!user || !isTottoWayRole(user.role)) {
      return jsonError("Credenciales inválidas", 401);
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return jsonError("Credenciales inválidas", 401);

    // Solo ADMIN entra sin ficha de empleado (como formador global).
    if (user.role !== "ADMIN" && !user.twEmployee) {
      return jsonError("Tu cuenta no tiene acceso a Totto Way", 403, { code: "NO_ACCESS" });
    }

    const needsOnboarding = !!user.twEmployee && !user.twEmployee.onboardedAt;
    const next = needsOnboarding ? TW_ONBOARDING_PATH : (safeNextPath(parsed.data.next) ?? TW_HOME_PATH);

    const token = signToken({ userId: user.id, role: user.role });
    const response = NextResponse.json({
      success: true,
      next,
      user: { name: user.name, role: user.role },
    });
    response.cookies.set(TW_TOKEN_COOKIE, token, tottoWayCookieOptions());
    return response;
  } catch (error) {
    console.error("[totto-way/auth] login failed:", error);
    return jsonError("Error interno del servidor", 500);
  }
}
