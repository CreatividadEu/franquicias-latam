import asyncio
import hashlib
import logging
import os
import random
import re
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import parse_qs, urljoin, urlparse

from bs4 import BeautifulSoup
from playwright.async_api import Error as PlaywrightError
from playwright.async_api import Page, async_playwright

try:
    from .db import init_db, upsert_trademarks
    from .models import TrademarkRecord
except ImportError:  # pragma: no cover
    from db import init_db, upsert_trademarks
    from models import TrademarkRecord

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SIPI_BASE = "https://sipi.sic.gov.co"
SIPI_LOGIN = f"{SIPI_BASE}/sipi/Extra/Login.aspx"
SIPI_HOME = f"{SIPI_BASE}/sipi/Extra/Default.aspx"

LOGIN_USER_SELECTORS = (
    'input[name*="Usuario"]',
    'input[id*="Usuario"]',
    'input[name*="usuario"]',
    'input[id*="usuario"]',
    'input[name*="LoginControl"][name*="User"]',
)
LOGIN_PASSWORD_SELECTORS = (
    'input[type="password"]',
    'input[name*="Clave"]',
    'input[id*="Clave"]',
    'input[name*="Password"]',
)
LOGIN_SUBMIT_SELECTORS = (
    'input[type="submit"]',
    'button[type="submit"]',
    'input[name*="btnIngresar"]',
    'button:has-text("Ingresar")',
    'button:has-text("Entrar")',
)
SEARCH_FORM_SELECTORS = (
    'input[name*="Denominacion"]',
    'input[id*="Denominacion"]',
    'input[id*="txtDenominacion"]',
    'input[name*="txtDenominacion"]',
)
DATE_PATTERNS = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y")


