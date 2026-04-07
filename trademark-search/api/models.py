import hashlib
import math
import re
import unicodedata
from dataclasses import dataclass

TOKEN_PATTERN = re.compile(r"[A-Za-z0-9]+", re.UNICODE)
ESTADO_ALIASES = {
    "R": ["registrada", "concedida", "renovada"],
    "S": ["solicitada", "en tramite", "en trámite"],
    "E": ["en examen", "publicacion", "publicación"],
    "C": ["caducada", "cancelada", "abandonada", "denegada"],
}


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


def vector_to_literal(vector: list[float]) -> str:
    return "[" + ",".join(f"{value:.6f}" for value in vector) + "]"


def expand_estado_filter(raw_estado: str | None) -> list[str]:
    if not raw_estado:
        return []
    normalized = raw_estado.strip().upper()
    return ESTADO_ALIASES.get(normalized, [raw_estado.strip().lower()])


@dataclass(frozen=True)
class SearchQueryContext:
    query: str
    ilike_term: str
    vector_literal: str


def build_search_context(query: str) -> SearchQueryContext:
    return SearchQueryContext(
        query=query.strip(),
        ilike_term=f"%{query.strip()}%",
        vector_literal=vector_to_literal(build_hash_embedding(query.strip())),
    )
