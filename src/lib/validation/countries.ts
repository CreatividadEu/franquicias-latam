/**
 * Country validation utilities
 *
 * Uses the canonical COUNTRIES list for validation
 */

import { COUNTRIES, type CountryCode } from "@/lib/constants/countries";
import type { PrismaClient } from "@prisma/client";

/**
 * Validate a single country ID against the database
 * Returns true if the country exists in the database
 */
export async function validateCountryId(
  countryId: string,
  prisma: PrismaClient
): Promise<boolean> {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
  });
  return !!country;
}

/**
 * Validate multiple country IDs against the database
 * Returns { valid: boolean, invalidIds: string[] }
 */
export async function validateCountryIds(
  countryIds: string[],
  prisma: PrismaClient
): Promise<{ valid: boolean; invalidIds: string[] }> {
  if (!countryIds || countryIds.length === 0) {
    return { valid: true, invalidIds: [] };
  }

  const countries = await prisma.country.findMany({
    where: { id: { in: countryIds } },
    select: { id: true },
  });

  const foundIds = new Set(countries.map((c) => c.id));
  const invalidIds = countryIds.filter((id) => !foundIds.has(id));

  return {
    valid: invalidIds.length === 0,
    invalidIds,
  };
}

/**
 * Validate a country code is supported
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return COUNTRIES.some((c) => c.code === code);
}

/**
 * Get all valid country codes
 */
export function getValidCountryCodes(): CountryCode[] {
  return COUNTRIES.map((c) => c.code);
}
