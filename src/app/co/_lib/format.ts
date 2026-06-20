// ── Colombia market — currency helpers (namespace-isolated under app/co) ──────

/**
 * Indicative COP per USD, used ONLY to render an approximate local-currency
 * reference on the Colombia landing. Franchise investment figures are stored in
 * USD (see `formatCurrency` in `@/lib/utils`), so any COP value derived from
 * them is shown as an explicit estimate ("≈", with a footnote). Keep this as a
 * round, clearly-approximate rate — it is a display aid, not a source of truth.
 */
export const COP_PER_USD = 4000;

/** Format a COP amount for the es-CO locale (no decimals). */
export const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);
