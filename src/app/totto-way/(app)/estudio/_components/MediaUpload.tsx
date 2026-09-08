"use client";

import { useRef, useState } from "react";
import { Check, Upload } from "lucide-react";

/**
 * Sube un archivo al bucket privado en tres pasos: el servidor firma, el
 * navegador manda el binario directo a Supabase (Vercel no lo ve) y el
 * servidor lo registra. Devuelve la URL de servicio, que es la que se guarda.
 */
export type MediaKind = "PDF" | "POSTER" | "IMAGE" | "VIDEO" | "SUBTITLE";

const ACCEPT: Record<MediaKind, string> = {
  PDF: "application/pdf",
  POSTER: "image/png,image/jpeg,image/webp",
  IMAGE: "image/png,image/jpeg,image/webp,image/svg+xml",
  VIDEO: "video/mp4,video/webm",
  SUBTITLE: "text/vtt",
};

export function MediaUpload({
  kind,
  label,
  chapterSlug,
  onUploaded,
}: {
  kind: MediaKind;
  label: string;
  chapterSlug?: string;
  onUploaded: (url: string, fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setState("uploading");
    try {
      const signRes = await fetch("/api/totto-way/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, fileName: file.name, mime: file.type, sizeBytes: file.size }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign?.error ?? "No se pudo preparar la subida.");

      // El binario va directo a Supabase con la URL firmada.
      const put = await fetch(sign.signedUrl, { method: "PUT", body: file, headers: { "x-upsert": "true" } });
      if (!put.ok) throw new Error("Falló la subida del archivo.");

      const regRes = await fetch("/api/totto-way/media/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          path: sign.path,
          fileName: file.name,
          mime: file.type,
          sizeBytes: file.size,
          chapterSlug: chapterSlug ?? null,
        }),
      });
      const reg = await regRes.json();
      if (!regRes.ok) throw new Error(reg?.error ?? "No se pudo registrar el archivo.");

      setState("done");
      onUploaded(reg.url, file.name);
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className="tw-btn tw-btn--outline tw-btn--sm"
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading"}
      >
        {state === "done" ? <Check strokeWidth={1.8} /> : <Upload strokeWidth={1.8} />}
        {state === "uploading" ? "Subiendo…" : state === "done" ? "Subido" : label}
      </button>
      {error ? (
        <p className="tw-small" style={{ color: "var(--tw-red)" }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
