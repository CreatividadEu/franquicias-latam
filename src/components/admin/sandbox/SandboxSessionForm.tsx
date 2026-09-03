"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { COUNTRIES } from "@/lib/constants/countries";
import type { AdminSessionDTO } from "@/lib/sandbox/admin";
import { SECTOR_UI, inputClass, labelClass, primaryBtn, secondaryBtn, toDateTimeLocal } from "./sandbox-ui";

export type BrandOption = { id: string; name: string; logoUrl: string | null; sectorName: string };

type FormState = {
  franchiseId: string;
  brandName: string;
  sector: AdminSessionDTO["sector"];
  country: string;
  city: string;
  logoUrl: string;
  accentColor: string;
  consultantName: string;
  scheduledAt: string;
  locale: "es" | "en";
  pin: string;
};

const COUNTRY_ES: Record<string, string> = {
  Mexico: "México",
  Peru: "Perú",
  Brazil: "Brasil",
  Spain: "España",
  "United States": "Estados Unidos",
  "Dominican Republic": "República Dominicana",
  Panama: "Panamá",
};

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ code: c.code, label: COUNTRY_ES[c.name] ?? c.name, flag: c.flag })).sort((a, b) =>
  a.label.localeCompare(b.label, "es"),
);

function guessSector(sectorName: string): AdminSessionDTO["sector"] {
  const s = sectorName.toLowerCase();
  if (/comida|restaur|aliment|caf|bebida|food/.test(s)) return "restaurante";
  if (/retail|moda|tienda|comercio/.test(s)) return "retail";
  if (/servic|salud|belleza|educa|tecnolog/.test(s)) return "servicios";
  return "otro";
}

type Props = {
  mode: "create" | "edit";
  sessionId?: string;
  initial?: Partial<AdminSessionDTO>;
  franchises: BrandOption[];
};

/** §7 paso 1: nueva sesión desde una marca del marketplace o a mano. */
export function SandboxSessionForm({ mode, sessionId, initial, franchises }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    franchiseId: initial?.franchiseId ?? "",
    brandName: initial?.brandName ?? "",
    sector: initial?.sector ?? "restaurante",
    country: initial?.country ?? "Colombia",
    city: initial?.city ?? "",
    logoUrl: initial?.logoUrl ?? "",
    accentColor: initial?.accentColor ?? "#00F0FF",
    consultantName: initial?.consultantName ?? "",
    scheduledAt: toDateTimeLocal(initial?.scheduledAt),
    locale: initial?.locale ?? "es",
    pin: initial?.pin ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const logoPath = useMemo(() => `sandbox/logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  function pickFranchise(id: string) {
    const brand = franchises.find((f) => f.id === id);
    setSaved(false);
    setForm((f) => ({
      ...f,
      franchiseId: id,
      brandName: brand ? brand.name : f.brandName,
      logoUrl: brand?.logoUrl ?? f.logoUrl,
      sector: brand ? guessSector(brand.sectorName) : f.sector,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setIssues([]);
    const payload = {
      franchiseId: form.franchiseId || null,
      brandName: form.brandName,
      sector: form.sector,
      country: form.country,
      city: form.city || null,
      logoUrl: form.logoUrl || null,
      accentColor: form.accentColor,
      consultantName: form.consultantName || null,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      locale: form.locale,
      pin: form.pin || null,
    };
    try {
      const res = await fetch(mode === "create" ? "/api/admin/sandbox" : `/api/admin/sandbox/${sessionId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo guardar");
        setIssues(Array.isArray(json.issues) ? json.issues : []);
        return;
      }
      if (mode === "create") {
        router.push(`/admin/sandbox/${json.id}`);
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {franchises.length > 0 && (
        <div className="space-y-1.5">
          <label className={labelClass}>Marca del marketplace (autocompleta)</label>
          <select value={form.franchiseId} onChange={(e) => pickFranchise(e.target.value)} className={inputClass}>
            <option value="">— Sin marca vinculada · escribir a mano —</option>
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} · {f.sectorName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Nombre de la marca *</label>
          <input required value={form.brandName} onChange={(e) => set("brandName", e.target.value)} className={inputClass} placeholder="Asadero Tres Carbones" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Sector *</label>
          <select value={form.sector} onChange={(e) => set("sector", e.target.value as FormState["sector"])} className={inputClass}>
            {(Object.keys(SECTOR_UI) as FormState["sector"][]).map((s) => (
              <option key={s} value={s}>
                {SECTOR_UI[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>País *</label>
          <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass}>
            {!COUNTRY_OPTIONS.some((c) => c.label === form.country) && <option value={form.country}>{form.country}</option>}
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.label}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ciudad</label>
          <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} placeholder="Bucaramanga" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Consultor</label>
          <input value={form.consultantName} onChange={(e) => set("consultantName", e.target.value)} className={inputClass} placeholder="Quién presenta" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Fecha de la sesión</label>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Idioma inicial</label>
          <select value={form.locale} onChange={(e) => set("locale", e.target.value as "es" | "en")} className={inputClass}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Color de acento</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(form.accentColor) ? form.accentColor : "#00F0FF"}
              onChange={(e) => set("accentColor", e.target.value.toUpperCase())}
              className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
              aria-label="Selector de color"
            />
            <input value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className={inputClass} placeholder="#FF6A2B" />
          </div>
          <p className="text-xs text-gray-400">Si no contrasta sobre el navy, el sandbox lo aclara solo.</p>
        </div>
        {mode === "create" && (
          <div className="space-y-1.5">
            <label className={labelClass}>PIN (opcional, 4 dígitos)</label>
            <input value={form.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 4))} className={inputClass} placeholder="Sin PIN" inputMode="numeric" />
          </div>
        )}
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass}>Logo (claro, para fondo oscuro)</label>
          <ImageUpload value={form.logoUrl} onChange={(url) => set("logoUrl", url)} storagePath={logoPath} previewHeight="h-12" hint="PNG o SVG con fondo transparente. Se muestra junto al logo de Franquicias LATAM." />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          {issues.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Guardando…" : mode === "create" ? "Crear sesión" : "Guardar marca"}
        </button>
        {mode === "create" && (
          <button type="button" onClick={() => router.push("/admin/sandbox")} className={secondaryBtn}>
            Cancelar
          </button>
        )}
        {saved && <span className="text-sm text-green-600">Guardado</span>}
      </div>
    </form>
  );
}
