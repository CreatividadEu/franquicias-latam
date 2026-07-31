import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";

/**
 * Guardas del Command Center. Reutilizan el mismo mecanismo del panel admin
 * (JWT `admin_token` + rol ADMIN, ver src/lib/auth.ts). Cada server action
 * vuelve a verificar en servidor: el cliente nunca es fuente de autoridad.
 */

const LOGIN_PATH = "/admin/login";

/** Para páginas: sin sesión válida → redirect al login del panel. */
export async function requireSajuAdmin() {
  const admin = await getAdminUser();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}

/** Para server actions: devuelve null en vez de redirigir. */
export async function getSajuAdmin() {
  return getAdminUser();
}
