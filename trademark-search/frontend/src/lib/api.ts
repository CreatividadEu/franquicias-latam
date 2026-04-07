const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SearchParams {
  q: string;
  clase?: number;
  estado?: string;
  page?: number;
  limit?: number;
}

export interface Trademark {
  id: number;
  numero_solicitud: string;
  numero_registro?: string;
  denominacion: string;
  clase_niza?: number[];
  descripcion_clase?: string;
  estado?: string;
  tipo_signo?: string;
  titular?: string;
  fecha_solicitud?: string;
  fecha_registro?: string;
  fecha_vigencia?: string;
  pais_titular?: string;
  logo_url?: string;
  logo_local_path?: string;
  fuente?: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
  last_scraped_at?: string;
}

export interface SearchResult {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: Trademark[];
  took_ms: number;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.detail === "string"
        ? payload.detail
        : `API error: ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function searchTrademarks(params: SearchParams): Promise<SearchResult> {
  const url = new URL(`${API_BASE}/api/v1/search`);
  url.searchParams.set("q", params.q);
  if (params.clase) {
    url.searchParams.set("clase", String(params.clase));
  }
  if (params.estado) {
    url.searchParams.set("estado", params.estado);
  }
  url.searchParams.set("page", String(params.page || 1));
  url.searchParams.set("limit", String(params.limit || 20));

  const response = await fetch(url.toString(), {
    cache: "no-store"
  });

  return parseJson<SearchResult>(response);
}

export async function getTrademark(numero: string): Promise<Trademark> {
  const response = await fetch(
    `${API_BASE}/api/v1/trademarks/${encodeURIComponent(numero)}`,
    { cache: "no-store" }
  );
  return parseJson<Trademark>(response);
}

export async function createAlert(email: string, query: string, clase?: number) {
  const response = await fetch(`${API_BASE}/api/v1/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, query, clase_niza: clase })
  });

  return parseJson<{ message: string; created_at: string }>(response);
}
