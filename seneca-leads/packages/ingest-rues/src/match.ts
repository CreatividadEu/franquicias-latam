import { stripAccents } from '@seneca/shared';

/**
 * Pad-3 trigram similarity (Jaccard on character trigrams with leading/trailing
 * spaces). Matches Postgres pg_trgm.similarity() semantics closely enough that
 * scores carry the same meaning across our codebase.
 */
function trigrams(input: string): Set<string> {
  const s = `  ${stripAccents(input).toLowerCase().replace(/\s+/g, ' ').trim()}  `;
  const out = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    out.add(s.slice(i, i + 3));
  }
  return out;
}

export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  for (const t of ta) if (tb.has(t)) intersection++;
  const union = ta.size + tb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface RuesCandidate {
  matricula: string;
  nit?: string;
  razonSocial: string;
  estado?: string; // "ACTIVA" | "CANCELADA" | etc
  ciudad?: string;
  departamento?: string;
  ciiu?: string;
  matriculaDate?: string; // raw ISO or DD/MM/YYYY
  rawHtml?: string;
}

export interface ScoredCandidate {
  candidate: RuesCandidate;
  score: number;
  signals: {
    nameSimilarity: number;
    cityMatch: number;
    activeStatus: number;
  };
}

export function scoreCandidate(
  candidate: RuesCandidate,
  query: { nameNormalized: string; city: string },
): ScoredCandidate {
  const nameSimilarity = trigramSimilarity(query.nameNormalized, candidate.razonSocial);
  const cityMatch = matchCity(candidate, query.city);
  const activeStatus = candidate.estado?.toLowerCase().includes('activa') ? 1 : 0;

  const score = nameSimilarity * 0.6 + cityMatch * 0.3 + activeStatus * 0.1;

  return {
    candidate,
    score,
    signals: { nameSimilarity, cityMatch, activeStatus },
  };
}

function matchCity(candidate: RuesCandidate, expectedCity: string): number {
  const expected = stripAccents(expectedCity).toLowerCase();
  const actualCity = stripAccents(candidate.ciudad ?? '').toLowerCase();
  const actualDept = stripAccents(candidate.departamento ?? '').toLowerCase();
  if (!actualCity && !actualDept) return 0;
  // Bogotá matches both "bogota" and Cundinamarca region
  if (expected.includes('bogota')) {
    if (actualCity.includes('bogota') || actualDept.includes('bogota')) return 1;
    if (actualDept.includes('cundinamarca')) return 0.5;
    return 0;
  }
  if (actualCity === expected) return 1;
  if (actualCity.includes(expected) || expected.includes(actualCity)) return 0.7;
  return 0;
}

export interface MatchDecision {
  kind: 'auto_accept' | 'review_queue' | 'reject';
  best: ScoredCandidate | null;
  runnerUp?: ScoredCandidate;
}

export function decideMatch(
  query: { nameNormalized: string; city: string },
  candidates: RuesCandidate[],
): MatchDecision {
  if (candidates.length === 0) return { kind: 'reject', best: null };
  const scored = candidates
    .map((c) => scoreCandidate(c, query))
    .sort((a, b) => b.score - a.score);
  const best = scored[0]!;
  const runnerUp = scored[1];
  if (best.score >= 0.85) return { kind: 'auto_accept', best, runnerUp };
  if (best.score >= 0.65) return { kind: 'review_queue', best, runnerUp };
  return { kind: 'reject', best, runnerUp };
}
