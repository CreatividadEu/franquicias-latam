"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSessionDTO } from "@/lib/sandbox/admin";
import { CopyButton } from "./CopyButton";
import { STATUS_UI, inputClass, primaryBtn, sandboxPublicUrl, secondaryBtn } from "./sandbox-ui";

const STATUS_ORDER: AdminSessionDTO["status"][] = ["draft", "ready", "live", "done", "archived"];

/** §7 paso 5: enlace, PIN y estado. Cada acción es un PATCH y refresca el server component. */
export function SandboxSessionControls({ session }: { session: AdminSessionDTO }) {
  const router = useRouter();
  const [url, setUrl] = useState(`/sandbox/${session.slug}`);
  const [pin, setPin] = useState(session.pin ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(sandboxPublicUrl(session.slug));
  }, [session.slug]);

  async function patch(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sandbox/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo guardar");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setBusy(null);
    }
  }

  const status = STATUS_UI[session.status];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Enlace del cliente</p>
        <p className="break-all rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700">{url}</p>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={url} />
          <a href={`/sandbox/${session.slug}?presenter=1`} target="_blank" rel="noreferrer" className={primaryBtn}>
            Abrir modo presentador ↗
          </a>
          <a href={`/sandbox/${session.slug}`} target="_blank" rel="noreferrer" className={secondaryBtn}>
            Ver como cliente ↗
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Estado</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy !== null}
              onClick={() => s !== session.status && patch({ status: s }, `status:${s}`)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                s === session.status ? `${STATUS_UI[s].classes} ring-2 ring-offset-1 ring-blue-500` : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {STATUS_UI[s].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{status.hint}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">PIN de acceso</p>
        <div className="flex gap-2">
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="Sin PIN"
            className={`${inputClass} max-w-[140px] font-mono`}
          />
          <button type="button" disabled={busy !== null || (pin.length !== 4 && pin.length !== 0) || pin === (session.pin ?? "")} onClick={() => patch({ pin: pin || null }, "pin")} className={secondaryBtn}>
            {pin ? "Guardar PIN" : "Quitar PIN"}
          </button>
        </div>
        <p className="text-xs text-gray-400">El cliente lo escribe al abrir el enlace; tú entras sin PIN con tu sesión de admin.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Idioma</p>
        <div className="flex gap-1.5">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              disabled={busy !== null}
              onClick={() => l !== session.locale && patch({ locale: l }, `locale:${l}`)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${l === session.locale ? "bg-gray-900 text-white" : "bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"}`}
            >
              {l === "es" ? "Español" : "English"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
