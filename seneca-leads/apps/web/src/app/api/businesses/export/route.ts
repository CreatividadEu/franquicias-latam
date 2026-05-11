// Streams the full businesses table as CSV. Picks up the same filter
// params as /businesses so users can export exactly what they're seeing.
//
// CSV (not XLSX) because Excel opens it natively, every spreadsheet tool
// supports it, and we avoid pulling exceljs/xlsx (~3 MB) as a dependency.
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = typeof value === 'string' ? value : String(value);
  // RFC 4180: wrap in quotes if contains comma, quote, or newline. Double
  // any internal quotes.
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const sector = searchParams.get('sector');
  const hasRues = searchParams.get('has_rues');
  const hasIg = searchParams.get('has_ig');
  const hasRappi = searchParams.get('has_rappi');
  const hasPains = searchParams.get('has_pains');
  const hasLead = searchParams.get('has_lead');

  const where = {
    ...(q ? { nameCanonical: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(sector ? { sector } : {}),
    ...(hasRues === '1' ? { ruesMatricula: { not: null } } : {}),
    ...(hasRues === '0' ? { ruesMatricula: null } : {}),
    ...(hasIg === '1' ? { igHandle: { not: null } } : {}),
    ...(hasIg === '0' ? { igHandle: null } : {}),
    ...(hasLead === '1' ? { salesLead: { isNot: null } } : {}),
    ...(hasLead === '0' ? { salesLead: null } : {}),
  };

  const businesses = await prisma.business.findMany({
    where,
    orderBy: [{ nameCanonical: 'asc' }],
    include: {
      snapshots: {
        orderBy: { date: 'desc' },
        take: 1,
        select: {
          googleReviewCount: true,
          googleRating: true,
          rappiPresent: true,
          rappiReviewCount: true,
          rappiRating: true,
          igFollowers: true,
          igEngagementRate: true,
        },
      },
      salesLead: {
        select: {
          id: true,
          cohort: true,
          status: true,
          tractionScore: true,
          painScore: true,
          fitScore: true,
          estRevenueLow: true,
          estRevenueHigh: true,
          revenueConfidence: true,
          serviceAngle: true,
        },
      },
      _count: { select: { painClusters: true, reviews: true } },
      sourceLinks: {
        select: { source: true, url: true },
      },
    },
  });

  // Apply the JS-side filters that don't translate to Prisma where cleanly.
  type Row = (typeof businesses)[number];
  let rows = businesses;
  if (hasRappi === '1') rows = rows.filter((b: Row) => b.snapshots[0]?.rappiPresent === true);
  if (hasRappi === '0') rows = rows.filter((b: Row) => b.snapshots[0]?.rappiPresent !== true);
  if (hasPains === '1') rows = rows.filter((b: Row) => b._count.painClusters > 0);
  if (hasPains === '0') rows = rows.filter((b: Row) => b._count.painClusters === 0);

  const headers = [
    'name',
    'sector',
    'city',
    'address',
    'phone',
    'domain',
    'nit',
    'rues_matricula',
    'legal_status',
    'opened_at',
    'lat',
    'lng',
    'ig_handle',
    'google_reviews',
    'google_rating',
    'ig_followers',
    'ig_engagement_pct',
    'rappi_present',
    'rappi_reviews',
    'rappi_rating',
    'pain_clusters',
    'reviews_in_db',
    'google_url',
    'rappi_url',
    'lead_cohort',
    'lead_status',
    'lead_traction_score',
    'lead_pain_score',
    'lead_fit_score',
    'lead_revenue_low_cop',
    'lead_revenue_high_cop',
    'lead_revenue_confidence',
    'lead_service_angle',
  ];

  const lines: string[] = [csvRow(headers)];
  for (const b of rows) {
    const snap = b.snapshots[0];
    const lead = b.salesLead;
    const linkBy = new Map(b.sourceLinks.map((sl: { source: string; url: string | null }) => [sl.source, sl.url]));
    lines.push(
      csvRow([
        b.nameCanonical,
        b.sector ?? '',
        b.city ?? '',
        b.address ?? '',
        b.phone ?? '',
        b.domain ?? '',
        b.nit ?? '',
        b.ruesMatricula ?? '',
        b.legalStatus ?? '',
        b.openedAt ? b.openedAt.toISOString().slice(0, 10) : '',
        b.lat ?? '',
        b.lng ?? '',
        b.igHandle ?? '',
        snap?.googleReviewCount ?? '',
        snap?.googleRating ?? '',
        snap?.igFollowers ?? '',
        snap?.igEngagementRate != null ? (snap.igEngagementRate * 100).toFixed(2) : '',
        snap?.rappiPresent ? 'yes' : 'no',
        snap?.rappiReviewCount ?? '',
        snap?.rappiRating ?? '',
        b._count.painClusters,
        b._count.reviews,
        linkBy.get('google_places') ?? '',
        linkBy.get('rappi') ?? '',
        lead?.cohort ?? '',
        lead?.status ?? '',
        lead?.tractionScore?.toFixed(3) ?? '',
        lead?.painScore?.toFixed(3) ?? '',
        lead?.fitScore?.toFixed(3) ?? '',
        lead?.estRevenueLow?.toString() ?? '',
        lead?.estRevenueHigh?.toString() ?? '',
        lead?.revenueConfidence?.toFixed(2) ?? '',
        lead?.serviceAngle ?? '',
      ]),
    );
  }

  // Prepend UTF-8 BOM so Excel opens it with proper encoding (otherwise
  // accented chars like "Bogotá" come out garbled on Windows Excel).
  const body = '﻿' + lines.join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="seneca-businesses-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
