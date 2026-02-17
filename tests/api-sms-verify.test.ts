import test from "node:test";
import assert from "node:assert/strict";
import * as verifyRouteModule from "../src/app/api/sms/verify/route";
import * as prismaModule from "../src/lib/prisma";

type AnyFn = (...args: unknown[]) => unknown;
const TEST_PHONE = "+573001112233";
const TEST_CODE = "111111";

type MockVerification = {
  id: string;
  phone: string;
  code: string;
  verified: boolean;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
};

function getNamedExport<T>(mod: Record<string, unknown>, name: string): T {
  const named = mod[name];
  if (named) return named as T;

  const fallback = (mod.default as Record<string, unknown> | undefined)?.[name];
  if (fallback) return fallback as T;

  throw new Error(`Missing export: ${name}`);
}

function clearTwilioEnv() {
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
}

test("POST /api/sms/verify increments attempts and returns 400 for invalid code", async () => {
  clearTwilioEnv();

  const post = getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST"
  );
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma"
  );
  const verificationDelegate = prisma.smsVerification as Record<string, AnyFn>;

  const originalCreateVerification = verificationDelegate.create;
  const originalFindVerification = verificationDelegate.findFirst;
  const originalUpdateVerification = verificationDelegate.update;

  let storedVerification: MockVerification | null = null;

  verificationDelegate.create = async (args: unknown) => {
    const data = (args as {
      data: {
        phone: string;
        code: string;
        verified?: boolean;
        attempts?: number;
        expiresAt: Date;
      };
    }).data;

    storedVerification = {
      id: "verification_1",
      phone: data.phone,
      code: data.code,
      verified: data.verified ?? false,
      attempts: data.attempts ?? 0,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    return storedVerification;
  };

  verificationDelegate.findFirst = async () => {
    if (!storedVerification) return null;
    if (storedVerification.verified) return null;
    if (storedVerification.expiresAt <= new Date()) return null;
    return storedVerification;
  };

  verificationDelegate.update = async (args: unknown) => {
    const payload = args as {
      where?: { id?: string };
      data?: { attempts?: { increment?: number }; verified?: boolean };
    };

    if (!storedVerification || payload.where?.id !== storedVerification.id) {
      return {};
    }

    const increment = payload.data?.attempts?.increment ?? 0;
    storedVerification = {
      ...storedVerification,
      attempts: storedVerification.attempts + increment,
      verified: payload.data?.verified ?? storedVerification.verified,
    };

    return storedVerification;
  };

  try {
    await verificationDelegate.create({
      data: {
        phone: TEST_PHONE,
        code: TEST_CODE,
        verified: false,
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const request = new Request("http://localhost/api/sms/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: TEST_PHONE,
        code: "222222",
      }),
    });

    const response = await post(request);
    const payload = (await response.json()) as { error?: string };

    assert.equal(response.status, 400);
    assert.match(payload.error ?? "", /invalido|expirado/i);
    assert.equal(
      (storedVerification as MockVerification | null)?.attempts,
      1
    );
  } finally {
    verificationDelegate.create = originalCreateVerification;
    verificationDelegate.findFirst = originalFindVerification;
    verificationDelegate.update = originalUpdateVerification;
  }
});

test("POST /api/sms/verify marks code as verified", async () => {
  clearTwilioEnv();

  const post = getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST"
  );
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma"
  );
  const verificationDelegate = prisma.smsVerification as Record<string, AnyFn>;

  const originalCreateVerification = verificationDelegate.create;
  const originalFindVerification = verificationDelegate.findFirst;
  const originalUpdateVerification = verificationDelegate.update;

  let updatedId: string | null = null;
  let storedVerification: MockVerification | null = null;

  verificationDelegate.create = async (args: unknown) => {
    const data = (args as {
      data: {
        phone: string;
        code: string;
        verified?: boolean;
        attempts?: number;
        expiresAt: Date;
      };
    }).data;

    storedVerification = {
      id: "verification_2",
      phone: data.phone,
      code: data.code,
      verified: data.verified ?? false,
      attempts: data.attempts ?? 0,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
    return storedVerification;
  };

  verificationDelegate.findFirst = async () => {
    if (!storedVerification) return null;
    if (storedVerification.verified) return null;
    if (storedVerification.expiresAt <= new Date()) return null;
    return storedVerification;
  };

  verificationDelegate.update = async (args: unknown) => {
    const payload = args as {
      where?: { id?: string };
      data?: { attempts?: { increment?: number }; verified?: boolean };
    };

    updatedId = payload.where?.id ?? null;

    if (!storedVerification || payload.where?.id !== storedVerification.id) {
      return { id: updatedId, verified: false };
    }

    const increment = payload.data?.attempts?.increment ?? 0;
    storedVerification = {
      ...storedVerification,
      attempts: storedVerification.attempts + increment,
      verified: payload.data?.verified ?? storedVerification.verified,
    };

    return { id: updatedId, verified: storedVerification.verified };
  };

  try {
    await verificationDelegate.create({
      data: {
        phone: TEST_PHONE,
        code: TEST_CODE,
        verified: false,
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const request = new Request("http://localhost/api/sms/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: TEST_PHONE,
        code: TEST_CODE,
      }),
    });

    const response = await post(request);
    const payload = (await response.json()) as { verified?: boolean };

    assert.equal(response.status, 200);
    assert.equal(payload.verified, true);
    assert.equal(updatedId, "verification_2");
    assert.equal(
      (storedVerification as MockVerification | null)?.attempts,
      0
    );
  } finally {
    verificationDelegate.create = originalCreateVerification;
    verificationDelegate.findFirst = originalFindVerification;
    verificationDelegate.update = originalUpdateVerification;
  }
});

test("POST /api/sms/verify returns 400 when attempts are exhausted", async () => {
  clearTwilioEnv();

  const post = getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST"
  );
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma"
  );
  const verificationDelegate = prisma.smsVerification as Record<string, AnyFn>;

  const originalFindVerification = verificationDelegate.findFirst;
  const originalUpdateVerification = verificationDelegate.update;
  let updateCalls = 0;

  verificationDelegate.findFirst = async () => ({
    id: "verification_3",
    phone: TEST_PHONE,
    code: TEST_CODE,
    verified: false,
    attempts: 5,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
  });

  verificationDelegate.update = async () => {
    updateCalls += 1;
    return {};
  };

  try {
    const request = new Request("http://localhost/api/sms/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: TEST_PHONE,
        code: TEST_CODE,
      }),
    });

    const response = await post(request);
    const payload = (await response.json()) as { error?: string };

    assert.equal(response.status, 400);
    assert.match(payload.error ?? "", /invalido|expirado/i);
    assert.equal(updateCalls, 0);
  } finally {
    verificationDelegate.findFirst = originalFindVerification;
    verificationDelegate.update = originalUpdateVerification;
  }
});
