/**
 * Composite pair scoring per spec §3.1:
 *
 *   score = 0.40 * cosine(name_embed_a, name_embed_b)
 *         + 0.30 * geo_decay(distance_meters, scale=200)
 *         + 0.20 * phone_exact_match
 *         + 0.10 * (domain_match || ig_handle_match)
 *
 * geo_decay(d, s) = exp(-d / s).
 *
 * Decisions: ≥ 0.85 → auto_merge, 0.65–0.85 → review_queue, < 0.65 → ignore.
 */
import { cosineSimilarity } from './embed.js';
import type { BusinessLite, CandidatePair } from './pairs.js';

const W_NAME = 0.4;
const W_GEO = 0.3;
const W_PHONE = 0.2;
const W_DOMAIN_OR_IG = 0.1;
const GEO_SCALE_M = 200;

function geoDecay(distanceM: number): number {
  return Math.exp(-distanceM / GEO_SCALE_M);
}

function normPhone(p: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/\D+/g, '');
  return digits.length >= 7 ? digits : null;
}

function distanceMaybe(a: BusinessLite, b: BusinessLite): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface PairScore {
  pair: CandidatePair;
  score: number;
  signals: {
    nameCosine: number;
    geoDecay: number | null;
    phoneMatch: boolean;
    domainOrIgMatch: boolean;
  };
}

export function scorePair(
  pair: CandidatePair,
  embeddings: Map<string, number[]>,
): PairScore {
  const va = embeddings.get(pair.a.id);
  const vb = embeddings.get(pair.b.id);
  const nameCosine = va && vb ? cosineSimilarity(va, vb) : 0;

  const d = pair.distanceMeters ?? distanceMaybe(pair.a, pair.b);
  const geoComponent = d !== null ? geoDecay(d) : 0;

  const pa = normPhone(pair.a.phone);
  const pb = normPhone(pair.b.phone);
  const phoneMatch = pa !== null && pa === pb;

  const domainMatch =
    !!pair.a.domain && !!pair.b.domain && pair.a.domain === pair.b.domain;
  const igMatch =
    !!pair.a.igHandle && !!pair.b.igHandle && pair.a.igHandle === pair.b.igHandle;
  const domainOrIg = domainMatch || igMatch;

  const score =
    W_NAME * nameCosine +
    W_GEO * geoComponent +
    W_PHONE * (phoneMatch ? 1 : 0) +
    W_DOMAIN_OR_IG * (domainOrIg ? 1 : 0);

  return {
    pair,
    score,
    signals: {
      nameCosine,
      geoDecay: d !== null ? geoComponent : null,
      phoneMatch,
      domainOrIgMatch: domainOrIg,
    },
  };
}

export type Decision = 'auto_merge' | 'review_queue' | 'reject';

export function decisionOf(score: number): Decision {
  if (score >= 0.85) return 'auto_merge';
  if (score >= 0.65) return 'review_queue';
  return 'reject';
}
