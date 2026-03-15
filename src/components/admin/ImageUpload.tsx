"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  storagePath: string;
  accept?: string;
  hint?: string;
  previewHeight?: string;
}

export function ImageUpload({
  value,
  onChange,
  storagePath,
  accept = "image/*",
  hint,
  previewHeight = "h-16",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${storagePath}.${ext}`;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("storagePath", path);

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok) {
          setError(json.error ?? "Error al subir archivo");
          return;
        }
        onChange(json.url);
      } catch {
        setError("Error de red al subir archivo");
      } finally {
        setUploading(false);
      }
    },
    [storagePath, onChange]
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const hasImage = Boolean(value);

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-colors",
          dragging ? "border-blue-400 bg-blue-50" : hasImage ? "border-gray-300 bg-gray-50" : "border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
          uploading && "cursor-not-allowed opacity-60"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            {/* Spinner */}
            <svg className="h-6 w-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-gray-500">Subiendo...</span>
          </div>
        ) : hasImage ? (
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className={cn("rounded object-contain", previewHeight)}
            />
            <span className="text-xs text-gray-400">Clic o arrastra para reemplazar</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-3 3m3-3l3 3" />
            </svg>
            <span className="text-sm text-gray-500">Arrastra o haz clic para subir</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Eliminar button */}
      {hasImage && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          className="text-xs text-red-500 hover:underline"
        >
          Eliminar
        </button>
      )}

      {/* URL input */}
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-xs text-gray-400">o pegar URL</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Hint */}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
