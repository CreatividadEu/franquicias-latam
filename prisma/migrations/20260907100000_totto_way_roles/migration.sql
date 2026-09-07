-- Totto Way — paso 1/2: nuevos valores del enum UserRole.
-- Va en una migración aparte porque Postgres no permite USAR un valor de enum
-- añadido dentro de la misma transacción en la que se creó; la migración
-- siguiente (totto_way_init) los usa como DEFAULT en tw_checkpoints.
-- Idempotente (IF NOT EXISTS) siguiendo la convención del repo.

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TW_ASESOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TW_LIDER_TIENDA';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TW_AUX_LOGISTICO';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TW_JEFE_COMERCIAL';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TW_FORMADOR';