class SIPIScraper:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self.sid: Optional[str] = None
        self.min_delay = 2.0
        self.max_delay = 4.5

    async def _random_delay(self) -> None:
        await asyncio.sleep(random.uniform(self.min_delay, self.max_delay))

    async def _find_first(self, page: Page, selectors: tuple[str, ...], timeout: int = 10000):
        for selector in selectors:
            locator = page.locator(selector).first
            try:
                await locator.wait_for(state="visible", timeout=timeout)
                return locator
            except PlaywrightError:
                continue
        return None

    async def _fill_if_present(self, page: Page, selectors: tuple[str, ...], value: str) -> bool:
        if not value:
            return False

        locator = await self._find_first(page, selectors, timeout=3000)
        if locator is None:
            return False

        await locator.click()
        await locator.fill("")
        await locator.fill(value)
        return True

    async def _select_if_present(self, page: Page, selectors: tuple[str, ...], value: str) -> bool:
        if value in (None, ""):
            return False

        for selector in selectors:
            locator = page.locator(selector).first
            try:
                await locator.wait_for(state="attached", timeout=3000)
                await locator.select_option(str(value))
                return True
            except PlaywrightError:
                continue
        return False

    def _extract_sid(self, url: str) -> Optional[str]:
        parsed = urlparse(url)
        sid_values = parse_qs(parsed.query).get("sid")
        if sid_values:
            return sid_values[0]

        match = re.search(r"[?&]sid=([^&]+)", url)
        if match:
            return match.group(1)
        return None

    async def authenticate(self, page: Page) -> bool:
        logger.info("Autenticando en SIPI...")
        try:
            await page.goto(SIPI_LOGIN, wait_until="domcontentloaded", timeout=30000)
            user_input = await self._find_first(page, LOGIN_USER_SELECTORS)
            password_input = await self._find_first(page, LOGIN_PASSWORD_SELECTORS)

            if user_input is None or password_input is None:
                logger.error("No se encontraron campos de autenticación en SIPI.")
                return False

            await user_input.fill(self.username)
            await asyncio.sleep(0.5)
            await password_input.fill(self.password)
            await asyncio.sleep(0.3)

            submit_button = await self._find_first(page, LOGIN_SUBMIT_SELECTORS, timeout=5000)
            if submit_button is None:
                logger.error("No se encontró el botón de acceso al SIPI.")
                return False

            try:
                async with page.expect_navigation(wait_until="networkidle", timeout=25000):
                    await submit_button.click()
            except PlaywrightError:
                await submit_button.click()
                await page.wait_for_load_state("networkidle", timeout=25000)

            current_url = page.url
            self.sid = self._extract_sid(current_url)
            login_failed = current_url.lower().endswith("login.aspx") or "login" in current_url.lower()
            if login_failed and not self.sid:
                logger.error("La autenticación no avanzó fuera de Login.aspx.")
                return False

            logger.info("Autenticación completada correctamente.")
            return True
        except Exception as exc:
            logger.error("Error durante la autenticación: %s", exc)
            return False

    async def navigate_to_trademark_search(self, page: Page) -> bool:
        """Navega hasta la búsqueda avanzada de signos distintivos."""
        try:
            await page.goto(SIPI_HOME, wait_until="networkidle", timeout=30000)
            await self._random_delay()

            navigation_targets = (
                'a:has-text("Signos Distintivos")',
                'a:has-text("Marcas")',
                'a[href*="Signos"]',
                'a[href*="Marcas"]',
                'a:has-text("Búsqueda avanzada")',
                'a:has-text("Consulta")',
            )

            for selector in navigation_targets:
                locator = page.locator(selector).first
                try:
                    await locator.wait_for(state="visible", timeout=2500)
                    await locator.click()
                    await page.wait_for_load_state("networkidle", timeout=20000)
                    await self._random_delay()
                except PlaywrightError:
                    continue

                if await self._find_first(page, SEARCH_FORM_SELECTORS, timeout=2000):
                    return True

            form_locator = await self._find_first(page, SEARCH_FORM_SELECTORS, timeout=5000)
            if form_locator:
                return True

            logger.error("No fue posible llegar al formulario de búsqueda de marcas.")
            return False
        except Exception as exc:
            logger.error("Error navegando a la búsqueda de marcas: %s", exc)
            return False

    async def search(
        self,
        page: Page,
        denominacion: str = "",
        clase_niza: int | None = None,
        tipo_busqueda: str = "2",
        estado: str = "",
        titular: str = "",
        fecha_desde: str = "",
    ) -> list[TrademarkRecord]:
        try:
            form_locator = await self._find_first(page, SEARCH_FORM_SELECTORS, timeout=15000)
            if form_locator is None:
                raise RuntimeError("El formulario de búsqueda del SIPI no está disponible.")

            await form_locator.fill("")
            if denominacion:
                await form_locator.fill(denominacion)

            await self._fill_if_present(
                page,
                (
                    'input[name*="Titular"]',
                    'input[id*="Titular"]',
                    'input[id*="txtTitular"]',
                ),
                titular,
            )

            await self._fill_if_present(
                page,
                (
                    'input[name*="FechaDesde"]',
                    'input[id*="FechaDesde"]',
                    'input[id*="txtFechaDesde"]',
                ),
                fecha_desde,
            )

            await self._select_if_present(
                page,
                (
                    'select[name*="Clase"]',
                    'select[id*="Clase"]',
                    'select[id*="ddlClase"]',
                ),
                str(clase_niza) if clase_niza else "",
            )

            await self._select_if_present(
                page,
                (
                    'select[name*="TipoBusqueda"]',
                    'select[id*="TipoBusqueda"]',
                    'select[id*="ddlTipo"]',
                ),
                tipo_busqueda,
            )

            await self._select_if_present(
                page,
                (
                    'select[name*="Estado"]',
                    'select[id*="Estado"]',
                    'select[id*="ddlEstado"]',
                ),
                estado,
            )

            await self._random_delay()
            search_button = await self._find_first(
                page,
                (
                    'input[name*="btnBuscar"]',
                    'input[id*="btnBuscar"]',
                    'input[value*="Buscar"]',
                    'button:has-text("Buscar")',
                ),
                timeout=5000,
            )
            if search_button is None:
                raise RuntimeError("No se encontró el botón de búsqueda del SIPI.")

            try:
                async with page.expect_navigation(wait_until="networkidle", timeout=30000):
                    await search_button.click()
            except PlaywrightError:
                await search_button.click()
                await page.wait_for_load_state("networkidle", timeout=30000)

            await self._random_delay()
            return self._parse_results(await page.content())
        except Exception as exc:
            logger.error("Error ejecutando la búsqueda en SIPI: %s", exc)
            return []

    def _parse_results(self, html: str) -> list[TrademarkRecord]:
        soup = BeautifulSoup(html, "lxml")
        table = self._find_results_table(soup)
        if table is None:
            logger.warning("No se encontró la tabla de resultados del SIPI.")
            return []

        header_map = self._build_header_map(table)
        results: list[TrademarkRecord] = []

        for row in table.find_all("tr"):
            if row.find("th"):
                continue

            cells = row.find_all("td")
            if len(cells) < 2:
                continue

            texts = [self._clean_text(cell.get_text(" ", strip=True)) for cell in cells]
            if not any(texts):
                continue

            logo_url = None
            image = row.find("img")
            if image and image.get("src"):
                logo_url = urljoin(SIPI_BASE, image["src"])

            numero = self._first_non_empty(
                self._cell_by_header(cells, header_map, ("solicitud", "expediente")),
                next((text for text in texts if re.fullmatch(r"\d{5,}", text)), None),
            )
            denominacion = self._first_non_empty(
                self._cell_by_header(cells, header_map, ("denominacion", "marca", "signo")),
                next((text for text in texts if len(text) > 2 and not text.isdigit()), None),
            )
            estado = self._first_non_empty(
                self._cell_by_header(cells, header_map, ("estado",)),
                next((text for text in texts if "registr" in text.lower() or "solicit" in text.lower()), None),
            )
            titular = self._first_non_empty(
                self._cell_by_header(cells, header_map, ("titular", "solicitante", "propietario")),
                texts[-2] if len(texts) >= 5 else None,
            )
            tipo_signo = self._cell_by_header(cells, header_map, ("tipo", "signo"))
            clase_text = self._cell_by_header(cells, header_map, ("clase", "niza"))
            registro = self._cell_by_header(cells, header_map, ("registro",))
            fecha_solicitud = self._parse_date(
                self._cell_by_header(cells, header_map, ("fecha solicitud", "solicitud"))
            )
            fecha_registro = self._parse_date(
                self._cell_by_header(cells, header_map, ("fecha registro",))
            )
            fecha_vigencia = self._parse_date(
                self._cell_by_header(cells, header_map, ("vigencia", "vencimiento"))
            )

            if not numero and not denominacion:
                continue

            raw_content = "|".join(texts)
            safe_numero = numero or f"UNKNOWN_{hashlib.md5(raw_content.encode('utf-8')).hexdigest()[:12]}"
            results.append(
                TrademarkRecord(
                    numero_solicitud=safe_numero,
                    numero_registro=registro,
                    denominacion=denominacion or "Sin denominación",
                    clase_niza=self._extract_classes(clase_text),
                    descripcion_clase=clase_text,
                    estado=estado,
                    tipo_signo=tipo_signo,
                    titular=titular,
                    fecha_solicitud=fecha_solicitud,
                    fecha_registro=fecha_registro,
                    fecha_vigencia=fecha_vigencia,
                    logo_url=logo_url,
                    content_hash=hashlib.md5(raw_content.encode("utf-8")).hexdigest(),
                    last_scraped_at=datetime.utcnow(),
                )
            )

        logger.info("Se parsearon %s registros desde la página actual.", len(results))
        return results

    def _find_results_table(self, soup: BeautifulSoup):
        candidate_tables = soup.find_all("table")
        for table in candidate_tables:
            header_text = " ".join(th.get_text(" ", strip=True).lower() for th in table.find_all("th"))
            table_id = " ".join(filter(None, [table.get("id"), " ".join(table.get("class", []))])).lower()
            if any(keyword in header_text for keyword in ("solicitud", "denominacion", "marca", "estado")):
                return table
            if any(keyword in table_id for keyword in ("gv", "grid", "result", "marca")):
                return table
        return None

    def _build_header_map(self, table) -> dict[str, int]:
        header_map: dict[str, int] = {}
        header_row = table.find("tr")
        if not header_row:
            return header_map

        for index, header in enumerate(header_row.find_all(["th", "td"])):
            label = self._clean_text(header.get_text(" ", strip=True)).lower()
            if label:
                header_map[label] = index
        return header_map

    def _cell_by_header(self, cells, header_map: dict[str, int], keywords: tuple[str, ...]) -> Optional[str]:
        for header_label, index in header_map.items():
            if any(keyword in header_label for keyword in keywords) and index < len(cells):
                return self._clean_text(cells[index].get_text(" ", strip=True))
        return None

    def _clean_text(self, value: str) -> str:
        return re.sub(r"\s+", " ", value or "").strip()

    def _extract_classes(self, value: Optional[str]) -> Optional[list[int]]:
        if not value:
            return None
        classes = sorted({int(match) for match in re.findall(r"\b([1-9]|[1-3][0-9]|4[0-5])\b", value)})
        return classes or None

    def _parse_date(self, value: Optional[str]):
        if not value:
            return None
        cleaned = self._clean_text(value)
        for pattern in DATE_PATTERNS:
            try:
                return datetime.strptime(cleaned, pattern).date()
            except ValueError:
                continue
        return None

    def _first_non_empty(self, *values: Optional[str]) -> Optional[str]:
        for value in values:
            if value:
                return value
        return None

    def _extract_next_postback(self, html: str, next_page: int) -> Optional[tuple[str, str]]:
        patterns = (
            rf"__doPostBack\('([^']+)','Page\${next_page}'\)",
            rf"__doPostBack\(\"([^\"]+)\",\"Page\${next_page}\"\)",
            r"__doPostBack\('([^']+)','Page\$Next'\)",
            r"__doPostBack\(\"([^\"]+)\",\"Page\$Next\"\)",
        )

        for pattern in patterns:
            match = re.search(pattern, html)
            if not match:
                continue

            argument = f"Page${next_page}" if "Next" not in pattern else "Page$Next"
            return match.group(1), argument
        return None

    async def get_all_pages(self, page: Page, **search_kwargs) -> list[TrademarkRecord]:
        all_records = await self.search(page, **search_kwargs)
        seen_keys = {record.numero_solicitud for record in all_records}

        current_page = 2
        while current_page <= 500:
            html = await page.content()
            postback = self._extract_next_postback(html, current_page)
            if postback is None:
                break

            target, argument = postback
            try:
                await page.evaluate(
                    """
                    ({ target, argument }) => {
                      if (typeof window.__doPostBack === "function") {
                        window.__doPostBack(target, argument);
                      }
                    }
                    """,
                    {"target": target, "argument": argument},
                )
                await page.wait_for_load_state("networkidle", timeout=20000)
                await self._random_delay()
            except Exception as exc:
                logger.error("Error avanzando a la página %s: %s", current_page, exc)
                break

            page_records = self._parse_results(await page.content())
            fresh_records = [record for record in page_records if record.numero_solicitud not in seen_keys]
            if not fresh_records:
                break

            for record in fresh_records:
                seen_keys.add(record.numero_solicitud)
            all_records.extend(fresh_records)
            logger.info("Página %s: %s registros nuevos.", current_page, len(fresh_records))
            current_page += 1

        logger.info("Búsqueda finalizada con %s registros acumulados.", len(all_records))
        return all_records


