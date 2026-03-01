import { prisma } from "@/lib/prisma";

let cachedCountries: { countries: unknown[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    if (cachedCountries && Date.now() - cacheTime < CACHE_TTL) {
      return Response.json(cachedCountries);
    }

    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
    });

    cachedCountries = { countries };
    cacheTime = Date.now();

    return Response.json(cachedCountries);
  } catch (error) {
    console.error("GET /api/countries failed:", error);
    return Response.json(
      { error: "Error al cargar paises" },
      { status: 500 }
    );
  }
}
