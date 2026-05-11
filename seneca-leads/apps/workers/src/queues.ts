// Single BullMQ queue with named jobs. Dispatch is by job name in the worker
// handler — see jobs.ts. Keeping one queue (rather than one per job type)
// makes scheduling, monitoring, and worker scaling simpler; we don't have
// jobs with wildly different processing characteristics to justify the split.
import { Queue } from 'bullmq';
import { redis } from './redis.js';

export const QUEUE_NAME = 'seneca-jobs';

export type JobName =
  | 'refresh:google-places'
  | 'refresh:rues'
  | 'refresh:rappi'
  | 'refresh:instagram'
  | 'resolve:entities'
  | 'extract:pains'
  | 'estimate:revenue'
  | 'score:leads'
  | 'notify:new-leads';

export const ALL_JOB_NAMES: JobName[] = [
  'refresh:google-places',
  'refresh:rues',
  'refresh:rappi',
  'refresh:instagram',
  'resolve:entities',
  'extract:pains',
  'estimate:revenue',
  'score:leads',
  'notify:new-leads',
];

// Don't type-parameterise the queue with our JobName union — BullMQ's
// upsertJobScheduler ties the schedulerId param to the NameType, which
// forces the schedulerId to be one of our job names. We just want it to
// stay as plain `string` (the BullMQ default). The jobs.ts dispatcher
// narrows job.name to JobName at runtime.
export const queue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30_000 },
    // Keep last 100 completed jobs for inspection; trash the rest.
    removeOnComplete: { count: 100 },
    // Keep failures for a week so we can see what broke.
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});
