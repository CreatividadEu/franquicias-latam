// Telegram message formatting helpers. We use MarkdownV2 throughout — it
// supports inline code, bold, italic, and links. Every dynamic value MUST
// be passed through `esc()` first; Telegram rejects messages with
// unescaped reserved characters.
import { formatCOPRange } from './revenue.js';

// Reserved MarkdownV2 chars per Telegram Bot API docs.
// https://core.telegram.org/bots/api#markdownv2-style
const MD_V2_RESERVED = /[_*[\]()~`>#+\-=|{}.!\\]/g;

export function esc(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '—';
  return String(text).replace(MD_V2_RESERVED, '\\$&');
}

// Bold but already-escaped — for static labels.
export function b(literal: string): string {
  return `*${esc(literal)}*`;
}

export function code(literal: string): string {
  return `\`${esc(literal)}\``;
}

export function link(label: string, url: string): string {
  // URLs in MarkdownV2 only need ) and \ escaped inside the parens.
  const safeUrl = url.replace(/[)\\]/g, '\\$&');
  return `[${esc(label)}](${safeUrl})`;
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function formatPercent(pct: number): string {
  return `${(pct * 100).toFixed(0)}%`;
}

export function formatRevenue(
  low: bigint | null | undefined,
  high: bigint | null | undefined,
  confidence: number | null | undefined,
): string {
  if (!low || !high) return '—';
  return `${esc(formatCOPRange(low, high))} _\\(${formatPercent(
    confidence ?? 0,
  )} conf\\)_`;
}

export type CohortLabel = {
  cohort: string;
  label: string;
};

export const COHORT_LABELS: Record<string, string> = {
  new_painful: 'New & painful',
  mature_painful: 'Mature & painful',
  mature_painful_inferred: 'Mature & painful (inferred)',
  steady_underrated: 'Steady & underrated',
  unscored: 'Unscored',
};

export function cohortLabel(cohort: string): string {
  return COHORT_LABELS[cohort] ?? cohort;
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  qualified: 'Qualified',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
};

export const ALLOWED_STATUSES = Object.keys(STATUS_LABELS);

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
