import test from "node:test";
import assert from "node:assert/strict";
import * as leadsRouteModule from "../src/app/api/leads/route";
import * as prismaModule from "../src/lib/prisma";

type AnyFn = (...args: unknown[]) => unknown;

function getNamedExport<T>(mod: Record<string, unknown>, name: string): T {
  const named = mod[name];
  if (named) return named as T;

  const fallback = (mod.default as Record<string, unknown> | undefined)?.[name];
  if (fallback) return fallback as T;

  throw new Error(`Missing export: ${name}`);
}

test("POST /api/leads rejects unverified phone numbers", async () => {
  const post = getNamedExport<(request: Request) => Promise<Response>>(
    leadsRouteModule as unknown as Record<string, unknown>,
    "POST"
  );
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma"
  );

  const countryDelegate = prisma.country as Record<string, AnyFn>;
  const verificationDelegate = prisma.smsVerification as Record<string, AnyFn>;

  const originalFindCountry = countryDelegate.findUnique;
  const originalFindVerification = verificationDelegate.findFirst;

  countryDelegate.findUnique = async () => ({ id: "country_1" });
  verificationDelegate.findFirst = async () => null;

  try {
    const request = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Lead",
        email: "lead@example.com",
        phone: "+573001112233",
        sectors: ["sector_1"],
        investmentRange: "RANGE_50K_100K",
        countryId: "country_1",
        experienceLevel: "INVERSOR",
      }),
    });

    const response = await post(request);
    const payload = (await response.json()) as { error?: string };

    assert.equal(response.status, 403);
    assert.match(payload.error ?? "", /verificado/i);
  } finally {
    countryDelegate.findUnique = originalFindCountry;
    verificationDelegate.findFirst = originalFindVerification;
  }
});
