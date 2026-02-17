import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFranchiseSlug,
  slugifyFranchiseName,
} from "../src/lib/franchiseSlug";

test("slugifyFranchiseName normalizes accents and symbols", () => {
  const slug = slugifyFranchiseName("  Café & Bistro 24! ");
  assert.equal(slug, "cafe-bistro-24");
});

test("buildFranchiseSlug appends the lowercase id prefix", () => {
  const slug = buildFranchiseSlug("Bella Vita Spa", "ABCDef123456");
  assert.equal(slug, "bella-vita-spa-abcdef12");
});

test("buildFranchiseSlug falls back to franquicia when name is empty", () => {
  const slug = buildFranchiseSlug("   ", "12345678abcdef");
  assert.equal(slug, "franquicia-12345678");
});
