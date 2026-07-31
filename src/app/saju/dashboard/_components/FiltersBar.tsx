"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SAJU_INTERESTS,
  SAJU_LEAD_TYPES,
  SAJU_STAGES,
  INTEREST_LABEL,
  STAGE_LABEL,
  TYPE_LABEL,
  countryMeta,
} from "@/lib/saju/command-center";
import type { SajuFilters } from "@/lib/saju/types";

/**
 * Filtros globales sincronizados con la URL: cualquier vista del tablero es
 * un enlace que se puede pegar en un chat. La búsqueda va con retardo para no
 * disparar una consulta por tecla.
 */
export function FiltersBar({
  filters,
  countries,
}: {
  filters: SajuFilters;
  countries: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
    });
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => pushParam("q", value.trim()), 400);
  }

  const hasFilters = Boolean(
    filters.country || filters.stage || filters.type || filters.interest || filters.q,
  );

  return (
    <div className="cc-card cc-card--pad cc-filters" data-pending={pending ? "true" : undefined}>
      <label className="cc-field cc-filters__search">
        <span className="cc-label">Buscar</span>
        <input
          className="cc-input"
          value={query}
          placeholder="Nombre, empresa, ciudad, nota…"
          onChange={(event) => onQueryChange(event.target.value)}
          type="search"
        />
      </label>

      <label className="cc-field cc-filters__select">
        <span className="cc-label">País</span>
        <select
          className="cc-select"
          value={filters.country ?? ""}
          onChange={(event) => pushParam("pais", event.target.value)}
        >
          <option value="">Todos</option>
          {countries.map((code) => {
            const meta = countryMeta(code);
            return (
              <option key={code} value={code}>
                {meta.flag} {meta.name}
              </option>
            );
          })}
        </select>
      </label>

      <label className="cc-field cc-filters__select">
        <span className="cc-label">Etapa</span>
        <select
          className="cc-select"
          value={filters.stage ?? ""}
          onChange={(event) => pushParam("etapa", event.target.value)}
        >
          <option value="">Todas</option>
          {SAJU_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABEL[stage]}
            </option>
          ))}
        </select>
      </label>

      <label className="cc-field cc-filters__select">
        <span className="cc-label">Tipo</span>
        <select
          className="cc-select"
          value={filters.type ?? ""}
          onChange={(event) => pushParam("tipo", event.target.value)}
        >
          <option value="">Todos</option>
          {SAJU_LEAD_TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABEL[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="cc-field cc-filters__select">
        <span className="cc-label">Interés</span>
        <select
          className="cc-select"
          value={filters.interest ?? ""}
          onChange={(event) => pushParam("interes", event.target.value)}
        >
          <option value="">Todos</option>
          {SAJU_INTERESTS.map((interest) => (
            <option key={interest} value={interest}>
              {INTEREST_LABEL[interest]}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button
          type="button"
          className="cc-btn cc-btn--ghost"
          onClick={() => {
            if (debounce.current) clearTimeout(debounce.current);
            setQuery("");
            const params = new URLSearchParams(searchParams.toString());
            for (const key of ["pais", "etapa", "tipo", "interes", "q"]) params.delete(key);
            startTransition(() => {
              router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, {
                scroll: false,
              });
            });
          }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
