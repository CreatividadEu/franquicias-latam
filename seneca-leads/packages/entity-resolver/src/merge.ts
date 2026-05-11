/**
 * Merge two Business rows into one. Per spec §3.1:
 *   - Keep the oldest business.id (the one with the earliest createdAt)
 *   - Transfer all BusinessSourceLink, Observation, Review, Snapshot,
 *     BusinessAlias from the losing row to the winner
 *   - Add the losing row's nameCanonical as an alias on the winner
 *   - Delete the losing row — all in one transaction
 */
import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';

export interface MergeInput {
  /** Which one wins. Caller picks the older row. */
  winnerId: string;
  loserId: string;
  loserNameCanonical: string;
  decisionScore: number;
  signals: Record<string, unknown>;
}

export async function mergeBusinesses(input: MergeInput): Promise<void> {
  if (input.winnerId === input.loserId) {
    throw new Error('cannot merge a business with itself');
  }
  await prisma.$transaction(async (tx) => {
    // 1. Move BusinessSourceLink rows; collisions (same source, sourceId
    //    already on winner) are dropped — they're true duplicates and the
    //    winner already has the link.
    await tx.$executeRaw`
      UPDATE business_source_link
      SET business_id = ${input.winnerId}
      WHERE business_id = ${input.loserId}
        AND NOT EXISTS (
          SELECT 1 FROM business_source_link x
          WHERE x.business_id = ${input.winnerId}
            AND x.source = business_source_link.source
            AND x.source_id = business_source_link.source_id
        )
    `;

    // 2. Move Observation rows
    await tx.observation.updateMany({
      where: { businessId: input.loserId },
      data: { businessId: input.winnerId },
    });

    // 3. Move Review rows (review.source_externalId is unique; loser's review
    //    can't collide with winner's since the source has the same external id
    //    only once).
    await tx.review.updateMany({
      where: { businessId: input.loserId },
      data: { businessId: input.winnerId },
    });

    // 4. Move Snapshot rows. (businessId, date) is unique; loser's snapshot on
    //    a date the winner also has is dropped — the winner's data wins.
    await tx.$executeRaw`
      UPDATE snapshot
      SET business_id = ${input.winnerId}
      WHERE business_id = ${input.loserId}
        AND NOT EXISTS (
          SELECT 1 FROM snapshot x
          WHERE x.business_id = ${input.winnerId} AND x.date = snapshot.date
        )
    `;

    // 5. Move BusinessAlias rows (and dedupe).
    await tx.$executeRaw`
      UPDATE business_alias
      SET business_id = ${input.winnerId}
      WHERE business_id = ${input.loserId}
        AND NOT EXISTS (
          SELECT 1 FROM business_alias x
          WHERE x.business_id = ${input.winnerId}
            AND x.alias = business_alias.alias
            AND x.source = business_alias.source
        )
    `;

    // 6. Record the loser's canonical name as a new alias on the winner.
    await tx.businessAlias.upsert({
      where: {
        businessId_alias_source: {
          businessId: input.winnerId,
          alias: input.loserNameCanonical,
          source: 'merged',
        },
      },
      create: {
        businessId: input.winnerId,
        alias: input.loserNameCanonical,
        source: 'merged',
      },
      update: {},
    });

    // 7. Write an Observation row capturing the merge — append-only audit.
    await tx.observation.create({
      data: {
        businessId: input.winnerId,
        source: 'entity_resolver',
        sourceId: `merge:${input.loserId}->${input.winnerId}:${Date.now()}`,
        observedAt: new Date(),
        payload: {
          decision: 'auto_merge',
          loserId: input.loserId,
          loserNameCanonical: input.loserNameCanonical,
          score: input.decisionScore,
          signals: input.signals,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // 8. Cascade-deletes handle PainCluster, SalesLead, BusinessEmbedding.
    await tx.business.delete({ where: { id: input.loserId } });
  });
}
