import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COUNTRIES } from "../src/lib/constants/countries";

const prisma = new PrismaClient();

async function main() {
  // Seed Sectors
  const sectors = await Promise.all(
    [
      { name: "Comida", slug: "comida", emoji: "\u{1F354}" },
      { name: "Retail", slug: "retail", emoji: "\u{1F457}" },
      { name: "Salud y Belleza", slug: "salud-y-belleza", emoji: "\u{1F4AA}" },
      { name: "Tecnologia", slug: "tecnologia", emoji: "\u{1F4BB}" },
      { name: "Educacion", slug: "educacion", emoji: "\u{1F393}" },
      { name: "Servicios", slug: "servicios", emoji: "\u{1F6E0}\u{FE0F}" },
    ].map((s) =>
      prisma.sector.upsert({
        where: { slug: s.slug },
        update: {},
        create: s,
      })
    )
  );

  // Seed Countries - Using canonical list from constants
  // Process sequentially to avoid connection pool limits
  console.log(`Seeding ${COUNTRIES.length} countries...`);
  const countries = [];
  for (const c of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, phoneCode: c.phoneCode, flag: c.flag },
      create: {
        name: c.name,
        code: c.code,
        phoneCode: c.phoneCode,
        flag: c.flag,
      },
    });
    countries.push(country);
  }

  // Seed Admin User (dev only)
  const allowDevSeed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEV_SEED === "true";

  if (!allowDevSeed) {
    throw new Error(
      "Refusing to seed default admin credentials. Set NODE_ENV=development or ALLOW_DEV_SEED=true to allow."
    );
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@franquiciaslatam.co" },
    update: {},
    create: {
      email: "admin@franquiciaslatam.co",
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  // Seed Sample Franchises
  const sectorMap = Object.fromEntries(sectors.map((s) => [s.slug, s.id]));
  const countryMap = Object.fromEntries(countries.map((c) => [c.code, c.id]));

  const franchiseData = [
    {
      name: "Burger Master",
      description:
        "Cadena de hamburguesas premium con mas de 50 locales en Latinoamerica. Modelo de negocio probado con retorno de inversion en 18 meses.",
      investmentMin: 80000,
      investmentMax: 150000,
      sectorSlug: "comida",
      contactEmail: "franquicias@burgermaster.co",
      featured: true,
      countries: ["CO", "MX", "EC"],
    },
    {
      name: "TechHub Academy",
      description:
        "Centros de educacion tecnologica para jovenes y adultos. Cursos de programacion, IA y marketing digital.",
      investmentMin: 50000,
      investmentMax: 90000,
      sectorSlug: "educacion",
      contactEmail: "expansion@techhub.edu",
      featured: true,
      countries: ["CO", "MX", "AR", "CL", "PE"],
    },
    {
      name: "Bella Vita Spa",
      description:
        "Red de spas y centros de bienestar con servicios de belleza integral. Marca reconocida en el mercado premium.",
      investmentMin: 120000,
      investmentMax: 200000,
      sectorSlug: "salud-y-belleza",
      contactEmail: "franquicias@bellavita.com",
      featured: false,
      countries: ["CO", "MX", "CL"],
    },
    {
      name: "Fashion Box",
      description:
        "Tiendas de moda rapida con colecciones mensuales. Publico objetivo: mujeres 18-35 anios. Margenes sobre el 60%.",
      investmentMin: 100000,
      investmentMax: 180000,
      sectorSlug: "retail",
      contactEmail: "info@fashionbox.la",
      featured: true,
      countries: ["MX", "AR", "CL", "PE"],
    },
    {
      name: "CleanPro Services",
      description:
        "Servicios profesionales de limpieza para empresas y hogares. Modelo de baja inversion con recurrencia mensual.",
      investmentMin: 30000,
      investmentMax: 70000,
      sectorSlug: "servicios",
      contactEmail: "franquicias@cleanpro.co",
      featured: false,
      countries: ["CO", "EC", "PE"],
    },
  ];

  for (const fd of franchiseData) {
    const franchisePayload = {
      name: fd.name,
      description: fd.description,
      investmentMin: fd.investmentMin,
      investmentMax: fd.investmentMax,
      sectorId: sectorMap[fd.sectorSlug],
      contactEmail: fd.contactEmail,
      featured: fd.featured,
      active: true,
    };

    const existingFranchise = await prisma.franchise.findFirst({
      where: { name: fd.name },
      select: { id: true },
    });

    const franchise = existingFranchise
      ? await prisma.franchise.update({
          where: { id: existingFranchise.id },
          data: franchisePayload,
        })
      : await prisma.franchise.create({
          data: franchisePayload,
        });

    const targetCountryIds = fd.countries
      .map((code) => countryMap[code])
      .filter((countryId): countryId is string => Boolean(countryId));

    if (targetCountryIds.length === 0) {
      await prisma.franchiseCoverage.deleteMany({
        where: { franchiseId: franchise.id },
      });
      continue;
    }

    await prisma.franchiseCoverage.deleteMany({
      where: {
        franchiseId: franchise.id,
        countryId: { notIn: targetCountryIds },
      },
    });

    await prisma.franchiseCoverage.createMany({
      data: targetCountryIds.map((countryId) => ({
        franchiseId: franchise.id,
        countryId,
      })),
      skipDuplicates: true,
    });
  }

  console.log("Seed completed successfully!");
  console.log(`- ${sectors.length} sectors`);
  console.log(`- ${countries.length} countries`);
  console.log(`- ${franchiseData.length} franchises`);
  console.log("- 1 admin user (admin@franquiciaslatam.co / admin123)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
