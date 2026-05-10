/**
 * Re-derive Business.openedAt (and any other RUES-sourced fields we want to
 * backfill) from existing source='rues' Observation rows. Idempotent. No new
 * API calls. Run once after fixing parseRuesDate.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '@seneca/db';

/* eslint-disable no-console */

function parseRuesDate(s: string): Date | null {
  if (!s) return null;
  const compact = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return new Date(`${compact[1]}-${compact[2]}-${compact[3]}T00:00:00.000Z`);
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00.000Z`);
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}T00:00:00.000Z`);
  return null;
}

interface ObservationPayload {
  decision?: string;
  candidate?: {
    matricula?: string;
    nit?: string | null;
    razonSocial?: string;
    estado?: string;
    ciudad?: string;
    departamento?: string;
    ciiu?: string;
    matriculaDate?: string;
  };
}

async function main(): Promise<void> {
  const observations = await prisma.observation.findMany({
    where: { source: 'rues' },
    orderBy: { observedAt: 'desc' },
    select: { id: true, businessId: true, payload: true },
  });

  let updates = 0;
  let openedAtSet = 0;
  let alreadyOk = 0;
  let skipped = 0;

  // Group by businessId, take the latest observation per business
  const byBusiness = new Map<string, ObservationPayload>();
  for (const obs of observations) {
    const payload = obs.payload as ObservationPayload | null;
    if (!obs.businessId || !payload?.candidate) continue;
    if (payload.decision !== 'auto_accept') continue;
    if (!byBusiness.has(obs.businessId)) byBusiness.set(obs.businessId, payload);
  }

  for (const [businessId, payload] of byBusiness) {
    const c = payload.candidate;
    if (!c) {
      skipped++;
      continue;
    }
    const opened = c.matriculaDate ? parseRuesDate(c.matriculaDate) : null;
    if (!opened) {
      skipped++;
      continue;
    }

    const existing = await prisma.business.findUnique({
      where: { id: businessId },
      select: { openedAt: true },
    });

    if (existing?.openedAt && existing.openedAt.getTime() === opened.getTime()) {
      alreadyOk++;
      continue;
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { openedAt: opened },
    });
    openedAtSet++;
    updates++;
  }

  console.log('=== RUES reprocess ===');
  console.log(`auto_accept observations: ${byBusiness.size}`);
  console.log(`businesses updated:       ${updates}`);
  console.log(`openedAt set:             ${openedAtSet}`);
  console.log(`already correct:          ${alreadyOk}`);
  console.log(`skipped (no date):        ${skipped}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
