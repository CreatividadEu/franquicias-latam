"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BadgeCheck } from "lucide-react";

import type { SearchFilters } from "@/components/SearchBox";
import { SearchResult, searchTrademarks } from "@/lib/api";

import ResultsTable from "./ResultsTable";
import SearchBox from "./SearchBox";

interface EmbedWidgetProps {
  embedded?: boolean;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

export default function EmbedWidget({
  embedded = false,
  initialQuery = "",
  initialFilters = {}
}: EmbedWidgetProps) {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters);

  const executeSearch = useCallback(
    async (query: string, filters: SearchFilters, page = 1) => {
      setLoading(true);
      setError(null);
      setCurrentQuery(query);
      setCurrentFilters(filters);
      try {
        const response = await searchTrademarks({
          q: query,
          clase: filters.clase,
          estado: filters.estado,
          page,
          limit: 20
        });
        setResults(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo completar la búsqueda.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-run the embedded search when initialQuery/initialFilters change.
  // executeSearch sets state (loading, results, error) which the new
  // react-compiler lint flags — "fetch on prop change" is the intended pattern.
  useEffect(() => {
    if (initialQuery.trim().length < 2) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void executeSearch(initialQuery.trim(), initialFilters, 1);
  }, [executeSearch, initialFilters, initialQuery]);

  const shellClassName = embedded
    ? "rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-xl"
    : "rounded-[36px] glass-card border border-white/60 p-5 shadow-glow sm:p-7";

  return (
    <section className={shellClassName}>
      {!embedded ? (
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-skyline/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-skyline">
              <BadgeCheck className="h-3.5 w-3.5" />
              Monitor de marcas Colombia
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Busca, compara y vigila marcas registradas en Colombia.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Índice propio actualizado desde el SIPI de la SIC, con búsqueda híbrida
              full-text, trigramas y vectorización hash para resultados más útiles.
            </p>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-gradient-to-br from-skyline to-jade p-6 text-white shadow-xl shadow-skyline/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Widget embebible
            </p>
            <p className="mt-3 text-lg font-semibold">
              También puedes montarlo en otro sitio usando un iframe al endpoint `/embed`.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Diseñado para equipos legales, franquicias, estudios de naming y vigilancia de
              competencia.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-slate-900">Búsqueda de Marcas Colombia</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulta rápida desde la base indexada del SIPI.
          </p>
        </div>
      )}

      <SearchBox
        onSearch={executeSearch}
        loading={loading}
        initialQuery={currentQuery}
        initialFilters={currentFilters}
      />

      <div className="mt-8">
        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        ) : null}

        {results ? (
          <ResultsTable
            results={results.results}
            total={results.total}
            query={results.query}
            page={results.page}
            limit={results.limit}
            took_ms={results.took_ms}
            onPageChange={(nextPage) => {
              void executeSearch(currentQuery, currentFilters, nextPage);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        ) : loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/70 px-6 py-14 text-center text-slate-500">
            Consultando la base de datos de marcas...
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/50 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-slate-900">Explora coincidencias en segundos</p>
            <p className="mt-2 text-sm text-slate-500">
              Ejemplos: Bancolombia, Claro, Nutresa, Café Quindío, Subway.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
