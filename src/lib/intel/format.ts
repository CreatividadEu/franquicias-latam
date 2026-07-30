/**
 * Formateadores es-CO para el simulador. El separador de miles se sustituye por
 * un espacio fino (U+2009) — la lectura financiera queda más limpia en mono y
 * evita confundir el punto de miles con el decimal.
 */

const THIN = " ";

const nf = (min: number, max: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

const nf0 = nf(0, 0);
const nf1 = nf(1, 1);

function thinSpace(value: string): string {
  return value.replace(/\./g, THIN);
}

/** Entero con espacio fino: 12 628 */
export function num(value: number): string {
  return thinSpace(nf0.format(Math.round(value)));
}

/** Un decimal: 2,5 */
export function num1(value: number): string {
  return thinSpace(nf1.format(value));
}

/** COP M (millones): "COP 12 628 M" */
export function copM(value: number, opts: { unit?: boolean } = {}): string {
  const unit = opts.unit === false ? "" : ` M`;
  return `COP ${num(value)}${unit}`;
}

/** COP M sin prefijo: "12 628 M" */
export function mShort(value: number): string {
  return `${num(value)}${THIN}M`;
}

/** COP nominales: "COP 200 000" */
export function cop(value: number): string {
  return `COP ${num(value)}`;
}

/** COP nominales con decimales cuando el valor es pequeño (ticker por segundo). */
export function copPrecise(value: number, decimals = 0): string {
  return `COP ${thinSpace(nf(decimals, decimals).format(value))}`;
}

/** Convierte COP M a USD con la TRM de referencia y lo formatea. */
export function usdFromM(valueM: number, trm: number): string {
  const usd = (valueM * 1e6) / trm;
  if (usd >= 1e6) return `USD ${num1(usd / 1e6)} M`;
  if (usd >= 1e3) return `USD ${num(usd / 1e3)} K`;
  return `USD ${num(usd)}`;
}

/** Porcentaje desde una fracción: 0.0255 → "2,5 %" */
export function pctFromRatio(ratio: number, decimals = 1): string {
  const formatted = decimals === 0 ? num(ratio * 100) : num1(ratio * 100);
  return `${formatted}${THIN}%`;
}

/** Porcentaje desde unidades de display: 52 → "52 %" */
export function pctValue(value: number, decimals = 0): string {
  const formatted = decimals === 0 ? num(value) : num1(value);
  return `${formatted}${THIN}%`;
}

/** Múltiplo: 35,4× */
export function times(value: number): string {
  return `${num1(value)}×`;
}

/** Firma explícita para deltas del P&L. */
export function signedM(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${num(Math.abs(value))}`;
}

export { THIN };
