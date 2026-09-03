import test from "node:test";
import assert from "node:assert/strict";
import {
  SANDBOX_NAVY,
  SANDBOX_TEAL,
  contrastRatio,
  hexAlpha,
  lighten,
  normalizeHex,
  resolveAccent,
} from "../src/lib/sandbox/color";

test("normalizeHex acepta #abc, abcdef y rechaza basura", () => {
  assert.equal(normalizeHex("#abc"), "#AABBCC");
  assert.equal(normalizeHex("ff6a2b"), "#FF6A2B");
  assert.equal(normalizeHex(" #FF6A2B "), "#FF6A2B");
  assert.equal(normalizeHex("#12345"), null);
  assert.equal(normalizeHex("rojo"), null);
});

test("contrastRatio: blanco sobre negro ≈ 21, mismo color = 1", () => {
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#000000") - 21) < 0.01);
  assert.ok(Math.abs(contrastRatio("#FF6A2B", "#FF6A2B") - 1) < 0.0001);
});

test("resolveAccent deja intactos los acentos que ya contrastan sobre el navy", () => {
  for (const hex of [SANDBOX_TEAL, "#FF6A2B", "#A8F542", "#FFD400"]) {
    const res = resolveAccent(hex);
    assert.equal(res.adjusted, false, `${hex} no debería ajustarse`);
    assert.equal(res.onNavy, res.raw);
    assert.ok(res.contrast >= 4.5);
  }
});

test("resolveAccent aclara los acentos oscuros hasta AA sobre el navy", () => {
  for (const hex of ["#1E3A8A", "#7A0C0C", "#0B3D2E", "#222222"]) {
    const res = resolveAccent(hex);
    assert.equal(res.adjusted, true, `${hex} debería ajustarse`);
    assert.ok(res.contrast >= 4.5, `${hex} → ${res.onNavy} contraste ${res.contrast.toFixed(2)}`);
    assert.ok(contrastRatio(res.onNavy, SANDBOX_NAVY) >= 4.5);
    assert.notEqual(res.onNavy, res.raw);
  }
});

test("resolveAccent cae al teal con un hex inválido o vacío", () => {
  assert.equal(resolveAccent("no-es-color").raw, SANDBOX_TEAL);
  assert.equal(resolveAccent(null).onNavy, SANDBOX_TEAL);
  assert.equal(resolveAccent(undefined).adjusted, false);
});

test("lighten y hexAlpha", () => {
  assert.equal(lighten("#000000", 1), "#FFFFFF");
  assert.equal(lighten("#000000", 0), "#000000");
  assert.equal(hexAlpha("#FF6A2B", 0.5), "rgba(255, 106, 43, 0.5)");
});
