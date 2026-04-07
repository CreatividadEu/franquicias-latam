import asyncio
import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import asyncpg
from celery import Celery

celery_app = Celery("trademark_worker")
celery_app.config_from_object("worker.celeryconfig")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def _require_sipi_credentials() -> tuple[str, str]:
    username = os.environ.get("SIPI_USERNAME")
    password = os.environ.get("SIPI_PASSWORD")
    if not username or not password:
        raise RuntimeError("SIPI_USERNAME y SIPI_PASSWORD son obligatorios para el scraping.")
    return username, password


def _send_resend_email(to_email: str, subject: str, html: str, text: str) -> bool:
    api_key = os.environ.get("RESEND_API_KEY")
    from_email = os.environ.get("FROM_EMAIL")
    if not api_key or not from_email:
        logger.warning("RESEND_API_KEY/FROM_EMAIL no configurados. Se omite el envío a %s.", to_email)
        return False

    payload = json.dumps(
        {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
            "text": text,
        }
    ).encode("utf-8")
    request = Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=20) as response:
            status_code = getattr(response, "status", 200)
            return 200 <= status_code < 300
    except (HTTPError, URLError) as exc:
        logger.error("No se pudo enviar el correo con Resend: %s", exc)
        return False


def _format_alert_email(query: str, trademarks: list[asyncpg.Record]) -> tuple[str, str]:
    lines = [
        f"Encontramos {len(trademarks)} marcas nuevas o similares para '{query}':",
        "",
    ]
    html_items = []
    for row in trademarks:
        line = (
            f"- {row['denominacion']} | Estado: {row['estado'] or 'N/D'} | "
            f"Titular: {row['titular'] or 'N/D'} | Solicitud: {row['numero_solicitud']}"
        )
        lines.append(line)
        html_items.append(f"<li>{line[2:]}</li>")

    text = "\n".join(lines)
    html = (
        f"<p>Encontramos <strong>{len(trademarks)}</strong> marcas nuevas o similares para "
        f"<strong>{query}</strong>:</p><ul>{''.join(html_items)}</ul>"
    )
    return html, text


@celery_app.task(bind=True, max_retries=3, default_retry_delay=600)
def incremental_scrape_task(self, days_back: int = 7):
    """Actualización diaria: marcas nuevas o modificadas en los últimos N días."""
    try:
        from scraper.db import init_db
        from scraper.sipi_scraper import run_incremental_scrape

        username, password = _require_sipi_credentials()
        asyncio.run(init_db())
        asyncio.run(run_incremental_scrape(username=username, password=password, days_back=days_back))
        logger.info("Scraping incremental completado correctamente.")
    except Exception as exc:
        logger.error("Error en el scraping incremental: %s", exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=1800)
def full_scrape_task(self):
    """Scraping masivo completo para carga inicial o re-sincronización."""
    try:
        from scraper.db import init_db
        from scraper.sipi_scraper import run_bulk_scrape

        username, password = _require_sipi_credentials()
        asyncio.run(init_db())
        asyncio.run(run_bulk_scrape(username=username, password=password))
        logger.info("Scraping masivo completado correctamente.")
    except Exception as exc:
        logger.error("Error en el scraping masivo: %s", exc)
        raise self.retry(exc=exc)


@celery_app.task
def send_alerts_task():
    """Busca nuevas coincidencias y envía alertas por correo usando Resend."""

    async def _send():
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL no está configurado.")

        conn = await asyncpg.connect(database_url)
        try:
            alerts = await conn.fetch(
                """
                SELECT *
                FROM trademark_alerts
                WHERE active = TRUE
                ORDER BY created_at ASC
                """
            )

            for alert in alerts:
                matches = await conn.fetch(
                    """
                    SELECT denominacion, estado, titular, numero_solicitud
                    FROM trademarks
                    WHERE (
                        denominacion_tsv @@ websearch_to_tsquery('spanish', $1)
                        OR similarity(lower(denominacion), lower($1)) > 0.35
                    )
                    AND ($2::smallint IS NULL OR $2 = ANY(clase_niza))
                    AND created_at > COALESCE($3, NOW() - INTERVAL '7 days')
                    ORDER BY created_at DESC
                    LIMIT 10
                    """,
                    alert["query"],
                    alert["clase_niza"],
                    alert["last_sent_at"],
                )

                if not matches:
                    continue

                html, text = _format_alert_email(alert["query"], matches)
                delivered = _send_resend_email(
                    to_email=alert["email"],
                    subject=f"Nuevas coincidencias para '{alert['query']}'",
                    html=html,
                    text=text,
                )

                if delivered:
                    await conn.execute(
                        "UPDATE trademark_alerts SET last_sent_at = NOW() WHERE id = $1",
                        alert["id"],
                    )
                else:
                    logger.warning("La alerta %s no pudo enviarse y no se marcará como enviada.", alert["id"])
        finally:
            await conn.close()

    asyncio.run(_send())
