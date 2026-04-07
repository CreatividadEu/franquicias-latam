import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db import close_pool, init_pool
from routers.search import router as search_router
from routers.trademarks import router as trademarks_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_pool()
    try:
        yield
    finally:
        await close_pool()


app = FastAPI(
    title="Colombia Trademark Search API",
    description="Búsqueda de marcas registradas en Colombia conectada al SIPI de la SIC.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router)
app.include_router(trademarks_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled API error", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/")
async def root():
    return {
        "service": "colombia-trademark-search-api",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    from datetime import datetime

    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
