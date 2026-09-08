"use client";

import { useState, type FormEvent } from "react";
import { fetchJsonSafely } from "@/lib/safeApiJson";

export type LoginCopy = {
  identifier: string;
  identifierPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  submitting: string;
  forgot: string;
  forgotHint: string;
  errorGeneric: string;
  errorNetwork: string;
  errorNoAccess: string;
};

type LoginResponse = { success: boolean; next: string };

export function LoginForm({ copy, next, initialError }: { copy: LoginCopy; next: string | null; initialError?: string | null }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await fetchJsonSafely<LoginResponse>("/api/totto-way/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, next: next ?? undefined }),
      });
      window.location.href = data.next || "/totto-way";
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (/acceso/i.test(message)) setError(copy.errorNoAccess);
      else if (/Respuesta|conexi/i.test(message) || !message) setError(copy.errorNetwork);
      else setError(copy.errorGeneric);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="tw-login__panel" noValidate>
      <div className="tw-field">
        <label className="tw-label" htmlFor="tw-identifier">
          {copy.identifier}
        </label>
        <input
          id="tw-identifier"
          className="tw-input"
          autoComplete="username"
          placeholder={copy.identifierPlaceholder}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          aria-invalid={error ? "true" : undefined}
        />
      </div>
      <div className="tw-field">
        <label className="tw-label" htmlFor="tw-password">
          {copy.password}
        </label>
        <input
          id="tw-password"
          className="tw-input"
          type="password"
          autoComplete="current-password"
          placeholder={copy.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={error ? "true" : undefined}
        />
      </div>

      {error ? (
        <div className="tw-error" role="alert">
          {error}
        </div>
      ) : null}

      <button type="submit" className="tw-btn tw-btn--black tw-btn--lg tw-btn--block" disabled={loading}>
        {loading ? copy.submitting : copy.submit}
      </button>

      <button type="button" className="tw-link tw-small" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", justifySelf: "start" }} onClick={() => setShowHint((v) => !v)}>
        {copy.forgot}
      </button>
      {showHint ? <p className="tw-muted tw-small">{copy.forgotHint}</p> : null}
    </form>
  );
}
