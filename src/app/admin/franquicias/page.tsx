"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const PLAN_BADGE: Record<string, { label: string; classes: string }> = {
  BASIC: { label: "Presencia", classes: "bg-slate-100 text-slate-600" },
  GROWTH: { label: "Conversión", classes: "bg-purple-100 text-purple-700" },
  ALL_IN: { label: "Aceleración", classes: "bg-teal-100 text-teal-700" },
};

type FranchiseRow = {
  id: string;
  name: string;
  slug: string | null;
  planTier: string;
  published: boolean;
  updatedAt: string;
  headline: string | null;
  listingType: string;
  availabilityLabel: string | null;
  editorialBadge: string | null;
};

const LISTING_BADGE: Record<string, string> = {
  ACTIVE_FRANCHISE: "bg-emerald-50 text-emerald-700",
  EXTERNAL_FRANCHISE: "bg-amber-50 text-amber-700",
  IDENTIFIED_BRAND: "bg-slate-100 text-slate-700",
};

export default function LandingFranchisesListPage() {
  const [franchises, setFranchises] = useState<FranchiseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; franchise: FranchiseRow | null }>({
    open: false,
    franchise: null,
  });
  const [bulkModal, setBulkModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/landing/franchises");
      if (res.ok) {
        const data = await res.json();
        setFranchises(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load. loadFranchises itself sets state (setLoading + setFranchises),
  // which the new react-compiler lint flags — but a "fetch on mount" effect is
  // the legitimate pattern here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFranchises();
  }, [loadFranchises]);

  const allSelected =
    franchises.length > 0 && franchises.every((f) => selectedIds.has(f.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(franchises.map((f) => f.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSingleDelete() {
    const f = deleteModal.franchise;
    if (!f) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/landing/franchises/${f.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      // Fade out
      setFadingIds((prev) => new Set(prev).add(f.id));
      setTimeout(() => {
        setFranchises((prev) => prev.filter((x) => x.id !== f.id));
        setFadingIds((prev) => {
          const next = new Set(prev);
          next.delete(f.id);
          return next;
        });
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(f.id);
          return next;
        });
      }, 300);
      setDeleteModal({ open: false, franchise: null });
      showToast("Franquicia eliminada");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/landing/franchises/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setBulkModal(false);
      setSelectedIds(new Set());
      await loadFranchises();
      showToast(`${ids.length} franquicia${ids.length !== 1 ? "s" : ""} eliminada${ids.length !== 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  const selectedFranchises = franchises.filter((f) => selectedIds.has(f.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-sm text-gray-500">
            Franquicias del sistema de landing modular
          </p>
        </div>
        <Link
          href="/admin/franquicias/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Nueva franquicia
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Franquicia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actualizado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && franchises.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay franquicias todavía.{" "}
                  <Link href="/admin/franquicias/new" className="text-blue-600 underline">
                    Crear la primera
                  </Link>
                </td>
              </tr>
            )}
            {franchises.map((f) => {
              const badge = PLAN_BADGE[f.planTier] ?? PLAN_BADGE.BASIC;
              const slugForUrl = f.slug ?? f.name.toLowerCase().replace(/\s+/g, "-");
              const isFading = fadingIds.has(f.id);

              return (
                <tr
                  key={f.id}
                  className={`hover:bg-gray-50 transition-all duration-300 ${isFading ? "opacity-0" : "opacity-100"}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(f.id)}
                      onChange={() => toggleOne(f.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                      {f.headline && (
                        <p className="text-xs text-gray-400 truncate max-w-[260px]">
                          {f.headline}
                        </p>
                      )}
                      {f.slug && (
                        <p className="text-xs text-gray-400 font-mono">/franquicia/{f.slug}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            LISTING_BADGE[f.listingType] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {f.availabilityLabel ??
                            (f.listingType === "IDENTIFIED_BRAND"
                              ? "Marca identificada"
                              : f.listingType === "EXTERNAL_FRANCHISE"
                              ? "Franquicia externa"
                              : "Franquicia activa")}
                        </span>
                        {f.editorialBadge && (
                          <span className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200">
                            {f.editorialBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        f.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          f.published ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {f.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Intl.DateTimeFormat("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(f.updatedAt))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/franquicia/${slugForUrl}?preview=true`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Preview ↗
                      </Link>
                      <Link
                        href={`/admin/franquicias/${f.id}/edit`}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ open: true, franchise: f })}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                        title="Eliminar franquicia"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-xl bg-gray-900 px-5 py-3 shadow-2xl">
          <span className="text-sm font-medium text-white">
            {selectedIds.size} franquicia{selectedIds.size !== 1 ? "s" : ""} seleccionada{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setBulkModal(true)}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            Eliminar seleccionadas
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Single delete modal */}
      {deleteModal.open && deleteModal.franchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              ¿Eliminar {deleteModal.franchise.name}?
            </h2>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. Se eliminarán todos los datos, modelos de negocio, FAQs, medios y configuraciones asociadas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, franchise: null })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSingleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              ¿Eliminar {selectedIds.size} franquicia{selectedIds.size !== 1 ? "s" : ""}?
            </h2>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.
            </p>
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {selectedFranchises.map((f) => (
                <li key={f.id} className="text-sm text-gray-700 font-medium">
                  • {f.name}
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Eliminando..." : "Eliminar todo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
