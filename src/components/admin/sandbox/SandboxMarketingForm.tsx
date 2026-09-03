"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { POSTING_CADENCES, marketingInputsSchema, type MarketingInputs } from "@/lib/sandbox/schemas";
import { inputClass, labelClass, primaryBtn } from "./sandbox-ui";

const CADENCE_LABEL: Record<(typeof POSTING_CADENCES)[number], string> = {
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  esporadica: "Esporádica",
  ninguna: "No publica",
};

type Props = { sessionId: string; initial: unknown; hasAuditDoc: boolean };

/** §3c: quick-form de 60 segundos cuando no hay auditoría de marketing. */
export function SandboxMarketingForm({ sessionId, initial, hasAuditDoc }: Props) {
  const router = useRouter();
  const parsed = marketingInputsSchema.safeParse(initial ?? {});
  const base: MarketingInputs = parsed.success
    ? parsed.data
    : { instagramHandle: "", followers: 0, postingCadence: "esporadica", hasWebsite: false, googleRating: null, adSpendGuess: 0 };
  const [form, setForm] = useState<MarketingInputs>(base);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof MarketingInputs>(key: K, value: MarketingInputs[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sandbox/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingInputs: form }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo guardar");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      {hasAuditDoc && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Hay una auditoría de marketing cargada: sus puntajes mandan. Este formulario solo complementa los datos que falten.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Instagram</label>
          <input value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value.replace(/^@/, ""))} className={inputClass} placeholder="@marca" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Seguidores</label>
          <input type="number" min={0} value={form.followers} onChange={(e) => set("followers", Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cadencia de publicación</label>
          <select value={form.postingCadence} onChange={(e) => set("postingCadence", e.target.value as MarketingInputs["postingCadence"])} className={inputClass}>
            {POSTING_CADENCES.map((c) => (
              <option key={c} value={c}>
                {CADENCE_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Calificación en Google Business</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.googleRating ?? ""}
            onChange={(e) => set("googleRating", e.target.value === "" ? null : Math.min(5, Math.max(0, Number(e.target.value))))}
            className={inputClass}
            placeholder="Sin ficha"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Pauta mensual estimada (USD)</label>
          <input type="number" min={0} value={form.adSpendGuess} onChange={(e) => set("adSpendGuess", Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm text-gray-700">
          <input type="checkbox" checked={form.hasWebsite} onChange={(e) => set("hasWebsite", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
          Tiene sitio web
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Guardando…" : "Guardar quick-form"}
        </button>
        {saved && <span className="text-sm text-green-600">Guardado · pulsa «Procesar» para recalcular los puntajes</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
