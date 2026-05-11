// Centralised env validation. Loaded once at startup so command handlers
// can rely on the parsed values without re-reading process.env every call.
//
// Load .env.local from the workspace root, not the package's cwd — keeps
// secrets in a single source-of-truth file shared with the dashboard and
// the ingest scripts (matches the pattern in scripts/*.ts).
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
loadDotenv({ path: resolve(__dirname, '../../../.env.local'), override: false });
loadDotenv({ override: false }); // fall through to .env in cwd too

import { childLogger } from '@seneca/shared';

const log = childLogger({ component: 'bot:env' });

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function parseIdList(raw: string | undefined): Set<number> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const n = Number(s);
        if (!Number.isInteger(n)) {
          throw new Error(`TELEGRAM_ALLOWED_USER_IDS contains non-integer: "${s}"`);
        }
        return n;
      }),
  );
}

export const env = {
  telegramBotToken: required('TELEGRAM_BOT_TOKEN'),
  // Comma-separated Telegram numeric user IDs. Anything outside this set
  // gets a polite "not authorised" reply — the bot must never serve lead
  // data to randoms who find it.
  allowedUserIds: parseIdList(process.env.TELEGRAM_ALLOWED_USER_IDS),
  // Optional: chat ID the worker process uses for new-lead notifications.
  // Falls back to the first allowed user if unset.
  alertChatId: process.env.TELEGRAM_ALERT_CHAT_ID?.trim() || undefined,
};

if (env.allowedUserIds.size === 0) {
  log.warn(
    'TELEGRAM_ALLOWED_USER_IDS is empty — the bot will reject every message. ' +
      'Set it to your Telegram user ID (DM @userinfobot to find yours).',
  );
}
