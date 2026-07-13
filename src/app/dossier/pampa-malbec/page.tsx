import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cinzel, Archivo } from "next/font/google";
import {
  dossierDeadline,
  dossierExpirado,
  ensureOpenedAt,
  getOpenedAt,
  resolveOpenKey,
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

type SearchParams = Promise<{ t?: string; k?: string }>;

// Dos puertas de acceso:
// - ?k= : link abierto de un solo uso (sin login). El "uso" lo arma el
//   cliente con un beacon; desde la primera apertura real corre una única
//   ventana de lectura y luego expira para siempre.
// - ?t= : invitación firmada legada (por email), sigue funcionando.
function resolveInvite(k?: string, t?: string) {
  if (k) return { invite: resolveOpenKey(k, SLUG), viaKey: true as const };
  if (t) return { invite: verifyDossierInvite(t, SLUG), viaKey: false as const };
  return { invite: null, viaKey: false as const };
}

// La validación vive también aquí (antes del streaming) para que el status
// HTTP sea un 404 real; dentro del page llegaría tarde y la respuesta ya
// habría salido como 200 (mismo patrón que /propuesta/[slug]).
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { t, k } = await searchParams;
  if (!resolveInvite(k, t).invite) {
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
  const { t, k } = await searchParams;

  const { invite, viaKey } = resolveInvite(k, t);
  if (!invite) {
    notFound();
  }

  const fontClass = `${cinzel.variable} ${archivo.variable}`;

  if (viaKey) {
    // Link abierto: la apertura NO se persiste en el GET (los prefetch de
    // WhatsApp/email no deben quemar el link); la arma el beacon del
    // cliente. La expiración sí se enforcea aquí en cada request.
    const openedAt = await getOpenedAt(invite);
    const deadline = dossierDeadline(openedAt ?? new Date(), invite.ttlHours);
    if (openedAt && dossierExpirado(deadline)) {
      return (
        <div className={fontClass}>
          <DossierExpired />
        </div>
      );
    }
    return (
      <div className={fontClass}>
        <PampaMalbecDossier deadlineIso={deadline.toISOString()} openKey={k} />
      </div>
    );
  }

  // Invitación firmada legada: primera apertura → arranca el reloj.
  const openedAt = await ensureOpenedAt(invite);
  const deadline = dossierDeadline(openedAt, invite.ttlHours);

  if (dossierExpirado(deadline)) {
    return (
      <div className={fontClass}>
        <DossierExpired />
      </div>
    );
  }

  return (
    <div className={fontClass}>
      <PampaMalbecDossier deadlineIso={deadline.toISOString()} inviteToken={t} />
    </div>
  );
}
