// Single ioredis connection shared by all queues + workers. BullMQ requires
// `maxRetriesPerRequest: null` on the connection used by Worker/QueueScheduler;
// without it the worker will close after the first transient disconnect.
import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
