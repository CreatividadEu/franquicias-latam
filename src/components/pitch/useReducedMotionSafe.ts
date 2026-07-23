"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// `useReducedMotion` ya devuelve el valor real en el PRIMER render del
// cliente, distinto del server (que no conoce la media query) → hydration
// mismatch en los árboles que ramifican por él. Este hook arranca en `false`
// (idéntico al server) y aplica la preferencia tras el mount. La supresión de
// transforms desde el primer frame la cubre <MotionConfig reducedMotion="user">.
export function useReducedMotionSafe(): boolean {
  const preferencia = useReducedMotion() ?? false;
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(preferencia);
  }, [preferencia]);
  return reduce;
}
