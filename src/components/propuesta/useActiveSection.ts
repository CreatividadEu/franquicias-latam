"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Devuelve el id de la sección activa (la que cruza el centro del
 * contenedor de scroll). Alimenta el rail de progreso.
 */
export function useActiveSection(
  containerRef: RefObject<HTMLElement | null>,
  ids: string[],
): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const el = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (el) {
        observer.observe(el);
      }
    }
    return () => observer.disconnect();
  }, [containerRef, ids]);

  return active;
}
