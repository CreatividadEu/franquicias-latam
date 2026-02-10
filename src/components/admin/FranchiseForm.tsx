"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Sector {
  id: string;
  name: string;
  emoji: string;
}

interface Country {
  id: string;
  name: string;
  flag: string;
  code: string;
}

export interface FranchiseFormData {
  id?: string;
  name: string;
  description: string;
  logo: string;
  video: string;
  investmentMin: string;
  investmentMax: string;
  sectorId: string;
  contactEmail: string;
  featured: boolean;
  active: boolean;
  countryIds: string[];
}

interface FranchiseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FranchiseFormData) => Promise<void>;
  initialData?: FranchiseFormData | null;
  sectors: Sector[];
  countries: Country[];
}

const emptyForm: FranchiseFormData = {
  name: "",
  description: "",
  logo: "",
  video: "",
  investmentMin: "",
  investmentMax: "",
  sectorId: "",
  contactEmail: "",
  featured: false,
  active: true,
  countryIds: [],
};

export function FranchiseForm({
  open,
  onClose,
  onSubmit,
  initialData,
  sectors,
  countries,
}: FranchiseFormProps) {
  const [form, setForm] = useState<FranchiseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.description || !form.sectorId) {
      setError("Por favor completa nombre, descripcion y sector");
      return;
    }

    if (!form.investmentMin || !form.investmentMax) {
      setError("Por favor indica el rango de inversion");
      return;
    }

    if (parseFloat(form.investmentMin) >= parseFloat(form.investmentMax)) {
      setError("La inversion minima debe ser menor que la maxima");
      return;
    }

    if (form.countryIds.length === 0) {
      setError("Selecciona al menos un pais de cobertura");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCountry = (countryId: string) => {
    setForm((prev) => ({
      ...prev,
      countryIds: prev.countryIds.includes(countryId)
        ? prev.countryIds.filter((id) => id !== countryId)
        : [...prev.countryIds, countryId],
    }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingLogo(true);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo subir la imagen");
      }

      setForm((prev) => ({ ...prev, logo: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Editar Franquicia" : "Nueva Franquicia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Subway Colombia"
              className="rounded-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Descripcion *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe la franquicia..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Sector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Sector *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => setForm({ ...form, sectorId: sector.id })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    form.sectorId === sector.id
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{sector.emoji}</span>
                  <span>{sector.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Inversion Min (USD) *
              </label>
              <Input
                type="number"
                value={form.investmentMin}
                onChange={(e) =>
                  setForm({ ...form, investmentMin: e.target.value })
                }
                placeholder="50000"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Inversion Max (USD) *
              </label>
              <Input
                type="number"
                value={form.investmentMax}
                onChange={(e) =>
                  setForm({ ...form, investmentMax: e.target.value })
                }
                placeholder="100000"
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Country Coverage */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Paises de Cobertura *
            </label>
            <div className="flex flex-wrap gap-2">
              {countries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => toggleCountry(country.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                    form.countryIds.includes(country.id)
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Imagen de la Franquicia
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700 file:font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Recomendado: 1600x1000 px (proporción 16:10). Máximo 5MB.
            </p>
            {uploadingLogo && (
              <p className="text-xs text-blue-600">Subiendo imagen...</p>
            )}
            {form.logo && (
              <div className="relative h-28 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.logo}
                  alt="Preview de franquicia"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                URL de Imagen (opcional)
              </label>
              <Input
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                placeholder="https://..."
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Video URL
              </label>
              <Input
                value={form.video}
                onChange={(e) => setForm({ ...form, video: e.target.value })}
                placeholder="https://youtube.com/..."
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Email de Contacto
            </label>
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) =>
                setForm({ ...form, contactEmail: e.target.value })
              }
              placeholder="contacto@franquicia.com"
              className="rounded-lg"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Activa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Destacada</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Crear Franquicia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
