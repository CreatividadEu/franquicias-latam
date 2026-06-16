// Server-side Supabase client for Server Components + Server Actions.
// Reads session cookies set by the auth flow; falls back to anonymous if
// no session is present.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies — middleware refreshes them.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return false;
  return allow.includes(email.toLowerCase());
}
