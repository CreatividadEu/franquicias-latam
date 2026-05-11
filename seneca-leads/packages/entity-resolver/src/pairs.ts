/**
 * Candidate-pair generation. Per spec §3.1: pairs of businesses within the
 * same city + sector, sharing the first 3 normalized-name characters OR
 * within 200m geo. The intersection keeps pair count low (~5-50 pairs on a
 * 207-business set) so we can afford the per-pair composite score.
 */
import { prisma } from '@seneca/db';

export interface BusinessLite {
  id: string;
  nameNormalized: string;
  city: string | null;
  sector: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  domain: string | null;
  igHandle: string | null;
  createdAt: Date;
}

const GEO_PROXIMITY_M = 200;

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface CandidatePair {
  a: BusinessLite;
  b: BusinessLite;
  /** Why this pair was selected, for telemetry. */
  reason: 'name_prefix' | 'geo_near';
  distanceMeters?: number;
}

export async function loadCandidates(): Promise<BusinessLite[]> {
  return prisma.business.findMany({
    select: {
      id: true,
      nameNormalized: true,
      city: true,
      sector: true,
      lat: true,
      lng: true,
      phone: true,
      domain: true,
      igHandle: true,
      createdAt: true,
    },
  });
}

export function generatePairs(businesses: BusinessLite[]): CandidatePair[] {
  // Group by (city, sector) — pairs only form within the same bucket.
  const buckets = new Map<string, BusinessLite[]>();
  for (const b of businesses) {
    const key = `${b.city ?? '?'}|${b.sector ?? '?'}`;
    const arr = buckets.get(key) ?? [];
    arr.push(b);
    buckets.set(key, arr);
  }

  const pairs: CandidatePair[] = [];
  const seen = new Set<string>();
  const pairKey = (a: BusinessLite, b: BusinessLite): string =>
    a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;

  for (const bucket of buckets.values()) {
    // Index by first 3 normalized chars for the prefix predicate.
    const byPrefix = new Map<string, BusinessLite[]>();
    for (const b of bucket) {
      const p = b.nameNormalized.slice(0, 3);
      if (p.length < 3) continue;
      const arr = byPrefix.get(p) ?? [];
      arr.push(b);
      byPrefix.set(p, arr);
    }

    // Prefix-match pairs
    for (const group of byPrefix.values()) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i]!;
          const b = group[j]!;
          const k = pairKey(a, b);
          if (seen.has(k)) continue;
          seen.add(k);
          pairs.push({ a, b, reason: 'name_prefix' });
        }
      }
    }

    // Geo-near pairs (full O(n²) within bucket but each bucket is small)
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i]!;
        const b = bucket[j]!;
        if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) continue;
        const d = haversineMeters(
          { lat: a.lat, lng: a.lng },
          { lat: b.lat, lng: b.lng },
        );
        if (d > GEO_PROXIMITY_M) continue;
        const k = pairKey(a, b);
        if (seen.has(k)) continue;
        seen.add(k);
        pairs.push({ a, b, reason: 'geo_near', distanceMeters: d });
      }
    }
  }

  return pairs;
}
