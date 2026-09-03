/**
 * Sandbox — seed de demo (idempotente).
 *
 * Crea/actualiza la sesión de ensayo `/sandbox/demo-asadero` para un asadero
 * ficticio (Asadero Tres Carbones, Bucaramanga) sin subir documentos. Hito 1:
 * solo marca y estado; el preload completo (menú, dolores, marketing, OPEX)
 * llega con el hito 8. Re-ejecutarlo no duplica nada ni pisa estado/PIN.
 *
 * Run: npm run sandbox:seed
 *   SANDBOX_SEED_SLUG=otro-slug npm run sandbox:seed  → otra sesión de ensayo
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = (process.env.SANDBOX_SEED_SLUG ?? "demo-asadero").trim();

const BRAND = {
  brandName: "Asadero Tres Carbones",
  sector: "RESTAURANTE" as const,
  country: "Colombia",
  city: "Bucaramanga",
  logoUrl: "/sandbox/demo-asadero.svg",
  accentColor: "#FF6A2B",
  consultantName: "Franquicias LATAM",
};

async function main() {
  const session = await prisma.sandboxSession.upsert({
    where: { slug: SLUG },
    update: { ...BRAND },
    create: {
      slug: SLUG,
      ...BRAND,
      locale: "ES",
      status: "READY",
      pin: null,
    },
    select: { slug: true, status: true, pin: true },
  });

  console.log(
    `Sandbox demo listo → /sandbox/${session.slug}` +
      `  (estado ${session.status}${session.pin ? `, PIN ${session.pin}` : ", sin PIN"})`,
  );
  console.log(`Modo presentador → /sandbox/${session.slug}?presenter=1`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
