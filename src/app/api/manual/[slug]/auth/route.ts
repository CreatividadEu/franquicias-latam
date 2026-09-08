import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MANUAL_TOKEN_COOKIE,
  esManualConPuerta,
  firmarToken,
  opcionesCookie,
  puertaConfigurada,
  verificarCredenciales,
} from "@/lib/manual/auth";

/** Entrada y salida del manual de costeo del cliente. */

const BodySchema = z.object({
  usuario: z.string().trim().min(1).max(120),
  contrasena: z.string().min(1).max(200),
});

// Freno básico de fuerza bruta. En serverless cada instancia tiene su propia
// memoria, así que no es una barrera dura — es un tope que encarece el intento
// sin castigar a quien simplemente se equivocó al teclear.
const INTENTOS = new Map<string, { n: number; hasta: number }>();
const MAX_INTENTOS = 10;
const VENTANA_MS = 10 * 60 * 1000;

function demasiadosIntentos(ip: string): boolean {
  const ahora = Date.now();
  const registro = INTENTOS.get(ip);
  if (!registro || registro.hasta < ahora) return false;
  return registro.n >= MAX_INTENTOS;
}

function anotarFallo(ip: string) {
  const ahora = Date.now();
  const registro = INTENTOS.get(ip);
  if (!registro || registro.hasta < ahora) INTENTOS.set(ip, { n: 1, hasta: ahora + VENTANA_MS });
  else registro.n += 1;
  if (INTENTOS.size > 5000) INTENTOS.clear();
}

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!esManualConPuerta(slug)) {
    return NextResponse.json({ error: "Manual no encontrado" }, { status: 404 });
  }
  if (!puertaConfigurada(slug)) {
    console.error(`[manual/${slug}] faltan las variables de entorno de acceso`);
    return NextResponse.json({ error: "El acceso no está configurado" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";
  if (demasiadosIntentos(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 });
  }

  const usuario = await verificarCredenciales(slug, parsed.data.usuario, parsed.data.contrasena);
  if (!usuario) {
    anotarFallo(ip);
    // Un solo mensaje para los dos campos: no se delata cuál falló.
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const respuesta = NextResponse.json({ ok: true, usuario });
  respuesta.cookies.set(MANUAL_TOKEN_COOKIE, firmarToken(slug, usuario), opcionesCookie());
  return respuesta;
}

export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(MANUAL_TOKEN_COOKIE, "", { ...opcionesCookie(), maxAge: 0 });
  return respuesta;
}
