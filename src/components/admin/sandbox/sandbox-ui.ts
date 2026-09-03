// Etiquetas y helpers compartidos del panel Sandbox (cliente y servidor).
import type { AdminAssetDTO, AdminSessionDTO } from "@/lib/sandbox/admin";
import type { SandboxAssetKindId } from "@/lib/sandbox/schemas";

export const STATUS_UI: Record<AdminSessionDTO["status"], { label: string; classes: string; dot: string; hint: string }> = {
  draft: { label: "Borrador", classes: "bg-gray-100 text-gray-600", dot: "bg-gray-400", hint: "En preparación; el enlace ya funciona para previsualizar." },
  ready: { label: "Lista", classes: "bg-blue-50 text-blue-700", dot: "bg-blue-500", hint: "Preparada para la llamada. Pasa a «En vivo» cuando el cliente la abre." },
  live: { label: "En vivo", classes: "bg-green-100 text-green-700", dot: "bg-green-500", hint: "El cliente ya la abrió." },
  done: { label: "Cerrada", classes: "bg-purple-50 text-purple-700", dot: "bg-purple-500", hint: "Sesión terminada; el enlace sigue abierto para el reporte." },
  archived: { label: "Archivada", classes: "bg-slate-100 text-slate-500", dot: "bg-slate-400", hint: "El enlace deja de funcionar." },
};

export const SECTOR_UI: Record<AdminSessionDTO["sector"], string> = {
  restaurante: "Restaurante",
  retail: "Retail",
  servicios: "Servicios",
  otro: "Otro",
};

export const KIND_UI: Record<SandboxAssetKindId, { label: string; hint: string; phase: string }> = {
  menu: { label: "Menú", hint: "Carta o menú con precios (PDF, foto, Excel)", phase: "Finanzas" },
  catalog: { label: "Catálogo", hint: "Catálogo de productos o servicios", phase: "Finanzas" },
  price_list: { label: "Lista de precios", hint: "Precios y costos si existen", phase: "Finanzas" },
  sales_notes: { label: "Notas de ventas", hint: "Ventas mensuales, ticket, transacciones", phase: "Finanzas" },
  opex_notes: { label: "Notas de gastos", hint: "Arriendo, nómina, servicios, marketing", phase: "Finanzas" },
  osint: { label: "OSINT", hint: "Reseñas de Google, comentarios de redes, notas de visita", phase: "Operaciones" },
  marketing_audit: { label: "Auditoría de marketing", hint: "Auditoría o notas de marca y redes", phase: "Marketing" },
  other: { label: "Otro", hint: "Referencia: no se extrae automáticamente", phase: "—" },
};

export const EXTRACTION_UI: Record<AdminAssetDTO["extractionStatus"], { label: string; classes: string }> = {
  pending: { label: "Pendiente", classes: "bg-gray-100 text-gray-600" },
  running: { label: "Procesando…", classes: "bg-amber-50 text-amber-700" },
  done: { label: "Extraído", classes: "bg-green-100 text-green-700" },
  error: { label: "Error", classes: "bg-red-50 text-red-700" },
};

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

/** URL pública de la sesión; en el navegador usa el origin actual. */
export function sandboxPublicUrl(slug: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "https://franquiciaslatam.com").replace(/\/$/, "");
  return `${base}/sandbox/${slug}`;
}

/** ISO → valor de <input type="datetime-local"> en hora local. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400";
export const labelClass = "text-sm font-medium text-gray-700";
export const primaryBtn =
  "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryBtn =
  "inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";
export const dangerBtn =
  "inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60";
