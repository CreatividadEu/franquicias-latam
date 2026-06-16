// Worker env validation. Loaded once at startup; throws on missing required
// vars so the process fails loud rather than silently never enqueueing.
//
// Load .env.local from the workspace root, not the package's cwd — see
// apps/bot/src/env.ts for the same pattern.
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
loadDotenv({ path: resolve(__dirname, '../../../.env.local'), override: false });
loadDotenv({ override: false });

import { childLogger } from '@seneca/shared';

const log = childLogger({ component: 'workers:env' });

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim() === '') return undefined;
  return value.trim();
}

// BullMQ needs a TCP Redis URL (not the Upstash REST endpoint). Upstash
// gives you a "rediss://default:<password>@<host>:<port>" string under
// "Database details → TCP / Redis" — that's what goes in REDIS_URL.
export const env = {
  redisUrl: required('REDIS_URL'),
  telegramBotToken: optional('TELEGRAM_BOT_TOKEN'),
  // Numeric chat id (user or group) the notify:new-leads job posts to.
  // Falls back to the first id in TELEGRAM_ALLOWED_USER_IDS if unset.
  telegramAlertChatId:
    optional('TELEGRAM_ALERT_CHAT_ID') ??
    optional('TELEGRAM_ALLOWED_USER_IDS')?.split(',')[0]?.trim(),
};

if (!env.telegramBotToken || !env.telegramAlertChatId) {
  log.warn(
    'TELEGRAM_BOT_TOKEN or TELEGRAM_ALERT_CHAT_ID missing — notify:new-leads will skip sending.',
  );
}
