// Lightweight Telegram sender for the worker process. Uses the raw Bot API
// over fetch — no grammY in workers, since we only need outbound send.
import { childLogger } from '@seneca/shared';
import { env } from './env.js';

const log = childLogger({ component: 'workers:notify' });

// Reserved MarkdownV2 chars per https://core.telegram.org/bots/api#markdownv2-style
const MD_V2_RESERVED = /[_*[\]()~`>#+\-=|{}.!\\]/g;

export function escMd(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '—';
  return String(text).replace(MD_V2_RESERVED, '\\$&');
}

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!env.telegramBotToken || !env.telegramAlertChatId) {
    log.warn('skipping telegram send — token or chat id unset');
    return;
  }

  const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.telegramAlertChatId,
        text,
        parse_mode: 'MarkdownV2',
        link_preview_options: { is_disabled: true },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      log.error({ status: res.status, body }, 'telegram send failed');
    }
  } catch (err) {
    log.error({ err }, 'telegram send threw');
  }
}
