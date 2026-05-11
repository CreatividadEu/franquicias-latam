import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatCOP } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const [
    totalBusinesses,
    totalReviews,
    totalLeads,
    totalPainExtractions,
    rappiPresent,
    rues,
    cohortBreakdown,
    sectorBreakdown,
    topLeads,
    topPainCategories,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.review.count(),
    prisma.salesLead.count(),
    prisma.painExtraction.count(),
    prisma.snapshot.count({ where: { rappiPresent: true } }),
    prisma.business.count({ where: { ruesMatricula: { not: null } } }),
    prisma.salesLead.groupBy({ by: ['cohort'], _count: { _all: true } }),
    prisma.business.groupBy({
      by: ['sector'],
      _count: { _all: true },
      orderBy: { _count: { sector: 'desc' } },
    }),
    prisma.salesLead.findMany({
      orderBy: { fitScore: 'desc' },
      take: 5,
      include: { business: { select: { id: true, nameCanonical: true } } },
    }),
    prisma.painExtraction.groupBy({
      by: ['category'],
      _count: { _all: true },
      _avg: { severity: true, frequencyInSample: true },
      orderBy: { _count: { category: 'desc' } },
      take: 6,
    }),
  ]);

  const kpis = [
    { label: 'Businesses', value: totalBusinesses, hint: 'ingested' },
    { label: 'Reviews', value: totalReviews.toLocaleString(), hint: 'stored' },
    { label: 'Sales leads', value: totalLeads, hint: 'cohort-scored' },
    { label: 'Pain extractions', value: totalPainExtractions, hint: 'Haiku 4.5' },
    { label: 'RUES matched', value: rues, hint: `${Math.round((rues / Math.max(totalBusinesses, 1)) * 100)}%` },
    { label: 'Rappi present', value: rappiPresent, hint: `${Math.round((rappiPresent / Math.max(totalBusinesses, 1)) * 100)}%` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-foreground">Overview</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          Cross-source intelligence on {totalBusinesses} Bogotá businesses.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4">
              <div className="text-xs text-foreground-muted uppercase tracking-wide">{k.label}</div>
              <div className="text-2xl font-medium text-foreground mt-1 tabular-nums">{k.value}</div>
              <div className="text-xs text-foreground-subtle mt-0.5">{k.hint}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cohort breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cohortBreakdown.length === 0 ? (
              <p className="text-sm text-foreground-subtle">No leads yet.</p>
            ) : (
              cohortBreakdown.map((c) => (
                <div key={c.cohort} className="flex items-center justify-between">
                  <Badge variant={c.cohort.includes('mature_painful') ? 'warning' : 'accent'}>
                    {c.cohort}
                  </Badge>
                  <span className="text-sm tabular-nums text-foreground">{c._count._all}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sector breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sectorBreakdown.map((s) => (
              <div key={s.sector ?? 'unknown'} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.sector ?? 'unknown'}</span>
                <span className="text-sm tabular-nums text-foreground-muted">{s._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top pain categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPainCategories.length === 0 ? (
              <p className="text-sm text-foreground-subtle">No pains extracted yet.</p>
            ) : (
              topPainCategories.map((p) => (
                <div key={p.category} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground truncate">{p.category}</span>
                  <span className="text-xs text-foreground-muted tabular-nums">
                    sev {p._avg.severity?.toFixed(1) ?? '–'} · ×{p._count._all}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 leads by fit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topLeads.length === 0 ? (
              <p className="text-sm text-foreground-subtle">No leads yet — run the scorer.</p>
            ) : (
              topLeads.map((l) => (
                <Link
                  key={l.id}
                  href={`/leads/${l.id}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 -mx-1 hover:bg-background-elevated transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-foreground truncate">{l.business.nameCanonical}</span>
                    <Badge variant={l.cohort.includes('mature_painful') ? 'warning' : 'accent'}>
                      {l.cohort.replace('mature_painful_inferred', 'mature_painful*')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-foreground-muted tabular-nums">
                    <span title="Fit score">fit {l.fitScore.toFixed(2)}</span>
                    <span title="Pain score">pain {l.painScore.toFixed(1)}</span>
                    <span className="text-foreground-subtle">
                      {formatCOP(l.estRevenueLow)}–{formatCOP(l.estRevenueHigh)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
