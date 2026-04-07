"use client";

import { useMemo, useState } from "react";

import type { Trademark } from "@/lib/api";

import TrademarkCard from "./TrademarkCard";

interface ResultsTableProps {
  results: Trademark[];
  total: number;
  query: string;
  page: number;
  limit: number;
  took_ms?: number;
  onPageChange: (page: number) => void;
}

const ESTADO_COLORS: Record<string, string> = {
  registrada: "bg-emerald-100 text-emerald-800",
  concedida: "bg-emerald-100 text-emerald-800",
  renovada: "bg-emerald-100 text-emerald-800",
  solicitada: "bg-amber-100 text-amber-800",
  "en trámite": "bg-sky-100 text-sky-800",
  "en tramite": "bg-sky-100 text-sky-800",
  caducada: "bg-rose-100 text-rose-800",
  cancelada: "bg-rose-100 text-rose-800",
  abandonada: "bg-slate-100 text-slate-700",
  default: "bg-slate-100 text-slate-700"
};

export default function ResultsTable({
  results,
  total,
  query,
  page,
  limit,
  took_ms,
  onPageChange
}: ResultsTableProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [limit, total]);

  if (results.length === 0) {
    return (
      <div className="glass-card rounded-[32px] px-6 py-14 text-center shadow-glow">
        <p className="text-lg font-semibold text-slate-900">
          No se encontraron marcas para &quot;{query}&quot;
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Prueba con otro nombre, variaciones fonéticas o elimina filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white/70 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> marcas
          encontradas para <span className="font-semibold text-skyline">{query}</span>
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {took_ms ? `${took_ms} ms` : "Búsqueda instantánea"}
        </p>
      </div>

      <div className="space-y-4 md:hidden">
        {results.map((trademark) => (
          <div key={trademark.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() =>
                setSelectedId((current) => (current === trademark.id ? null : trademark.id))
              }
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    {trademark.numero_solicitud}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {trademark.denominacion}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {trademark.titular || "Titular no reportado"}
                  </p>
                </div>
                <StatusBadge estado={trademark.estado} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  Clase {trademark.clase_niza?.join(", ") || "N/D"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  Vigencia {trademark.fecha_vigencia || "N/D"}
                </span>
              </div>
            </button>
            {selectedId === trademark.id ? (
              <TrademarkCard trademark={trademark} onClose={() => setSelectedId(null)} />
            ) : null}
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Solicitud</th>
              <th className="px-5 py-4">Denominación</th>
              <th className="px-5 py-4">Clase</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Titular</th>
              <th className="px-5 py-4">Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {results.map((trademark, index) => (
              <FragmentRow
                key={trademark.id}
                trademark={trademark}
                striped={index % 2 === 1}
                expanded={selectedId === trademark.id}
                onToggle={() =>
                  setSelectedId((current) => (current === trademark.id ? null : trademark.id))
                }
                onClose={() => setSelectedId(null)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/80 px-4 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            ← Página anterior
          </button>
          <span className="text-sm text-slate-500">
            Página <strong className="text-slate-900">{page}</strong> de{" "}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            Página siguiente →
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FragmentRow({
  trademark,
  striped,
  expanded,
  onToggle,
  onClose
}: {
  trademark: Trademark;
  striped: boolean;
  expanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-t border-slate-100 transition hover:bg-sky-50/70 ${
          striped ? "bg-slate-50/50" : "bg-white"
        }`}
      >
        <td className="px-5 py-4 font-mono text-xs text-slate-500">{trademark.numero_solicitud}</td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            {trademark.logo_url ? (
              <img
                src={trademark.logo_url}
                alt={trademark.denominacion}
                className="h-9 w-9 rounded-xl border border-slate-100 object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <div>
              <p className="font-semibold text-slate-900">{trademark.denominacion}</p>
              <p className="text-xs text-slate-400">
                Score {typeof trademark.score === "number" ? trademark.score.toFixed(3) : "0.000"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4 text-slate-600">{trademark.clase_niza?.join(", ") || "—"}</td>
        <td className="px-5 py-4">
          <StatusBadge estado={trademark.estado} />
        </td>
        <td className="max-w-[240px] truncate px-5 py-4 text-slate-600">{trademark.titular || "—"}</td>
        <td className="px-5 py-4 text-slate-500">{trademark.fecha_vigencia || "—"}</td>
      </tr>
      {expanded ? (
        <tr className="border-t border-slate-100 bg-slate-50/70">
          <td colSpan={6} className="px-5 py-2">
            <TrademarkCard trademark={trademark} onClose={onClose} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function StatusBadge({ estado }: { estado?: string }) {
  const normalized = (estado || "").toLowerCase();
  const colorClass = ESTADO_COLORS[normalized] || ESTADO_COLORS.default;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      {estado || "Sin estado"}
    </span>
  );
}
