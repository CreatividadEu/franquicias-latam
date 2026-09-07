import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import * as authRouteModule from "../src/app/api/totto-way/auth/route";
import * as prismaModule from "../src/lib/prisma";
import { safeNextPath } from "../src/lib/totto-way/paths";
import { verifyToken } from "../src/lib/auth";

type AnyFn = (...args: unknown[]) => unknown;

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-totto-way";

const prisma = (prismaModule as unknown as { prisma: Record<string, Record<string, AnyFn>> }).prisma;
const POST = (authRouteModule as unknown as { POST: (req: Request) => Promise<Response> }).POST;

const PASSWORD = "clave-demo";
const HASH = bcrypt.hashSync(PASSWORD, 4);

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "camila.rojas@totto-way.demo",
    passwordHash: HASH,
    name: "Camila Rojas",
    role: "TW_ASESOR",
    franchiseId: "f1",
    twEmployee: { id: "e1", storeId: "s1", onboardedAt: new Date(), franchiseId: "f1", store: { id: "s1" } },
    twStoreAccess: [],
    ...overrides,
  };
}

function request(body: unknown) {
  return new Request("http://localhost/api/totto-way/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stub(users: Record<string, unknown>, employees: Record<string, string> = {}) {
  const originalUser = prisma.user.findUnique;
  const originalEmployee = prisma.twEmployee?.findFirst;
  prisma.user.findUnique = (async (args: { where: { email?: string; id?: string } }) => {
    if (args.where.email) return users[args.where.email] ?? null;
    return Object.values(users).find((u) => (u as { id: string }).id === args.where.id) ?? null;
  }) as AnyFn;
  prisma.twEmployee = prisma.twEmployee ?? {};
  prisma.twEmployee.findFirst = (async (args: { where: { employeeCode: { equals: string } } }) => {
    const userId = employees[args.where.employeeCode.equals.toUpperCase()];
    return userId ? { userId } : null;
  }) as AnyFn;
  return () => {
    prisma.user.findUnique = originalUser;
    if (originalEmployee) prisma.twEmployee.findFirst = originalEmployee;
  };
}

test("login por correo emite tw_token y devuelve next", async () => {
  const restore = stub({ "camila.rojas@totto-way.demo": user() });
  try {
    const res = await POST(request({ identifier: "Camila.Rojas@totto-way.demo", password: PASSWORD, next: "/totto-way/aprender" }));
    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; next: string };
    assert.equal(body.success, true);
    assert.equal(body.next, "/totto-way/aprender");
    const cookie = res.headers.get("set-cookie") ?? "";
    assert.match(cookie, /^tw_token=/);
    assert.match(cookie, /HttpOnly/i);
    const token = cookie.split(";")[0].slice("tw_token=".length);
    const payload = verifyToken(token);
    assert.equal(payload?.userId, "user-1");
    assert.equal(payload?.role, "TW_ASESOR");
  } finally {
    restore();
  }
});

test("login por código de colaborador", async () => {
  const restore = stub({ "camila.rojas@totto-way.demo": user() }, { "TA-0412": "user-1" });
  try {
    const res = await POST(request({ identifier: "ta-0412", password: PASSWORD }));
    assert.equal(res.status, 200);
  } finally {
    restore();
  }
});

test("primer login sin onboarding redirige a /totto-way/onboarding aunque venga next", async () => {
  const restore = stub({ "camila.rojas@totto-way.demo": user({ twEmployee: { id: "e1", storeId: "s1", onboardedAt: null, franchiseId: "f1" } }) });
  try {
    const res = await POST(request({ identifier: "camila.rojas@totto-way.demo", password: PASSWORD, next: "/totto-way/liga" }));
    const body = (await res.json()) as { next: string };
    assert.equal(body.next, "/totto-way/onboarding");
  } finally {
    restore();
  }
});

test("contraseña incorrecta, rol sin acceso y usuario sin ficha", async () => {
  const restore = stub({
    "camila.rojas@totto-way.demo": user(),
    "sin-acceso@totto-way.demo": user({ id: "u2", role: "TW_ASESOR", twEmployee: null }),
  });
  try {
    assert.equal((await POST(request({ identifier: "camila.rojas@totto-way.demo", password: "otra" }))).status, 401);
    assert.equal((await POST(request({ identifier: "nadie@totto-way.demo", password: PASSWORD }))).status, 401);
    assert.equal((await POST(request({ identifier: "sin-acceso@totto-way.demo", password: PASSWORD }))).status, 403);
    assert.equal((await POST(request({ identifier: "x", password: "" }))).status, 400);
  } finally {
    restore();
  }
});

test("safeNextPath solo acepta rutas internas del LMS", () => {
  assert.equal(safeNextPath("/totto-way/liga"), "/totto-way/liga");
  assert.equal(safeNextPath("/totto-way/login"), null);
  assert.equal(safeNextPath("/totto-way/onboarding"), null);
  assert.equal(safeNextPath("//evil.com"), null);
  assert.equal(safeNextPath("/admin"), null);
  assert.equal(safeNextPath("https://x"), null);
  assert.equal(safeNextPath(undefined), null);
});
