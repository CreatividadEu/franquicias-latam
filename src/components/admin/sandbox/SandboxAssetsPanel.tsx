"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminAssetDTO, AdminSessionDTO } from "@/lib/sandbox/admin";
import { ACCEPTED_EXTENSIONS } from "@/lib/sandbox/extract";
import type { SandboxAssetKindId } from "@/lib/sandbox/schemas";
import { EXTRACTION_UI, KIND_UI, dangerBtn, formatBytes, formatDateTime, inputClass, primaryBtn, secondaryBtn } from "./sandbox-ui";

type PrepareResponse = {
  uploads: { assetId: string; name: string; signedUrl: string; token: string; path: string }[];
  rejected: { name: string; reason: string }[];
  error?: string;
};

type Props = {
  sessionId: string;
  initialAssets: AdminAssetDTO[];
  aiConfigured: boolean;
  storageConfigured: boolean;
  preloadGeneratedAt: string | null;
};

const KIND_ORDER: SandboxAssetKindId[] = ["menu", "catalog", "price_list", "sales_notes", "opex_notes", "osint", "marketing_audit", "other"];

/**
 * §7 pasos 2 y 4: subir documentos por tipo y «Procesar». La extracción corre
 * asset por asset (una request cada una, idempotente) y al final se construye
 * el preload; el estado de cada archivo se ve en vivo.
 */
