from datetime import datetime
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query, status

from db import get_db
from models import build_search_context, expand_estado_filter
from schemas import AlertCreate, AlertResponse, SearchResponse, StatsBucket, StatsResponse, TrademarkResult

router = APIRouter(prefix="/api/v1", tags=["search"])


@router.get("/search", response_model=SearchResponse)
async def search_trademarks(
    q: str = Query(..., min_length=2, description="Término a buscar"),
    clase: Optional[int] = Query(None, ge=1, le=45, description="Clase Niza"),
    estado: Optional[str] = Query(None, description="Estado de la marca"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: asyncpg.Connection = Depends(get_db),
):
    started_at = datetime.utcnow()
    search_context = build_search_context(q)
    params: list[object] = [
        search_context.query,
        search_context.ilike_term,
        search_context.vector_literal,
    ]

    conditions = [
        """
        (
            denominacion_tsv @@ websearch_to_tsquery('spanish', $1)
            OR similarity(lower(denominacion), lower($1)) > 0.22
            OR denominacion ILIKE $2
            OR (denominacion_vec IS NOT NULL AND 1 - (denominacion_vec <=> $3::vector) > 0.28)
        )
        """
    ]

    if clase is not None:
        params.append(clase)
        conditions.append(f"${len(params)} = ANY(clase_niza)")

    estado_terms = expand_estado_filter(estado)
    if estado_terms:
        estado_conditions = []
        for term in estado_terms:
            params.append(f"%{term}%")
            estado_conditions.append(f"estado ILIKE ${len(params)}")
        conditions.append("(" + " OR ".join(estado_conditions) + ")")

    where_clause = " WHERE " + " AND ".join(conditions)
    score_expr = """
        (
            COALESCE(ts_rank_cd(denominacion_tsv, websearch_to_tsquery('spanish', $1)), 0) * 0.45 +
            GREATEST(similarity(lower(denominacion), lower($1)), 0) * 0.35 +
            CASE
                WHEN denominacion_vec IS NOT NULL THEN GREATEST(1 - (denominacion_vec <=> $3::vector), 0)
                ELSE 0
            END * 0.20
        ) AS score
    """

    limit_placeholder = len(params) + 1
    offset_placeholder = len(params) + 2
    params_with_pagination = [*params, limit, (page - 1) * limit]

    query_sql = f"""
        SELECT
            id,
            numero_solicitud,
            denominacion,
            clase_niza,
            estado,
            tipo_signo,
            titular,
            fecha_solicitud,
            fecha_vigencia,
            logo_url,
            {score_expr}
        FROM trademarks
        {where_clause}
        ORDER BY score DESC, fecha_solicitud DESC NULLS LAST
        LIMIT ${limit_placeholder} OFFSET ${offset_placeholder}
    """
    count_sql = f"SELECT COUNT(*) FROM trademarks {where_clause}"

    try:
        rows = await db.fetch(query_sql, *params_with_pagination)
        total = await db.fetchval(count_sql, *params)
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No fue posible consultar la base de datos: {exc}",
        ) from exc

    elapsed_ms = round((datetime.utcnow() - started_at).total_seconds() * 1000, 2)
    return SearchResponse(
        query=search_context.query,
        total=total or 0,
        page=page,
        limit=limit,
        took_ms=elapsed_ms,
        results=[
            TrademarkResult(
                id=row["id"],
                numero_solicitud=row["numero_solicitud"],
                denominacion=row["denominacion"],
                clase_niza=row["clase_niza"],
                estado=row["estado"],
                tipo_signo=row["tipo_signo"],
                titular=row["titular"],
                fecha_solicitud=row["fecha_solicitud"].isoformat() if row["fecha_solicitud"] else None,
                fecha_vigencia=row["fecha_vigencia"].isoformat() if row["fecha_vigencia"] else None,
                logo_url=row["logo_url"],
                score=float(row["score"]) if row["score"] is not None else 0.0,
            )
            for row in rows
        ],
    )


@router.post("/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert: AlertCreate,
    db: asyncpg.Connection = Depends(get_db),
):
    try:
        existing = await db.fetchrow(
            """
            SELECT id, active, created_at
            FROM trademark_alerts
            WHERE email = $1
              AND query = $2
              AND (
                ($3::smallint IS NULL AND clase_niza IS NULL)
                OR clase_niza = $3
              )
            """,
            alert.email,
            alert.query,
            alert.clase_niza,
        )

        if existing:
            await db.execute(
                """
                UPDATE trademark_alerts
                SET active = TRUE
                WHERE id = $1
                """,
                existing["id"],
            )
            return AlertResponse(
                message="La alerta ya existía y quedó reactivada.",
                created_at=existing["created_at"],
            )

        created_at = await db.fetchval(
            """
            INSERT INTO trademark_alerts (email, query, clase_niza)
            VALUES ($1, $2, $3)
            RETURNING created_at
            """,
            alert.email,
            alert.query,
            alert.clase_niza,
        )
        return AlertResponse(
            message="Alerta creada. Te notificaremos cuando aparezcan marcas similares.",
            created_at=created_at,
        )
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No fue posible crear la alerta: {exc}",
        ) from exc


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: asyncpg.Connection = Depends(get_db)):
    try:
        total = await db.fetchval("SELECT COUNT(*) FROM trademarks")
        by_estado = await db.fetch(
            """
            SELECT estado, COUNT(*) AS count
            FROM trademarks
            GROUP BY estado
            ORDER BY count DESC
            """
        )
        last_update = await db.fetchval("SELECT MAX(last_scraped_at) FROM trademarks")
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No fue posible leer las estadísticas: {exc}",
        ) from exc

    return StatsResponse(
        total_trademarks=total or 0,
        by_estado=[StatsBucket(estado=row["estado"], count=row["count"]) for row in by_estado],
        last_update=last_update.isoformat() if last_update else None,
    )
