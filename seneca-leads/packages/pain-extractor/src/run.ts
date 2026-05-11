import { prisma } from '@seneca/db';
import {
  childLogger,
  stripPiiFromReview,
  type PainCategory,
} from '@seneca/shared';
import { embedBusinessReviews, loadReviewEmbeddings } from './embed.js';
import { centroid, cluster } from './cluster.js';
import { extractPains } from './extract.js';
import { synthesizeServiceAngle } from './synthesize.js';

const log = childLogger({ module: 'pain-extractor' });

const MIN_REVIEWS_PER_BUSINESS = 10;
const NEGATIVE_RATING_THRESHOLD = 3;

export interface RunPainExtractorInput {
  /** Smoke-test cap. Default: process all eligible businesses. */
  limit?: number;
  /** Skip the (expensive) Sonnet synthesis pass. */
  skipSynthesis?: boolean;
}

export interface RunPainExtractorResult {
  eligibleBusinesses: number;
  reviewsEmbedded: number;
  clustersCreated: number;
  painsExtracted: number;
  serviceAnglesWritten: number;
  errors: number;
  durationSeconds: number;
}

function vectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`;
}

export async function runPainExtractor(
  input: RunPainExtractorInput = {},
): Promise<RunPainExtractorResult> {
  const startedAt = Date.now();

  // Find businesses with at least MIN_REVIEWS_PER_BUSINESS Google reviews.
  // Fetch all with their review counts, then filter + slice in JS — 207 rows
  // is small enough that the extra HAVING/LIMIT SQL gymnastics aren't worth
  // the readability hit.
  const allWithCounts = await prisma.business.findMany({
    select: {
      id: true,
      nameCanonical: true,
      sector: true,
      city: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { reviews: { _count: 'desc' } },
  });
  let eligible = allWithCounts
    .filter((b) => b._count.reviews >= MIN_REVIEWS_PER_BUSINESS)
    .map((b) => ({
      id: b.id,
      name: b.nameCanonical,
      sector: b.sector,
      city: b.city,
      review_count: BigInt(b._count.reviews),
    }));
  if (input.limit) eligible = eligible.slice(0, input.limit);

  log.info(
    { eligibleBusinesses: eligible.length },
    'starting pain extraction',
  );

  const counters = {
    reviewsEmbedded: 0,
    clustersCreated: 0,
    painsExtracted: 0,
    serviceAnglesWritten: 0,
    errors: 0,
  };

  let scanned = 0;
  for (const biz of eligible) {
    scanned++;
    try {
      log.info(
        { scanned, total: eligible.length, name: biz.name, reviews: Number(biz.review_count) },
        'processing business',
      );

      // 1. Embed any reviews that don't have an embedding yet.
      const newlyEmbedded = await embedBusinessReviews(biz.id);
      counters.reviewsEmbedded += newlyEmbedded.length;

      // 2. Load ALL review embeddings for this business + their text + rating.
      const allEmbeddings = await loadReviewEmbeddings(biz.id);
      const reviewRows = await prisma.review.findMany({
        where: { businessId: biz.id, id: { in: Array.from(allEmbeddings.keys()) } },
        select: { id: true, rating: true, textOriginal: true },
      });

      // 3. Filter to negative reviews per spec (rating <= 3).
      const negatives = reviewRows.filter(
        (r) => r.rating <= NEGATIVE_RATING_THRESHOLD,
      );
      if (negatives.length < 3) {
        log.debug(
          { business: biz.name, negatives: negatives.length },
          'too few negative reviews to cluster',
        );
        continue;
      }

      // 4. Cluster the negative reviews.
      const vectors = negatives.map((r) => ({
        id: r.id,
        embedding: allEmbeddings.get(r.id)!,
      }));
      const clusterIds = cluster(vectors, {
        minClusterSize: 3,
        distanceThreshold: 0.35,
      });
      if (clusterIds.length === 0) {
        log.debug({ business: biz.name }, 'no clusters of size 3+');
        continue;
      }

      // 5. For each cluster, persist PainCluster + ReviewClusterLink and
      //    call Haiku for pain extraction.
      for (const memberIds of clusterIds) {
        const members = negatives.filter((r) => memberIds.includes(r.id));
        if (members.length === 0) continue;

        const memberVectors = members.map((r) => allEmbeddings.get(r.id)!);
        const c = centroid(memberVectors);
        const avgRating = members.reduce((s, r) => s + r.rating, 0) / members.length;

        // Sort most negative first for the prompt (lowest rating first).
        const sorted = [...members].sort((a, b) => a.rating - b.rating);

        // Insert PainCluster via Prisma's typed client (lets it handle the
        // cuid + createdAt), then set the centroid (pgvector column) via
        // raw UPDATE since Prisma marks the column Unsupported.
        const createdCluster = await prisma.painCluster.create({
          data: {
            businessId: biz.id,
            reviewCount: members.length,
            avgRating,
          },
          select: { id: true },
        });
        const clusterId = createdCluster.id;
        await prisma.$executeRaw`
          UPDATE pain_cluster
          SET centroid = ${vectorLiteral(c)}::vector
          WHERE id = ${clusterId}
        `;
        counters.clustersCreated++;

        // Link reviews to the cluster.
        await prisma.reviewClusterLink.createMany({
          data: sorted.map((r) => ({ reviewId: r.id, clusterId })),
          skipDuplicates: true,
        });

        // Call Haiku.
        const extraction = await extractPains({
          sector: biz.sector ?? 'restaurant',
          city: biz.city ?? 'Bogotá',
          nameCanonical: biz.name,
          reviews: sorted.map((r) => ({
            rating: r.rating,
            text: stripPiiFromReview(r.textOriginal),
          })),
        });

        if (!extraction.ok) {
          counters.errors++;
          log.warn(
            {
              business: biz.name,
              clusterId,
              reason: extraction.reason,
              ...(extraction.error ? { error: extraction.error } : {}),
            },
            'pain extraction failed',
          );
          continue;
        }

        // Persist PainExtraction rows.
        for (const pain of extraction.extraction.pains) {
          await prisma.painExtraction.create({
            data: {
              clusterId,
              category: pain.category as PainCategory,
              subcategory: pain.subcategory,
              severity: pain.severity,
              frequencyInSample: pain.frequency_in_sample,
              evidenceCount: pain.evidence_count,
              representativeQuote: pain.representative_quote,
              solutionHint: pain.solution_hint,
              modelVersion: extraction.modelVersion,
            },
          });
          counters.painsExtracted++;
        }
      }

      // 6. Optional Sonnet synthesis if we have ≥3 pains for this business.
      if (input.skipSynthesis) continue;

      const allPains = await prisma.painExtraction.findMany({
        where: { cluster: { businessId: biz.id } },
        select: {
          category: true,
          subcategory: true,
          severity: true,
          frequencyInSample: true,
          representativeQuote: true,
        },
      });
      if (allPains.length < 3) continue;

      const angle = await synthesizeServiceAngle({
        nameCanonical: biz.name,
        sector: biz.sector ?? 'restaurant',
        city: biz.city ?? 'Bogotá',
        pains: allPains.map((p) => ({
          category: p.category,
          subcategory: p.subcategory,
          severity: p.severity,
          frequency: p.frequencyInSample,
          representativeQuote: p.representativeQuote,
        })),
      });
      if (angle) {
        // Service angle is stored on SalesLead — but SalesLead doesn't exist
        // yet for this business (created by the scorer). Stash on an
        // Observation for the scorer to consume; SalesLead.upsert later.
        await prisma.observation.create({
          data: {
            businessId: biz.id,
            source: 'pain_extractor',
            sourceId: `service_angle:${biz.id}:${Date.now()}`,
            observedAt: new Date(),
            payload: {
              kind: 'service_angle',
              modelVersion: 'sonnet-4.6',
              text: angle,
            },
          },
        });
        counters.serviceAnglesWritten++;
      }
    } catch (err) {
      counters.errors++;
      log.error(
        {
          source: 'pain_extractor',
          sourceId: biz.id,
          name: biz.name,
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
        'pain extraction crashed for business',
      );
    }
  }

  return {
    eligibleBusinesses: eligible.length,
    reviewsEmbedded: counters.reviewsEmbedded,
    clustersCreated: counters.clustersCreated,
    painsExtracted: counters.painsExtracted,
    serviceAnglesWritten: counters.serviceAnglesWritten,
    errors: counters.errors,
    durationSeconds: (Date.now() - startedAt) / 1000,
  };
}
