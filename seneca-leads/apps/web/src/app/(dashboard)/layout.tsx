import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Activity,
  Building2,
  LogOut,
} from 'lucide-react';
import { getCurrentUser, isEmailAllowed } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/businesses', label: 'Businesses', icon: Building2 },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pains', label: 'Pains', icon: AlertTriangle },
  { href: '/ingestion', label: 'Ingestion', icon: Activity },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!isEmailAllowed(user.email)) redirect(`/login?error=not_allowed&email=${user.email}`);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-background-card flex flex-col">
        <div className="px-4 h-12 flex items-center border-b border-border">
          <Link href="/" className="text-foreground font-medium text-sm tracking-tight">
            Seneca <span className="text-accent">Leads</span>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border px-4 py-3 text-xs text-foreground-subtle space-y-1">
          <div className="truncate" title={user.email ?? ''}>
            {user.email}
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1 text-foreground-muted hover:text-accent transition-colors"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="px-6 py-5 max-w-screen-2xl">{children}</div>
      </main>
    </div>
  );
}
