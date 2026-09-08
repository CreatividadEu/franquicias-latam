import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ManualSlug } from "./auth";

/**
 * Lo que el manual guarda: el costo de cada pieza y si el negocio factura con
 * IVA. Se valida la forma, no el catálogo — qué piezas existen hoy lo sabe el
 * manual, y ahí se filtra al pintarlas. Así, renombrar una pieza no invalida
 * lo que el cliente ya tenía guardado.
 */
export const EstadoSchema = z.object({
  costos: z.record(z.string().min(1).max(40), z.number().finite().min(0).max(1_000_000)),
  conIVA: z.boolean(),
});

export type EstadoManual = z.infer<typeof EstadoSchema>;

/** Tope de seguridad: nadie debe poder engordar la fila con miles de claves. */
const MAX_PIEZAS = 300;

export function parsearEstado(valor: unknown): EstadoManual | null {
  const parsed = EstadoSchema.safeParse(valor);
  if (!parsed.success) return null;
  if (Object.keys(parsed.data.costos).length > MAX_PIEZAS) return null;
  return parsed.data;
}

export type EstadoGuardado = { estado: EstadoManual; actualizado: string; por: string | null };

export async function leerEstado(slug: ManualSlug): Promise<EstadoGuardado | null> {
  const fila = await prisma.manualCosting.findUnique({ where: { slug } });
  if (!fila) return null;
  const estado = parsearEstado(fila.data);
  if (!estado) return null;
  return { estado, actualizado: fila.updatedAt.toISOString(), por: fila.updatedBy };
}

export async function guardarEstado(
  slug: ManualSlug,
  estado: EstadoManual,
  usuario: string,
): Promise<EstadoGuardado> {
  const fila = await prisma.manualCosting.upsert({
    where: { slug },
    create: { slug, data: estado, updatedBy: usuario },
    update: { data: estado, updatedBy: usuario },
  });
  return { estado, actualizado: fila.updatedAt.toISOString(), por: fila.updatedBy };
}
