from datetime import date, datetime
from typing import Any

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status

from db import get_db
from schemas import TrademarkDetail

router = APIRouter(prefix="/api/v1/trademarks", tags=["trademarks"])


def _serialize_value(value: Any):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


@router.get(
    "/{numero_solicitud}",
    response_model=TrademarkDetail,
    responses={404: {"description": "Marca no encontrada"}},
)
async def get_trademark(
    numero_solicitud: str,
    db: asyncpg.Connection = Depends(get_db),
):
    try:
        row = await db.fetchrow(
            "SELECT * FROM trademarks WHERE numero_solicitud = $1",
            numero_solicitud,
        )
    except asyncpg.PostgresError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No fue posible consultar la marca: {exc}",
        ) from exc

    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca no encontrada")

    payload = {key: _serialize_value(value) for key, value in dict(row).items()}
    return TrademarkDetail(**payload)
