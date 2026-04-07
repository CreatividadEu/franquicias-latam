"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, ShieldCheck, X } from "lucide-react";

import { Trademark, createAlert, getTrademark } from "@/lib/api";

interface TrademarkCardProps {
  trademark: Trademark;
  onClose: () => void;
}

export default function TrademarkCard({ trademark, onClose }: TrademarkCardProps) {
  const [detail, setDetail] = useState<Trademark>(trademark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [alertState, setAlertState] = useState<string | null>(null);
  const [creatingAlert, setCreatingAlert] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const nextDetail = await getTrademark(trademark.numero_solicitud);
        if (active) {
          setDetail(nextDetail);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el detalle.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDetail();
    return () => {
      active = false;
    };
  }, [trademark.numero_solicitud]);

  async function handleCreateAlert() {
    if (!email.trim()) {
      setAlertState("Ingresa un correo válido para crear la alerta.");
      return;
    }

    setCreatingAlert(true);
    setAlertState(null);
    try {
      const response = await createAlert(
        email.trim(),
        detail.denominacion,
        detail.clase_niza?.[0]
      );
      setAlertState(response.message);
      setEmail("");
    } catch (err) {
      setAlertState(err instanceof Error ? err.message : "No se pudo crear la alerta.");
    } finally {
      setCreatingAlert(false);
    }
  }

  return (
    <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-jade">
            <ShieldCheck className="h-3.5 w-3.5" />
            Expediente {detail.numero_solicitud}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">{detail.denominacion}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {detail.titular || "Titular no disponible"} • {detail.tipo_signo || "Tipo no reportado"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          aria-label="Cerrar detalle"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando detalle de la marca...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <DetailItem label="Estado" value={detail.estado} />
          <DetailItem label="Número de registro" value={detail.numero_registro} />
          <DetailItem label="Clases de Niza" value={detail.clase_niza?.join(", ")} />
          <DetailItem label="Fecha de solicitud" value={detail.fecha_solicitud} />
          <DetailItem label="Fecha de registro" value={detail.fecha_registro} />
          <DetailItem label="Fecha de vigencia" value={detail.fecha_vigencia} />
          <DetailItem label="País titular" value={detail.pais_titular} />
          <DetailItem label="Fuente" value={detail.fuente} />
          <div className="md:col-span-2">
            <DetailItem label="Descripción de clase" value={detail.descripcion_clase} />
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-sm text-slate-600">
            Recibe alertas por correo si aparecen marcas similares
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-skyline focus:ring-4 focus:ring-skyline/10"
            />
          </label>
          <button
            type="button"
            onClick={() => void handleCreateAlert()}
            disabled={creatingAlert}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingAlert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Crear alerta
          </button>
        </div>
        {alertState ? <p className="mt-3 text-sm text-slate-600">{alertState}</p> : null}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm text-slate-700">{value || "No disponible"}</p>
    </div>
  );
}
