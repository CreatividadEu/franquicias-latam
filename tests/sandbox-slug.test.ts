import test from "node:test";
import assert from "node:assert/strict";
import {
  SANDBOX_SLUG_LENGTH,
  generateSandboxSlug,
  isValidPin,
  isValidSandboxSlug,
} from "../src/lib/sandbox/slug";

test("slugs de 12 chars base58 sin caracteres ambiguos", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const slug = generateSandboxSlug();
    assert.equal(slug.length, SANDBOX_SLUG_LENGTH);
    assert.match(slug, /^[1-9A-HJ-NP-Za-km-z]+$/);
    assert.ok(isValidSandboxSlug(slug));
    seen.add(slug);
  }
  assert.equal(seen.size, 500, "500 slugs deberían ser todos distintos");
});

test("validación de slug y PIN", () => {
  assert.ok(isValidSandboxSlug("demo-asadero"));
  assert.equal(isValidSandboxSlug("ab"), false);
  assert.equal(isValidSandboxSlug("../x"), false);
  assert.equal(isValidSandboxSlug(42), false);
  assert.ok(isValidPin("0042"));
  assert.equal(isValidPin("42"), false);
  assert.equal(isValidPin("abcd"), false);
});
