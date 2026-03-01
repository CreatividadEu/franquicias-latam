import { prisma } from "@/lib/prisma";

let cachedSectors: { sectors: unknown[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    if (cachedSectors && Date.now() - cacheTime < CACHE_TTL) {
      return Response.json(cachedSectors);
    }

    const sectors = await prisma.sector.findMany({
      orderBy: { name: "asc" },
    });

    cachedSectors = { sectors };
    cacheTime = Date.now();

    return Response.json(cachedSectors);
  } catch (error) {
    console.error("GET /api/sectors failed:", error);
    return Response.json(
      { error: "Error al cargar sectores" },
      { status: 500 }
    );
  }
}