export function SandboxAssetsPanel({ sessionId, initialAssets, aiConfigured, storageConfigured, preloadGeneratedAt }: Props) {
  const router = useRouter();
  const [assets, setAssets] = useState<AdminAssetDTO[]>(initialAssets);
  const [kind, setKind] = useState<SandboxAssetKindId>("menu");
  const [uploading, setUploading] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const appendLog = (line: string) => setLog((l) => [...l.slice(-40), line]);

  const refreshAssets = useCallback(async () => {
    const res = await fetch(`/api/admin/sandbox/${sessionId}`, { cache: "no-store" });
    if (res.ok) {
      const dto = (await res.json()) as AdminSessionDTO;
      setAssets(dto.assets);
    }
  }, [sessionId]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);
    setUploading(list.map((f) => f.name));
    try {
      const prep = await fetch(`/api/admin/sandbox/${sessionId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, files: list.map((f) => ({ name: f.name, mime: f.type, size: f.size })) }),
      });
      const json = (await prep.json()) as PrepareResponse;
      if (!prep.ok) {
        setError(json.error ?? "No se pudo preparar la subida");
        return;
      }
      for (const r of json.rejected ?? []) appendLog(`✗ ${r.name}: ${r.reason}`);

      for (const upload of json.uploads) {
        const file = list.find((f) => f.name === upload.name);
        if (!file) continue;
        const put = await fetch(upload.signedUrl, {
          method: "PUT",
          headers: { "content-type": file.type || "application/octet-stream", "x-upsert": "true" },
          body: file,
        });
        if (!put.ok) {
          appendLog(`✗ ${upload.name}: error ${put.status} subiendo al storage`);
          await fetch(`/api/admin/sandbox/${sessionId}/assets/${upload.assetId}`, { method: "DELETE" });
        } else {
          appendLog(`↑ ${upload.name} subido`);
        }
      }
      await refreshAssets();
    } catch {
      setError("Error de red subiendo archivos");
    } finally {
      setUploading([]);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function extractOne(asset: AdminAssetDTO, force: boolean): Promise<boolean> {
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, extractionStatus: "running", extractionError: null } : a)));
    appendLog(`⋯ ${asset.originalName}: extrayendo (${KIND_UI[asset.kind].label})`);
    try {
      const res = await fetch(`/api/admin/sandbox/${sessionId}/assets/${asset.id}/extract${force ? "?force=1" : ""}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        appendLog(`✗ ${asset.originalName}: ${json.error ?? "error"}`);
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, extractionStatus: "error", extractionError: json.error ?? "error" } : a)));
        return false;
      }
      const updated = json.asset as AdminAssetDTO;
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? updated : a)));
      appendLog(`✓ ${asset.originalName}: ${updated.extractedSummary ?? "listo"}${json.cached ? " (cache)" : ""}`);
      return true;
    } catch {
      appendLog(`✗ ${asset.originalName}: error de red`);
      return false;
    }
  }

  async function buildPreload(): Promise<boolean> {
    appendLog("⋯ Construyendo preload (oferta, dolores, marketing, OPEX)…");
    try {
      const res = await fetch(`/api/admin/sandbox/${sessionId}/preload`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        appendLog(`✗ Preload: ${json.error ?? "error"}`);
        return false;
      }
      const s = json.summary as { items: number; heroes: string[]; pains: number; strengths: number; ideas: number; sources: Record<string, string>; ideasFrom: string };
      appendLog(
        `✓ Preload listo: ${s.items} ítems (héroes: ${s.heroes.join(", ") || "—"}) · ${s.pains} dolores · ${s.strengths} fortalezas · ${s.ideas} ideas (${s.ideasFrom}) · fuentes ${Object.entries(s.sources)
          .map(([k, v]) => `${k}:${v}`)
          .join(" ")}`,
      );
      return true;
    } catch {
      appendLog("✗ Preload: error de red");
      return false;
    }
  }

  async function processAll(reprocess: boolean) {
    setProcessing(true);
    setError(null);
    setLog([]);
    try {
      const targets = assets.filter((a) => reprocess || a.extractionStatus !== "done");
      for (const asset of targets) {
        await extractOne(asset, reprocess);
      }
      await buildPreload();
      router.refresh();
    } finally {
      setProcessing(false);
    }
  }

  async function removeAsset(asset: AdminAssetDTO) {
    if (!window.confirm(`¿Eliminar ${asset.originalName}?`)) return;
    const res = await fetch(`/api/admin/sandbox/${sessionId}/assets/${asset.id}`, { method: "DELETE" });
    if (res.ok) setAssets((prev) => prev.filter((a) => a.id !== asset.id));
  }

  const pending = assets.filter((a) => a.extractionStatus !== "done").length;

  return (
    <div className="space-y-5">
      {!storageConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase Storage no está configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY): no se pueden subir documentos. «Procesar» igual construye el preload con fallbacks.
        </div>
      )}
      {!aiConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ANTHROPIC_API_KEY no está configurada: la extracción con Claude no correrá; el preload usará fallbacks del sector.
        </div>
      )}

      {/* Subida */}
      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Tipo de documento</label>
          <select value={kind} onChange={(e) => setKind(e.target.value as SandboxAssetKindId)} className={inputClass}>
            {KIND_ORDER.map((k) => (
              <option key={k} value={k}>
                {KIND_UI[k].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">{KIND_UI[kind].hint}</p>
        </div>
        <div
          onClick={() => !uploading.length && storageConfigured && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (storageConfigured) void uploadFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 text-center transition-colors ${
            dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          } ${uploading.length || !storageConfigured ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {uploading.length ? (
            <p className="text-sm text-gray-500">Subiendo {uploading.length} archivo{uploading.length !== 1 ? "s" : ""}…</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">Arrastra varios archivos o haz clic para subirlos como «{KIND_UI[kind].label}»</p>
              <p className="mt-1 text-xs text-gray-400">PDF, fotos (PNG/JPG/WebP), DOCX, XLSX, CSV, TXT · PDF hasta 25 MB, imágenes hasta 5 MB</p>
            </>
          )}
          <input ref={inputRef} type="file" multiple accept={ACCEPTED_EXTENSIONS.join(",")} className="sr-only" onChange={(e) => e.target.files && void uploadFiles(e.target.files)} />
        </div>
      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-2">Archivo</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Extracción</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {assets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                  Sin documentos. Puedes procesar igual: el preload usará ítems, dolores y OPEX de referencia del sector.
                </td>
              </tr>
            )}
            {assets.map((a) => {
              const ex = EXTRACTION_UI[a.extractionStatus];
              return (
                <tr key={a.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.originalName}</p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(a.sizeBytes)} · {formatDateTime(a.uploadedAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {KIND_UI[a.kind].label}
                    <p className="text-xs text-gray-400">→ {KIND_UI[a.kind].phase}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ex.classes}`}>{ex.label}</span>
                    {a.extractedSummary && a.extractionStatus === "done" && <p className="mt-1 text-xs text-gray-500">{a.extractedSummary}</p>}
                    {a.extractionError && a.extractionStatus === "error" && <p className="mt-1 max-w-xs text-xs text-red-600">{a.extractionError}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <a href={`/api/admin/sandbox/${sessionId}/assets/${a.id}`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-gray-800">
                        Ver ↗
                      </a>
                      <button type="button" disabled={processing || !aiConfigured} onClick={() => void extractOne(a, true)} className="text-xs text-blue-600 hover:underline disabled:opacity-50">
                        Reprocesar
                      </button>
                      <button type="button" disabled={processing} onClick={() => void removeAsset(a)} className={dangerBtn}>
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

      {/* Procesar */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={processing || uploading.length > 0} onClick={() => void processAll(false)} className={primaryBtn}>
          {processing ? "Procesando…" : pending > 0 ? `Procesar (${pending} pendiente${pending !== 1 ? "s" : ""})` : "Procesar"}
        </button>
        <button type="button" disabled={processing || uploading.length > 0 || assets.length === 0} onClick={() => void processAll(true)} className={secondaryBtn}>
          Reprocesar todo
        </button>
        <span className="text-xs text-gray-400">
          {preloadGeneratedAt ? `Preload generado ${formatDateTime(preloadGeneratedAt)}` : "Aún no hay preload"}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {log.length > 0 && (
        <pre className="max-h-56 overflow-y-auto rounded-lg bg-gray-900 px-4 py-3 font-mono text-xs leading-relaxed text-gray-100">{log.join("\n")}</pre>
      )}
    </div>
  );
}
