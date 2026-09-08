"use client";

import { useEffect, useState } from "react";

/** Cuenta hasta `target` (portado de totto-demo). Respeta reduced-motion. */
export function TwCountUp({ target, duration = 900, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return (
    <span>
      {(value ?? target).toLocaleString("es-CO")}
      {suffix}
    </span>
  );
}
