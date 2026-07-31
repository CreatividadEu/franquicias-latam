"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Portal } from "./Portal";
import type { ActionResult } from "@/lib/saju/types";

type ToastTone = "ok" | "error";
type Toast = { id: number; message: string; tone: ToastTone };

type ToastApi = {
  notify: (message: string, tone?: ToastTone) => void;
  /** Muestra el error de una server action; devuelve true si salió bien. */
  report: (result: ActionResult, successMessage?: string) => boolean;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const notify = useCallback((message: string, tone: ToastTone = "ok") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const report = useCallback(
    (result: ActionResult, successMessage?: string) => {
      if (result.ok) {
        if (successMessage) notify(successMessage, "ok");
        return true;
      }
      notify(result.error, "error");
      return false;
    },
    [notify],
  );

  const api = useMemo<ToastApi>(() => ({ notify, report }), [notify, report]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 && (
        <Portal>
          <div className="cc-toasts" role="status" aria-live="polite">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`cc-toast${toast.tone === "error" ? " cc-toast--error" : ""}`}
              >
                {toast.message}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </ToastContext.Provider>
  );
}
