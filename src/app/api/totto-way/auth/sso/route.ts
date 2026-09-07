import { NextResponse } from "next/server";
import { getAdminUser, signToken, TW_TOKEN_COOKIE, tottoWayCookieOptions } from "@/lib/auth";
import { safeNextPath, TW_HOME_PATH, TW_LOGIN_PATH } from "@/lib/totto-way/paths";

/**
 * SSO admin → Totto Way: un ADMIN con `admin_token` válido recibe `tw_token`
 * sin volver a escribir su contraseña y entra como formador global.
 * GET con redirect para poder invocarlo desde un layout de servidor.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next") ?? undefined) ?? TW_HOME_PATH;

  const admin = await getAdminUser();
  if (!admin) {
    const login = new URL(TW_LOGIN_PATH, url.origin);
    login.searchParams.set("error", "sso");
    login.searchParams.set("next", next);
    const response = NextResponse.redirect(login);
    // Limpia un tw_token inválido para que el proxy no siga dejando pasar.
    response.cookies.set(TW_TOKEN_COOKIE, "", tottoWayCookieOptions(0));
    return response;
  }

  const response = NextResponse.redirect(new URL(next, url.origin));
  response.cookies.set(TW_TOKEN_COOKIE, signToken({ userId: admin.id, role: admin.role }), tottoWayCookieOptions());
  return response;
}
