// Command handlers for the Telegram bot. Each handler receives a grammY
// Context and returns void; replies use MarkdownV2 (escape every dynamic
// value via the format.ts helpers).
import type { CommandContext, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { prisma } from '@seneca/db';
import {
  ALLOWED_STATUSES,
  b,
  cohortLabel,
  code,
  esc,
  formatPercent,
  formatRevenue,
  formatScore,
  link,
  statusLabel,
} from './format.js';

const MAX_LIST = 10;
const DEFAULT_LIST = 5;

type Ctx = CommandContext<Context>;

export async function startCommand(ctx: Ctx): Promise<void> {
  const name = esc(ctx.from?.first_name ?? 'there');
  await ctx.reply(
    `Hola ${name}\\! Soy el bot de Seneca Leads\\.\n\n` +
      `Mandame ${code('/top')} para ver los mejores leads, ` +
      `${code('/help')} para la lista completa\\.`,
    { parse_mode: 'MarkdownV2' },
  );
}

export async function helpCommand(ctx: Ctx): Promise<void> {
  const lines = [
    b('Commands'),
    '',
    `${code('/top [n]')} — top N leads by fit score \\(default ${DEFAULT_LIST}, max ${MAX_LIST}\\)`,
    `${code('/lead <id>')} — full dossier for a lead`,
    `${code('/status <id> <new\\|qualified\\|contacted\\|won\\|lost>')} — update lead status`,
    `${code('/cohort <name> [n]')} — top N in a cohort`,
    `${code('/help')} — this list`,
    '',
    b('Cohorts'),
    `${code('new_painful')}, ${code('mature_painful')}, ${code('mature_painful_inferred')}, ${code('steady_underrated')}, ${code('unscored')}`,
  ].join('\n');
  await ctx.reply(lines, { parse_mode: 'MarkdownV2' });
}

export async function topCommand(ctx: Ctx): Promise<void> {
  const requested = Number(ctx.match?.toString().trim() || DEFAULT_LIST);
  const n = Math.min(Math.max(Number.isFinite(requested) ? requested : DEFAULT_LIST, 1), MAX_LIST);

  const leads = await prisma.salesLead.findMany({
    where: { status: { not: 'lost' } },
    orderBy: [{ fitScore: 'desc' }, { painScore: 'desc' }],
    take: n,
    include: {
      business: {
        select: {
          nameCanonical: true,
          sector: true,
          city: true,
        },
      },
    },
  });

  if (leads.length === 0) {
    await ctx.reply('No hay leads todavia\\. Corre el scoring primero\\.', {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const lines = [b(`Top ${leads.length} leads`), ''];
  for (const lead of leads) {
    const { business: biz } = lead;
    const cityPart = biz.city ? ` · ${esc(biz.city)}` : '';
    const sectorPart = biz.sector ? ` · ${esc(biz.sector)}` : '';
    lines.push(
      `${b(biz.nameCanonical)}${cityPart}${sectorPart}\n` +
        `  fit ${esc(formatScore(lead.fitScore))} · pain ${esc(
          formatScore(lead.painScore),
        )} · ${esc(cohortLabel(lead.cohort))}\n` +
        `  ${code(`/lead ${lead.id}`)} · ${code(`/status ${lead.id} qualified`)}`,
    );
  }
  await ctx.reply(lines.join('\n\n'), { parse_mode: 'MarkdownV2' });
}

export async function cohortCommand(ctx: Ctx): Promise<void> {
  const args = (ctx.match?.toString() ?? '').trim().split(/\s+/).filter(Boolean);
  const cohort = args[0];
  if (!cohort) {
    await ctx.reply(
      `Usage: ${code('/cohort <name> [n]')}\\. Ejemplo: ${code('/cohort mature_painful_inferred 5')}`,
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }
  const requested = Number(args[1] ?? DEFAULT_LIST);
  const n = Math.min(Math.max(Number.isFinite(requested) ? requested : DEFAULT_LIST, 1), MAX_LIST);

  const leads = await prisma.salesLead.findMany({
    where: { cohort },
    orderBy: [{ fitScore: 'desc' }, { painScore: 'desc' }],
    take: n,
    include: {
      business: {
        select: { nameCanonical: true, sector: true, city: true },
      },
    },
  });

  if (leads.length === 0) {
    await ctx.reply(`Sin leads en cohort ${code(cohort)}\\.`, { parse_mode: 'MarkdownV2' });
    return;
  }

  const lines = [b(`${cohortLabel(cohort)} (${leads.length})`), ''];
  for (const lead of leads) {
    const { business: biz } = lead;
    const cityPart = biz.city ? ` · ${esc(biz.city)}` : '';
    lines.push(
      `${b(biz.nameCanonical)}${cityPart}\n` +
        `  fit ${esc(formatScore(lead.fitScore))} · pain ${esc(formatScore(lead.painScore))}\n` +
        `  ${code(`/lead ${lead.id}`)}`,
    );
  }
  await ctx.reply(lines.join('\n\n'), { parse_mode: 'MarkdownV2' });
}

export async function leadCommand(ctx: Ctx): Promise<void> {
  const id = ctx.match?.toString().trim();
  if (!id) {
    await ctx.reply(`Usage: ${code('/lead <id>')}`, { parse_mode: 'MarkdownV2' });
    return;
  }

  const lead = await prisma.salesLead.findUnique({
    where: { id },
    include: {
      business: {
        include: {
          sourceLinks: { select: { source: true, url: true } },
          painClusters: {
            include: {
              extractions: {
                orderBy: [{ severity: 'desc' }, { frequencyInSample: 'desc' }],
                take: 3,
              },
            },
          },
          snapshots: { orderBy: { date: 'desc' }, take: 1 },
        },
      },
    },
  });

  if (!lead) {
    await ctx.reply(`No encontre el lead ${code(id)}\\.`, { parse_mode: 'MarkdownV2' });
    return;
  }

  const { business: biz } = lead;
  const latest = biz.snapshots[0];
  const linkBy = new Map(biz.sourceLinks.map((sl) => [sl.source, sl.url]));
  const googleUrl = linkBy.get('google_places');
  const rappiUrl = linkBy.get('rappi');
  const igUrl = biz.igHandle ? `https://www.instagram.com/${biz.igHandle}` : null;

  const externalLinks: string[] = [];
  if (googleUrl) externalLinks.push(link('Google', googleUrl));
  if (rappiUrl) externalLinks.push(link('Rappi', rappiUrl));
  if (igUrl) externalLinks.push(link('Instagram', igUrl));

  const header = [
    b(biz.nameCanonical),
    [biz.city, biz.sector].filter(Boolean).map(esc).join(' · '),
    externalLinks.length > 0 ? externalLinks.join(' · ') : '',
  ]
    .filter(Boolean)
    .join('\n');

  const tractionLines: string[] = [];
  if (latest?.googleReviewCount != null && latest.googleRating != null) {
    tractionLines.push(
      `Google: ${esc(latest.googleReviewCount)} reviews · ⭐ ${esc(latest.googleRating.toFixed(1))}`,
    );
  }
  if (latest?.igFollowers != null) {
    const engagement = latest.igEngagementRate ?? 0;
    tractionLines.push(
      `Instagram: ${esc(latest.igFollowers)} followers · ${esc(formatPercent(engagement))} eng`,
    );
  }

  const scoreLine =
    `Cohort ${esc(cohortLabel(lead.cohort))} · status ${esc(statusLabel(lead.status))}\n` +
    `Fit ${esc(formatScore(lead.fitScore))} · pain ${esc(
      formatScore(lead.painScore),
    )} · traction ${esc(formatScore(lead.tractionScore))}`;

  const revenueLine = `Revenue: ${formatRevenue(
    lead.estRevenueLow,
    lead.estRevenueHigh,
    lead.revenueConfidence,
  )}`;

  const pains = biz.painClusters.flatMap((c) => c.extractions);
  const painLines =
    pains.length > 0
      ? [
          b('Top pains'),
          ...pains.map(
            (p) =>
              `• ${esc(p.category)}${p.subcategory ? `/${esc(p.subcategory)}` : ''} ` +
              `· sev ${esc(p.severity)} · ${esc(p.evidenceCount)} ev\n` +
              `  _${esc(p.representativeQuote.slice(0, 140))}_`,
          ),
        ].join('\n')
      : '_No pain extractions yet\\._';

  const serviceLine = lead.serviceAngle
    ? `${b('Service angle')}\n${esc(lead.serviceAngle)}`
    : '';

  const sections = [
    header,
    scoreLine,
    revenueLine,
    tractionLines.length > 0 ? tractionLines.join('\n') : '',
    painLines,
    serviceLine,
  ]
    .filter(Boolean)
    .join('\n\n');

  const kb = new InlineKeyboard()
    .text('Qualified', `status:${lead.id}:qualified`)
    .text('Contacted', `status:${lead.id}:contacted`)
    .row()
    .text('Won', `status:${lead.id}:won`)
    .text('Lost', `status:${lead.id}:lost`);

  await ctx.reply(sections, {
    parse_mode: 'MarkdownV2',
    reply_markup: kb,
    link_preview_options: { is_disabled: true },
  });
}

export async function statusCommand(ctx: Ctx): Promise<void> {
  const args = (ctx.match?.toString() ?? '').trim().split(/\s+/).filter(Boolean);
  const id = args[0];
  const next = args[1]?.toLowerCase();

  if (!id || !next) {
    await ctx.reply(
      `Usage: ${code('/status <id> <status>')}\\. Status: ${ALLOWED_STATUSES.map((s: string) => code(s)).join(', ')}\\.`,
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }
  if (!ALLOWED_STATUSES.includes(next)) {
    await ctx.reply(
      `Status ${code(next)} no es valido\\. Usa: ${ALLOWED_STATUSES.map((s: string) => code(s)).join(', ')}\\.`,
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  await applyStatusUpdate(ctx, id, next);
}

export async function statusCallbackHandler(ctx: Context): Promise<void> {
  const data = ctx.callbackQuery?.data;
  if (!data || !data.startsWith('status:')) return;
  const [, id, next] = data.split(':');
  if (!id || !next || !ALLOWED_STATUSES.includes(next)) {
    await ctx.answerCallbackQuery({ text: 'Status invalido' });
    return;
  }
  await applyStatusUpdate(ctx, id, next);
  await ctx.answerCallbackQuery({ text: `Status → ${statusLabel(next)}` });
}

async function applyStatusUpdate(ctx: Context, id: string, next: string): Promise<void> {
  const updated = await prisma.salesLead
    .update({
      where: { id },
      data: {
        status: next,
        contactedAt:
          next === 'contacted' || next === 'qualified' || next === 'won' ? new Date() : undefined,
      },
      include: { business: { select: { nameCanonical: true } } },
    })
    .catch(() => null);

  if (!updated) {
    await ctx.reply(`No encontre el lead ${code(id)}\\.`, { parse_mode: 'MarkdownV2' });
    return;
  }

  await ctx.reply(
    `${b(updated.business.nameCanonical)} → ${esc(statusLabel(next))}`,
    { parse_mode: 'MarkdownV2' },
  );
}
