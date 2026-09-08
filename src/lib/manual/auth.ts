import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

/**
 * Sesión de los manuales de costeo (/manual/[slug]).
 *
 * Es una puerta aparte de las del resto de la plataforma: el cliente entra a su
 * propio documento de trabajo, no a Franquicias LATAM. Comparte el JWT_SECRET
 * pero el token lleva `aud: "manual"` y su propio nombre de cookie, así que un
 * token de manual nunca vale como sesión de /admin ni de /totto-way, ni al
 * revés.
 *
 * Las credenciales viven en variables de entorno, nunca en el repositorio:
 * este repo es público.
 */

export const MANUAL_TOKEN_COOKIE = "manual_token";

const AUDIENCE = "manual";
const DIAS = 30;

/** Manuales con puerta, y de qué variables salen sus credenciales. */
const MANUALES = {
  "pollo-al-barril": {
    usuario: "MANUAL_POLLO_AL_BARRIL_USER",
    hash: "MANUAL_POLLO_AL_BARRIL_PASSWORD_HASH",
  },
} as const;

export type ManualSlug = keyof typeof MANUALES;

export const esManualConPuerta = (slug: string): slug is ManualSlug => slug in MANUALES;

export type ManualSession = { slug: ManualSlug; usuario: string };

// El secreto se resuelve en cada petición, no al importar: `next build` recorre
// los módulos sin las variables cargadas y no debe reventar por eso.
function secreto(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is required. Set JWT_SECRET in the environment.");
  return s;
}

// Un hash bcrypt lleva signos de dólar ($2b$12$...) y los archivos .env los
// expanden como si fueran variables, dejando el hash mutilado. En Vercel no
// pasa (las variables no se parsean), pero en local hay que escribirlos como
// \$. Comprobar la forma convierte un "contraseña incorrecta" desconcertante
// en un error claro.
const FORMA_BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/** ¿Está configurada la puerta de este manual? Sin credenciales no hay acceso. */
export function puertaConfigurada(slug: ManualSlug): boolean {
  const { usuario, hash } = MANUALES[slug];
  const valorHash = process.env[hash];
  if (!process.env[usuario] || !valorHash) return false;
  if (!FORMA_BCRYPT.test(valorHash)) {
    console.error(
      `[manual/${slug}] ${hash} no tiene forma de hash bcrypt. ` +
        `Si viene de un archivo .env, escapa los $ como \\$.`,
    );
    return false;
  }
  return true;
}

/**
 * Comprueba usuario y contraseña. Devuelve el usuario canónico o null.
 * bcrypt.compare tarda lo mismo acierte o falle, y cuando el usuario no existe
 * se compara igual contra un hash de descarte para no delatar por el tiempo de
 * respuesta cuál de los dos campos estaba mal.
 */
export async function verificarCredenciales(
  slug: ManualSlug,
  usuario: string,
  contrasena: string,
): Promise<string | null> {
  if (!puertaConfigurada(slug)) return null;
  const config = MANUALES[slug];
  const esperado = process.env[config.usuario];
  const hash = process.env[config.hash];
  if (!esperado || !hash) return null;

  const usuarioOk = usuario.trim().toLowerCase() === esperado.trim().toLowerCase();
  const contrasenaOk = await bcrypt.compare(contrasena, hash);
  return usuarioOk && contrasenaOk ? esperado : null;
}

export function firmarToken(slug: ManualSlug, usuario: string): string {
  return jwt.sign({ slug, usuario }, secreto(), {
    audience: AUDIENCE,
    expiresIn: `${DIAS}d`,
  });
}

export function verificarToken(token: string): ManualSession | null {
  try {
    const payload = jwt.verify(token, secreto(), { audience: AUDIENCE }) as {
      slug?: string;
      usuario?: string;
    };
    if (!payload.slug || !payload.usuario || !esManualConPuerta(payload.slug)) return null;
    return { slug: payload.slug, usuario: payload.usuario };
  } catch {
    return null;
  }
}

/** La sesión del manual pedido, o null. Un token de otro manual no sirve. */
export async function sesionManual(slug: ManualSlug): Promise<ManualSession | null> {
  const token = (await cookies()).get(MANUAL_TOKEN_COOKIE)?.value;
  if (!token) return null;
  const sesion = verificarToken(token);
  return sesion && sesion.slug === slug ? sesion : null;
}

export function opcionesCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  };
}
