// Worker entry. Boots one BullMQ Worker over the seneca-jobs queue and
// installs the repeatable schedules in scheduler.ts. Run with `pnpm dev`
// (watch mode) for local development or `pnpm start` in production.
import { Worker } from 'bullmq';
import { childLogger } from '@seneca/shared';
import { jobHandlers } from './jobs.js';
import { redis } from './redis.js';
import { installSchedules } from './scheduler.js';
import { QUEUE_NAME, queue } from './queues.js';
import type { JobName } from './queues.js';

const log = childLogger({ component: 'workers' });

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const handler = jobHandlers[job.name as JobName];
    if (!handler) {
      throw new Error(`No handler for job "${job.name}"`);
    }
    const startedAt = Date.now();
    log.info({ jobId: job.id, name: job.name }, 'job started');
    const result = await handler(job);
    log.info(
      { jobId: job.id, name: job.name, ms: Date.now() - startedAt, result },
      'job completed',
    );
    return result;
  },
  {
    connection: redis,
    // One job at a time — most jobs are I/O-heavy (SerpAPI, Anthropic, Apify)
    // and we don't want to ddos those provider APIs by running parallel.
    concurrency: 1,
    // Most jobs are slow; give them 25 minutes before BullMQ marks stalled.
    lockDuration: 25 * 60 * 1000,
  },
);

worker.on('failed', (job, err) => {
  log.error(
    { jobId: job?.id, name: job?.name, attemptsMade: job?.attemptsMade, err },
    'job failed',
  );
});

worker.on('error', (err) => {
  log.error({ err }, 'worker error');
});

function shutdown(signal: NodeJS.Signals): void {
  log.info({ signal }, 'shutdown requested');
  Promise.allSettled([worker.close(), queue.close(), redis.quit()]).finally(() =>
    process.exit(0),
  );
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

installSchedules()
  .then(() => log.info('worker ready'))
  .catch((err) => {
    log.error({ err }, 'failed to install schedules');
    process.exit(1);
  });
