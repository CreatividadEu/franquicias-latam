import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

const SOURCES = [
  { key: 'google_places', label: 'Google Places (SerpAPI)' },
  { key: 'rues', label: 'RUES (Confecámaras)' },
  { key: 'rappi', label: 'Rappi (Grability)' },
  { key: 'instagram', label: 'Instagram (Apify)' },
  { key: 'entity_resolver', label: 'Entity resolver' },
  { key: 'pain_extractor', label: 'Pain extractor / service angle' },
];

export default async function IngestionPage() {
  const counts = await prisma.observation.groupBy({
    by: ['source'],
    _count: { _all: true },
    _max: { observedAt: true },
    _min: { observedAt: true },
  });
  type SourceCount = (typeof counts)[number];
  const bySource = new Map<string, SourceCount>(
    counts.map((c: SourceCount) => [c.source, c]),
  );

  const recentErrors = await prisma.observation.findMany({
    where: { sourceId: { startsWith: 'reject:' } },
    orderBy: { observedAt: 'desc' },
    take: 0, // placeholder — observations themselves are append-only, not errors
  });
  void recentErrors;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-medium text-foreground">Ingestion health</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          Observation counts and last-seen timestamps per source.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SOURCES.map((s) => {
          const c = bySource.get(s.key);
          const lastSeen = c?._max.observedAt;
          const stale = lastSeen ? Date.now() - lastSeen.getTime() > 7 * 24 * 60 * 60 * 1000 : false;
          return (
            <Card key={s.key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{s.label}</span>
                  {c ? (
                    <Badge variant={stale ? 'warning' : 'success'}>
                      {stale ? 'stale' : 'fresh'}
                    </Badge>
                  ) : (
                    <Badge variant="outline">no data</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Observations</span>
                  <span className="tabular-nums">{c?._count._all ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Last seen</span>
                  <span className="tabular-nums text-xs">
                    {lastSeen ? lastSeen.toISOString().slice(0, 16).replace('T', ' ') : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">First seen</span>
                  <span className="tabular-nums text-xs">
                    {c?._min.observedAt
                      ? c._min.observedAt.toISOString().slice(0, 16).replace('T', ' ')
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
