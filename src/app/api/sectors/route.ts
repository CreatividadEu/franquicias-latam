import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let cachedSectors: unknown[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  if (cachedSectors && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cachedSectors);
  }

  const sectors = await prisma.sector.findMany({
    orderBy: { name: "asc" },
  });

  cachedSectors = sectors;
  cacheTime = Date.now();

  return NextResponse.json(sectors);
}
