"use client";

import type { SearchFilters } from "./SearchBox";

interface FiltersPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

const CLASES_NIZA = Array.from({ length: 45 }, (_, index) => index + 1);
const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "R", label: "Registrada / Concedida" },
  { value: "S", label: "Solicitada / En trámite" },
  { value: "E", label: "En examen / Publicación" },
  { value: "C", label: "Caducada / Cancelada" }
];

export default function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  return (
    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm sm:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm text-slate-600">
        Clase de Niza
        <select
          value={filters.clase || ""}
          onChange={(event) =>
            onChange({
              ...filters,
              clase: event.target.value ? Number(event.target.value) : undefined
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-skyline focus:ring-2 focus:ring-skyline/15"
        >
          <option value="">Todas las clases</option>
          {CLASES_NIZA.map((clase) => (
            <option key={clase} value={clase}>
              Clase {clase}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-600">
        Estado
        <select
          value={filters.estado || ""}
          onChange={(event) =>
            onChange({
              ...filters,
              estado: event.target.value || undefined
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-skyline focus:ring-2 focus:ring-skyline/15"
        >
          {ESTADOS.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
