import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.franchise.findMany({
    where: {
      OR: [
        { slug: { contains: "saju", mode: "insensitive" } },
        { name: { contains: "saju", mode: "insensitive" } },
        { slug: { contains: "sajú", mode: "insensitive" } },
        { name: { contains: "sajú", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      planTier: true,
      published: true,
      sectorId: true,
      investmentMin: true,
      investmentMax: true,
      headline: true,
      subheadline: true,
      shortDescription: true,
      longDescription: true,
      credibilityLine: true,
      royaltyInfo: true,
      operatorProfile: true,
      ebitdaReference: true,
      paybackMonths: true,
      cta1Label: true,
      cta1Url: true,
      cta2Label: true,
      cta2Url: true,
      logoUrl: true,
      heroImageUrl: true,
      youtubeUrl: true,
      brochureUrl: true,
      bookingUrl: true,
      businessModels: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      media: { orderBy: { order: "asc" } },
      moduleConfig: true,
      coverageCountries: { include: { country: true } },
    },
  });

  console.log(JSON.stringify(matches, null, 2));
  console.log(`\nFound ${matches.length} match(es)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
