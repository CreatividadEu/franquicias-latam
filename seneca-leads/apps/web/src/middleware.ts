import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth/callback'];

function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.length > 0 && allow.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  // Public assets/files
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Misconfiguration — let request through; the page itself will warn.
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (!isAllowed(user.email)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'not_allowed');
    loginUrl.searchParams.set('email', user.email ?? '');
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
