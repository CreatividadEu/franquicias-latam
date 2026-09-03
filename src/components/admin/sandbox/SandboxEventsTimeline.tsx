import type { AdminEventDTO, AdminResultDTO } from "@/lib/sandbox/admin";
import { formatDateTime } from "./sandbox-ui";

function compact(payload: unknown): string {
  if (payload === null || payload === undefined) return "";
  const text = JSON.stringify(payload);
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}

/** §7 paso 6: línea de tiempo de la sesión y resultado guardado hasta ahora. */
export function SandboxEventsTimeline({ events, result }: { events: AdminEventDTO[]; result: AdminResultDTO | null }) {
  return (
    <div className="space-y-4">
      {result && (
        <div className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
          <p>
            <span className="text-gray-500">Titular 2029:</span> {result.headline ?? "—"}
          </p>
          <p>
            <span className="text-gray-500">Correo para el reporte:</span> {result.sentToEmail ?? "—"}
          </p>
          <p>
            <span className="text-gray-500">Radar:</span> {result.readinessScores ? "guardado" : "pendiente"}
          </p>
          <p>
            <span className="text-gray-500">PDF:</span> {result.reportPdfPath ?? "pendiente (hito 7)"}
          </p>
        </div>
      )}
      {events.length === 0 ? (
        <p className="text-sm text-gray-400">Sin eventos todavía: aparecen cuando alguien abre el enlace.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-2">Cuándo</th>
                <th className="px-4 py-2">Fase</th>
                <th className="px-4 py-2">Evento</th>
                <th className="px-4 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-gray-500">{formatDateTime(e.createdAt)}</td>
                  <td className="px-4 py-2 text-xs uppercase tracking-wide text-gray-600">{e.phase}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-900">{e.type}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-gray-500" title={JSON.stringify(e.payload ?? null)}>
                    {compact(e.payload)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
