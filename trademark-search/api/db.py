import os
from typing import AsyncIterator, Optional

import asyncpg
from dotenv import load_dotenv

load_dotenv()

SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS trademarks (
    id                BIGSERIAL PRIMARY KEY,
    numero_solicitud  VARCHAR(50) UNIQUE NOT NULL,
    numero_registro   VARCHAR(50),
    denominacion      TEXT NOT NULL,
    denominacion_tsv  TSVECTOR,
    denominacion_vec  vector(384),
    clase_niza        SMALLINT[],
    descripcion_clase TEXT,
    estado            VARCHAR(50),
    tipo_signo        VARCHAR(50),
    titular           TEXT,
    pais_titular      VARCHAR(10) DEFAULT 'CO',
    fecha_solicitud   DATE,
    fecha_registro    DATE,
    fecha_vigencia    DATE,
    logo_url          TEXT,
    logo_local_path   TEXT,
    fuente            VARCHAR(20) DEFAULT 'SIPI_COL',
    content_hash      CHAR(32),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    last_scraped_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS trademark_history (
    id               BIGSERIAL PRIMARY KEY,
    trademark_id     BIGINT REFERENCES trademarks(id),
    campo_modificado VARCHAR(50),
    valor_anterior   TEXT,
    valor_nuevo      TEXT,
    changed_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trademark_alerts (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,
    query        TEXT NOT NULL,
    clase_niza   SMALLINT,
    last_sent_at TIMESTAMPTZ,
    active       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_denominacion_tsv ON trademarks USING GIN(denominacion_tsv);
CREATE INDEX IF NOT EXISTS idx_denominacion_trgm ON trademarks USING GIN(denominacion gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clase_estado ON trademarks(clase_niza, estado);
CREATE INDEX IF NOT EXISTS idx_titular_trgm ON trademarks USING GIN(titular gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_updated ON trademarks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vec ON trademarks USING ivfflat(denominacion_vec vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION update_trademark_tsv()
RETURNS TRIGGER AS $$
BEGIN
  NEW.denominacion_tsv := to_tsvector('spanish', COALESCE(NEW.denominacion, ''));
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trademarks_tsv_update ON trademarks;
CREATE TRIGGER trademarks_tsv_update
BEFORE INSERT OR UPDATE ON trademarks
FOR EACH ROW EXECUTE FUNCTION update_trademark_tsv();
"""

_pool: Optional[asyncpg.Pool] = None


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL no está configurado.")
    return database_url


async def init_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=get_database_url(),
            min_size=1,
            max_size=10,
            command_timeout=30,
        )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def get_db() -> AsyncIterator[asyncpg.Connection]:
    pool = await init_pool()
    async with pool.acquire() as connection:
        yield connection


async def init_db() -> None:
    connection = await asyncpg.connect(get_database_url())
    try:
        await connection.execute(SCHEMA_SQL)
    finally:
        await connection.close()
