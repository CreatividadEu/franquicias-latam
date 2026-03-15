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
