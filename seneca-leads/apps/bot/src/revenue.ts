// Small COP formatter — duplicated here instead of pulling from @seneca/shared
// to keep the bot's import surface minimal. Same logic as apps/web/src/lib/utils.ts.
export function formatCOP(amount: bigint): string {
  const n = Number(amount);
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function formatCOPRange(low: bigint, high: bigint): string {
  return `${formatCOP(low)}–${formatCOP(high)} COP/mo`;
}
