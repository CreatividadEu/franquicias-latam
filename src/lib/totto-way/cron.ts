/**
 * Guarda de los jobs programados. Vercel Cron llama con
 * `Authorization: Bearer $CRON_SECRET`; un ADMIN con sesión también puede
 * dispararlos a mano desde el panel para depurar.
 */
import { getAdminUser } from "@/lib/auth";

export async function isAuthorizedCron(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (secret && header === `Bearer ${secret}`) return true;

  // Sin secreto configurado no se abre el endpoint: solo un admin logueado.
  try {
    return !!(await getAdminUser());
  } catch {
    return false;
  }
}
