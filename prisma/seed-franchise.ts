/**
 * Franchise Landing System seed — idempotent via upsert.
 * Creates two example franchises with all data for immediate testing.
 *
 * Run: npx tsx prisma/seed-franchise.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding franchise landing system...");

  // Ensure the "Comida" sector exists (created by main seed)
  const sector = await prisma.sector.upsert({
    where: { slug: "comida" },
    update: {},
    create: { name: "Comida", slug: "comida", emoji: "🍔" },
  });

  // ── Crem Helado — ALL_IN ─────────────────────────────────────────────────

  const cremHelado = await prisma.franchise.upsert({
    where: { slug: "crem-helado" },
    update: {
      planTier: "ALL_IN",
      published: true,
      headline: "La franquicia de helados más querida de LATAM",
      subheadline:
        "Más de 200 puntos en 8 países. Tres modelos de inversión para cualquier escala.",
      shortDescription: "Franquicia de helados artesanales con presencia en toda LATAM.",
      longDescription:
        "Crem Helado nació en 1998 con un único kiosco en Bogotá. Hoy opera más de 200 puntos en Colombia, México, Perú, Chile, Argentina, Ecuador, Panamá y Costa Rica. Nuestro sistema incluye formación inicial, soporte continuo, central de compras y marketing cooperado.",
      credibilityLine: "+200 puntos activos · 8 países · 25 años de operación",
      logoUrl: "https://picsum.photos/seed/cremhelado-logo/200/80",
      heroImageUrl: "https://picsum.photos/seed/cremhelado-hero/1600/900",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      brochureUrl: "https://example.com/crem-helado-dossier.pdf",
      bookingUrl: "https://calendly.com/crem-helado",
      cta1Label: "Agendar llamada con el equipo",
      cta1Url: "/quiz",
      cta2Label: "Descargar dossier",
      cta2Url: "https://example.com/crem-helado-dossier.pdf",
      ebitdaReference: "28–35%",
      paybackMonths: 24,
      royaltyInfo: "6% sobre ventas brutas",
      operatorProfile: "Emprendedor con capital propio y vocación de servicio",
    },
    create: {
      slug: "crem-helado",
      name: "Crem Helado",
      description: "Franquicia de helados artesanales líder en LATAM.",
      investmentMin: 40000,
      investmentMax: 280000,
      sectorId: sector.id,
      planTier: "ALL_IN",
      published: true,
      headline: "La franquicia de helados más querida de LATAM",
      subheadline:
        "Más de 200 puntos en 8 países. Tres modelos de inversión para cualquier escala.",
      shortDescription: "Franquicia de helados artesanales con presencia en toda LATAM.",
      longDescription:
        "Crem Helado nació en 1998 con un único kiosco en Bogotá. Hoy opera más de 200 puntos en Colombia, México, Perú, Chile, Argentina, Ecuador, Panamá y Costa Rica.",
      credibilityLine: "+200 puntos activos · 8 países · 25 años de operación",
      logoUrl: "https://picsum.photos/seed/cremhelado-logo/200/80",
      heroImageUrl: "https://picsum.photos/seed/cremhelado-hero/1600/900",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      brochureUrl: "https://example.com/crem-helado-dossier.pdf",
      bookingUrl: "https://calendly.com/crem-helado",
      cta1Label: "Agendar llamada con el equipo",
      cta1Url: "/quiz",
      cta2Label: "Descargar dossier",
      cta2Url: "https://example.com/crem-helado-dossier.pdf",
      ebitdaReference: "28–35%",
      paybackMonths: 24,
      royaltyInfo: "6% sobre ventas brutas",
      operatorProfile: "Emprendedor con capital propio y vocación de servicio",
    },
  });

  // Module config — ALL_IN: all modules on
  await prisma.franchiseModuleConfig.upsert({
    where: { franchiseId: cremHelado.id },
    update: {
      heroEnabled: true,
      videoEnabled: true,
      galleryEnabled: true,
      businessModelsEnabled: true,
      financialsEnabled: true,
      faqEnabled: true,
      brochureEnabled: true,
      bookingEnabled: true,
      chatbotEnabled: true,
      nurturingEnabled: true,
    },
    create: {
      franchiseId: cremHelado.id,
      heroEnabled: true,
      videoEnabled: true,
      galleryEnabled: true,
      businessModelsEnabled: true,
      financialsEnabled: true,
      faqEnabled: true,
      brochureEnabled: true,
      bookingEnabled: true,
      chatbotEnabled: true,
      nurturingEnabled: true,
    },
  });

  // Business models (3)
  const cremModels = [
    {
      name: "Kiosco",
      size: "4–8 m²",
      investmentMin: 40000,
      investmentMax: 70000,
      ebitda: "30%",
      paybackMonths: 18,
      roiAnnual: 35,
      imageUrl: "https://picsum.photos/seed/crem-kiosco/800/600",
      description: "Formato mall y aeropuerto. Alta rotación, bajo CAPEX.",
      order: 0,
    },
    {
      name: "Tienda Express",
      size: "20–35 m²",
      investmentMin: 80000,
      investmentMax: 130000,
      ebitda: "28%",
      paybackMonths: 22,
      roiAnnual: 30,
      imageUrl: "https://picsum.photos/seed/crem-express/800/600",
      description: "Local de paso con barra y take-away. Ideal para zonas comerciales.",
      order: 1,
    },
    {
      name: "Full Store",
      size: "60–100 m²",
      investmentMin: 180000,
      investmentMax: 280000,
      ebitda: "32%",
      paybackMonths: 28,
      roiAnnual: 28,
      imageUrl: "https://picsum.photos/seed/crem-fullstore/800/600",
      description: "Experiencia completa con salón, vitrina y eventos. Ancla en centros comerciales.",
      order: 2,
    },
  ];

  // Delete existing models and recreate (idempotent)
  await prisma.franchiseBusinessModel.deleteMany({
    where: { franchiseId: cremHelado.id },
  });
  await prisma.franchiseBusinessModel.createMany({
    data: cremModels.map((m) => ({ ...m, franchiseId: cremHelado.id })),
  });

  // Gallery (5 images)
  await prisma.franchiseMedia.deleteMany({
    where: { franchiseId: cremHelado.id, type: "image" },
  });
  await prisma.franchiseMedia.createMany({
    data: Array.from({ length: 5 }, (_, i) => ({
      franchiseId: cremHelado.id,
      type: "image",
      url: `https://picsum.photos/seed/crem-gallery-${i + 1}/800/600`,
      label: `Local ${i + 1}`,
      altText: `Galería Crem Helado ${i + 1}`,
      order: i,
    })),
  });

  // FAQs (4)
  await prisma.franchiseFaq.deleteMany({ where: { franchiseId: cremHelado.id } });
  await prisma.franchiseFaq.createMany({
    data: [
      {
        franchiseId: cremHelado.id,
        question: "¿Cuánto tiempo toma abrir el primer punto?",
        answer:
          "El proceso desde la firma del contrato hasta la apertura es de 60 a 90 días, dependiendo del formato y la disponibilidad del local.",
        order: 0,
      },
      {
        franchiseId: cremHelado.id,
        question: "¿Incluye capacitación el paquete de franquicia?",
        answer:
          "Sí. Todos nuestros franquiciados reciben 2 semanas de formación inicial en nuestra planta central, más soporte remoto continuo.",
        order: 1,
      },
      {
        franchiseId: cremHelado.id,
        question: "¿Qué pasa si el local no cumple ventas el primer año?",
        answer:
          "Contamos con un protocolo de acompañamiento. Si en 6 meses las ventas no alcanzan el umbral mínimo, activamos un plan de rescate comercial sin costo.",
        order: 2,
      },
      {
        franchiseId: cremHelado.id,
        question: "¿Puedo tener más de un punto de venta?",
        answer:
          "Sí. Ofrecemos condiciones preferenciales a partir de la segunda unidad: menor fee de entrada y soporte de desarrollo de negocio dedicado.",
        order: 3,
      },
    ],
  });

  console.log(`  ✓ Crem Helado (ALL_IN, published) — /franquicia/crem-helado`);

  // ── Subway — GROWTH ──────────────────────────────────────────────────────

  const subway = await prisma.franchise.upsert({
    where: { slug: "subway" },
    update: {
      planTier: "GROWTH",
      published: true,
      headline: "La cadena de sándwiches más grande del mundo",
      subheadline:
        "Más de 37,000 restaurantes en 100 países. Únete al sistema más probado del mundo.",
      shortDescription: "Franquicia de comida rápida saludable líder mundial.",
      credibilityLine: "+37,000 restaurantes · 100 países · 60 años de historia",
      logoUrl: "https://picsum.photos/seed/subway-logo/200/80",
      heroImageUrl: "https://picsum.photos/seed/subway-hero/1600/900",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      bookingUrl: "https://calendly.com/subway-latam",
      cta1Label: "Quiero ser franquiciado Subway",
      cta1Url: "/quiz",
      cta2Label: "Ver modelo financiero",
      cta2Url: "#financials",
      ebitdaReference: "18–22%",
      paybackMonths: 36,
      royaltyInfo: "8% sobre ventas brutas",
      operatorProfile: "Emprendedor con experiencia en operaciones o F&B",
    },
    create: {
      slug: "subway",
      name: "Subway",
      description: "La cadena de sándwiches más grande del mundo.",
      investmentMin: 150000,
      investmentMax: 350000,
      sectorId: sector.id,
      planTier: "GROWTH",
      published: true,
      headline: "La cadena de sándwiches más grande del mundo",
      subheadline:
        "Más de 37,000 restaurantes en 100 países. Únete al sistema más probado del mundo.",
      shortDescription: "Franquicia de comida rápida saludable líder mundial.",
      credibilityLine: "+37,000 restaurantes · 100 países · 60 años de historia",
      logoUrl: "https://picsum.photos/seed/subway-logo/200/80",
      heroImageUrl: "https://picsum.photos/seed/subway-hero/1600/900",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      bookingUrl: "https://calendly.com/subway-latam",
      cta1Label: "Quiero ser franquiciado Subway",
      cta1Url: "/quiz",
      cta2Label: "Ver modelo financiero",
      cta2Url: "#financials",
      ebitdaReference: "18–22%",
      paybackMonths: 36,
      royaltyInfo: "8% sobre ventas brutas",
      operatorProfile: "Emprendedor con experiencia en operaciones o F&B",
    },
  });

  // Module config — GROWTH: growth modules on
  await prisma.franchiseModuleConfig.upsert({
    where: { franchiseId: subway.id },
    update: {
      heroEnabled: true,
      videoEnabled: true,
      galleryEnabled: true,
      businessModelsEnabled: true,
      financialsEnabled: true,
      faqEnabled: true,
      brochureEnabled: false,
      bookingEnabled: true,
      chatbotEnabled: false,
      nurturingEnabled: false,
    },
    create: {
      franchiseId: subway.id,
      heroEnabled: true,
      videoEnabled: true,
      galleryEnabled: true,
      businessModelsEnabled: true,
      financialsEnabled: true,
      faqEnabled: true,
      brochureEnabled: false,
      bookingEnabled: true,
      chatbotEnabled: false,
      nurturingEnabled: false,
    },
  });

  // Business models (2)
  await prisma.franchiseBusinessModel.deleteMany({ where: { franchiseId: subway.id } });
  await prisma.franchiseBusinessModel.createMany({
    data: [
      {
        franchiseId: subway.id,
        name: "Restaurante Tradicional",
        size: "60–90 m²",
        investmentMin: 150000,
        investmentMax: 250000,
        ebitda: "20%",
        paybackMonths: 36,
        roiAnnual: 22,
        imageUrl: "https://picsum.photos/seed/subway-trad/800/600",
        description: "Formato de calle o mall con barra completa y área de mesas.",
        order: 0,
      },
      {
        franchiseId: subway.id,
        name: "Subway Express",
        size: "30–45 m²",
        investmentMin: 220000,
        investmentMax: 350000,
        ebitda: "18%",
        paybackMonths: 40,
        roiAnnual: 19,
        imageUrl: "https://picsum.photos/seed/subway-express/800/600",
        description: "Formato no tradicional para aeropuertos, universidades y edificios corporativos.",
        order: 1,
      },
    ],
  });

  // Gallery (3 images)
  await prisma.franchiseMedia.deleteMany({ where: { franchiseId: subway.id, type: "image" } });
  await prisma.franchiseMedia.createMany({
    data: Array.from({ length: 3 }, (_, i) => ({
      franchiseId: subway.id,
      type: "image",
      url: `https://picsum.photos/seed/subway-gallery-${i + 1}/800/600`,
      label: `Local ${i + 1}`,
      altText: `Galería Subway ${i + 1}`,
      order: i,
    })),
  });

  // FAQs (3)
  await prisma.franchiseFaq.deleteMany({ where: { franchiseId: subway.id } });
  await prisma.franchiseFaq.createMany({
    data: [
      {
        franchiseId: subway.id,
        question: "¿Subway ofrece financiamiento para nuevos franquiciados?",
        answer:
          "Subway trabaja con una red de financiadores aprobados en LATAM. Puedes calificar si cuentas con al menos el 30% del capital propio.",
        order: 0,
      },
      {
        franchiseId: subway.id,
        question: "¿Cuánto tarda el proceso de aprobación?",
        answer:
          "El proceso de evaluación y aprobación tarda entre 4 y 8 semanas desde la solicitud inicial.",
        order: 1,
      },
      {
        franchiseId: subway.id,
        question: "¿Qué soporte recibo tras la apertura?",
        answer:
          "Un representante de campo visita tu local mínimo 4 veces al año. Además tienes acceso a la plataforma de entrenamiento en línea y marketing nacional.",
        order: 2,
      },
    ],
  });

  console.log(`  ✓ Subway (GROWTH, published) — /franquicia/subway`);
  console.log("\n✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
