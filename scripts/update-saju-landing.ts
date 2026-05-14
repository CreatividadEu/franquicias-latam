/**
 * SAJÚ landing content update — dry-run by default.
 *
 *   npx tsx scripts/update-saju-landing.ts         # dry-run (prints diff + counts)
 *   npx tsx scripts/update-saju-landing.ts --apply # executes inside a Prisma $transaction
 *
 * Scope: content only. Does NOT touch schema, routes, components, media, coverageCountries,
 * logoUrl, heroImageUrl, youtubeUrl, brochureUrl, bookingUrl, cta1Url, cta2Url.
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");

const FRANCHISE_FIELDS = {
  planTier: "ALL_IN" as const,
  published: true,

  headline: "Vivamos la vida tachando sueños de la lista de pendientes.",
  subheadline:
    "La marca de gafas de Colombia que se está convirtiendo en la número 1 de LATAM. Franquicia Master disponible.",

  shortDescription:
    "SAJÚ es una plataforma de eyewear orgullosamente tropical: gafas en plástico reciclado, bio-acetato y aluminio reciclado, con servicio óptico integrado (Lenses Bar). Hoy operamos 16 tiendas entre Colombia, Costa Rica y Venezuela, y abrimos Franquicia Master para los principales mercados de LATAM.",

  longDescription:
    "Sajú arrancó hace más de 8 años como un chiste universitario vendiendo cuelga-gafas en una caja de zapatos. Después de años de ferias, tiendas multimarca, experimentos e innovación, hoy somos una de las marcas de eyewear más relevantes de Colombia, con 16 tiendas operando entre Colombia, Costa Rica y Venezuela, y un sueño claro: ser la marca No.1 de gafas de LATAM.\n\nEl modelo de tienda evolucionó. El ticket creció casi 4X desde el inicio del programa de franquicias y hoy se ubica alrededor de $110 USD. La propuesta de producto se consolidó en tres líneas — Plástico Reciclado, Bio Acetato y Aluminio Reciclado — y se viene una línea deportiva con diseño propio. Seguimos colaborando con celebridades y marcas líderes de la región.\n\nEl Sajú Experience pasó de un taller de fabricación en tienda a un sistema de personalización pre-fabricada que se ensambla en el back end: 4 marcos, 8 colores de patas, 8 colores de marco y 8 colores de lente. Sumamos el Lenses Bar, que entrega lentes formulados en 20 minutos al 80% del Pareto de clientes ópticos.\n\nNos retamos a hacer campañas de lanzamiento disruptivas, el mercadeo está en nuestro ADN, y queremos seguir controlando el branding global y las redes sociales desde la matriz. Por eso, el modelo es Franquicia Master por país: trabajamos el marketing local en conjunto con el equipo local de cada franquicia.",

  credibilityLine:
    "16 tiendas operando · Forbes: 25 empresas más resilientes durante la pandemia · 1er lugar programa PYMEs FedEx entre +2,200 empresas · Colaboraciones con James Rodríguez, Adidas, MINI y Cerveza Corona.",

  investmentMin: 35000,
  investmentMax: 150000,
  ebitdaReference: null as string | null,
  paybackMonths: null as number | null,
  royaltyInfo:
    "Fee de entrada Franquicia Master: desde $100,000 USD por territorio estándar (USA y México son casos especiales). Royalties: arrancan en 7% y bajan progresivamente al 5%–4% según se alcanza el objetivo de tiendas del territorio. Fondo de publicidad: 3%.",
  operatorProfile:
    "Buscamos empresarios o emprendedores con experiencia construyendo negocios, capital para inversión y red local relevante. El franquiciado ideal entiende el mercado local: conoce eventos, influenciadores, lugares y emprendimientos en tendencia que ayuden a posicionar SAJÚ. Modelo es Franquicia Master por territorio: exclusividad sobre todos los canales de la marca (retail, online, B2B, corporativos, alianzas). Perfil de referencia: nuestros masters actuales en Costa Rica (Giuliano, fundador de The Yard, +10 sucursales) y Venezuela (grupo restaurantero con Pilar y Juanito, Trinchero Burgers, Vessubio).",

  cta1Label: "Aplicar a la Franquicia",
  cta2Label: "Hablar con el equipo SAJÚ",
};

// Schema lacks `breakdown`, `investmentCurrency`, `sizeMin/Max/Unit` — flattening to existing
// `size` (string) and `investmentMin/Max` (Float). All amounts USD by convention.
const BUSINESS_MODELS = [
  {
    order: 1,
    name: "Experience Store",
    description:
      "Tienda flagship con experiencia completa de marca. Incluye Sajú Experience (gafas personalizadas pre-fabricadas, ensambladas en el back end) y Lenses Bar (lentes formulados en 20 minutos). Formato pensado para capitales y ciudades clave del territorio. Desglose CAPEX: Obra Civil $50K–$60K · Equipos Ópticos $35K · Sajú Experience $15K · Lenses Bar $40K.",
    investmentMin: 100000,
    investmentMax: 150000,
    size: "50–70 m²",
  },
  {
    order: 2,
    name: "Tienda en Centro Comercial",
    description:
      "Formato optimizado para malls y centros comerciales de alto tráfico. Incluye servicio óptico integrado. Versión compacta del modelo flagship sin Sajú Experience completo. Desglose CAPEX: Obra Civil $50K–$60K · Equipos Ópticos $35K–$40K.",
    investmentMin: 85000,
    investmentMax: 100000,
    size: "30–50 m²",
  },
  {
    order: 3,
    name: "Isla / Corner",
    description:
      "Formato de menor CAPEX para entrada gradual a un mercado o para puntos satélite dentro de un territorio ya activo. Ideal para validar zonas o complementar tiendas flagship. Desglose CAPEX: Obra Civil $35K–$50K.",
    investmentMin: 35000,
    investmentMax: 50000,
    size: "15–40 m²",
  },
];

const FAQS = [
  {
    order: 1,
    question: "¿En qué países están abriendo Franquicia Master?",
    answer:
      "Priorizamos países hispanohablantes de LATAM. Los primeros mercados objetivo son República Dominicana, Perú, Ecuador, Panamá y Chile. También estamos abiertos a explorar El Salvador y Argentina. Estados Unidos y México son casos especiales y no son foco en esta primera ola.",
  },
  {
    order: 2,
    question: "¿Cuál es la inversión total para abrir una franquicia SAJÚ?",
    answer:
      "Depende del formato. Experience Store: $100K–$150K USD (50–70 m²). Tienda en Centro Comercial: $85K–$100K USD (30–50 m²). Isla / Corner: $35K–$50K USD (15–40 m²). A esto se suma el fee de entrada de la Franquicia Master, que arranca en $100,000 USD para territorios estándar.",
  },
  {
    order: 3,
    question: "¿Cuáles son los royalties y el fee del fondo de publicidad?",
    answer:
      "Royalties: arrancan en 7% sobre ventas y bajan progresivamente al 5%–4% a medida que el franquiciado alcanza el objetivo de tiendas del territorio. Fondo de publicidad: 3%.",
  },
  {
    order: 4,
    question: "¿Cuántas tiendas debo abrir como Franquicia Master?",
    answer:
      "Inicialmente trabajamos con un objetivo de 5 tiendas para el territorio, pero no es un techo. A más tiendas, mejor para todos: hay mark-up en el producto y royalties sobre ventas, así que el upside está alineado entre la marca y el franquiciado.",
  },
  {
    order: 5,
    question: "¿Qué incluye la Franquicia Master?",
    answer:
      "Exclusividad sobre todos los canales de la marca en el territorio: retail físico, ventas online, B2B, corporativos para marcas y alianzas. Trabajamos el marketing local en conjunto con tu equipo, manteniendo el branding global y las redes sociales desde la matriz en Colombia.",
  },
  {
    order: 6,
    question: "¿Qué perfil de franquiciado buscan?",
    answer:
      "Empresarios o emprendedores con experiencia construyendo negocios, capital para inversión y red local relevante. Idealmente alguien que entienda muy bien su mercado local — eventos, influenciadores, lugares y marcas en tendencia. Nuestros masters actuales son perfiles de este tipo: en Costa Rica, Giuliano fundó The Yard (+10 sucursales); en Venezuela, el grupo opera Pilar y Juanito, Trinchero Burgers y Vessubio.",
  },
  {
    order: 7,
    question: "¿Cuál es el ticket promedio y la propuesta de producto?",
    answer:
      "Ticket promedio actual: ~$110 USD. Tres líneas de gafas: Plástico Reciclado, Bio Acetato y Aluminio Reciclado, con una línea deportiva en lanzamiento. Sumamos el Lenses Bar, que entrega lentes formulados en 20 minutos al 80% del Pareto de clientes ópticos. El Sajú Experience permite a los clientes personalizar gafas combinando 4 marcos, 8 colores de patas, 8 colores de marco y 8 colores de lente.",
  },
  {
    order: 8,
    question: "¿Qué tipo de ubicaciones funcionan mejor: calle o centro comercial?",
    answer:
      "Ambas funcionan. En Colombia operamos tiendas a pie de calle y en centros comerciales con buenos resultados en ambos formatos. La estrategia puntual depende del mercado: el franquiciado local define la mezcla óptima junto con el equipo SAJÚ.",
  },
  {
    order: 9,
    question: "¿Qué credenciales respaldan la marca?",
    answer:
      "Forbes nos seleccionó como una de las 25 empresas más resilientes durante la pandemia. Ganamos el primer lugar en el programa de PYMEs de FedEx entre más de 2,200 empresas. Hemos colaborado con James Rodríguez, Simón Vargas, Marcela García y Camila Cisneros, y con marcas líderes como Adidas, MINI y Cerveza Corona.",
  },
];

// Only fields that the prompt explicitly enumerates. financials → false (no EBITDA/payback).
// Other module flags (brochure, booking, chatbot, nurturing) are left untouched.
const MODULE_CONFIG_PATCH = {
  heroEnabled: true,
  videoEnabled: true,
  galleryEnabled: true,
  businessModelsEnabled: true,
  faqEnabled: true,
  financialsEnabled: false,
};

function trunc(v: unknown, n = 90): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

async function main() {
  const saju = await prisma.franchise.findFirst({
    where: {
      OR: [
        { slug: { equals: "saju", mode: "insensitive" } },
        { name: { contains: "saju", mode: "insensitive" } },
        { name: { contains: "sajú", mode: "insensitive" } },
      ],
    },
    include: {
      businessModels: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      moduleConfig: true,
    },
  });

  if (!saju) {
    console.error("✗ SAJÚ franchise not found");
    process.exit(1);
  }

  console.log(`\n=== SAJÚ identified ===`);
  console.log(`  id:   ${saju.id}`);
  console.log(`  slug: ${saju.slug}`);
  console.log(`  name: ${saju.name}`);
  console.log(`  mode: ${APPLY ? "APPLY (writes ON, in $transaction)" : "DRY-RUN (no writes)"}`);

  // ── Franchise field diff ────────────────────────────────────────────────
  console.log(`\n--- Franchise field diff ---`);
  const updatedFranchise: Prisma.FranchiseUpdateInput = {};
  for (const [k, newVal] of Object.entries(FRANCHISE_FIELDS)) {
    const oldVal = (saju as Record<string, unknown>)[k] ?? null;
    const normalizedNew = newVal === undefined ? null : newVal;
    const changed = JSON.stringify(oldVal) !== JSON.stringify(normalizedNew);
    if (changed) {
      console.log(`  • ${k}:`);
      console.log(`      old → ${trunc(oldVal)}`);
      console.log(`      new → ${trunc(normalizedNew)}`);
      (updatedFranchise as Record<string, unknown>)[k] = normalizedNew;
    }
  }
  if (Object.keys(updatedFranchise).length === 0) {
    console.log(`  (no Franchise field changes)`);
  }

  // ── BusinessModels ──────────────────────────────────────────────────────
  console.log(`\n--- BusinessModels ---`);
  console.log(`  to delete: ${saju.businessModels.length}`);
  saju.businessModels.forEach((bm) =>
    console.log(`    - ${bm.id}  order=${bm.order}  name=${trunc(bm.name, 40)}`),
  );
  console.log(`  to create: ${BUSINESS_MODELS.length}`);
  BUSINESS_MODELS.forEach((bm) =>
    console.log(
      `    + order=${bm.order}  name=${bm.name}  size=${bm.size}  inv=$${bm.investmentMin}–$${bm.investmentMax} USD`,
    ),
  );

  // ── FAQs ────────────────────────────────────────────────────────────────
  console.log(`\n--- FAQs ---`);
  console.log(`  to delete: ${saju.faqs.length}`);
  saju.faqs.forEach((f) => console.log(`    - ${f.id}  order=${f.order}  q=${trunc(f.question, 60)}`));
  console.log(`  to create: ${FAQS.length}`);
  FAQS.forEach((f) => console.log(`    + order=${f.order}  q=${trunc(f.question, 70)}`));

  // ── ModuleConfig diff ───────────────────────────────────────────────────
  console.log(`\n--- ModuleConfig patch ---`);
  if (!saju.moduleConfig) {
    console.log(`  (no existing moduleConfig — will create with patch)`);
  } else {
    let any = false;
    for (const [k, v] of Object.entries(MODULE_CONFIG_PATCH)) {
      const old = (saju.moduleConfig as Record<string, unknown>)[k];
      if (old !== v) {
        console.log(`  • ${k}: ${old} → ${v}`);
        any = true;
      }
    }
    if (!any) console.log(`  (no module flag changes)`);
  }

  // ── Untouched (per spec) ────────────────────────────────────────────────
  console.log(`\n--- Untouched (per spec) ---`);
  console.log(`  logoUrl, heroImageUrl, youtubeUrl, brochureUrl, bookingUrl`);
  console.log(`  cta1Url, cta2Url`);
  console.log(`  FranchiseMedia (gallery: ${5} entries left intact)`);
  console.log(`  coverageCountries (semantically "operating", not "target")`);
  console.log(`  Franchise.description (legacy required field, not in spec)`);

  if (!APPLY) {
    console.log(`\nDRY-RUN complete. Re-run with --apply to execute inside a transaction.`);
    return;
  }

  // ── EXECUTE ─────────────────────────────────────────────────────────────
  console.log(`\n=== APPLYING ===`);
  await prisma.$transaction([
    prisma.franchise.update({
      where: { id: saju.id },
      data: updatedFranchise,
    }),
    prisma.franchiseBusinessModel.deleteMany({ where: { franchiseId: saju.id } }),
    prisma.franchiseBusinessModel.createMany({
      data: BUSINESS_MODELS.map((bm) => ({ franchiseId: saju.id, ...bm })),
    }),
    prisma.franchiseFaq.deleteMany({ where: { franchiseId: saju.id } }),
    prisma.franchiseFaq.createMany({
      data: FAQS.map((f) => ({ franchiseId: saju.id, ...f })),
    }),
    prisma.franchiseModuleConfig.upsert({
      where: { franchiseId: saju.id },
      create: { franchiseId: saju.id, ...MODULE_CONFIG_PATCH },
      update: MODULE_CONFIG_PATCH,
    }),
  ]);
  console.log(`✓ Transaction committed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
