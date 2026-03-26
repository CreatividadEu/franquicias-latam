"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { parseJsonResponse } from "@/lib/safeApiJson";

type PrepareBrochureUploadResponse = {
  publicUrl: string;
  signedUrl: string;
  storagePath: string;
};

type DocumentUploadProps = {
  franchiseId: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  hint?: string;
};

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

function looksLikePdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
}

function getDisplayNameFromUrl(rawUrl: string) {
  if (!rawUrl) return "";

  try {
    const url = new URL(rawUrl);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(lastSegment ?? rawUrl);
  } catch {
    const lastSegment = rawUrl.split("/").filter(Boolean).pop();
    return decodeURIComponent(lastSegment ?? rawUrl);
  }
}

async function getErrorMessage(response: Response, fallback: string) {
  const rawBody = await response.text();
  if (!rawBody.trim()) return fallback;

  try {
    const parsed = JSON.parse(rawBody) as { error?: string; message?: string };
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error;
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Ignore parse errors and fall back to raw text.
  }

  return rawBody.length > 220 ? `${rawBody.slice(0, 217)}...` : rawBody;
}

export function DocumentUpload({
  franchiseId,
  value,
  onChange,
  accept = ".pdf,application/pdf",
  hint,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasDocument = Boolean(value);
  const displayName = useMemo(() => getDisplayNameFromUrl(value), [value]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!looksLikePdf(file)) {
        setError("Solo se permiten archivos PDF.");
        return;
      }

      if (file.size <= 0) {
        setError("El archivo PDF está vacío.");
        return;
      }

      if (file.size > MAX_PDF_SIZE_BYTES) {
        setError(`El PDF supera el máximo de ${formatBytes(MAX_PDF_SIZE_BYTES)}.`);
        return;
      }

      setUploading(true);
      setError(null);
      setSuccess(null);

      try {
        const prepareResponse = await fetch(
          `/api/admin/landing/franchises/${franchiseId}/brochure-upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contentType: file.type || "application/pdf",
              fileName: file.name,
              fileSize: file.size,
            }),
          }
        );

        const { signedUrl, publicUrl } = await parseJsonResponse<PrepareBrochureUploadResponse>(
          prepareResponse,
          `/api/admin/landing/franchises/${franchiseId}/brochure-upload`
        );

        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "cache-control": "max-age=3600",
            "content-type": file.type || "application/pdf",
            "x-upsert": "false",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            await getErrorMessage(
              uploadResponse,
              `Error ${uploadResponse.status} al subir el PDF al storage.`
            )
          );
        }

        onChange(publicUrl);
        setSuccess("PDF subido correctamente. Guarda cambios para persistirlo.");
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo subir el PDF."
        );
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [franchiseId, onChange]
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    void uploadFile(files[0]);
  }

  function handleManualUrlChange(nextValue: string) {
    setError(null);
    setSuccess(null);
    onChange(nextValue);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-colors",
          dragging
            ? "border-blue-400 bg-blue-50"
            : hasDocument
            ? "border-gray-300 bg-gray-50"
            : "border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
          uploading && "cursor-not-allowed opacity-60"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="h-6 w-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-gray-500">Subiendo PDF...</span>
          </div>
        ) : hasDocument ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3h6l4 4v14H7a2 2 0 01-2-2V5a2 2 0 012-2zm6 0v4h4M9 13h6M9 17h6M9 9h1" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="max-w-full truncate text-sm font-medium text-gray-700">
                {displayName || "Documento cargado"}
              </p>
              <span className="text-xs text-gray-400">Clic o arrastra para reemplazar</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-3 3m3-3l3 3" />
            </svg>
            <span className="text-sm text-gray-500">Arrastra un PDF o haz clic para subirlo</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {hasDocument && !uploading && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleManualUrlChange("");
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Eliminar
          </button>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Abrir documento actual
          </a>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-xs text-gray-400">o pegar URL</span>
        <input
          type="text"
          value={value}
          onChange={(event) => handleManualUrlChange(event.target.value)}
          placeholder="https://.../brochure.pdf"
          className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <p className="text-xs text-gray-400">
        {hint ?? `Solo PDF. Máximo ${formatBytes(MAX_PDF_SIZE_BYTES)}. También puedes usar una URL manual.`}
      </p>

      {success && <p className="text-xs text-emerald-600">{success}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
