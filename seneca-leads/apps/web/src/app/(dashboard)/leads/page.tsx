import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCOP, formatDate } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchParams {
  cohort?: string;
  status?: string;
  q?: string;
}

export default async function LeadsPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;

  const leads = await prisma.salesLead.findMany({
    where: {
      ...(sp.cohort ? { cohort: sp.cohort } : {}),
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.q
        ? {
            business: {
              nameCanonical: { contains: sp.q, mode: 'insensitive' as const },
            },
          }
        : {}),
    },
    orderBy: [{ fitScore: 'desc' }, { painScore: 'desc' }],
    include: {
      business: {
        select: {
          id: true,
          nameCanonical: true,
          city: true,
          sector: true,
          nit: true,
          openedAt: true,
          igHandle: true,
          snapshots: {
            orderBy: { date: 'desc' },
            take: 1,
            select: { googleReviewCount: true, googleRating: true, rappiPresent: true },
          },
          _count: { select: { painClusters: true } },
        },
      },
    },
  });

  const cohortCounts = await prisma.salesLead.groupBy({
    by: ['cohort'],
    _count: { _all: true },
  });
  const statusCounts = await prisma.salesLead.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Leads</h1>
          <p className="text-sm text-foreground-muted mt-0.5">
            {leads.length} businesses scored, ranked by fit
          </p>
        </div>
        <form className="flex gap-2 items-center">
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Search by name…"
            className="h-9 w-56 rounded-md border border-border bg-background-elevated px-3 text-sm placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            name="cohort"
            defaultValue={sp.cohort ?? ''}
            className="h-9 rounded-md border border-border bg-background-elevated px-3 text-sm"
          >
            <option value="">All cohorts</option>
            {cohortCounts.map((c: (typeof cohortCounts)[number]) => (
              <option key={c.cohort} value={c.cohort}>
                {c.cohort} ({c._count._all})
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={sp.status ?? ''}
            className="h-9 rounded-md border border-border bg-background-elevated px-3 text-sm"
          >
            <option value="">All status</option>
            {statusCounts.map((s: (typeof statusCounts)[number]) => (
              <option key={s.status} value={s.status}>
                {s.status} ({s._count._all})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-background hover:bg-accent-hover"
          >
            Filter
          </button>
        </form>
      </header>

      <Card>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="py-12 text-center text-sm text-foreground-subtle">
              No leads match these filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead className="text-right">Fit</TableHead>
                  <TableHead className="text-right">Pain</TableHead>
                  <TableHead className="text-right">Traction</TableHead>
                  <TableHead className="text-right">Reviews ⭐</TableHead>
                  <TableHead>Revenue est</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                  <TableHead className="w-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: (typeof leads)[number]) => {
                  const snap = lead.business.snapshots[0];
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Link href={`/leads/${lead.id}`} className="hover:text-accent">
                          <div className="font-medium text-foreground">
                            {lead.business.nameCanonical}
                          </div>
                          <div className="text-xs text-foreground-muted">
                            {lead.business.city ?? '—'} · {lead.business.sector ?? '—'}
                            {lead.business.nit ? ` · NIT ${lead.business.nit}` : ''}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.cohort.includes('mature_painful') ? 'warning' : 'accent'}>
                          {lead.cohort.replace('mature_painful_inferred', 'mature_painful*')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">
                        {lead.fitScore.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">
                        {lead.painScore.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">
                        {lead.tractionScore.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground-muted">
                        {snap?.googleReviewCount?.toLocaleString() ?? '—'}
                        {snap?.googleRating != null ? ` · ${snap.googleRating.toFixed(1)}` : ''}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums text-foreground-muted">
                        {formatCOP(lead.estRevenueLow)}–{formatCOP(lead.estRevenueHigh)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.status === 'won'
                              ? 'success'
                              : lead.status === 'lost'
                                ? 'danger'
                                : lead.status === 'contacted' || lead.status === 'qualified'
                                  ? 'warning'
                                  : 'outline'
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-foreground-muted tabular-nums">
                        {formatDate(lead.business.openedAt)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-foreground-muted hover:text-accent"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
