# Trademark Search Colombia

Sistema completo de búsqueda de marcas registradas de Colombia, conectado al SIPI de la SIC mediante scraping periódico, índice propio en PostgreSQL con `pgvector`, API en FastAPI, worker Celery y frontend Next.js 14 embebible.

## Estructura

```text
trademark-search/
├── api/
├── frontend/
├── scraper/
├── worker/
├── docker-compose.yml
└── README.md
```

## Arranque paso a paso

1. Entra al módulo y crea el archivo de entorno:

   ```bash
   cd trademark-search
   cp .env.example .env
   ```

   Configura al menos `DB_USER`, `DB_PASSWORD`, `SIPI_USERNAME` y `SIPI_PASSWORD`.

2. Levanta toda la plataforma:

   ```bash
   docker-compose up -d --build
   ```

3. Inicializa la base de datos y las extensiones:

   ```bash
   docker exec trademark_api python -c "from db import init_db; import asyncio; asyncio.run(init_db())"
   ```

4. Ejecuta la carga inicial completa desde Celery:

   ```bash
   docker exec trademark_worker python -c "from worker.tasks import full_scrape_task; full_scrape_task.delay()"
   ```

5. Abre el frontend:

   - Aplicación principal: `http://localhost:3000`
   - Widget embebible: `http://localhost:3000/embed`

6. Abre la documentación interactiva de la API:

   - Swagger UI: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

## Servicios

- `postgres`: PostgreSQL 16 con `pgvector`, `pg_trgm` y extensiones necesarias.
- `redis`: broker/backend de Celery.
- `api`: API FastAPI para búsqueda, detalle, alertas y estadísticas.
- `worker`: ejecución de scraping incremental, carga completa y envío de alertas.
- `beat`: scheduler de Celery para trabajos periódicos.
- `frontend`: Next.js 14 App Router con experiencia responsive y modo embebible.

## Jobs programados

- Incremental diario: 02:00 Colombia / 07:00 UTC
- Rescrape semanal completo: domingos 01:00 Colombia / 06:00 UTC
- Alertas por correo: diario 03:00 Colombia / 08:00 UTC

## Endpoints principales

- `GET /api/v1/search?q=bancolombia`
- `GET /api/v1/trademarks/{numero_solicitud}`
- `POST /api/v1/alerts`
- `GET /api/v1/stats`

## Integración embebible

Puedes embeber el módulo en otro sitio con un `iframe`:

```html
<iframe
  src="http://localhost:3000/embed?q=claro"
  title="Búsqueda de marcas Colombia"
  width="100%"
  height="900"
  style="border:0;border-radius:24px;overflow:hidden"
></iframe>
```

## Notas operativas

- El scraper respeta un rate limiting mínimo de 2 segundos entre interacciones contra SIPI.
- La búsqueda combina `tsvector`, `pg_trgm` y una vectorización hash de 384 dimensiones compatible con `pgvector` sin dependencias extra.
- Las alertas usan Resend por HTTP nativo de Python. Si no configuras `RESEND_API_KEY` y `FROM_EMAIL`, la tarea se ejecutará pero no enviará correos.
