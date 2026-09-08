import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth";
import { getTwSession } from "@/lib/totto-way/auth";
import { TW_LOGIN_PATH, TW_ONBOARDING_PATH, TW_SSO_PATH } from "@/lib/totto-way/paths";
import { TwShell } from "../_components/TwShell";

export const dynamic = "force-dynamic";

/**
 * Guarda de segmento (PLAN §5): sin sesión válida no se renderiza nada de la
 * app. Un admin de la plataforma sin tw_token pasa primero por el SSO, que le
 * emite la cookie y vuelve aquí.
 */
export default async function TottoWayAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getTwSession();

  if (!session) {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") ?? "/totto-way";
    const cookieStore = await cookies();
    if (cookieStore.get(ADMIN_TOKEN_COOKIE)?.value) {
      redirect(`${TW_SSO_PATH}?next=${encodeURIComponent(pathname)}`);
    }
    redirect(`${TW_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
  }

  if (session.needsOnboarding) redirect(TW_ONBOARDING_PATH);

  return <TwShell session={session}>{children}</TwShell>;
}
