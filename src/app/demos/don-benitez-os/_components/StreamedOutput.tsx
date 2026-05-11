"use client";

import { useEffect, useRef, useState } from "react";

type StreamedOutputProps = {
  endpoint: string;
  payload: Record<string, unknown>;
  fallback: string;
  className?: string;
  autoStart?: boolean;
  onDone?: (fullText: string) => void;
  triggerKey?: string | number;
};

export function StreamedOutput({
  endpoint,
  payload,
  fallback,
  className,
  autoStart = true,
  onDone,
  triggerKey,
}: StreamedOutputProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!autoStart) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Reset before starting a new stream. The react-compiler lint flags this
    // cascade, but it's the intended behaviour for "stream on prop change".
    /* eslint-disable react-hooks/set-state-in-effect */
    setText("");
    setStatus("streaming");
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error("stream-failed");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          acc += chunk;
          setText(acc);
        }
        setStatus("done");
        onDone?.(acc);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setText(fallback);
        setStatus("error");
        onDone?.(fallback);
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, triggerKey, autoStart]);

  return (
    <div className={className ?? "whitespace-pre-wrap text-sm leading-relaxed text-fl-text"}>
      {text}
      {status === "streaming" && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-fl-teal align-middle" />}
      {status === "error" && (
        <p className="mt-2 text-[11px] text-fl-muted">Fallback demo (API sin respuesta).</p>
      )}
    </div>
  );
}
