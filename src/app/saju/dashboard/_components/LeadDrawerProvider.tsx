"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { SajuLeadDTO, SajuLeadDetailDTO } from "@/lib/saju/types";
import { loadLeadDetail } from "../actions";
import { LeadDrawer } from "./LeadDrawer";

type DrawerApi = {
  /** Abre la ficha; el lead recibido pinta al instante mientras llega el detalle. */
  open: (lead: SajuLeadDTO) => void;
  openById: (id: string) => void;
  close: () => void;
  /** Recarga la ficha abierta (tras editar o añadir un evento). */
  refresh: () => void;
};

const DrawerContext = createContext<DrawerApi | null>(null);

export function useLeadDrawer(): DrawerApi {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useLeadDrawer debe usarse dentro de <LeadDrawerProvider>");
  return ctx;
}

/** Escribe `?lead=` sin re-renderizar el servidor (History API nativa). */
function syncUrl(leadId: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (leadId) url.searchParams.set("lead", leadId);
  else url.searchParams.delete("lead");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

/**
 * Estado del drawer. El deep-link `?lead=` se resuelve en el servidor
 * (`initialDetail`), así que al montar ya hay ficha: nada de efectos de carga.
 * Las recargas posteriores nacen siempre de un evento — abrir o refrescar.
 */
export function LeadDrawerProvider({
  initialLeadId,
  initialDetail = null,
  children,
}: {
  initialLeadId: string | null;
  initialDetail?: SajuLeadDetailDTO | null;
  children: React.ReactNode;
}) {
  const [leadId, setLeadId] = useState<string | null>(initialLeadId);
  const [seed, setSeed] = useState<SajuLeadDTO | null>(null);
  const [detail, setDetail] = useState<SajuLeadDetailDTO | null>(initialDetail);
  const [loading, setLoading] = useState(false);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (id: string) => {
    const token = ++requestId.current;
    const result = await loadLeadDetail(id);
    if (token !== requestId.current) return; // respuesta obsoleta
    setDetail(result);
    setLoading(false);
  }, []);

  const close = useCallback(() => {
    requestId.current += 1;
    setLeadId(null);
    setSeed(null);
    setDetail(null);
    setLoading(false);
    syncUrl(null);
    restoreFocusTo.current?.focus?.();
    restoreFocusTo.current = null;
  }, []);

  const open = useCallback(
    (lead: SajuLeadDTO) => {
      restoreFocusTo.current = (document.activeElement as HTMLElement) ?? null;
      setSeed(lead);
      setDetail(null);
      setLoading(true);
      setLeadId(lead.id);
      syncUrl(lead.id);
      void load(lead.id);
    },
    [load],
  );

  const openById = useCallback(
    (id: string) => {
      restoreFocusTo.current = (document.activeElement as HTMLElement) ?? null;
      setSeed(null);
      setDetail(null);
      setLoading(true);
      setLeadId(id);
      syncUrl(id);
      void load(id);
    },
    [load],
  );

  const refresh = useCallback(() => {
    if (!leadId) return;
    setLoading(true);
    void load(leadId);
  }, [leadId, load]);

  const api = useMemo<DrawerApi>(
    () => ({ open, openById, close, refresh }),
    [open, openById, close, refresh],
  );

  return (
    <DrawerContext.Provider value={api}>
      {children}
      {leadId && (
        <LeadDrawer
          key={leadId}
          leadId={leadId}
          seed={seed}
          detail={detail}
          loading={loading}
          onClose={close}
          onChanged={refresh}
        />
      )}
    </DrawerContext.Provider>
  );
}
