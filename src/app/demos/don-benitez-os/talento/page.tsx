"use client";

import { useState } from "react";
import { Funnel } from "../_components/Funnel";
import { AgentChatPreview } from "../_components/AgentChatPreview";
import { CANDIDATES, FUNNEL_COUNTS } from "../_lib/seed";
import { POINT_NAMES } from "../_lib/narrative";

const FUNNEL_STAGES = [
  { label: "Sourced", count: FUNNEL_COUNTS.sourced },
  { label: "Contactado", count: FUNNEL_COUNTS.contacted },
  { label: "Entrevistado", count: FUNNEL_COUNTS.interviewing },
  { label: "Contratado", count: FUNNEL_COUNTS.hired },
];

export default function TalentoPage() {
  const active = CANDIDATES.find((c) => c.conversation);
  const [toast, setToast] = useState<string | null>(null);

  function schedule() {
    if (!active) return;
    setToast(`Entrevista agendada · asignado a ${POINT_NAMES[active.pointPreference]} · jue 24 abr 3pm`);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-fl-text">Talento</h1>
        <p className="mt-1 text-sm text-fl-muted">
          Funnel por punto · Clawdbot con {FUNNEL_COUNTS.interviewing} conversaciones activas
        </p>
      </header>

      <section className="rounded-xl border border-fl-border bg-fl-surface p-5">
        <h2 className="text-sm font-semibold text-fl-text">Funnel cadena · últimos 30 días</h2>
        <div className="mt-4">
          <Funnel stages={FUNNEL_STAGES} />
        </div>
      </section>

      {active && (
        <section className="rounded-xl border border-fl-teal/30 bg-fl-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-fl-text">Conversación activa</h2>
              <p className="mt-0.5 text-xs text-fl-muted">
                {active.name} · {active.role} · preferencia {POINT_NAMES[active.pointPreference]} · score IA {active.aiScore}
              </p>
            </div>
            <button
              onClick={schedule}
              className="rounded-md bg-fl-teal px-4 py-2 text-xs font-semibold text-fl-base hover:bg-fl-teal/90"
            >
              Agendar entrevista
            </button>
          </div>
          <div className="mt-4">
            <AgentChatPreview messages={active.conversation!} candidateName={active.name} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-fl-text">Pipeline activo</h2>
        <p className="mt-0.5 text-xs text-fl-muted">30 candidatos · orden por score IA.</p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-fl-border bg-fl-surface">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-fl-border bg-fl-base/50 text-[10px] uppercase tracking-wider text-fl-muted">
                <th className="px-4 py-3 text-left">Candidato</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Punto</th>
                <th className="px-4 py-3 text-right">Score IA</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Último contacto</th>
              </tr>
            </thead>
            <tbody>
              {CANDIDATES.slice()
                .sort((a, b) => b.aiScore - a.aiScore)
                .map((c) => (
                  <tr key={c.id} className="border-b border-fl-border/40 hover:bg-fl-base/30">
                    <td className="px-4 py-3 font-medium text-fl-text">{c.name}</td>
                    <td className="px-4 py-3 text-fl-muted">{c.role}</td>
                    <td className="px-4 py-3 text-fl-muted">{POINT_NAMES[c.pointPreference]}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ${
                          c.aiScore >= 85
                            ? "bg-fl-teal/15 text-fl-teal"
                            : c.aiScore >= 70
                            ? "bg-fl-purple/15 text-fl-purple"
                            : "bg-fl-surface text-fl-muted"
                        }`}
                      >
                        {c.aiScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-fl-base px-2 py-0.5 text-[11px] text-fl-muted">
                        {statusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-fl-muted">{c.lastTouch}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-lg border border-fl-teal/40 bg-fl-base px-4 py-3 text-sm text-fl-text shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function statusLabel(s: string): string {
  return (
    {
      sourced: "Sourced",
      contacted: "Contactado",
      interviewing: "Entrevista",
      hired: "Contratado",
      rejected: "Descartado",
    }[s] ?? s
  );
}
