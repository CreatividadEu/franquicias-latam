from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TrademarkRecord(BaseModel):
    numero_solicitud: str
    numero_registro: Optional[str] = None
    denominacion: str
    clase_niza: Optional[List[int]] = None
    descripcion_clase: Optional[str] = None
    estado: Optional[str] = None
    tipo_signo: Optional[str] = None
    titular: Optional[str] = None
    fecha_solicitud: Optional[date] = None
    fecha_registro: Optional[date] = None
    fecha_vigencia: Optional[date] = None
    logo_url: Optional[str] = None
    fuente: str = "SIPI_COL"
    content_hash: Optional[str] = None
    last_scraped_at: datetime = Field(default_factory=datetime.utcnow)
