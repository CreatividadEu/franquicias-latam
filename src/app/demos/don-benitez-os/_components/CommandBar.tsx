"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  { label: "Generar plan de acción para Kennedy", query: "genera un plan de acción para Kennedy" },
  { label: "Candidatos de cocina en Medellín", query: "muéstrame candidatos cocina Medellín Poblado" },
  { label: "Módulo de formación de Servicio", query: "módulo de formación servicio Chapinero" },
];

type RouteDirective = { type: "route"; path: string; label: string };

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "routing">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const close = useCallback(() => {
    abortRef.current?.abort();
    setOpen(false);
    setQuery("");
    setResponse("");
    setStatus("idle");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  const run = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setResponse("");
      setStatus("streaming");
      try {
        const res = await fetch("/api/demos/don-benitez-os/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error("stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        let checkedRoute = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          if (!checkedRoute && acc.trimStart().startsWith("{")) {
            const firstLine = acc.trimStart().split("\n")[0];
            try {
              const parsed = JSON.parse(firstLine) as RouteDirective;
              if (parsed.type === "route" && typeof parsed.path === "string") {
                checkedRoute = true;
                setStatus("routing");
                setResponse(`→ ${parsed.label}`);
                setTimeout(() => {
                  router.push(parsed.path);
                  close();
                }, 400);
                return;
              }
            } catch {
              checkedRoute = true;
            }
          }
          setResponse(acc);
        }
        setStatus("idle");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setResponse("No pude conectar con el agente. Intenta de nuevo.");
        setStatus("idle");
      }
    },
    [router, close]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-fl-border bg-fl-base shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-fl-border px-4 py-3">
          <span className="text-fl-teal">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run(query);
            }}
            placeholder="Pregúntale a Clawdbot: 'muéstrame Kennedy', 'plan para Barranquilla'…"
            className="flex-1 bg-transparent text-sm text-fl-text outline-none placeholder:text-fl-muted"
          />
          <kbd className="rounded border border-fl-border px-1.5 py-0.5 text-[10px] text-fl-muted">ESC</kbd>
        </div>

        {status === "idle" && !response && (
          <div className="p-2">
            <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-fl-muted">Sugerencias</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setQuery(s.query);
                  run(s.query);
                }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-fl-text hover:bg-fl-surface"
              >
                <span>{s.label}</span>
                <span className="text-xs text-fl-muted">↵</span>
              </button>
            ))}
          </div>
        )}

        {(status === "streaming" || status === "routing" || response) && (
          <div className="max-h-[40vh] overflow-y-auto px-4 py-3 text-sm text-fl-text">
            <div className="whitespace-pre-wrap">
              {response}
              {status === "streaming" && (
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-fl-teal align-middle" />
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-fl-border bg-fl-surface px-4 py-2 text-[11px] text-fl-muted">
          <span>Clawdbot · routing + diagnóstico</span>
          <span>
            <kbd className="mx-0.5 rounded border border-fl-border px-1">↵</kbd> para ejecutar
          </span>
        </div>
      </div>
    </div>
  );
}
