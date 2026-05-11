import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPercent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PainCell {
  category: string;
  subcategory: string | null;
  severity: number;
  frequencyInSample: number;
  representativeQuote: string;
  business: { id: string; nameCanonical: string };
  leadId: string | null;
}

export default async function PainsPage() {
  const extractions = await prisma.painExtraction.findMany({
    include: {
      cluster: {
        select: {
          business: {
            select: {
              id: true,
              nameCanonical: true,
              salesLead: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: [{ severity: 'desc' }, { frequencyInSample: 'desc' }],
  });

  // Group by category
  const byCategory = new Map<string, PainCell[]>();
  for (const e of extractions) {
    const arr = byCategory.get(e.category) ?? [];
    arr.push({
      category: e.category,
      subcategory: e.subcategory,
      severity: e.severity,
      frequencyInSample: e.frequencyInSample,
      representativeQuote: e.representativeQuote,
      business: {
        id: e.cluster.business.id,
        nameCanonical: e.cluster.business.nameCanonical,
      },
      leadId: e.cluster.business.salesLead?.id ?? null,
    });
    byCategory.set(e.category, arr);
  }

  const categories = Array.from(byCategory.entries())
    .map(([category, items]) => ({
      category,
      items,
      avgIntensity:
        items.reduce((s, i) => s + i.severity * i.frequencyInSample, 0) / items.length,
      avgSeverity: items.reduce((s, i) => s + i.severity, 0) / items.length,
      count: items.length,
    }))
    .sort((a, b) => b.avgIntensity - a.avgIntensity);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-medium text-foreground">Pains explorer</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          {extractions.length} pain points across {byCategory.size} categories
        </p>
      </header>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-foreground-subtle">
            No pain extractions yet — run{' '}
            <code className="text-xs">pnpm exec tsx scripts/extract-pains.ts --skip-synthesis</code>.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <IntensityBar value={cat.avgIntensity} />
                    <span className="text-xs tabular-nums text-foreground-muted">
                      sev {cat.avgSeverity.toFixed(1)} · ×{cat.count}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cat.items.slice(0, 5).map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.leadId ? (
                        <Link
                          href={`/leads/${item.leadId}`}
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {item.business.nameCanonical}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {item.business.nameCanonical}
                        </span>
                      )}
                      {item.subcategory && (
                        <Badge variant="outline" className="text-[10px]">
                          {item.subcategory}
                        </Badge>
                      )}
                      <span className="text-xs text-foreground-subtle tabular-nums">
                        {item.severity}/5 · {formatPercent(item.frequencyInSample)}
                      </span>
                    </div>
                    <p className="text-xs italic text-foreground-muted pl-1 line-clamp-2">
                      "{item.representativeQuote}"
                    </p>
                  </div>
                ))}
                {cat.items.length > 5 && (
                  <p className="text-xs text-foreground-subtle pt-1">
                    + {cat.items.length - 5} more
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function IntensityBar({ value }: { value: number }) {
  // value = mean(severity * frequency); roughly 0–5 range
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <div className="h-1.5 w-16 rounded-sm bg-border overflow-hidden" title={`${value.toFixed(2)} intensity`}>
      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}
