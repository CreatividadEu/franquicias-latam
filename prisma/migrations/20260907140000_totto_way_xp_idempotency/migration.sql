-- Totto Way — idempotencia del XP.
--
-- Dos índices únicos PARCIALES que hacen imposible pagar dos veces el mismo
-- evento, incluso con dos peticiones en paralelo (doble clic, reintento de red):
--   1. Fuentes con tope diario (marcación e Inspira): un evento por usuario y día.
--   2. Fuentes ligadas a un objeto (lección, quiz, checkpoint): uno por refId.
--
-- Prisma no expresa índices parciales en el schema, así que viven solo aquí;
-- `awardXp` captura la violación (P2002) y devuelve awarded:false.

CREATE UNIQUE INDEX IF NOT EXISTS "tw_xp_events_daily_cap_key"
  ON "tw_xp_events" ("userId", "source", "dayKey")
  WHERE "source" IN ('ATTENDANCE', 'INSPIRE');

CREATE UNIQUE INDEX IF NOT EXISTS "tw_xp_events_ref_key"
  ON "tw_xp_events" ("userId", "source", "refId")
  WHERE "refId" IS NOT NULL AND "source" IN ('LESSON', 'QUIZ', 'CHECKPOINT');
