// Schedule definitions. Each entry is one BullMQ "repeat" config attached
// to a named job. Times are UTC — the BullMQ docs are explicit that cron
// expressions without a timezone run in UTC.
//
// Cohort breakdown:
//   - Refresh ingestors weekly (Sunday early-morning Bogotá → Sunday 08:00 UTC)
//   - Resolve/extract/estimate/score nightly (03:00 Bogotá → 08:00 UTC)
//   - Notify hourly during sales hours (12:00–22:00 UTC = 07:00–17:00 Bogotá)
import { childLogger } from '@seneca/shared';
import { queue } from './queues.js';
import type { JobName } from './queues.js';

const log = childLogger({ component: 'workers:scheduler' });

type Schedule = {
  name: JobName;
  cron: string;
  comment: string;
};

const SCHEDULES: Schedule[] = [
  { name: 'refresh:google-places', cron: '0 8 * * 0', comment: 'Sun 03:00 Bogotá' },
  { name: 'refresh:rues',          cron: '15 8 * * 0', comment: 'Sun 03:15 Bogotá' },
  { name: 'refresh:rappi',         cron: '30 8 * * 0', comment: 'Sun 03:30 Bogotá' },
  { name: 'refresh:instagram',     cron: '45 8 1 * *', comment: '1st of month 03:45 Bogotá' },
  { name: 'resolve:entities',      cron: '0 8 * * *',  comment: 'Daily 03:00 Bogotá' },
  { name: 'extract:pains',         cron: '20 8 * * *', comment: 'Daily 03:20 Bogotá' },
  { name: 'estimate:revenue',      cron: '40 8 * * *', comment: 'Daily 03:40 Bogotá' },
  { name: 'score:leads',           cron: '50 8 * * *', comment: 'Daily 03:50 Bogotá' },
  { name: 'notify:new-leads',      cron: '0 12-22 * * *', comment: 'Hourly 07–17 Bogotá' },
];

export async function installSchedules(): Promise<void> {
  for (const s of SCHEDULES) {
    await queue.upsertJobScheduler(
      // Stable key so re-installing doesn't create duplicates.
      `scheduler:${s.name}`,
      { pattern: s.cron },
      {
        name: s.name,
        data: { scheduled: true },
        opts: { removeOnComplete: { count: 50 } },
      },
    );
    log.info({ job: s.name, cron: s.cron, when: s.comment }, 'scheduled');
  }
}
