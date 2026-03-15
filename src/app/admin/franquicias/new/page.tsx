"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Sector = { id: string; name: string; emoji: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function NewFranchisePage() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    sectorId: "",
    investmentMin: "",
    investmentMax: "",
    active: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then((d) => setSectors(d.sectors ?? d))
      .catch(() => {});
  }, []);

  function setField(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate slug from name if user hasn't manually edited it
      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) { setError("El nombre es requerido"); return; }
    if (!form.description.trim()) { setError("La descripción es requerida"); return; }
    if (!form.sectorId) { setError("El sector es requerido"); return; }
    if (!form.investmentMin || !form.investmentMax) {
      setError("Los rangos de inversión son requeridos");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/landing/franchises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || null,
          shortDescription: form.description.trim(),
          sectorId: form.sectorId,
          investmentMin: Number(form.investmentMin),
          investmentMax: Number(form.investmentMax),
          active: form.active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear la franquicia");
      }

      const franchise = await res.json();
      router.push(`/admin/franquicias/${franchise.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/franquicias"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Franquicias
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Nueva franquicia</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Datos básicos</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Completa la información inicial. Podrás editar todos los detalles después.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ej: Crem Helado"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Slug (URL)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField("slug", e.target.value);
                }}
                placeholder="crem-helado"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400">
                Solo letras, números y guiones. Se auto-genera del nombre.
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Breve descripción de la franquicia..."
                rows={3}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                value={form.sectorId}
                onChange={(e) => setField("sectorId", e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— Seleccionar sector —</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Estado inicial
              </label>
              <label className="flex cursor-pointer items-center gap-3 pt-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.active}
                    onChange={(e) => setField("active", e.target.checked)}
                  />
                  <div
                    className={`h-6 w-11 rounded-full transition-colors ${
                      form.active ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-700">Activa</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Inversión mínima (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.investmentMin}
                onChange={(e) => setField("investmentMin", e.target.value)}
                placeholder="50000"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Inversión máxima (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.investmentMax}
                onChange={(e) => setField("investmentMax", e.target.value)}
                placeholder="100000"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Creando..." : "Crear franquicia"}
            </button>
            <Link
              href="/admin/franquicias"
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
