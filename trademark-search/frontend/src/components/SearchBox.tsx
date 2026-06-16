"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";

import FiltersPanel from "./FiltersPanel";

interface SearchBoxProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading: boolean;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  clase?: number;
  estado?: string;
}

export default function SearchBox({
  onSearch,
  loading,
  initialQuery = "",
  initialFilters = {}
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(Boolean(initialFilters.clase || initialFilters.estado));
  // React-canonical "reset on prop change" pattern: track the previous prop
  // value and reset local state during render when it changes.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }
  const [prevInitialFilters, setPrevInitialFilters] = useState(initialFilters);
  if (initialFilters !== prevInitialFilters) {
    setPrevInitialFilters(initialFilters);
    setFilters(initialFilters);
  }

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        inputRef.current?.focus();
        return;
      }
      onSearch(trimmed, filters);
    },
    [filters, onSearch, query]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-card rounded-[28px] p-3 shadow-glow">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar marca registrada, titular o expediente..."
              className="w-full rounded-[22px] border border-slate-200 bg-white px-12 py-4 text-base text-slate-900 outline-none transition focus:border-skyline focus:ring-4 focus:ring-skyline/10"
            />
          </div>

          <div className="flex gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-skyline hover:text-skyline"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </button>
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="inline-flex min-w-[136px] items-center justify-center gap-2 rounded-[22px] bg-skyline px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-skyline/20 transition hover:bg-skyline/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buscar"}
            </button>
          </div>
        </div>

        {showFilters ? (
          <FiltersPanel filters={filters} onChange={setFilters} />
        ) : (
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="mt-3 text-sm font-medium text-skyline transition hover:text-skyline/80"
          >
            Mostrar filtros avanzados
          </button>
        )}
      </div>
    </form>
  );
}
