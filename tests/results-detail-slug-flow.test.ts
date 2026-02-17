import test from "node:test";
import assert from "node:assert/strict";
import { findMatches } from "../src/lib/matching";
import { matchesFranchiseSlug } from "../src/lib/franchiseSlug";
import * as prismaModule from "../src/lib/prisma";

type AnyFn = (...args: unknown[]) => unknown;

function getNamedExport<T>(mod: Record<string, unknown>, name: string): T {
  const named = mod[name];
  if (named) return named as T;

  const fallback = (mod.default as Record<string, unknown> | undefined)?.[name];
  if (fallback) return fallback as T;

  throw new Error(`Missing export: ${name}`);
}

test("match results slug resolves with detail page slug matcher", async () => {
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma"
  );
  const franchiseDelegate = prisma.franchise as Record<string, AnyFn>;
  const originalFindMany = franchiseDelegate.findMany;

  franchiseDelegate.findMany = async () => [
    {
      id: "abc12345xyz",
      name: "Café Uno",
      description: "Franquicia de comida",
      logo: null,
      investmentMin: 50000,
      investmentMax: 120000,
      sectorId: "sector_food",
      sector: { name: "Comida", emoji: "🍔" },
      coverageCountries: [{ countryId: "country_co" }],
    },
  ];

  try {
    const matches = await findMatches({
      sectors: ["sector_food"],
      investmentRange: "RANGE_50K_100K",
      countryId: "country_co",
      experienceLevel: "INVERSOR",
    });

    assert.equal(matches.length, 1);

    const [result] = matches;
    assert.equal(
      matchesFranchiseSlug(
        { id: "abc12345xyz", name: "Café Uno" },
        result.slug
      ),
      true
    );
  } finally {
    franchiseDelegate.findMany = originalFindMany;
  }
});