async def _build_browser_context(playwright):
    browser = await playwright.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    )
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1440, "height": 960},
    )
    return browser, context


async def run_bulk_scrape(username: str, password: str) -> None:
    import string

    await init_db()
    search_prefixes = list(string.ascii_uppercase) + list(string.digits)

    async with async_playwright() as playwright:
        browser, context = await _build_browser_context(playwright)
        page = await context.new_page()
        scraper = SIPIScraper(username=username, password=password)

        try:
            authenticated = await scraper.authenticate(page)
            if not authenticated:
                raise RuntimeError("No fue posible autenticar la sesión del SIPI.")

            navigated = await scraper.navigate_to_trademark_search(page)
            if not navigated:
                raise RuntimeError("No fue posible acceder a la búsqueda de marcas.")

            for prefix in search_prefixes:
                logger.info("Scraping masivo para el prefijo %s*", prefix)
                try:
                    records = await scraper.get_all_pages(page, denominacion=f"{prefix}*")
                    if records:
                        saved = await upsert_trademarks(records)
                        logger.info("Prefijo %s*: %s registros guardados.", prefix, saved)
                    await asyncio.sleep(random.uniform(8.0, 15.0))
                except Exception as exc:
                    logger.error("Error procesando el prefijo %s*: %s", prefix, exc)
                    if await scraper.authenticate(page):
                        await scraper.navigate_to_trademark_search(page)
        finally:
            await context.close()
            await browser.close()

    logger.info("Scraping masivo completado.")


