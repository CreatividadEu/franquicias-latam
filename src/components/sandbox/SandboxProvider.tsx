"use client";

import { createContext, useContext } from "react";
import type { SandboxLocale, SandboxMessages, Translator } from "@/lib/sandbox/i18n";
import type { SandboxPhaseId } from "@/lib/sandbox/phases";
import type { SandboxClientSession } from "@/lib/sandbox/types";

export type NavReason = "next" | "back" | "jump" | "skip" | "rail";

export type SandboxContextValue = {
  session: SandboxClientSession;
  presenter: boolean;
  locale: SandboxLocale;
  setLocale: (locale: SandboxLocale) => void;
  t: Translator;
  messages: SandboxMessages;
  phase: SandboxPhaseId;
  visited: readonly SandboxPhaseId[];
  goTo: (phase: SandboxPhaseId, reason?: NavReason) => void;
  next: () => void;
  back: () => void;
  /** Log append-only: fire-and-forget, nunca bloquea la UI. */
  track: (type: string, payload?: Record<string, unknown>) => void;
  reduceMotion: boolean;
  calendarUrl: string | null;
};

const SandboxContext = createContext<SandboxContextValue | null>(null);

export const SandboxContextProvider = SandboxContext.Provider;

export function useSandbox(): SandboxContextValue {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error("useSandbox() debe usarse dentro de <SandboxExperience>");
  return ctx;
}
