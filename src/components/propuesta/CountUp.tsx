"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  value: number;
  format?: (n: number) => string;
  /** Segundos de la primera animación al entrar al viewport */
  duration?: number;
  className?: string;
};

/**
 * Contador animado al entrar al viewport. Actualizaciones posteriores
 * (p.ej. un slider) transicionan rápido; reduced-motion salta al valor final.
 */
export function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 0.9,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const current = useRef(0);
  const revealed = useRef(false);

  useEffect(() => {
    if (!inView) {
      return;
    }
    if (reduced) {
      current.current = value;
      revealed.current = true;
      setDisplay(value);
      return;
    }
    const controls = animate(revealed.current ? current.current : 0, value, {
      duration: revealed.current ? 0.35 : duration,
      ease: "easeOut",
      onUpdate: (v) => {
        current.current = v;
        setDisplay(v);
      },
    });
    revealed.current = true;
    return () => controls.stop();
  }, [inView, value, reduced, duration]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
