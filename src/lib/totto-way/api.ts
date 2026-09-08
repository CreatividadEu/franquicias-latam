/**
 * Helpers de route handlers de Totto Way: respuestas JSON uniformes y lectura
 * segura del body. Mismo patrón que el admin del Sandbox. Solo server.
 */
import { NextResponse } from "next/server";
import type { z } from "zod";

export function unauthorized(error = "No autorizado") {
  return NextResponse.json({ error }, { status: 401 });
}

export function forbidden(error = "Sin permiso") {
  return NextResponse.json({ error }, { status: 403 });
}

export function jsonError(error: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues
    .slice(0, 8)
    .map((issue) => `${issue.path.map(String).join(".") || "(raíz)"}: ${issue.message}`);
}
