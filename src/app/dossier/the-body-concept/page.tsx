import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Montserrat, Quicksand } from "next/font/google";
import {
  dossierDeadline,
  dossierExpirado,
  ensureOpenedAt,
  getOpenedAt,
  resolveOpenKey,
  verifyDossierInvite,
} from "@/lib/dossier";
import { TheBodyConceptDossier } from "@/components/dossier/TheBodyConceptDossier";
import { TbcExpired } from "@/components/dossier/TbcExpired";

const SLUG = "the-body-concept";

// Montserrat hace de Gotham (titulares en caja alta del dossier de la marca);
// Quicksand replica la sans redondeada del cuerpo de texto.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-mont",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quick",
  display: "swap",
});

// Propuesta privada: jamás indexar ni cachear.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ t?: string; k?: string }>;

// Mismas dos puertas que el resto de dossiers:
// - ?k= : link abierto (aquí todos con vencimiento fijo, el de la ventana
//   de pago inicial de la propuesta).
// - ?t= : invitación firmada por email (se emite vía /api/admin/dossier-invite
//   con slug=the-body-concept).
function resolveInvite(k?: string, t?: string) {
  if (k) return { invite: resolveOpenKey(k, SLUG), viaKey: true as const };
  if (t) return { invite: verifyDossierInvite(t, SLUG), viaKey: false as const };
  return { invite: null, viaKey: false as const };
}

// La validación vive también aquí (antes del streaming) para que el status
// HTTP sea un 404 real; dentro del page llegaría tarde y la respuesta ya
// habría salido como 200 (mismo patrón que /dossier/pampa-malbec).
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
    title: "El Motor Financiero — The Body Concept · Confidencial",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function TheBodyConceptDossierPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t, k } = await searchParams;

  const { invite, viaKey } = resolveInvite(k, t);
  if (!invite) {
    notFound();
  }

  const fontClass = `${montserrat.variable} ${quicksand.variable}`;

  if (viaKey) {
    // Link abierto. Con vencimiento fijo (expiresAt) el timer cuenta hacia esa
    // fecha sin importar cuándo se abra; sin él, corre la ventana única de
    // lectura desde la primera apertura real (beacon del cliente).
    if (invite.expiresAt) {
      if (dossierExpirado(invite.expiresAt)) {
        return (
          <div className={fontClass}>
            <TbcExpired />
          </div>
        );
      }
      return (
        <div className={fontClass}>
          <TheBodyConceptDossier
            deadlineIso={invite.expiresAt.toISOString()}
            openKey={k}
          />
        </div>
      );
    }

    const openedAt = await getOpenedAt(invite);
    const deadline = dossierDeadline(openedAt ?? new Date(), invite.ttlHours);
    if (openedAt && dossierExpirado(deadline)) {
      return (
        <div className={fontClass}>
          <TbcExpired />
        </div>
      );
    }
    return (
      <div className={fontClass}>
        <TheBodyConceptDossier deadlineIso={deadline.toISOString()} openKey={k} />
      </div>
    );
  }

  // Invitación firmada: primera apertura → arranca el reloj.
  const openedAt = await ensureOpenedAt(invite);
  const deadline = dossierDeadline(openedAt, invite.ttlHours);

  if (dossierExpirado(deadline)) {
    return (
      <div className={fontClass}>
        <TbcExpired />
      </div>
    );
  }

  return (
    <div className={fontClass}>
      <TheBodyConceptDossier
        deadlineIso={deadline.toISOString()}
        inviteToken={t}
      />
    </div>
  );
}
