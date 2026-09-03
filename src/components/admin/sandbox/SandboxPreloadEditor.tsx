"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPreloadDTO } from "@/lib/sandbox/admin";
import { sandboxPreloadSchema } from "@/lib/sandbox/schemas";
import { formatDateTime, primaryBtn, secondaryBtn } from "./sandbox-ui";

type SectionKey = "offering" | "pains" | "marketing" | "opexSkeleton";

const SECTIONS: { key: SectionKey; label: string; hint: string }[] = [
  { key: "offering", label: "Oferta", hint: "Ítems, costos estimados y héroes (Finanzas)" },
  { key: "pains", label: "Dolores", hint: "Dolores con evidencia y fortalezas (Estrategia, Operaciones)" },
  { key: "marketing", label: "Marketing", hint: "Cinco ejes, quick wins e ideas de campaña" },
  { key: "opexSkeleton", label: "OPEX", hint: "Líneas de gasto con fuente y confianza" },
];

function pretty(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function summarize(key: SectionKey, value: unknown): string {
  if (!value || typeof value !== "object") return "—";
  const v = value as Record<string, unknown>;
  const len = (k: string) => (Array.isArray(v[k]) ? (v[k] as unknown[]).length : 0);
  const src = typeof v.source === "string" ? ` · fuente: ${v.source}` : "";
  switch (key) {
    case "offering": {
      const items = Array.isArray(v.items) ? (v.items as { isHero?: boolean; name?: string }[]) : [];
      const heroes = items.filter((i) => i.isHero).map((i) => i.name).join(", ");
      return `${items.length} ítems · héroes: ${heroes || "—"}${src}`;
    }
    case "pains":
      return `${len("pains")} dolores · ${len("strengths")} fortalezas${src}`;
    case "marketing":
      return `${len("ideas")} ideas${src}`;
    case "opexSkeleton":
      return `${len("lines")} líneas · ventas/mes ${String(v.monthlySalesEstimate ?? "—")} ${String(v.currency ?? "")}${src}`;
  }
}

/** §7 paso 4: el consultor corrige a mano las extracciones obviamente erróneas. */
export function SandboxPreloadEditor({ sessionId, preload }: { sessionId: string; preload: AdminPreloadDTO | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<SectionKey>("offering");
  const [drafts, setDrafts] = useState<Record<SectionKey, string>>({
    offering: pretty(preload?.offering),
    pains: pretty(preload?.pains),
    marketing: pretty(preload?.marketing),
    opexSkeleton: pretty(preload?.opexSkeleton),
  });
  const [issues, setIssues] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const summaries = useMemo(() => {
    const out: Partial<Record<SectionKey, string>> = {};
    for (const s of SECTIONS) {
      try {
        out[s.key] = summarize(s.key, JSON.parse(drafts[s.key]));
      } catch {
        out[s.key] = "JSON inválido";
      }
    }
    return out;
  }, [drafts]);

  function validate(): Record<SectionKey, unknown> | null {
    const parsedSections: Partial<Record<SectionKey, unknown>> = {};
    const errors: string[] = [];
    for (const s of SECTIONS) {
      try {
        parsedSections[s.key] = JSON.parse(drafts[s.key]);
      } catch (e) {
        errors.push(`${s.label}: JSON inválido (${e instanceof Error ? e.message : "error"})`);
      }
    }
    if (errors.length) {
      setIssues(errors);
      return null;
    }
    const result = sandboxPreloadSchema.safeParse(parsedSections);
    if (!result.success) {
      setIssues(result.error.issues.slice(0, 10).map((i) => `${i.path.map(String).join(".") || "(raíz)"}: ${i.message}`));
      return null;
    }
    setIssues([]);
    return parsedSections as Record<SectionKey, unknown>;
  }

  async function save() {
    setMessage(null);
    const body = validate();
    if (!body) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/sandbox/${sessionId}/preload`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setIssues(Array.isArray(json.issues) ? json.issues : [json.error ?? "No se pudo guardar"]);
        return;
      }
      const saved = json.preload as Record<SectionKey, unknown>;
      setDrafts({
        offering: pretty(saved.offering),
        pains: pretty(saved.pains),
        marketing: pretty(saved.marketing),
        opexSkeleton: pretty(saved.opexSkeleton),
      });
      setMessage("Preload guardado");
      router.refresh();
    } catch {
      setIssues(["Error de red"]);
    } finally {
      setSaving(false);
    }
  }

  if (!preload) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        Todavía no hay preload. Sube documentos y pulsa «Procesar»; sin documentos también funciona con datos de referencia del sector.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setTab(s.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${tab === s.key ? "bg-gray-900 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Generado {formatDateTime(preload.generatedAt)} · editado {formatDateTime(preload.updatedAt)}
        </p>
      </div>

      <p className="text-xs text-gray-500">
        {SECTIONS.find((s) => s.key === tab)?.hint} — <span className="font-medium text-gray-700">{summaries[tab]}</span>
      </p>

      <textarea
        value={drafts[tab]}
        onChange={(e) => setDrafts((d) => ({ ...d, [tab]: e.target.value }))}
        spellCheck={false}
        className="h-80 w-full resize-y rounded-lg border border-gray-200 bg-gray-950 p-3 font-mono text-xs leading-relaxed text-gray-100 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {issues.length > 0 && (
        <ul className="list-disc rounded-lg border border-red-200 bg-red-50 px-6 py-3 text-xs text-red-700">
          {issues.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => validate() && setMessage("JSON válido")} className={secondaryBtn}>
          Validar
        </button>
        <button type="button" disabled={saving} onClick={() => void save()} className={primaryBtn}>
          {saving ? "Guardando…" : "Guardar preload"}
        </button>
        {message && <span className="text-sm text-green-600">{message}</span>}
      </div>
    </div>
  );
}
