"use server";

/**
 * Server actions de la ruta pública. Cada una re-valida en servidor y nunca
 * lanza hacia el cliente: un log de eventos que falla no puede romper una
 * demo en vivo.
 */
import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isSandboxLocale, type SandboxLocale } from "./i18n";
import { isSandboxPhaseId, toPrismaPhase, type SandboxPhaseId } from "./phases";
import { isValidPin, isValidSandboxSlug } from "./slug";
import {
  PIN_COOKIE_MAX_AGE_SEC,
  pinCookieName,
  pinToken,
} from "./session";
import type { SandboxEventType } from "./types";

const MAX_PAYLOAD_CHARS = 16_000;
const MAX_TYPE_CHARS = 64;

type SessionRef = { id: string; status: "DRAFT" | "READY" | "LIVE" | "DONE" | "ARCHIVED" };

async function findSession(slug: string): Promise<SessionRef | null> {
  if (!isValidSandboxSlug(slug)) return null;
  return prisma.sandboxSession.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
}

function sanitizePayload(payload: unknown): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;
  const json = JSON.stringify(payload);
  if (json.length > MAX_PAYLOAD_CHARS) {
    return { truncated: true, preview: json.slice(0, 500) };
  }
  return JSON.parse(json) as Record<string, unknown>;
}

export type RecordEventInput = {
  slug: string;
  phase: SandboxPhaseId;
  type: SandboxEventType | (string & {});
  payload?: Record<string, unknown>;
  /** Los eventos del presentador no cambian el estado de la sesión. */
  presenter?: boolean;
};

export async function recordSandboxEvent(input: RecordEventInput): Promise<{ ok: boolean }> {
  try {
    const { slug, phase, type } = input;
    if (!isSandboxPhaseId(phase)) return { ok: false };
    if (typeof type !== "string" || !type || type.length > MAX_TYPE_CHARS) return { ok: false };
    const session = await findSession(slug);
    if (!session || session.status === "ARCHIVED") return { ok: false };

    const payload = sanitizePayload(input.payload);
    await prisma.sandboxEvent.create({
      data: {
        sessionId: session.id,
        phase: toPrismaPhase(phase),
        type,
        payload: payload ? (payload as Prisma.InputJsonObject) : undefined,
      },
    });

    // La primera apertura del cliente (no del presentador) pasa READY → LIVE.
    if (type === "session_open" && !input.presenter && session.status === "READY") {
      await prisma.sandboxSession.updateMany({
        where: { id: session.id, status: "READY" },
        data: { status: "LIVE" },
      });
    }
    return { ok: true };
  } catch (error) {
    console.error("[sandbox/recordSandboxEvent]", error);
    return { ok: false };
  }
}

export async function verifySandboxPin(slug: string, pin: string): Promise<{ ok: boolean }> {
  try {
    if (!isValidSandboxSlug(slug) || !isValidPin(pin)) return { ok: false };
    const session = await prisma.sandboxSession.findUnique({
      where: { slug },
      select: { id: true, pin: true, status: true },
    });
    if (!session || session.status === "ARCHIVED") return { ok: false };
    if (!session.pin) return { ok: true };

    const ok = session.pin === pin;
    await prisma.sandboxEvent.create({
      data: { sessionId: session.id, phase: "INTRO", type: ok ? "pin_ok" : "pin_fail" },
    });
    if (!ok) return { ok: false };

    const store = await cookies();
    store.set({
      name: pinCookieName(slug),
      value: pinToken(slug, pin),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/sandbox/${slug}`,
      maxAge: PIN_COOKIE_MAX_AGE_SEC,
    });
    return { ok: true };
  } catch (error) {
    console.error("[sandbox/verifySandboxPin]", error);
    return { ok: false };
  }
}

export async function setSandboxLocale(slug: string, locale: SandboxLocale): Promise<{ ok: boolean }> {
  try {
    if (!isSandboxLocale(locale)) return { ok: false };
    const session = await findSession(slug);
    if (!session || session.status === "ARCHIVED") return { ok: false };
    await prisma.sandboxSession.update({
      where: { id: session.id },
      data: { locale: locale.toUpperCase() as "ES" | "EN" },
    });
    return { ok: true };
  } catch (error) {
    console.error("[sandbox/setSandboxLocale]", error);
    return { ok: false };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Guarda el correo al que se enviará el reporte. El PDF y el envío llegan en
 * el hito 7; hasta entonces el consultor lo ve en el admin y lo envía a mano.
 */
export async function requestSandboxReport(slug: string, email: string): Promise<{ ok: boolean }> {
  try {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean) || clean.length > 160) return { ok: false };
    const session = await findSession(slug);
    if (!session || session.status === "ARCHIVED") return { ok: false };
    await prisma.sandboxResult.upsert({
      where: { sessionId: session.id },
      update: { sentToEmail: clean },
      create: { sessionId: session.id, sentToEmail: clean },
    });
    await prisma.sandboxEvent.create({
      data: { sessionId: session.id, phase: "REPORTE", type: "report_email", payload: { email: clean } },
    });
    return { ok: true };
  } catch (error) {
    console.error("[sandbox/requestSandboxReport]", error);
    return { ok: false };
  }
}
