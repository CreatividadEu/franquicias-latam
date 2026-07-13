import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { sendFormLeadNotification } from "./resend";

// ── Dossier privado con autodestrucción ─────────────────────────────────────
// Acceso mediante token de invitación firmado con el mismo JWT_SECRET del
// sistema de sesiones, y expiración server-side contada desde la PRIMERA
// apertura. La primera apertura se persiste como un FormLead con
// sourceType "dossier_open": cero migraciones (la tabla ya existe en prod),
// queda visible en /admin/leads y dispara la notificación de email al
// equipo en el momento exacto en que el prospecto abre el dossier.

const TTL_MIN_HOURS = 3;
const TTL_MAX_HOURS = 72;
export const TTL_DEFAULT_HOURS = 72;

export type DossierInvite = {
  slug: string;
  email: string;
  name?: string;
  ttlHours: number;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required. Set JWT_SECRET in the environment.");
  }
  return secret;
}

export function clampTtl(hours: number): number {
  if (!Number.isFinite(hours)) return TTL_DEFAULT_HOURS;
  return Math.min(TTL_MAX_HOURS, Math.max(TTL_MIN_HOURS, Math.round(hours)));
}

/**
 * Firma un token de invitación. Sin `exp` de JWT: la vigencia real la
 * gobierna la primera apertura (opened_at + ttl), enforced en servidor.
 */
export function signDossierInvite(invite: {
  slug: string;
  email: string;
  name?: string;
  ttlHours?: number;
}): string {
  return jwt.sign(
    {
      dz: invite.slug,
      em: invite.email.trim().toLowerCase(),
      nm: invite.name?.trim() ?? "",
      th: clampTtl(invite.ttlHours ?? TTL_DEFAULT_HOURS),
    },
    getSecret(),
  );
}

export function verifyDossierInvite(
  token: string,
  slug: string,
): DossierInvite | null {
  try {
    const payload = jwt.verify(token, getSecret()) as {
      dz?: string;
      em?: string;
      nm?: string;
      th?: number;
    };
    if (!payload || payload.dz !== slug || !payload.em) return null;
    return {
      slug,
      email: payload.em,
      name: payload.nm || undefined,
      ttlHours: clampTtl(payload.th ?? TTL_DEFAULT_HOURS),
    };
  } catch {
    return null;
  }
}

// Fallback en memoria para desarrollo sin DATABASE_URL. En producción el
// registro vive en form_leads; si la DB no responde, degradamos a memoria
// para no bloquear la venta (el token sigue siendo la puerta de acceso).
const memoryOpens = new Map<string, Date>();

function dossierKey(slug: string) {
  return `dossier-${slug}`;
}

/**
 * Devuelve la fecha de primera apertura, registrándola si esta es la
 * primera vez que el invitado abre el dossier.
 */
export async function ensureOpenedAt(invite: DossierInvite): Promise<Date> {
  const key = dossierKey(invite.slug);
  const memKey = `${key}:${invite.email}`;

  try {
    const existing = await prisma.formLead.findFirst({
      where: { franchiseSlug: key, email: invite.email, sourceType: "dossier_open" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    if (existing) return existing.createdAt;

    const created = await prisma.formLead.create({
      data: {
        name: invite.name || invite.email,
        email: invite.email,
        phone: "—",
        investmentRange: "",
        franchiseSlug: key,
        listingSlug: key,
        sourceType: "dossier_open",
        landingSource: "dossier",
        type: "dossier",
        message: `Primera apertura del dossier · vigencia ${invite.ttlHours}h`,
      },
      select: { createdAt: true },
    });

    // Alerta inmediata al equipo: el reloj del dossier empezó a correr.
    sendFormLeadNotification({
      name: invite.name || invite.email,
      email: invite.email,
      phone: "—",
      sourceType: "dossier_open",
      franchiseSlug: key,
      message: `Abrió el dossier · la propuesta expira en ${invite.ttlHours}h`,
    }).catch(console.error);

    return created.createdAt;
  } catch (error) {
    console.error("[dossier] DB no disponible; usando registro en memoria", error);
    const cached = memoryOpens.get(memKey);
    if (cached) return cached;
    const now = new Date();
    memoryOpens.set(memKey, now);
    return now;
  }
}

export function dossierDeadline(openedAt: Date, ttlHours: number): Date {
  return new Date(openedAt.getTime() + ttlHours * 3_600_000);
}

/** ¿La ventana ya cerró? (evaluado por request en el server) */
export function dossierExpirado(deadline: Date): boolean {
  return deadline.getTime() <= Date.now();
}

/** Registra un click en el CTA de reserva (Stripe). */
export async function trackDossierCta(invite: DossierInvite): Promise<void> {
  const key = dossierKey(invite.slug);
  try {
    await prisma.formLead.create({
      data: {
        name: invite.name || invite.email,
        email: invite.email,
        phone: "—",
        investmentRange: "",
        franchiseSlug: key,
        listingSlug: key,
        sourceType: "dossier_cta",
        landingSource: "dossier",
        type: "dossier",
        message: "Click en 'Separar mi cupo · Reservar ahora' (Stripe)",
      },
    });
  } catch (error) {
    console.error("[dossier] No se pudo registrar el click de CTA", error);
  }
}
