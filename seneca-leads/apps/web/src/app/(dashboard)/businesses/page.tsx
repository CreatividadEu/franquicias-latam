// Full businesses table — every Business row, regardless of whether the
// scorer promoted it to a SalesLead. This is the universe view; /leads is
// the "scored & qualified" subset.
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight, Check, Download, Minus } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  sector?: string;
  has_rues?: string;
  has_rappi?: string;
  has_ig?: string;
  has_pains?: string;
  has_lead?: string;
}

export default async function BusinessesPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;

  const where = {
    ...(sp.q ? { nameCanonical: { contains: sp.q, mode: 'insensitive' as const } } : {}),
    ...(sp.sector ? { sector: sp.sector } : {}),
    ...(sp.has_rues === '1' ? { ruesMatricula: { not: null } } : {}),
    ...(sp.has_rues === '0' ? { ruesMatricula: null } : {}),
    ...(sp.has_ig === '1' ? { igHandle: { not: null } } : {}),
    ...(sp.has_ig === '0' ? { igHandle: null } : {}),
    ...(sp.has_lead === '1' ? { salesLead: { isNot: null } } : {}),
    ...(sp.has_lead === '0' ? { salesLead: null } : {}),
  };

  const [businesses, sectorCounts, total] = await Promise.all([
    prisma.business.findMany({
      where,
      orderBy: [{ nameCanonical: 'asc' }],
      include: {
        snapshots: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { googleReviewCount: true, googleRating: true, rappiPresent: true, igFollowers: true },
        },
        salesLead: { select: { id: true, status: true, cohort: true, fitScore: true } },
        _count: { select: { painClusters: true, reviews: true } },
      },
    }),
    prisma.business.groupBy({
      by: ['sector'],
      _count: { _all: true },
      orderBy: { _count: { sector: 'desc' } },
    }),
    prisma.business.count(),
  ]);

  // Filter rappi/pains in JS — Prisma's count-based filtering across joins
  // is awkward and these are cheap to do client-side at 207 rows.
  type Row = (typeof businesses)[number];
  let filtered = businesses;
  if (sp.has_rappi === '1') filtered = filtered.filter((b: Row) => b.snapshots[0]?.rappiPresent === true);
  if (sp.has_rappi === '0') filtered = filtered.filter((b: Row) => b.snapshots[0]?.rappiPresent !== true);
  if (sp.has_pains === '1') filtered = filtered.filter((b: Row) => b._count.painClusters > 0);
  if (sp.has_pains === '0') filtered = filtered.filter((b: Row) => b._count.painClusters === 0);

  // Build the export URL preserving current filters so users get exactly
  // what they're seeing on screen.
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value) exportParams.set(key, value);
  }
  const exportHref = `/api/businesses/export${exportParams.toString() ? `?${exportParams}` : ''}`;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Businesses</h1>
          <p className="text-sm text-foreground-muted mt-0.5">
            {filtered.length} of {total} ingested
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-background-elevated text-sm hover:border-accent hover:text-accent transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </header>

      {/* FILTERS */}
      <form className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Search by name…"
          className="h-9 w-56 rounded-md border border-border bg-background-elevated px-3 text-sm placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          name="sector"
          defaultValue={sp.sector ?? ''}
          className="h-9 rounded-md border border-border bg-background-elevated px-3 text-sm"
        >
          <option value="">All sectors</option>
          {sectorCounts.map((s: (typeof sectorCounts)[number]) => (
            <option key={s.sector ?? 'none'} value={s.sector ?? ''}>
              {s.sector ?? '(none)'} ({s._count._all})
            </option>
          ))}
        </select>
        {[
          { name: 'has_rues', label: 'RUES' },
          { name: 'has_rappi', label: 'Rappi' },
          { name: 'has_ig', label: 'Instagram' },
          { name: 'has_pains', label: 'Pains' },
          { name: 'has_lead', label: 'Lead' },
        ].map((f) => (
          <select
            key={f.name}
            name={f.name}
            defaultValue={(sp as Record<string, string | undefined>)[f.name] ?? ''}
            className="h-9 rounded-md border border-border bg-background-elevated px-3 text-sm"
          >
            <option value="">{f.label}: any</option>
            <option value="1">{f.label}: yes</option>
            <option value="0">{f.label}: no</option>
          </select>
        ))}
        <button
          type="submit"
          className="h-9 px-3 rounded-md bg-accent text-background text-sm font-medium hover:opacity-90"
        >
          Apply
        </button>
        <Link
          href="/businesses"
          className="h-9 px-3 inline-flex items-center text-sm text-foreground-muted hover:text-foreground"
        >
          Reset
        </Link>
      </form>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Sector · City</TableHead>
                <TableHead className="text-right">Reviews</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-center">RUES</TableHead>
                <TableHead className="text-center">Rappi</TableHead>
                <TableHead className="text-center">IG</TableHead>
                <TableHead className="text-right">Pains</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="text-right">Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b: Row) => {
                const snap = b.snapshots[0];
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{b.nameCanonical}</div>
                      <div className="text-xs text-foreground-subtle tabular-nums">
                        {b.nit ? `NIT ${b.nit}` : b.ruesMatricula ? `MAT ${b.ruesMatricula}` : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground-muted">
                      <div>{b.sector ?? '—'}</div>
                      <div className="text-xs text-foreground-subtle">{b.city ?? '—'}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {snap?.googleReviewCount ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {snap?.googleRating?.toFixed(1) ?? '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.ruesMatricula ? (
                        <Check className="h-4 w-4 text-success inline" />
                      ) : (
                        <Minus className="h-4 w-4 text-foreground-subtle inline" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {snap?.rappiPresent ? (
                        <Check className="h-4 w-4 text-success inline" />
                      ) : (
                        <Minus className="h-4 w-4 text-foreground-subtle inline" />
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {b.igHandle ? (
                        <span className="text-accent">@{b.igHandle}</span>
                      ) : (
                        <Minus className="h-4 w-4 text-foreground-subtle inline" />
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {b._count.painClusters > 0 ? (
                        <span className="text-accent">{b._count.painClusters}</span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {b.salesLead ? (
                        <Link
                          href={`/leads/${b.salesLead.id}`}
                          className="inline-flex items-center gap-1 hover:text-accent"
                        >
                          <Badge variant="accent" className="text-xs">
                            {b.salesLead.cohort.replace('mature_painful_inferred', 'inferred')}
                          </Badge>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-foreground-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-foreground-muted tabular-nums">
                      {b.openedAt ? formatDate(b.openedAt) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-foreground-subtle">
              No businesses match these filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
