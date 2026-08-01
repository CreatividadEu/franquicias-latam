-- El unique [channel, title] de saju_channel_efforts colapsaba esfuerzos
-- legítimos: la misma pauta de PR corre con idéntico título en varios países
-- (Forbes + medio local en PA y en GT), y el país no puede formar parte de la
-- clave porque los esfuerzos globales lo tienen a NULL — Postgres considera
-- cada NULL distinto, así que el upsert del seed dejaría de ser idempotente.
-- La idempotencia del seed pasa a apoyarse en ids fijos.

DROP INDEX IF EXISTS "saju_channel_efforts_channel_title_key";
