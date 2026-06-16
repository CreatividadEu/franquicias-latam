/**
 * Agglomerative single-linkage clustering for review embeddings.
 *
 * Why not the npm `hdbscan` package: only alpha pre-releases exist
 * (0.0.1-alpha.5). Spec's intent is "group similar reviews together with
 * min_cluster_size=3" — agglomerative + cosine threshold delivers that
 * deterministically in ~30 lines, with no fragile dep.
 *
 * Algorithm:
 *   - Start with each point as its own cluster.
 *   - At each step, find the closest pair of clusters (single-linkage:
 *     min cosine distance between any pair of points).
 *   - Merge them.
 *   - Stop when the next merge would cross the distance threshold.
 *   - Drop clusters with size < minClusterSize.
 *
 * Complexity is O(n³) worst case, fine for ≤ 200 reviews per business.
 */
import { cosineSimilarity } from './embed.js';

export interface ClusterOptions {
  /** Cosine distance threshold above which we stop merging. 0.35 ≈ topically related. */
  distanceThreshold?: number;
  /** Drop clusters smaller than this. Spec: 3. */
  minClusterSize?: number;
}

export function cluster(
  vectors: Array<{ id: string; embedding: number[] }>,
  opts: ClusterOptions = {},
): string[][] {
  const distanceThreshold = opts.distanceThreshold ?? 0.35;
  const minClusterSize = opts.minClusterSize ?? 3;

  if (vectors.length === 0) return [];

  // Each cluster is the array of original-index members.
  const clusters: number[][] = vectors.map((_, i) => [i]);

  function clusterDistance(a: number[], b: number[]): number {
    let min = Infinity;
    for (const i of a) {
      for (const j of b) {
        const sim = cosineSimilarity(
          vectors[i]!.embedding,
          vectors[j]!.embedding,
        );
        const d = 1 - sim;
        if (d < min) min = d;
      }
    }
    return min;
  }

  while (clusters.length > 1) {
    let bestI = -1;
    let bestJ = -1;
    let bestD = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDistance(clusters[i]!, clusters[j]!);
        if (d < bestD) {
          bestD = d;
          bestI = i;
          bestJ = j;
        }
      }
    }
    if (bestD > distanceThreshold) break;
    // Merge bestJ into bestI
    clusters[bestI] = [...clusters[bestI]!, ...clusters[bestJ]!];
    clusters.splice(bestJ, 1);
  }

  return clusters
    .filter((c) => c.length >= minClusterSize)
    .map((c) => c.map((idx) => vectors[idx]!.id));
}

/** Centroid of a set of vectors (mean per dimension). */
export function centroid(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dims = vectors[0]!.length;
  const out = new Array(dims).fill(0) as number[];
  for (const v of vectors) {
    for (let i = 0; i < dims; i++) out[i]! += v[i]!;
  }
  for (let i = 0; i < dims; i++) out[i]! /= vectors.length;
  return out;
}
