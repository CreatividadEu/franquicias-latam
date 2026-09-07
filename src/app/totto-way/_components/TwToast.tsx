"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** Toast amarillo de marca: "+120 XP · título". Uno a la vez, 4 s. */
type Toast = { id: number; text: string };
type ToastContextValue = { showToast: (text: string) => void };

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div className="tw-toast" role="status" aria-live="polite" key={toast.id}>
          {toast.text}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
