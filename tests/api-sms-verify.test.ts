import test from "node:test";
import assert from "node:assert/strict";
import * as verifyRouteModule from "../src/app/api/sms/verify/route";
import * as prismaModule from "../src/lib/prisma";

type AnyFn = (...args: unknown[]) => unknown;
const TEST_PHONE = "+573001112233";

function getNamedExport<T>(mod: Record<string, unknown>, name: string): T {
  const named = mod[name];
  if (named) return named as T;

  const fallback = (mod.default as Record<string, unknown> | undefined)?.[name];
  if (fallback) return fallback as T;

  throw new Error(`Missing export: ${name}`);
}

function getPost() {
  return getNamedExport<(request: Request) => Promise<Response>>(
    verifyRouteModule as unknown as Record<string, unknown>,
    "POST"
  );
}

function getVerificationDelegate() {
  const prisma = getNamedExport<Record<string, unknown>>(
    prismaModule as unknown as Record<string, unknown>,
    "prisma"
  );
  return prisma.smsVerification as Record<string, AnyFn>;
}

/**
 * The route reports SMS as "configured" only when all three Twilio vars are set,
 * and otherwise uses a dev fallback that accepts any code (real OTP checks are
 * delegated to Twilio Verify via `checkVerification`). CI sets placeholder Twilio
 * vars at the job level, so clear them here to exercise the dev-fallback path
 * deterministically without reaching the network.
 */
function clearTwilioEnv() {
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_VERIFY_SERVICE_SID;
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/sms/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("POST /api/sms/verify (dev fallback) accepts any code and stamps the phone as verified", async () => {
  clearTwilioEnv();
  const post = getPost();
  const delegate = getVerificationDelegate();

  const originalDeleteMany = delegate.deleteMany;
  const originalCreate = delegate.create;

  let deletedPhone: string | null = null;
  let created: { phone: string; code: string; verified: boolean } | null = null;

  delegate.deleteMany = async (args: unknown) => {
    deletedPhone =
      (args as { where?: { phone?: string } }).where?.phone ?? null;
    return { count: 0 };
  };
  delegate.create = async (args: unknown) => {
    const data = (
      args as {
        data: { phone: string; code: string; verified: boolean; expiresAt: Date };
      }
    ).data;
    created = { phone: data.phone, code: data.code, verified: data.verified };
    return { id: "stub", ...data };
  };

  try {
    const response = await post(
      jsonRequest({ phone: TEST_PHONE, code: "999999" })
    );
    const payload = (await response.json()) as { verified?: boolean };

    assert.equal(response.status, 200);
    assert.equal(payload.verified, true);
    // stampVerified() clears prior rows for the phone and writes a verified stamp.
    assert.equal(deletedPhone, TEST_PHONE);
    assert.equal((created as { phone: string } | null)?.phone, TEST_PHONE);
    assert.equal((created as { verified: boolean } | null)?.verified, true);
  } finally {
    delegate.deleteMany = originalDeleteMany;
    delegate.create = originalCreate;
  }
});

test("POST /api/sms/verify returns 400 when the code is missing", async () => {
  clearTwilioEnv();
  const post = getPost();
  const delegate = getVerificationDelegate();

  const originalDeleteMany = delegate.deleteMany;
  const originalCreate = delegate.create;
  let dbTouched = false;
  delegate.deleteMany = async () => {
    dbTouched = true;
    return { count: 0 };
  };
  delegate.create = async () => {
    dbTouched = true;
    return {};
  };

  try {
    const response = await post(jsonRequest({ phone: TEST_PHONE }));
    const payload = (await response.json()) as { error?: string };

    assert.equal(response.status, 400);
    assert.match(payload.error ?? "", /requerid/i);
    // Validation must short-circuit before any DB write.
    assert.equal(dbTouched, false);
  } finally {
    delegate.deleteMany = originalDeleteMany;
    delegate.create = originalCreate;
  }
});

test("POST /api/sms/verify returns 400 for an invalid phone number", async () => {
  clearTwilioEnv();
  const post = getPost();
  const delegate = getVerificationDelegate();

  const originalDeleteMany = delegate.deleteMany;
  const originalCreate = delegate.create;
  let dbTouched = false;
  delegate.deleteMany = async () => {
    dbTouched = true;
    return { count: 0 };
  };
  delegate.create = async () => {
    dbTouched = true;
    return {};
  };

  try {
    const response = await post(
      jsonRequest({ phone: "not-a-phone", code: "123456" })
    );
    const payload = (await response.json()) as { error?: string };

    assert.equal(response.status, 400);
    assert.match(payload.error ?? "", /requerid/i);
    assert.equal(dbTouched, false);
  } finally {
    delegate.deleteMany = originalDeleteMany;
    delegate.create = originalCreate;
  }
});
