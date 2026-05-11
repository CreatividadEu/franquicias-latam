'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginForm() {
  const params = useSearchParams();
  const errorParam = params.get('error');
  const blockedEmail = params.get('email');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);
    try {
      const supabase = getSupabaseBrowser();
      const next = params.get('next') ?? '/';
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-foreground normal-case tracking-normal text-base">
          Seneca Leads
        </CardTitle>
        <p className="text-xs text-foreground-muted">
          Sign in with your work email. We&apos;ll send you a one-tap link.
        </p>
      </CardHeader>
      <CardContent>
        {errorParam === 'not_allowed' && (
          <div className="mb-3 rounded-md border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
            <strong>{blockedEmail}</strong> is signed in but not on the allow-list.
            Ask an admin to add you to <code>ALLOWED_EMAILS</code>.
          </div>
        )}
        {status === 'sent' ? (
          <div className="rounded-md border border-success/30 bg-success/10 p-3 text-xs text-success">
            Check your inbox. Click the link in the email Seneca sent to{' '}
            <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              required
              placeholder="you@franquiciaslatam.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending'}
              autoFocus
            />
            <Button type="submit" disabled={status === 'sending' || !email} className="w-full">
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </Button>
            {errorMsg && (
              <p className="text-xs text-danger">{errorMsg}</p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function LoginFallback() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-foreground normal-case tracking-normal text-base">
          Seneca Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-foreground-muted">Loading…</p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
