"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  franchiseId: string;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
};

type Step = "upload" | "processing" | "done";

type ApplySummary = {
  fields: number;
  models: number;
  faqs: number;
};

function FilePicker({
  label,
  file,
  onFile,
  disabled,
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.toLowerCase().endsWith(".pdf") && f.type !== "application/pdf") {
      alert("Solo se aceptan PDFs.");
      return;
    }
    onFile(f);
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
        dragging ? "border-violet-400 bg-violet-50" : "border-gray-300 bg-gray-50 hover:border-gray-400",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {file ? (
        <>
          <p className="mt-2 max-w-full truncate text-xs text-violet-700">{file.name}</p>
          <p className="text-[10px] text-gray-400">
            {(file.size / (1024 * 1024)).toFixed(1)} MB · clic para reemplazar
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-gray-500">Arrastra un PDF o haz clic para seleccionar</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}

export function AutofillFromDossiers({ franchiseId, open, onClose, onApplied }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [strategic, setStrategic] = useState<File | null>(null);
  const [financial, setFinancial] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [summary, setSummary] = useState<ApplySummary | null>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setStrategic(null);
    setFinancial(null);
    setError(null);
    setProgress("");
    setSummary(null);
  }, []);

  const handleClose = useCallback(() => {
    if (step === "processing") return;
    reset();
    onClose();
  }, [step, reset, onClose]);

  async function uploadToSupabase(file: File, label: string): Promise<string> {
    setProgress(`Subiendo ${label}...`);
    const prepRes = await fetch(
      `/api/admin/landing/franchises/${franchiseId}/brochure-upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/pdf",
          fileSize: file.size,
        }),
      }
    );
    const prepJson = await prepRes.json().catch(() => ({}));
    if (!prepRes.ok) {
      throw new Error(prepJson.error ?? `No se pudo preparar el upload de ${label}`);
    }
    const { signedUrl, storagePath } = prepJson as {
      signedUrl: string;
      storagePath: string;
    };

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/pdf" },
      body: file,
    });
    if (!uploadRes.ok) {
      throw new Error(`Falló el upload de ${label} a Supabase (${uploadRes.status})`);
    }
    return storagePath;
  }

  async function runAutofill() {
    if (!strategic || !financial) return;
    setError(null);
    setStep("processing");

    try {
      const [strategicPath, financialPath] = await Promise.all([
        uploadToSupabase(strategic, "Definición Estratégica"),
        uploadToSupabase(financial, "Viabilidad Financiera"),
      ]);

      setProgress("Claude está leyendo los dossiers y guardando los datos...");
      const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/autofill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicPath, financialPath }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Error al procesar los dossiers");
      }

      setSummary(json.applied as ApplySummary);
      setStep("done");
      setProgress("");
      onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setStep("upload");
      setProgress("");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Auto-rellenar desde dossiers</h2>
            <p className="text-xs text-gray-500">Sube los 2 PDFs. La IA extrae y guarda todo en un solo paso.</p>
          </div>
          <button
            onClick={handleClose}
            disabled={step === "processing"}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-4">
              <FilePicker label="📄 Definición estratégica" file={strategic} onFile={setStrategic} />
              <FilePicker label="📊 Viabilidad financiera" file={financial} onFile={setFinancial} />
              <p className="text-xs text-gray-400">
                PDFs hasta 25MB cada uno. El proceso tarda ~30-60 segundos. Podrás editar cualquier campo después en el editor.
              </p>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <svg className="h-8 w-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-600">{progress || "Procesando..."}</p>
              <p className="text-xs text-gray-400">No cierres esta ventana.</p>
            </div>
          )}

          {step === "done" && summary && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
                ✓
              </div>
              <p className="text-sm font-medium text-gray-800">Landing rellenada</p>
              <div className="text-xs text-gray-600">
                <p>{summary.fields} campo{summary.fields === 1 ? "" : "s"} general{summary.fields === 1 ? "" : "es"} actualizado{summary.fields === 1 ? "" : "s"}</p>
                <p>{summary.models} modelo{summary.models === 1 ? "" : "s"} de negocio creado{summary.models === 1 ? "" : "s"}</p>
                <p>{summary.faqs} FAQ{summary.faqs === 1 ? "" : "s"} creada{summary.faqs === 1 ? "" : "s"}</p>
              </div>
              <p className="mt-2 text-xs text-gray-400">Al cerrar se recargará el editor con los datos.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
          {step === "upload" && (
            <>
              <button onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Cancelar
              </button>
              <button
                onClick={runAutofill}
                disabled={!strategic || !financial}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rellenar landing
              </button>
            </>
          )}
          {step === "done" && (
            <button
              onClick={handleClose}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Cerrar y recargar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
