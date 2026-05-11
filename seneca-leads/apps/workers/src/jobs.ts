// Job dispatch table. Each handler wraps a `run*()` from the intelligence
// packages, returning a small JSON-serializable summary that BullMQ stores
// on the completed job (useful for the bot / future ops UI).
import { runGooglePlacesIngest } from '@seneca/ingest-google';
import { runRuesIngest } from '@seneca/ingest-rues';
import { runRappiIngest } from '@seneca/ingest-rappi';
import { runInstagramIngest } from '@seneca/ingest-instagram';
import { runEntityResolver } from '@seneca/entity-resolver';
import { runPainExtractor } from '@seneca/pain-extractor';
import { runRevenueEstimator } from '@seneca/revenue-estimator';
import { runScorer } from '@seneca/scorer';
import { BOGOTA_SEEDS, childLogger } from '@seneca/shared';
import { prisma } from '@seneca/db';
import type { Job } from 'bullmq';
import { escMd, sendTelegramMessage } from './notify.js';
import type { JobName } from './queues.js';

const log = childLogger({ component: 'workers:jobs' });

type JobHandler = (job: Job) => Promise<Record<string, unknown>>;

export const jobHandlers: Record<JobName, JobHandler> = {
  'refresh:google-places': async () => {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) throw new Error('SERPAPI_KEY missing');
    const result = await runGooglePlacesIngest({
      apiKey,
      city: 'Bogotá',
      sector: 'restaurant',
      query: 'restaurantes',
      seeds: BOGOTA_SEEDS,
      pagesPerSeed: 2,
      fetchReviews: true,
    });
    return { ...result };
  },

  'refresh:rues': async () => {
    const result = await runRuesIngest({});
    return { ...result };
  },

  'refresh:rappi': async () => {
    const result = await runRappiIngest({});
    return { ...result };
  },

  'refresh:instagram': async () => {
    const apifyToken = process.env.APIFY_TOKEN;
    if (!apifyToken) throw new Error('APIFY_TOKEN missing');
    const result = await runInstagramIngest({ apifyToken, batchSize: 50 });
    return { ...result };
  },

  'resolve:entities': async () => {
    const result = await runEntityResolver({});
    return { ...result };
  },

  'extract:pains': async () => {
    const result = await runPainExtractor({});
    return { ...result };
  },

  'estimate:revenue': async () => {
    const result = await runRevenueEstimator({});
    return { ...result };
  },

  'score:leads': async () => {
    const result = await runScorer({});
    return { ...result };
  },

  'notify:new-leads': async (job) => {
    // Find SalesLeads whose underlying SalesLead row was created since the
    // previous scheduled run. The scheduler enqueues this hourly, so look
    // back 65 minutes to avoid a gap on slow runs.
    const since = new Date(Date.now() - 65 * 60 * 1000);
    const fresh = await prisma.salesLead.findMany({
      where: { createdAt: { gte: since } },
      orderBy: [{ fitScore: 'desc' }, { painScore: 'desc' }],
      take: 5,
      include: { business: { select: { nameCanonical: true, city: true, sector: true } } },
    });

    if (fresh.length === 0) {
      return { sent: 0, since: since.toISOString() };
    }

    const lines = [
      `*New leads in the last hour \\(${fresh.length}\\)*`,
      '',
      ...fresh.map((lead) => {
        const cityPart = lead.business.city ? ` · ${escMd(lead.business.city)}` : '';
        const sectorPart = lead.business.sector ? ` · ${escMd(lead.business.sector)}` : '';
        return (
          `${escMd(lead.business.nameCanonical)}${cityPart}${sectorPart}\n` +
          `  fit ${escMd(lead.fitScore.toFixed(2))} · pain ${escMd(
            lead.painScore.toFixed(2),
          )}\n` +
          `  \`/lead ${escMd(lead.id)}\``
        );
      }),
    ].join('\n');

    await sendTelegramMessage(lines);
    log.info({ jobId: job.id, sent: fresh.length }, 'notified new leads');
    return { sent: fresh.length, since: since.toISOString() };
  },
};
