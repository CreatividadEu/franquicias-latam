import hashlib
import math
import os
import re
import unicodedata
from datetime import date, datetime
from typing import Iterable, Optional, Sequence

import asyncpg
from dotenv import load_dotenv

try:
    from .models import TrademarkRecord
except ImportError:  # pragma: no cover
    from models import TrademarkRecord

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

UPSERT_SQL = """
INSERT INTO trademarks (
    numero_solicitud,
    numero_registro,
    denominacion,
    denominacion_vec,
    clase_niza,
    descripcion_clase,
    estado,
    tipo_signo,
    titular,
    fecha_solicitud,
    fecha_registro,
    fecha_vigencia,
    logo_url,
    fuente,
    content_hash,
    last_scraped_at
)
VALUES (
    $1, $2, $3, $4::vector, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
)
ON CONFLICT (numero_solicitud) DO UPDATE SET
    numero_registro = EXCLUDED.numero_registro,
    denominacion = EXCLUDED.denominacion,
    denominacion_vec = EXCLUDED.denominacion_vec,
    clase_niza = EXCLUDED.clase_niza,
    descripcion_clase = EXCLUDED.descripcion_clase,
    estado = EXCLUDED.estado,
    tipo_signo = EXCLUDED.tipo_signo,
    titular = EXCLUDED.titular,
    fecha_solicitud = EXCLUDED.fecha_solicitud,
    fecha_registro = EXCLUDED.fecha_registro,
    fecha_vigencia = EXCLUDED.fecha_vigencia,
    logo_url = EXCLUDED.logo_url,
    fuente = EXCLUDED.fuente,
    content_hash = EXCLUDED.content_hash,
    last_scraped_at = EXCLUDED.last_scraped_at
RETURNING id;
"""

TRACKED_FIELDS = (
    "numero_registro",
    "denominacion",
    "clase_niza",
    "descripcion_clase",
    "estado",
    "tipo_signo",
    "titular",
    "fecha_solicitud",
    "fecha_registro",
    "fecha_vigencia",
    "logo_url",
)

TOKEN_PATTERN = re.compile(r"[A-Za-z0-9]+", re.UNICODE)


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL no está configurado.")
    return database_url


async def get_connection() -> asyncpg.Connection:
    return await asyncpg.connect(get_database_url())


async def init_db() -> None:
    conn = await get_connection()
    try:
        await conn.execute(SCHEMA_SQL)
    finally:
        await conn.close()


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_only = "".join(char for char in normalized if not unicodedata.combining(char))
    return ascii_only.lower().strip()


def build_hash_embedding(text: str, dimensions: int = 384) -> list[float]:
    vector = [0.0] * dimensions
    normalized = normalize_text(text)

    for token in TOKEN_PATTERN.findall(normalized):
        grams = {token}
        if len(token) >= 3:
            grams.update(token[index : index + 3] for index in range(len(token) - 2))

        for gram in grams:
            digest = hashlib.sha256(gram.encode("utf-8")).digest()
            index = int.from_bytes(digest[:2], "big") % dimensions
            sign = 1.0 if digest[2] % 2 == 0 else -1.0
            weight = 1.5 if gram == token else 1.0
            vector[index] += sign * weight

    norm = math.sqrt(sum(component * component for component in vector))
    if norm == 0:
        return vector

    return [round(component / norm, 6) for component in vector]


def vector_to_literal(vector: Sequence[float]) -> str:
    return "[" + ",".join(f"{value:.6f}" for value in vector) + "]"


def _serialize_value(value: object) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return ",".join(str(item) for item in value)
    return str(value)


def _record_hash(record: TrademarkRecord) -> str:
    raw = "|".join(
        [
            record.numero_solicitud,
            record.numero_registro or "",
            record.denominacion or "",
            _serialize_value(record.clase_niza) or "",
            record.descripcion_clase or "",
            record.estado or "",
            record.tipo_signo or "",
            record.titular or "",
            _serialize_value(record.fecha_solicitud) or "",
            _serialize_value(record.fecha_registro) or "",
            _serialize_value(record.fecha_vigencia) or "",
            record.logo_url or "",
            record.fuente or "SIPI_COL",
        ]
    )
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


async def _store_history(
    conn: asyncpg.Connection,
    trademark_id: int,
    existing: asyncpg.Record,
    record: TrademarkRecord,
) -> None:
    for field_name in TRACKED_FIELDS:
        previous_value = _serialize_value(existing[field_name])
        next_value = _serialize_value(getattr(record, field_name))
        if previous_value == next_value:
            continue

        await conn.execute(
            """
            INSERT INTO trademark_history (
                trademark_id,
                campo_modificado,
                valor_anterior,
                valor_nuevo
            )
            VALUES ($1, $2, $3, $4)
            """,
            trademark_id,
            field_name,
            previous_value,
            next_value,
        )


async def upsert_trademarks(records: Iterable[TrademarkRecord]) -> int:
    records = list(records)
    if not records:
        return 0

    await init_db()
    conn = await get_connection()
    processed = 0

    try:
        async with conn.transaction():
            for record in records:
                content_hash = record.content_hash or _record_hash(record)
                vector_literal = vector_to_literal(build_hash_embedding(record.denominacion))

                existing = await conn.fetchrow(
                    """
                    SELECT id, numero_registro, denominacion, clase_niza, descripcion_clase,
                           estado, tipo_signo, titular, fecha_solicitud, fecha_registro,
                           fecha_vigencia, logo_url, content_hash
                    FROM trademarks
                    WHERE numero_solicitud = $1
                    """,
                    record.numero_solicitud,
                )

                if existing and existing["content_hash"] != content_hash:
                    await _store_history(conn, existing["id"], existing, record)

                await conn.execute(
                    UPSERT_SQL,
                    record.numero_solicitud,
                    record.numero_registro,
                    record.denominacion,
                    vector_literal,
                    record.clase_niza,
                    record.descripcion_clase,
                    record.estado,
                    record.tipo_signo,
                    record.titular,
                    record.fecha_solicitud,
                    record.fecha_registro,
                    record.fecha_vigencia,
                    record.logo_url,
                    record.fuente,
                    content_hash,
                    record.last_scraped_at,
                )
                processed += 1
    finally:
        await conn.close()

    return processed