async def run_incremental_scrape(username: str, password: str, days_back: int = 7) -> None:
    await init_db()
    fecha_desde = (datetime.utcnow() - timedelta(days=days_back)).strftime("%d/%m/%Y")

    async with async_playwright() as playwright:
        browser, context = await _build_browser_context(playwright)
        page = await context.new_page()
        scraper = SIPIScraper(username=username, password=password)

        try:
            if not await scraper.authenticate(page):
                raise RuntimeError("Autenticación fallida en el scraping incremental.")

            if not await scraper.navigate_to_trademark_search(page):
                raise RuntimeError("No se encontró el módulo de búsqueda de marcas.")

            records = await scraper.get_all_pages(page, fecha_desde=fecha_desde)
            if records:
                saved = await upsert_trademarks(records)
                logger.info("Scraping incremental completado: %s registros procesados.", saved)
        finally:
            await context.close()
            await browser.close()


if __name__ == "__main__":
    mode = os.getenv("SCRAPE_MODE", "incremental").lower()
    username = os.getenv("SIPI_USERNAME")
    password = os.getenv("SIPI_PASSWORD")

    if not username or not password:
        raise RuntimeError("SIPI_USERNAME y SIPI_PASSWORD son obligatorios.")

    if mode == "bulk":
        asyncio.run(run_bulk_scrape(username=username, password=password))
    else:
        days_back = int(os.getenv("SCRAPE_DAYS_BACK", "7"))
        asyncio.run(run_incremental_scrape(username=username, password=password, days_back=days_back))
