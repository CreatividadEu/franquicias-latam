"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  HERO_LABELS,
  FINANCIAL_LABELS,
  BUSINESS_MODEL_LABELS,
  type ExtractionResult,
} from "@/lib/landing-extraction-schema";

type Props = {
  franchiseId: string;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
};

type Step = "upload" | "extracting" | "review" | "applying" | "done";

type FieldValue = string | number;

type FieldRow = {
  group: "hero" | "financials";
  key: string;
  label: string;
  value: FieldValue;
  selected: boolean;
};

type ModelRow = {
  index: number;
  data: Record<string, FieldValue>;
  selected: boolean;
};

type FaqRow = {
  index: number;
  question: string;
  answer: string;
  selected: boolean;
};

const HERO_FIELD_KEYS = [
  "name",
  "headline",
  "subheadline",
  "shortDescription",
  "longDescription",
  "credibilityLine",
  "foundingYear",
] as const;

const FINANCIAL_FIELD_KEYS = [
  "investmentMin",
  "investmentMax",
  "canonEntrada",
  "ebitdaReference",
  "paybackMonths",
  "royaltyInfo",
  "operatorProfile",
] as const;

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

function formatValue(v: FieldValue): string {
  if (typeof v === "number") return v.toLocaleString();
  return v;
}

