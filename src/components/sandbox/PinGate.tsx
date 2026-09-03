"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { verifySandboxPin } from "@/lib/sandbox/actions";
import { createTranslator } from "@/lib/sandbox/i18n";
import type { SandboxClientSession } from "@/lib/sandbox/types";
import BrandLockup from "./BrandLockup";
import SandboxBackground from "./SandboxBackground";

/** Puerta de PIN de 4 dígitos (§1). Cookie httpOnly de 12 h al acertar. */
export default function PinGate({ session }: { session: SandboxClientSession }) {
  const router = useRouter();
  const t = createTranslator(session.locale);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const accentStyle = {
    "--sb-accent": session.accent.onNavy,
    "--sb-accent-raw": session.accent.raw,
  } as CSSProperties;

  const submit = (value: string) => {
    if (value.length !== 4 || pending) return;
    startTransition(async () => {
      const res = await verifySandboxPin(session.slug, value);
      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
        setPin("");
      }
    });
  };

  return (
    <main style={accentStyle} className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <SandboxBackground />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <BrandLockup brandName={session.brandName} logoUrl={session.logoUrl} flLabel={t("common.franquiciasLatam")} />
        <p className="sb-kicker mt-12">{t("pin.kicker")}</p>
        <h1 className="sb-title mt-3">{t("pin.title")}</h1>
        <p className="mt-3 text-[15px] text-[var(--sb-muted)]">{t("pin.body")}</p>

        <form
          className="mt-8 flex flex-col items-center gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit(pin);
          }}
        >
          <InputOTP
            maxLength={4}
            value={pin}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoFocus
            aria-label={t("pin.title")}
            onChange={(value) => {
              setPin(value);
              setError(false);
              if (value.length === 4) submit(value);
            }}
          >
            <InputOTPGroup className="gap-3">
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} className="sb-pin-slot" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className={`min-h-5 text-[13px] ${error ? "text-[var(--sb-amber)]" : "text-transparent"}`} aria-live="polite">
            {error ? t("pin.error") : "·"}
          </p>
          <button type="submit" disabled={pin.length !== 4 || pending} className="sb-btn sb-btn-primary w-full">
            {t("pin.cta")}
          </button>
        </form>
      </div>
    </main>
  );
}
