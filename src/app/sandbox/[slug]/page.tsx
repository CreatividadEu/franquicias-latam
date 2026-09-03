import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { parsePhaseParam } from "@/lib/sandbox/phases";
import {
  getSandboxSessionBySlug,
  hasValidPinCookie,
  toClientSession,
} from "@/lib/sandbox/session";
import PinGate from "@/components/sandbox/PinGate";
import SandboxExperience from "@/components/sandbox/SandboxExperience";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSandboxSessionBySlug(slug);
  return {
    title: session ? `${session.brandName} × Franquicias LATAM` : "Sandbox · Franquicias LATAM",
    robots: { index: false, follow: false, nocache: true },
  };
}

/** El admin logueado entra sin PIN (preview y modo presentador). */
async function isAdmin(): Promise<boolean> {
  try {
    return Boolean(await getAdminUser());
  } catch {
    return false;
  }
}

export default async function SandboxPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const row = await getSandboxSessionBySlug(slug);
  if (!row || row.status === "ARCHIVED") notFound();

  const presenter = sp.presenter === "1";
  const session = toClientSession(row);

  if (row.pin) {
    const unlocked = (await hasValidPinCookie(slug, row.pin)) || (await isAdmin());
    if (!unlocked) return <PinGate session={session} />;
  }

  return (
    <SandboxExperience
      session={session}
      presenter={presenter}
      initialPhase={parsePhaseParam(sp.fase)}
      calendarUrl={process.env.SANDBOX_CALENDAR_URL?.trim() || null}
    />
  );
}
