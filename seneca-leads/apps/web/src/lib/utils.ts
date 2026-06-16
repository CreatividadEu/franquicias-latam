import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCOP(value: bigint | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'bigint' ? Number(value) : value;
  if (num >= 1_000_000_000) return `COP ${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `COP ${(num / 1_000_000).toFixed(0)}M`;
  if (num >= 1_000) return `COP ${(num / 1_000).toFixed(0)}K`;
  return `COP ${num}`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