export function AutofillFromDossiers({ franchiseId, open, onClose, onApplied }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [strategic, setStrategic] = useState<File | null>(null);
  const [financial, setFinancial] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractionResult | null>(null);
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([]);
  const [modelRows, setModelRows] = useState<ModelRow[]>([]);
  const [faqRows, setFaqRows] = useState<FaqRow[]>([]);
  const [progress, setProgress] = useState<string>("");

  const reset = useCallback(() => {
    setStep("upload");
    setStrategic(null);
    setFinancial(null);
    setError(null);
    setExtracted(null);
    setFieldRows([]);
    setModelRows([]);
    setFaqRows([]);
    setProgress("");
  }, []);

  const handleClose = useCallback(() => {
    if (step === "extracting" || step === "applying") return;
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

  async function runExtraction() {
    if (!strategic || !financial) return;
    setError(null);
    setStep("extracting");

    try {
      const [strategicPath, financialPath] = await Promise.all([
        uploadToSupabase(strategic, "Definición Estratégica"),
        uploadToSupabase(financial, "Viabilidad Financiera"),
      ]);

      setProgress("Analizando PDFs con IA...");
      const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/autofill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicPath, financialPath }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Error al extraer datos");
      }
      const data = (json.extracted ?? {}) as ExtractionResult;
      setExtracted(data);

      const rows: FieldRow[] = [];
      for (const k of HERO_FIELD_KEYS) {
        const v = data.hero?.[k];
        if (v !== undefined && v !== null && v !== "") {
          rows.push({ group: "hero", key: k, label: HERO_LABELS[k], value: v as FieldValue, selected: true });
        }
      }
      for (const k of FINANCIAL_FIELD_KEYS) {
        const v = data.financials?.[k];
        if (v !== undefined && v !== null && v !== "") {
          rows.push({ group: "financials", key: k, label: FINANCIAL_LABELS[k], value: v as FieldValue, selected: true });
        }
      }
      setFieldRows(rows);

      setModelRows(
        (data.businessModels ?? []).map((m, i) => ({
          index: i,
          data: m as Record<string, FieldValue>,
          selected: true,
        }))
      );

      setFaqRows(
        (data.faqs ?? []).map((f, i) => ({
          index: i,
          question: f.question ?? "",
          answer: f.answer ?? "",
          selected: true,
        }))
      );

      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setStep("upload");
    }
  }

  async function applySelections() {
    if (!extracted) return;
    setStep("applying");
    setError(null);

    try {
      // Build PUT payload from selected hero+financial fields
      const putBody: Record<string, FieldValue> = {};
      for (const row of fieldRows) {
        if (row.selected) putBody[row.key] = row.value;
      }

      if (Object.keys(putBody).length > 0) {
        setProgress("Guardando campos generales...");
        const res = await fetch(`/api/admin/landing/franchises/${franchiseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(putBody),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "Error guardando campos");
        }
      }

      // Create selected business models
      const selectedModels = modelRows.filter((m) => m.selected);
      for (let i = 0; i < selectedModels.length; i++) {
        const m = selectedModels[i];
        setProgress(`Creando modelo ${i + 1}/${selectedModels.length}...`);
        const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/models`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...m.data, order: i }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `Error creando modelo ${i + 1}`);
        }
      }

      // Create selected FAQs
      const selectedFaqs = faqRows.filter((f) => f.selected);
      for (let i = 0; i < selectedFaqs.length; i++) {
        const f = selectedFaqs[i];
        setProgress(`Creando FAQ ${i + 1}/${selectedFaqs.length}...`);
        const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: f.question, answer: f.answer, order: i }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `Error creando FAQ ${i + 1}`);
        }
      }

      setStep("done");
      setProgress("");
      onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error aplicando cambios");
      setStep("review");
      setProgress("");
    }
  }

  if (!open) return null;

  const totalSelected =
    fieldRows.filter((r) => r.selected).length +
    modelRows.filter((m) => m.selected).length +
    faqRows.filter((f) => f.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Auto-rellenar desde dossiers</h2>
            <p className="text-xs text-gray-500">Sube los 2 PDFs y la IA extrae los datos para la landing.</p>
          </div>
          <button
            onClick={handleClose}
            disabled={step === "extracting" || step === "applying"}
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
                PDFs hasta 25MB cada uno. La extracción tarda ~30-60 segundos. Modelo: Sonnet 4.6.
              </p>
            </div>
          )}

          {step === "extracting" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <svg className="h-8 w-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-600">{progress || "Claude está leyendo los dossiers..."}</p>
              <p className="text-xs text-gray-400">Esto puede tardar 30-60 segundos.</p>
            </div>
          )}

          {step === "applying" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <svg className="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-600">{progress || "Aplicando cambios..."}</p>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                ✓
              </div>
              <p className="text-sm font-medium text-gray-800">Cambios aplicados</p>
              <p className="text-xs text-gray-500">Los datos se guardaron en la franquicia.</p>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              {fieldRows.length > 0 && (
                <section>
                  <SectionHeader
                    title="Campos generales"
                    count={fieldRows.filter((r) => r.selected).length}
                    total={fieldRows.length}
                    onToggleAll={(v) => setFieldRows((rows) => rows.map((r) => ({ ...r, selected: v })))}
                  />
                  <div className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {fieldRows.map((row, idx) => (
                      <label key={`${row.group}-${row.key}`} className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) =>
                            setFieldRows((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, selected: e.target.checked } : r))
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500">{row.label}</p>
                          <p className="break-words text-sm text-gray-900">{formatValue(row.value)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {modelRows.length > 0 && (
                <section>
                  <SectionHeader
                    title="Modelos de negocio (nuevos)"
                    count={modelRows.filter((m) => m.selected).length}
                    total={modelRows.length}
                    onToggleAll={(v) => setModelRows((rows) => rows.map((r) => ({ ...r, selected: v })))}
                  />
                  <div className="mt-2 space-y-2">
                    {modelRows.map((m, idx) => (
                      <label key={m.index} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={m.selected}
                          onChange={(e) =>
                            setModelRows((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, selected: e.target.checked } : r))
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-medium text-gray-900">{m.data.name ?? "(sin nombre)"}</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                            {Object.entries(m.data)
                              .filter(([k]) => k !== "name")
                              .map(([k, v]) => (
                                <p key={k}>
                                  <span className="text-gray-400">{BUSINESS_MODEL_LABELS[k as keyof typeof BUSINESS_MODEL_LABELS] ?? k}:</span>{" "}
                                  {formatValue(v)}
                                </p>
                              ))}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {faqRows.length > 0 && (
                <section>
                  <SectionHeader
                    title="FAQs (nuevas)"
                    count={faqRows.filter((f) => f.selected).length}
                    total={faqRows.length}
                    onToggleAll={(v) => setFaqRows((rows) => rows.map((r) => ({ ...r, selected: v })))}
                  />
                  <div className="mt-2 space-y-2">
                    {faqRows.map((f, idx) => (
                      <label key={f.index} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={f.selected}
                          onChange={(e) =>
                            setFaqRows((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, selected: e.target.checked } : r))
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{f.question}</p>
                          <p className="mt-1 text-xs text-gray-600">{f.answer}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {fieldRows.length === 0 && modelRows.length === 0 && faqRows.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-500">
                  La IA no extrajo datos suficientes de los PDFs. Revisa el contenido o intenta con otros documentos.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-xs text-gray-400">
            {step === "review" && totalSelected > 0 && `${totalSelected} elemento${totalSelected === 1 ? "" : "s"} seleccionado${totalSelected === 1 ? "" : "s"}`}
          </p>
          <div className="flex gap-2">
            {step === "upload" && (
              <>
                <button onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Cancelar
                </button>
                <button
                  onClick={runExtraction}
                  disabled={!strategic || !financial}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Extraer datos
                </button>
              </>
            )}
            {step === "review" && (
              <>
                <button onClick={reset} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Empezar de nuevo
                </button>
                <button
                  onClick={applySelections}
                  disabled={totalSelected === 0}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Aplicar {totalSelected > 0 ? `(${totalSelected})` : ""}
                </button>
              </>
            )}
            {step === "done" && (
              <button
                onClick={handleClose}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  total,
  onToggleAll,
}: {
  title: string;
  count: number;
  total: number;
  onToggleAll: (v: boolean) => void;
}) {
  const allSelected = count === total;
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-800">
        {title} <span className="text-gray-400">({count}/{total})</span>
      </h3>
      <button
        type="button"
        onClick={() => onToggleAll(!allSelected)}
        className="text-xs text-violet-600 hover:underline"
      >
        {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
      </button>
    </div>
  );
}
