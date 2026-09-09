"use client";

import { useEffect, useState } from "react";

export function StoreViewer() {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("error"), 12_000);
    return () => clearTimeout(timer);
  }, [attempt, status]);

  return (
    <section className="tw-store" aria-label="Mi Tienda Totto">
      <iframe key={attempt} src="/microsites/totto-way/index.html?v=61471409e691"
        title="TOTTO Way — recorrido virtual"
        allow="fullscreen" allowFullScreen
        onLoad={(event) => setStatus(event.currentTarget.contentDocument?.querySelector('script[src^="./app.js?"]') ? "ready" : "error")}
        onError={() => setStatus("error")} />
      {status !== "ready" && <div className="tw-store__status">
        {status === "loading" ? <p role="status">Cargando Mi Tienda Totto…</p> : <div role="alert">
          <p>No se pudo cargar el recorrido.</p>
          <button type="button" className="tw-btn tw-btn--yellow" onClick={() => { setStatus("loading"); setAttempt((n) => n + 1); }}>Reintentar</button>
        </div>}
      </div>}
    </section>
  );
}
