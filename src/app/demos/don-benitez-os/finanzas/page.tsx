"use client";

import { useState } from "react";
import { FinancialTable } from "../_components/FinancialTable";
import { StreamedOutput } from "../_components/StreamedOutput";

export default function FinanzasPage() {
  const [auditing, setAuditing] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-fl-text">Finanzas</h1>
            <span className="flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300">
              🔒 Acceso gerencia
            </span>
          </div>
          <p className="mt-1 text-sm text-fl-muted">
            P&L por punto · últimos 30 días · benchmark cadena
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-400/15 text-amber-300">
            ⚠
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-fl-text">
              Barranquilla food cost +2.3pp sobre media — probable desviación en proteína
            </p>
            <p className="mt-1 text-xs text-fl-muted">
              Últimas 3 semanas consistente. Patrón sugiere merma o cambio de proveedor.
            </p>
            {!auditing && (
              <button
                onClick={() => setAuditing(true)}
                className="mt-3 rounded-md bg-fl-teal px-4 py-2 text-xs font-semibold text-fl-base hover:bg-fl-teal/90"
              >
                Generar auditoría
              </button>
            )}
            {auditing && (
              <div className="mt-3 rounded-lg border border-fl-border bg-fl-base/60 p-4">
                <StreamedOutput
                  endpoint="/api/demos/don-benitez-os/action-plan"
                  payload={{ pointId: "barranquilla" }}
                  fallback={FALLBACK_AUDIT}
                  triggerKey="audit-barranquilla"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-fl-text">P&L consolidado por punto</h2>
        <p className="mt-0.5 text-xs text-fl-muted">
          Rojo = desviación food cost &gt; 1.5pp sobre media. Sparkline = ingresos diarios 30d.
        </p>
        <div className="mt-3">
          <FinancialTable />
        </div>
      </section>
    </div>
  );
}

const FALLBACK_AUDIT = `1. **Auditar compras de proteína últimas 3 semanas**
   Owner: Chef Barranquilla + Compras central.
   Plazo: 48h.
   Por qué: identifica si la desviación viene de precio, merma o pedido.

2. **Pesar protocolo por porción durante 5 turnos**
   Owner: Chef Barranquilla.
   Plazo: esta semana.
   Por qué: valida si hay sobre-servicio en cocina.

3. **Revisar contrato con proveedor actual vs. alternativa**
   Owner: Gerente de punto + Compras.
   Plazo: semana.
   Por qué: 2.3pp anualizados = ~$12M COP impacto EBITDA.`;
