/**
 * Puente landing → Command Center.
 *
 * Cuando alguien aplica desde /saju, el `FormLead` sigue siendo el registro
 * canónico del funnel público; aquí sólo se replica al pipeline de expansión
 * como PROSPECTO con origen LANDING_FORM, para que el equipo lo vea en el
 * tablero. Idempotente por [name, country] y nunca bloqueante: si algo falla,
 * se registra y la respuesta al formulario no cambia.
 */
import { prisma } from "@/lib/prisma";
import { countryCodeFromName } from "./command-center";

/** Slugs del listing de Sajú que activan la réplica. */
const SAJU_SLUGS = new Set(["saju", "saju-company", "saju-eyewear"]);

export function isSajuListing(slug: string | null | undefined): boolean {
  return typeof slug === "string" && SAJU_SLUGS.has(slug.trim().toLowerCase());
}

export type LandingLeadInput = {
  name: string;
  country: string | null;
  city: string | null;
  email: string;
  phone: string;
  investmentRange: string | null;
  message: string | null;
};

export async function mirrorLandingLeadToSaju(input: LandingLeadInput): Promise<void> {
  const name = input.name.trim();
  if (!name) return;

  const country = countryCodeFromName(input.country);
  const contact = [input.email, input.phone].filter(Boolean).join(" · ");
  const notes = [
    contact ? `Contacto: ${contact}` : "",
    input.investmentRange ? `Inversión declarada: ${input.investmentRange}` : "",
    input.message ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const existing = await prisma.sajuLead.findUnique({
      where: { name_country: { name, country } },
      select: { id: true },
    });

    if (existing) {
      // Re-aplicación: no se pisan las ediciones del equipo, sólo se anota.
      await prisma.sajuLeadEvent.create({
        data: {
          leadId: existing.id,
          type: "TOUCHPOINT",
          description: "Nueva aplicación desde el landing público.",
        },
      });
      return;
    }

    await prisma.sajuLead.create({
      data: {
        name,
        country,
        city: input.city?.trim() || null,
        stage: "PROSPECTO",
        status: "ACTIVO",
        interest: "MEDIO",
        source: "LANDING_FORM",
        nextAction: "Calificar y contactar",
        notes: notes || null,
        events: {
          create: {
            type: "NOTA",
            description: "Lead entrante desde el formulario del landing /saju.",
          },
        },
      },
    });
  } catch (error) {
    console.error("[saju/mirrorLandingLead] No se pudo replicar el lead", error);
  }
}
