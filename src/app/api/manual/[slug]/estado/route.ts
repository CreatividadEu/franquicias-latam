import { NextResponse } from "next/server";
import { esManualConPuerta, sesionManual } from "@/lib/manual/auth";
import { guardarEstado, leerEstado, parsearEstado } from "@/lib/manual/estado";

/** Los costos guardados del manual. Todo pasa por la sesión del propio manual. */

async function exigirSesion(slug: string) {
  if (!esManualConPuerta(slug)) return { error: NextResponse.json({ error: "Manual no encontrado" }, { status: 404 }) };
  const sesion = await sesionManual(slug);
  if (!sesion) return { error: NextResponse.json({ error: "Sesión requerida" }, { status: 401 }) };
  return { sesion };
}

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const { sesion, error } = await exigirSesion(slug);
  if (error) return error;

  try {
    const guardado = await leerEstado(sesion.slug);
    return NextResponse.json({ guardado });
  } catch (e) {
    console.error(`[manual/${slug}] no se pudo leer el estado:`, e);
    return NextResponse.json({ error: "No se pudo leer lo guardado" }, { status: 503 });
  }
}

export async function PUT(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const { sesion, error } = await exigirSesion(slug);
  if (error) return error;

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const estado = parsearEstado(cuerpo);
  if (!estado) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  try {
    const guardado = await guardarEstado(sesion.slug, estado, sesion.usuario);
    return NextResponse.json({ guardado });
  } catch (e) {
    console.error(`[manual/${slug}] no se pudo guardar el estado:`, e);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 503 });
  }
}
