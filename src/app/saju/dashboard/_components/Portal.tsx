"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/**
 * Monta contenido en <body> dentro de un contenedor `.saju-cc`.
 *
 * El dashboard cuelga del layout de /saju, cuyo `.saju-root` lleva
 * `overflow-x: clip` — que recorta los descendientes `position: fixed`. Sacar
 * drawer, modales y toasts del subárbol evita el recorte y mantiene los tokens.
 */
const subscribe = () => () => {};

export function Portal({ children }: { children: React.ReactNode }) {
  // Detección de cliente sin efecto: en SSR devuelve false y no se portaliza.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!isClient) return null;
  return createPortal(<div className="saju-cc cc-portal">{children}</div>, document.body);
}
