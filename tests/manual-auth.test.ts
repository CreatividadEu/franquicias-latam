import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// La lib lee el entorno en cada llamada, no al importarse, así que basta con
// dejarlo puesto antes de que corra el primer test.
process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.MANUAL_POLLO_AL_BARRIL_USER = "pollosalbarril";
process.env.MANUAL_POLLO_AL_BARRIL_PASSWORD_HASH = bcrypt.hashSync("elmejorpollocrece", 4);

import {
  esManualConPuerta,
  firmarToken,
  puertaConfigurada,
  verificarCredenciales,
  verificarToken,
} from "../src/lib/manual/auth";
import { parsearEstado } from "../src/lib/manual/estado";

test("solo los manuales declarados tienen puerta", () => {
  assert.ok(esManualConPuerta("pollo-al-barril"));
  assert.ok(!esManualConPuerta("otro-manual"));
  assert.ok(!esManualConPuerta("../admin"));
});

test("la puerta exige que las credenciales estén configuradas", () => {
  assert.ok(puertaConfigurada("pollo-al-barril"));
  const hash = process.env.MANUAL_POLLO_AL_BARRIL_PASSWORD_HASH;
  delete process.env.MANUAL_POLLO_AL_BARRIL_PASSWORD_HASH;
  assert.ok(!puertaConfigurada("pollo-al-barril"));
  process.env.MANUAL_POLLO_AL_BARRIL_PASSWORD_HASH = hash;
});

test("entra con las credenciales correctas", async () => {
  assert.equal(
    await verificarCredenciales("pollo-al-barril", "pollosalbarril", "elmejorpollocrece"),
    "pollosalbarril",
  );
});

test("el usuario no distingue mayúsculas ni espacios de sobra", async () => {
  assert.equal(
    await verificarCredenciales("pollo-al-barril", "  PolloSalBarril ", "elmejorpollocrece"),
    "pollosalbarril",
  );
});

test("la contraseña sí distingue mayúsculas", async () => {
  assert.equal(
    await verificarCredenciales("pollo-al-barril", "pollosalbarril", "ElMejorPolloCrece"),
    null,
  );
});

test("rechaza contraseña o usuario equivocados", async () => {
  assert.equal(await verificarCredenciales("pollo-al-barril", "pollosalbarril", "otra"), null);
  assert.equal(await verificarCredenciales("pollo-al-barril", "otro", "elmejorpollocrece"), null);
  assert.equal(await verificarCredenciales("pollo-al-barril", "", ""), null);
});

test("el token de ida y vuelta conserva la sesión", () => {
  const sesion = verificarToken(firmarToken("pollo-al-barril", "pollosalbarril"));
  assert.deepEqual(sesion, { slug: "pollo-al-barril", usuario: "pollosalbarril" });
});

test("un token manipulado o de otro secreto no vale", () => {
  assert.equal(verificarToken("no-es-un-token"), null);
  assert.equal(
    verificarToken(jwt.sign({ slug: "pollo-al-barril", usuario: "x" }, "otro-secreto", { audience: "manual" })),
    null,
  );
});

test("una sesión de la plataforma no abre el manual", () => {
  // Mismo secreto, otro público: un admin_token no debe valer como manual_token.
  const tokenAdmin = jwt.sign({ userId: "u1", role: "ADMIN" }, process.env.JWT_SECRET!);
  assert.equal(verificarToken(tokenAdmin), null);
});

test("un token de un manual que ya no existe se descarta", () => {
  const ajeno = jwt.sign({ slug: "manual-viejo", usuario: "x" }, process.env.JWT_SECRET!, {
    audience: "manual",
  });
  assert.equal(verificarToken(ajeno), null);
});

test("el estado guardado valida forma, no catálogo", () => {
  assert.deepEqual(parsearEstado({ costos: { pollo: 7.24 }, conIVA: true }), {
    costos: { pollo: 7.24 },
    conIVA: true,
  });
  assert.equal(parsearEstado({ costos: { pollo: -1 }, conIVA: false }), null);
  assert.equal(parsearEstado({ costos: { pollo: "7.24" }, conIVA: false }), null);
  assert.equal(parsearEstado({ costos: {}, conIVA: "sí" }), null);
  assert.equal(parsearEstado({ conIVA: false }), null);
  assert.equal(parsearEstado(null), null);
});

test("no se puede engordar la fila con miles de piezas", () => {
  const costos = Object.fromEntries(Array.from({ length: 301 }, (_, i) => [`p${i}`, 1]));
  assert.equal(parsearEstado({ costos, conIVA: false }), null);
});
