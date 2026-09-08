import test from "node:test";
import assert from "node:assert/strict";
import {
  assertStoreInScope,
  canEditContent,
  canSeeLeaderPanel,
  employeeWhere,
  isTottoWayRole,
  resolveScope,
  storeInScope,
  storeWhere,
  TwScopeError,
} from "../src/lib/totto-way/scope";

const F = "franchise-1";

test("roles con acceso al LMS", () => {
  assert.ok(isTottoWayRole("TW_ASESOR"));
  assert.ok(isTottoWayRole("FRANCHISE_OWNER"));
  assert.ok(isTottoWayRole("ADMIN"));
  assert.ok(!isTottoWayRole("OTRO"));
  assert.ok(!isTottoWayRole(null));
});

test("asesor y líder solo ven su tienda", () => {
  const scope = resolveScope({ role: "TW_ASESOR", franchiseId: F, employeeStoreId: "s1", accessStoreIds: ["s2"] });
  assert.deepEqual(scope.storeIds, ["s1"]);
  assert.equal(scope.homeStoreId, "s1");
  assert.ok(storeInScope(scope, "s1"));
  assert.ok(!storeInScope(scope, "s2"));
  assert.deepEqual(storeWhere(scope), { franchiseId: F, id: { in: ["s1"] } });
  assert.deepEqual(employeeWhere(scope), { franchiseId: F, storeId: { in: ["s1"] } });
});

test("asesor sin tienda no ve ninguna", () => {
  const scope = resolveScope({ role: "TW_LIDER_TIENDA", franchiseId: F, employeeStoreId: null });
  assert.deepEqual(scope.storeIds, []);
  assert.throws(() => assertStoreInScope(scope, "s1"), TwScopeError);
});

test("franquiciado y jefe comercial ven sus tiendas asignadas más la propia", () => {
  const scope = resolveScope({ role: "FRANCHISE_OWNER", franchiseId: F, employeeStoreId: "s3", accessStoreIds: ["s1", "s2", "s1"] });
  assert.deepEqual(scope.storeIds, ["s1", "s2", "s3"]);
  assert.equal(assertStoreInScope(scope, "s2"), "s2");
  assert.throws(() => assertStoreInScope(scope, "s9"));
});

test("formador y admin ven todas las tiendas de la franquicia", () => {
  for (const role of ["TW_FORMADOR", "ADMIN"] as const) {
    const scope = resolveScope({ role, franchiseId: F });
    assert.equal(scope.storeIds, "all");
    assert.ok(storeInScope(scope, "cualquiera"));
    assert.deepEqual(storeWhere(scope), { franchiseId: F });
  }
});

test("permisos por rol", () => {
  assert.ok(canSeeLeaderPanel("TW_LIDER_TIENDA"));
  assert.ok(canSeeLeaderPanel("FRANCHISE_OWNER"));
  assert.ok(!canSeeLeaderPanel("TW_ASESOR"));
  assert.ok(canEditContent("TW_FORMADOR"));
  assert.ok(canEditContent("ADMIN"));
  assert.ok(!canEditContent("TW_JEFE_COMERCIAL"));
});
