import { cookies } from "next/headers";
import { GATE, BRAND } from "@/lib/intel/copy";
import { submitPasscode } from "./actions";
import { INTEL_COOKIE } from "./gate-config";

// ── Compuerta opcional ──────────────────────────────────────────────────────
// Si INTEL_PASSCODE está definido, la ruta pide código y guarda una cookie
// httpOnly. Si no está definido, la página queda abierta.

export async function isUnlocked(): Promise<boolean> {
  const expected = process.env.INTEL_PASSCODE;
  if (!expected) return true;
  const store = await cookies();
  return store.get(INTEL_COOKIE)?.value === expected;
}

export default function PasscodeGate({ error }: { error?: boolean }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <form action={submitPasscode} className="intel-card intel-card-pad w-full max-w-[380px]">
        <p className="intel-eyebrow">
          {BRAND.wordmark} · {BRAND.wordmarkSuffix}
        </p>
        <h1 className="intel-display mt-3 text-[22px]">{GATE.title}</h1>
        <p className="intel-hint mt-2">{GATE.subtitle}</p>
        <label htmlFor="code" className="intel-eyebrow mt-6 block">
          {GATE.label}
        </label>
        <input
          id="code"
          name="code"
          type="password"
          autoComplete="off"
          autoFocus
          required
          className="mono mt-2 w-full rounded-[8px] border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2.5 text-[15px] text-[var(--text)] outline-none"
        />
        {error ? (
          <p className="mt-3 text-[13.5px]" style={{ color: "var(--neg)" }}>
            {GATE.error}
          </p>
        ) : null}
        <button
          type="submit"
          className="intel-display mt-5 w-full cursor-pointer rounded-[8px] bg-[var(--accent)] px-4 py-2.5 text-[14px] text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          {GATE.submit}
        </button>
      </form>
    </main>
  );
}
