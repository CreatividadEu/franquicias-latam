import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Inject pathname so layouts can detect the current route without an
  // async cookies() call that would delay server-component rendering.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Guard all /admin routes except the login page.
  // Doing this in the proxy (edge) means the serverless layout never issues
  // a redirect for unauthenticated requests, which prevents CDN from caching
  // a stale redirect that would cause the sidebar to be missing on first visit.
  const isAdminLoginPage =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (pathname.startsWith("/admin") && !isAdminLoginPage) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Guard /totto-way (LMS) by cookie presence, same reasoning as /admin. An
  // admin session also passes: the (app) layout exchanges it for tw_token via
  // /api/totto-way/auth/sso. Token validity is checked in the layout.
  const isTwLoginPage =
    pathname === "/totto-way/login" || pathname.startsWith("/totto-way/login/");
  // Static assets under /public/totto-way (logos, photos, posters) are public.
  const isStaticAsset = /\.[a-z0-9]{2,5}$/i.test(pathname);

  if (pathname.startsWith("/totto-way") && !isTwLoginPage && !isStaticAsset) {
    const twToken = request.cookies.get("tw_token")?.value;
    const adminToken = request.cookies.get("admin_token")?.value;
    if (!twToken && !adminToken) {
      const login = new URL("/totto-way/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
