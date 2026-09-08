-- Totto Way — eventos de XP que son de la tienda, no de una persona.
--
-- El NPS del mes suma +300 al equipo completo (§5 del brief), así que
-- `tw_xp_events.userId` pasa a ser opcional. Los eventos con userId nulo solo
-- cuentan para la clasificación por tienda; la individual se construye desde
-- la lista de empleados, así que los ignora sola.
--
-- Además, un índice único parcial impide pagar dos veces el NPS del mismo mes
-- a la misma tienda: la clave es (storeId, source, refId) con refId = "nps:2026-09".
--
-- Aditiva e idempotente.

ALTER TABLE "tw_xp_events" ALTER COLUMN "userId" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "tw_xp_events_store_ref_key"
  ON "tw_xp_events" ("storeId", "source", "refId")
  WHERE "storeId" IS NOT NULL AND "refId" IS NOT NULL AND "source" = 'NPS';
