import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cinzel, Archivo } from "next/font/google";
import {
  dossierDeadline,
  dossierExpirado,
  ensureOpenedAt,
  verifyDossierInvite,
} from "@/lib/dossier";
import { PampaMalbecDossier } from "@/components/dossier/PampaMalbecDossier";
import { DossierExpired } from "@/components/dossier/DossierExpired";

const SLUG = "pampa-malbec";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

// Dossier privado: jamás indexar ni cachear.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ t?: string }>;

// La validación vive también aquí (antes del streaming) para que el status
// HTTP sea un 404 real; dentro del page llegaría tarde y la respuesta ya
// habría salido como 200 (mismo patrón que /propuesta/[slug]).
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { t } = await searchParams;
  if (!t || !verifyDossierInvite(t, SLUG)) {
    notFound();
  }
  return {
    title: "Propuesta Estratégica de Franquicia — Confidencial",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function PampaMalbecDossierPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await searchParams;

  // Puerta de acceso: token de invitación firmado, ligado a este slug.
  // Sin token válido la página no existe (404, sin filtrar contenido).
  const invite = t ? verifyDossierInvite(t, SLUG) : null;
  if (!invite) {
    notFound();
  }

  // Primera apertura → arranca el reloj. Enforced en cada request.
  const openedAt = await ensureOpenedAt(invite);
  const deadline = dossierDeadline(openedAt, invite.ttlHours);
  const fontClass = `${cinzel.variable} ${archivo.variable}`;

  if (dossierExpirado(deadline)) {
    return (
      <div className={fontClass}>
        <DossierExpired />
      </div>
    );
  }

  return (
    <div className={fontClass}>
      <PampaMalbecDossier
        deadlineIso={deadline.toISOString()}
        inviteToken={t!}
      />
    </div>
  );
}
