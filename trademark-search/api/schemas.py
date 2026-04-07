from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class TrademarkResult(BaseModel):
    id: int
    numero_solicitud: str
    denominacion: str
    clase_niza: Optional[List[int]] = None
    estado: Optional[str] = None
    tipo_signo: Optional[str] = None
    titular: Optional[str] = None
    fecha_solicitud: Optional[str] = None
    fecha_vigencia: Optional[str] = None
    logo_url: Optional[str] = None
    score: Optional[float] = None


class TrademarkDetail(TrademarkResult):
    numero_registro: Optional[str] = None
    descripcion_clase: Optional[str] = None
    fecha_registro: Optional[str] = None
    pais_titular: Optional[str] = None
    fuente: Optional[str] = None
    logo_local_path: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_scraped_at: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    page: int
    limit: int
    results: List[TrademarkResult]
    took_ms: float


class AlertCreate(BaseModel):
    email: EmailStr
    query: str
    clase_niza: Optional[int] = None


class AlertResponse(BaseModel):
    message: str
    created_at: datetime


class StatsBucket(BaseModel):
    estado: Optional[str] = None
    count: int


class StatsResponse(BaseModel):
    total_trademarks: int
    by_estado: List[StatsBucket]
    last_update: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str
