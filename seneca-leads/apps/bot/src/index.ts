// Seneca Leads Telegram bot. Long-polling by default for dev; the same
// build can be wrapped in a Vercel/Cloudflare handler when deployed.
import { Bot } from 'grammy';
import { childLogger } from '@seneca/shared';
import { env } from './env.js';
import {
  cohortCommand,
  helpCommand,
  leadCommand,
  startCommand,
  statusCallbackHandler,
  statusCommand,
  topCommand,
} from './commands.js';

const log = childLogger({ component: 'bot' });

const bot = new Bot(env.telegramBotToken);

// Allow-list middleware. Anything off the list gets a polite refusal —
// the bot must never serve lead data to randoms who guess the username.
bot.use(async (ctx, nextMiddleware) => {
  const userId = ctx.from?.id;
  if (userId === undefined) {
    return; // System message we can't authorise
  }
  if (!env.allowedUserIds.has(userId)) {
    log.warn({ userId, username: ctx.from?.username }, 'unauthorised user');
    await ctx.reply('Lo siento, no estas autorizado para usar este bot.');
    return;
  }
  await nextMiddleware();
});

bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('top', topCommand);
bot.command('cohort', cohortCommand);
bot.command('lead', leadCommand);
bot.command('status', statusCommand);

// Inline-button callbacks from the /lead dossier (Qualified/Contacted/Won/Lost).
bot.callbackQuery(/^status:/, statusCallbackHandler);

bot.catch((err) => {
  log.error({ err }, 'unhandled error');
});

// Graceful shutdown on SIGINT/SIGTERM so the underlying long-poll connection
// closes cleanly (otherwise Telegram keeps the previous bot instance running
// for a minute or so before timing out).
function shutdown(signal: NodeJS.Signals): void {
  log.info({ signal }, 'shutdown requested');
  bot.stop().finally(() => process.exit(0));
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

log.info('starting in long-polling mode');
bot.start({
  drop_pending_updates: true,
  onStart: (botInfo) => {
    log.info(
      { username: botInfo.username, allowedUsers: env.allowedUserIds.size },
      'bot ready',
    );
  },
});
