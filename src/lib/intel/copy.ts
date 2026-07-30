/**
 * Todos los textos del simulador, en es-CO. No hay framework de i18n: este
 * archivo es la única fuente de copy para que el modelo y los componentes no
 * mezclen lógica con redacción.
 */

import { copM, mShort, pctFromRatio, times, usdFromM } from "./format";
import { SMLMV, TRM, type ModelResult } from "./totto-model";

export const BRAND = {
  wordmark: "SENECA",
  wordmarkSuffix: "IP INTELLIGENCE",
  caseTag: "EXP · TOTTO-CO / NALSANI S.A.S.",
  headerRight: "Simulador de impacto financiero · Falsificación marcaria",
  confidential: "CONFIDENCIAL",
} as const;

export const HERO = {
  eyebrow: "Hemorragia estimada en curso — escenario sin protección",
  label: "Pérdida acumulada desde que abriste esta página",
  hint: "El contador corre sobre el daño anual estimado del escenario de inacción.",
} as const;

export const SECTIONS = {
  scenarios: "Escenario de respuesta",
  kpis: "Indicadores del escenario",
  assumptions: "Supuestos",
  assumptionsNote: "Editables · calibrar con data forense",
  anatomy: "Anatomía del daño anual",
  simulation: "Simulación 12 meses",
  simulationNote: "Daño acumulado · COP M",
  pl: "Impacto en el P&L · año 1",
  legal: "Palanca legal · indemnización preestablecida",
  legalNote: "Ley 1648/2013 · Decreto 2264/2014, recogido en D. 1074/2015",
  verdict: "Veredicto del modelo",
  method: "Metodología y anclas",
} as const;

export const KPI_LABELS = {
  dano: "Daño anual al P&L (inacción)",
  avoided: "Daño evitado año 1",
  recovered: "Ventas recuperadas",
  legal: "Recupero legal esperado",
  roi: "ROI año 1",
  payback: "Payback",
} as const;

export const ANATOMY_LABELS = {
  lostGP: "Utilidad bruta de ventas sustituidas",
  erosion: "Erosión de precio y descuento defensivo",
  clvYear: "CLV destruido (cuota anual)",
  mktLeak: "Inversión en marketing capturada por el falsificador",
  costosIncr: "Costos incrementales de defensa y control",
  total: "Daño anual total al P&L",
} as const;

export const CHART_LEGEND = {
  base: "Inacción — daño acumulado",
  plan: "Con plan — daño remanente + costo − recuperos",
  benefit: "Beneficio neto acumulado",
  payback: "Payback",
} as const;

export const PL_HEADERS = {
  line: "Línea del P&L",
  base: "Referencia",
  scenario: "Escenario",
  delta: "Δ",
} as const;

export const PL_BASE_NOTE = {
  inaction: "Δ contra un mundo sin falsificación",
  plan: "Δ contra el escenario de inacción",
} as const;

export const LEGAL_CELLS = {
  min: {
    label: "Piso legal",
    detail: "3 SMLMV por marca infringida",
  },
  max: {
    label: "Techo ordinario",
    detail: "100 SMLMV por marca infringida",
  },
  agg: {
    label: "Techo con agravantes",
    detail:
      "200 SMLMV — marca notoria, mala fe, riesgo a la salud (morrales escolares), reincidencia",
  },
  iva: {
    label: "IVA evadido / año",
    detail: "Daño al fisco — argumento de Fiscalía y DIAN-POLFA",
  },
} as const;

export const LEGAL_FOOT = `SMLMV 2026: COP ${new Intl.NumberFormat("es-CO").format(SMLMV).replace(/\./g, " ")} · la indemnización preestablecida se liquida por marca infringida y por infractor, sin necesidad de probar el monto del perjuicio.`;

export const GATE = {
  title: "Acceso restringido",
  subtitle: "Documento de trabajo confidencial · SENECA IP Intelligence",
  label: "Código de acceso",
  submit: "Entrar",
  error: "Código incorrecto.",
} as const;

