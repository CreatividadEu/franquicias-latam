/**
 * Enhancement 1: backfill NITs from parent SAS observations.
 *
 * In Bogotá, a restaurant's brand ("LA PUERTA FALSA") is registered as an
 * "establecimiento de comercio" with no NIT. Its legal owner ("DE LA PUERTA
 * FALSA PARA COLOMBIA S.A.S.") is a SAS with a NIT — and usually appears in
 * the SAME RUES query response. This script walks every auto-accept
 * Observation, finds the parent SAS in the saved `allCandidates`, and
 * backfills the parent's NIT onto the Business row.
 *
 * Heuristic for parenthood:
 *   - parent record is a SOCIEDAD/SAS (desc_tipo_sociedad contains "SOCIEDAD"
 *     or razon_social ends with SAS/S.A.S./LTDA/S.A./S.C.A./E.U.)
 *   - parent has a non-null NIT
 *   - ≥ 80% of the brand's tokens appear in the parent's razon_social
 *     (case-insensitive, accent-stripped, ignoring stopwords/legal suffixes)
 *
 * Idempotent: re-runnable. Writes a new "parent_link" Observation per backfill.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import type { Prisma } from '@seneca/db';
import { prisma } from '@seneca/db';
import { stripAccents } from '@seneca/shared';

/* eslint-disable no-console */

const LEGAL_SUFFIXES = /\b(s\.?a\.?s\.?|ltda\.?|s\.?a\.?|e\.?u\.?|s\.?c\.?a\.?|sas|inc\.?|llc\.?)\b/g;
const STOPWORDS = new Set(['de', 'la', 'el', 'los', 'las', 'y', 'del', 'al', 'por', 'para']);

function tokenize(name: string): string[] {
  if (!name) return [];
  return stripAccents(name)
    .toLowerCase()
    .replace(LEGAL_SUFFIXES, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function tokenOverlap(brandTokens: string[], parentTokens: string[]): number {
  if (brandTokens.length === 0) return 0;
  const parentSet = new Set(parentTokens);
  let hits = 0;
  for (const t of brandTokens) if (parentSet.has(t)) hits++;
  return hits / brandTokens.length;
}

interface RuesCandidateLite {
  matricula?: string;
  nit?: string;
  razonSocial?: string;
  estado?: string;
  ciudad?: string;
  rawHtml?: string;
}

interface ObservationPayload {
  decision?: string;
  candidate?: RuesCandidateLite;
  allCandidates?: RuesCandidateLite[];
}

function isSociedad(c: RuesCandidateLite): boolean {
  if (!c.razonSocial) return false;
  // Either the rawHtml (which we stored as JSON.stringify of _source) mentions
  // SOCIEDAD, or the razon social ends with SAS/LTDA/S.A.
  if (/SOCIEDAD/i.test(c.rawHtml ?? '')) return true;
  if (/\b(s\.?a\.?s\.?|ltda\.?|s\.?a\.?|e\.?u\.?)\.?\s*$/i.test(c.razonSocial)) return true;
  return false;
}

async function main(): Promise<void> {
  const observations = await prisma.observation.findMany({
    where: { source: 'rues' },
    orderBy: { observedAt: 'desc' },
    select: { id: true, businessId: true, payload: true, observedAt: true },
  });

  // Take the latest auto_accept obs per business
  const byBusiness = new Map<string, ObservationPayload>();
  for (const obs of observations) {
    const payload = obs.payload as ObservationPayload | null;
    if (!obs.businessId || !payload) continue;
    if (payload.decision !== 'auto_accept') continue;
    if (!byBusiness.has(obs.businessId)) byBusiness.set(obs.businessId, payload);
  }

  let candidatesProcessed = 0;
  let parentsFound = 0;
  let nitsBackfilled = 0;
  let alreadyHadNit = 0;
  let noParent = 0;

  for (const [businessId, payload] of byBusiness) {
    candidatesProcessed++;
    const brand = payload.candidate;
    if (!brand?.razonSocial) continue;

    // If brand candidate already has a NIT, nothing to do
    const existing = await prisma.business.findUnique({
      where: { id: businessId },
      select: { nit: true, nameCanonical: true },
    });
    if (existing?.nit) {
      alreadyHadNit++;
      continue;
    }

    const brandTokens = tokenize(brand.razonSocial);
    if (brandTokens.length === 0) continue;

    // Look through allCandidates for a parent SAS
    const candidates = payload.allCandidates ?? [];
    let bestParent: { c: RuesCandidateLite; overlap: number } | null = null;
    for (const c of candidates) {
      if (!c.razonSocial || !c.nit) continue;
      if (!isSociedad(c)) continue;
      const parentTokens = tokenize(c.razonSocial);
      if (parentTokens.length === 0) continue;
      const overlap = tokenOverlap(brandTokens, parentTokens);
      if (overlap < 0.8) continue;
      if (!bestParent || overlap > bestParent.overlap) bestParent = { c, overlap };
    }

    if (!bestParent) {
      noParent++;
      continue;
    }

    parentsFound++;
    const parent = bestParent.c;
    if (!parent.nit) continue;

    await prisma.$transaction([
      prisma.business.update({
        where: { id: businessId },
        data: { nit: parent.nit },
      }),
      prisma.observation.create({
        data: {
          businessId,
          source: 'rues',
          sourceId: `parent_link:${businessId}:${Date.now()}`,
          observedAt: new Date(),
          payload: {
            decision: 'parent_link',
            childMatricula: brand.matricula,
            childRazonSocial: brand.razonSocial,
            parentNit: parent.nit,
            parentRazonSocial: parent.razonSocial,
            tokenOverlap: bestParent.overlap,
            brandTokens,
            parentTokens: tokenize(parent.razonSocial),
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);
    nitsBackfilled++;
    console.log(
      `  ${(existing?.nameCanonical ?? businessId).padEnd(35)}  ← ${parent.nit}  (${(bestParent.overlap * 100).toFixed(0)}% overlap)`,
    );
  }

  console.log('\n=== NIT backfill from parent SAS ===');
  console.log(`auto_accept observations: ${byBusiness.size}`);
  console.log(`processed:                ${candidatesProcessed}`);
  console.log(`already had NIT:          ${alreadyHadNit}`);
  console.log(`parent SAS found:         ${parentsFound}`);
  console.log(`NITs backfilled:          ${nitsBackfilled}`);
  console.log(`no parent found:          ${noParent}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
