import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let cachedCountries: unknown[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  if (cachedCountries && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cachedCountries);
  }

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
  });

  cachedCountries = countries;
  cacheTime = Date.now();

  return NextResponse.json(countries);
}
