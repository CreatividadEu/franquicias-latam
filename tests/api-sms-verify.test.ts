import test from "node:test";
import assert from "node:assert/strict";
import * as verifyRouteModule from "../src/app/api/sms/verify/route";
import * as prismaModule from "../src/lib/prisma";

// The /api/sms/verify route delegates code comparison + attempt-tracking to
// Twilio Verify (see commit 20a2fb5). What's left to test in-process:
//   - input validation (phone format, code presence)
//   - the dev fallback path that runs when Twilio creds are absent — this is
//     the only path that touches the DB via prisma.smsVerification.
// The Twilio-configured path (checkVerification → external API) is covered
// by integration testing against a real Twilio account, not here.

type AnyFn = (...args: unknown[]) => unknown;
const TEST_PHONE = "+573001112233";
const TEST_CODE = "111111";

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
  delete process.env.TWILIO_VERIFY_SERVICE_SID;
}

test("POST /api/sms/verify returns 400 when phone is missing or invalid", async () => {
  clearTwilioEnv();

  const post = getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST",
  );

  const request = new Request("http://localhost/api/sms/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "not-a-phone", code: TEST_CODE }),
  });

  const response = await post(request);
  const payload = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.match(payload.error ?? "", /requeridos/i);
});

test("POST /api/sms/verify returns 400 when code is missing", async () => {
  clearTwilioEnv();

  const post = getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST",
  );

  const request = new Request("http://localhost/api/sms/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: TEST_PHONE }),
  });

  const response = await post(request);
  const payload = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.match(payload.error ?? "", /requeridos/i);
});

test("POST /api/sms/verify stamps phone as verified via dev fallback when Twilio is not configured", async () => {
  clearTwilioEnv();

  const post = getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST",
  );
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma",
  );
  const verificationDelegate = prisma.smsVerification as Record<string, AnyFn>;

  const originalDeleteMany = verificationDelegate.deleteMany;
  const originalCreate = verificationDelegate.create;

  let deleteManyCalls = 0;
  let createCalls = 0;
  let createdRecord: {
    phone?: string;
    code?: string;
    verified?: boolean;
    expiresAt?: Date;
  } | null = null;

  verificationDelegate.deleteMany = async (args: unknown) => {
    deleteManyCalls += 1;
    const filter = (args as { where?: { phone?: string } }).where;
    assert.equal(filter?.phone, TEST_PHONE);
    return { count: 0 };
  };

  verificationDelegate.create = async (args: unknown) => {
    createCalls += 1;
    createdRecord = (
      args as {
        data: {
          phone: string;
          code: string;
          verified: boolean;
          expiresAt: Date;
        };
      }
    ).data;
    return {
      id: "verification_fallback",
      ...createdRecord,
      attempts: 0,
      createdAt: new Date(),
    };
  };

  try {
    const request = new Request("http://localhost/api/sms/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: TEST_PHONE, code: TEST_CODE }),
    });

    const response = await post(request);
    const payload = (await response.json()) as { verified?: boolean };

    assert.equal(response.status, 200);
    assert.equal(payload.verified, true);
    assert.equal(deleteManyCalls, 1);
    assert.equal(createCalls, 1);

    // TS's control-flow analysis won't carry the mutation inside the async
    // mock into this scope. Cast through the known shape — runtime is
    // guarded by the createCalls assertion above.
    const stamped = createdRecord as {
      phone: string;
      code: string;
      verified: boolean;
      expiresAt: Date;
    } | null;
    if (!stamped) {
      throw new Error("Expected create() to have captured the stamp record");
    }
    assert.equal(stamped.phone, TEST_PHONE);
    assert.equal(stamped.verified, true);
    // The route stores a sentinel code value since Twilio Verify owns the
    // real OTP and no comparison is done here.
    assert.equal(stamped.code, "twilio-verify");
    assert.ok(
      stamped.expiresAt && stamped.expiresAt > new Date(),
      "expiresAt should be in the future",
    );
  } finally {
    verificationDelegate.deleteMany = originalDeleteMany;
    verificationDelegate.create = originalCreate;
  }
});
