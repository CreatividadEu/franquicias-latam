/**
 * Formateo de números para el sandbox de propuesta (es-CO, COP).
 * Los montos se muestran compactos ("$ 180 M") para lectura de un vistazo.
 */

const copFull = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(n: number): string {
  return copFull.format(n);
}

/** $ 180 M · $ 1.240 M — millones de COP, sin decimales innecesarios. */
export function formatCOPMillones(n: number): string {
  const millones = n / 1_000_000;
  const digits = Math.abs(millones) < 10 && millones % 1 !== 0 ? 1 : 0;
  const num = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits,
  }).format(millones);
  return `$${num} M`;
}

/**
 * Mes de inflexión efectivo para el modelo de 12 meses: entero en [1..12].
 * Headline, chart y cifra de caja liberada usan ESTE valor para no
 * contradecirse cuando la config trae valores fuera de rango.
 */
export function mesInflexionEfectivo(mesInflexion: number): number {
  return Math.min(Math.max(Math.round(mesInflexion), 1), 12);
}

/** 28.400.000 → "28,4 M" · 950.000 → "950 K" */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: m % 1 === 0 ? 0 : 1 }).format(m)} M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n / 1_000)} K`;
  }
  return new Intl.NumberFormat("es-CO").format(n);
}
