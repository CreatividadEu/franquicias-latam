// Manual job enqueue — `pnpm -F @seneca/workers enqueue <job-name>`. Useful
// for triggering a one-off refresh from your laptop without waiting for the
// cron, or for backfilling after a scheduler outage.
import { childLogger } from '@seneca/shared';
import { ALL_JOB_NAMES, queue } from './queues.js';
import type { JobName } from './queues.js';
import { redis } from './redis.js';

const log = childLogger({ component: 'workers:cli' });

function isJobName(s: string): s is JobName {
  return (ALL_JOB_NAMES as readonly string[]).includes(s);
}

async function main(): Promise<void> {
  const name = process.argv[2];
  if (!name) {
    process.stderr.write(
      `Usage: pnpm -F @seneca/workers enqueue <job-name>\n\n` +
        `Available jobs:\n` +
        ALL_JOB_NAMES.map((n) => `  ${n}`).join('\n') +
        '\n',
    );
    process.exit(1);
  }
  if (!isJobName(name)) {
    process.stderr.write(`Unknown job "${name}". See list above.\n`);
    process.exit(1);
  }

  const job = await queue.add(name, { manual: true });
  log.info({ jobId: job.id, name }, 'enqueued');

  await queue.close();
  await redis.quit();
}

main().catch((err) => {
  log.error({ err }, 'enqueue failed');
  process.exit(1);
});