/** Sublíneas de los KPI cuando el escenario es Inacción. */
export const KPI_INACTION_HINTS = {
  avoided: "No se contiene nada: el daño corre completo.",
  recovered: "Sin acción, la venta sustituida no vuelve.",
  legal: "Sin proceso no hay indemnización que liquidar.",
  roi: "No hay inversión, luego no hay retorno.",
  payback: "Nada que recuperar: el costo es el daño mismo.",
} as const;

/** Párrafo del veredicto, dependiente del escenario. */
export function verdict(result: ModelResult): string {
  const { damage, sim, plan } = result;

  if (plan.id === 0) {
    return (
      `El modelo estima ${copM(damage.danoPL)} de daño anual al P&L de Totto en Colombia ` +
      `(${pctFromRatio(damage.danoPctRev)} de los ingresos del país, ≈ ${usdFromM(damage.danoPL, TRM)}). ` +
      `Ese monto no aparece en ninguna línea del estado de resultados con el nombre "falsificación": ` +
      `se disfraza de ventas flojas, de presión de precio en el canal, de marketing que no rinde y de ` +
      `clientes que no vuelven. Es la pérdida más cara de todas, porque nadie la presupuesta y nadie la ` +
      `firma — se acepta por omisión, y crece a ${pctFromRatio(0.18, 0)} anual con el comercio ilícito.`
    );
  }

  const roi = sim.roi ?? 0;
  const payback = sim.payback;
  const paybackText = payback ? `mes ${payback}` : "más de 12 meses";

  return (
    `${plan.name} cuesta ${copM(sim.totalCost)} en el año 1 y devuelve ` +
    `${mShort(sim.avoided)} de daño evitado más ${mShort(sim.recNet)} de recuperos legales netos: ` +
    `un ROI de ${times(roi)} con payback en el ${paybackText}. ` +
    `Contra el escenario de inacción, el EBITDA del país mejora en ${mShort(result.deltaEbitda)}. ` +
    `Es 100 % variable y cancelable: la línea de inversión con mejor TIR del P&L, y la única que además ` +
    `construye un activo — expediente, precedente y disuasión sobre el mercado ilícito.`
  );
}

/** Nota al pie del gráfico de anatomía. */
export function anatomyNote(result: ModelResult): string {
  return `≈ ${pctFromRatio(result.damage.danoPctRev)} de los ingresos Colombia · ≈ ${usdFromM(result.damage.danoPL, TRM)}`;
}

export const METHOD = {
  title: "Metodología",
  body:
    "Daño anual al P&L = utilidad bruta de las ventas sustituidas (unidades falsificadas × tasa de " +
    "sustitución × ASP × margen bruto) + erosión de precio sobre los ingresos del país + cuota anual del " +
    "CLV destruido (clientes engañados que se dan cuenta × los que abandonan × CLV ÷ 3 años) + fuga de la " +
    "inversión en marketing (4 % de ingresos × % capturado) + costos incrementales de defensa y control. " +
    "Cada plan aplica una curva de efectividad creciente sobre el daño mensual, con el comercio ilícito " +
    "creciendo 18 % a.a.; los recuperos legales netos aterrizan de forma pareja entre los meses 7 y 12.",
  anchorsTottoTitle: "Anclas Totto / Nalsani",
  anchorsTotto: [
    "Ingresos 2025 > COP 827.000 M (≈ USD 240 M vs. ~214 M el año anterior)",
    "+520 tiendas · 45 mercados · ~40 % de las ventas fuera de Colombia (Modaes, jul-2026)",
    "Margen bruto histórico 51–53 %",
    "Relevo generacional hacia Benny Bursztyn (VP producto); Natalie Bursztyn lidera marketing",
  ],
  anchorsExtTitle: "Anclas externas",
  anchorsExt: [
    "OCDE/EUIPO 2025 — falsificaciones ≈ USD 467.000 M, 2,3 % del comercio mundial",
    "DIAN T1-2026 — aprehensiones +56,7 %; textil y manufacturas COP 38.392 M",
    "SMLMV 2026 COP 1.750.905 (Decretos 1469 y 1470 de 2025)",
    "TRM de referencia: 1 USD ≈ COP 4.000",
  ],
  disclaimer:
    "SENECA · House of Seneor — Documento de trabajo. Supuestos editables; calibrar con data forense del expediente.",
} as const;
