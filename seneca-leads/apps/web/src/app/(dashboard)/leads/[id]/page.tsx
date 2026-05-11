import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCOP, formatDate, formatPercent, clamp } from '@/lib/utils';
import { ExternalLink, Instagram, Globe, MapPin } from 'lucide-react';
import { Sparkline } from './sparklines';
import { StatusForm } from './status-form';

export const dynamic = 'force-dynamic';

export default async function LeadDossierPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const lead = await prisma.salesLead.findUnique({
    where: { id },
    include: {
      business: {
        include: {
          sourceLinks: { select: { source: true, sourceId: true, url: true } },
          painClusters: {
            include: {
              extractions: {
                orderBy: [{ severity: 'desc' }, { frequencyInSample: 'desc' }],
              },
            },
          },
          snapshots: {
            orderBy: { date: 'asc' },
            take: 90,
          },
        },
      },
    },
  });

  if (!lead) notFound();

  const b = lead.business;
  const latest = b.snapshots[b.snapshots.length - 1];
  const allPains = b.painClusters.flatMap((c) => c.extractions);

  // External-source link map (Google place_id, Rappi store_id, RUES matricula)
  const linkBy: Record<string, string | null> = {};
  for (const sl of b.sourceLinks) linkBy[sl.source] = sl.url ?? null;

  const ruesLink = b.ruesMatricula
    ? `https://www.rues.org.co/buscar/RM/${encodeURIComponent(b.nameCanonical)}`
    : null;
  const igLink = b.igHandle ? `https://www.instagram.com/${b.igHandle}` : null;
  const googleLink = linkBy['google_places'];
  const rappiLink = linkBy['rappi'];

  const trends = b.snapshots.map((s) => ({
    date: s.date.toISOString().slice(0, 10),
    reviews: s.googleReviewCount ?? 0,
    rating: s.googleRating ?? 0,
    followers: s.igFollowers ?? 0,
    engagement: (s.igEngagementRate ?? 0) * 100,
  }));

  return (
    <div className="space-y-5">
      {/* HEADER STRIP */}
      <header className="space-y-2.5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl font-medium text-foreground">{b.nameCanonical}</h1>
          <Badge variant={lead.cohort.includes('mature_painful') ? 'warning' : 'accent'}>
            {lead.cohort.replace('mature_painful_inferred', 'mature_painful*')}
          </Badge>
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
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground-muted flex-wrap">
          <span>{b.sector ?? '—'}</span>
          <span>·</span>
          <span>{b.city ?? '—'}</span>
          <span>·</span>
          <span>opened {formatDate(b.openedAt)}</span>
          {b.nit && (
            <>
              <span>·</span>
              <span className="tabular-nums">NIT {b.nit}</span>
            </>
          )}
          {b.ruesMatricula && (
            <>
              <span>·</span>
              <span className="tabular-nums">matrícula {b.ruesMatricula}</span>
            </>
          )}
        </div>
        <div className="flex gap-3 text-xs">
          {googleLink && (
            <LinkChip href={googleLink} label="Google Maps">
              <MapPin className="h-3 w-3" />
            </LinkChip>
          )}
          {igLink && (
            <LinkChip href={igLink} label={`@${b.igHandle}`}>
              <Instagram className="h-3 w-3" />
            </LinkChip>
          )}
          {rappiLink && (
            <LinkChip href={rappiLink} label="Rappi">
              <ExternalLink className="h-3 w-3" />
            </LinkChip>
          )}
          {ruesLink && (
            <LinkChip href={ruesLink} label="RUES">
              <ExternalLink className="h-3 w-3" />
            </LinkChip>
          )}
          {b.domain && (
            <LinkChip href={`https://${b.domain}`} label={b.domain}>
              <Globe className="h-3 w-3" />
            </LinkChip>
          )}
        </div>
      </header>

      {/* TRACTION STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TractionCard
          label="Reviews"
          value={latest?.googleReviewCount?.toLocaleString() ?? '—'}
          spark={trends.length > 1 ? <Sparkline data={trends} valueKey="reviews" /> : null}
        />
        <TractionCard
          label="Rating"
          value={latest?.googleRating?.toFixed(2) ?? '—'}
          spark={trends.length > 1 ? <Sparkline data={trends} valueKey="rating" /> : null}
        />
        <TractionCard
          label="IG followers"
          value={latest?.igFollowers?.toLocaleString() ?? '—'}
          spark={trends.length > 1 ? <Sparkline data={trends} valueKey="followers" /> : null}
        />
        <TractionCard
          label="Engagement"
          value={
            latest?.igEngagementRate != null
              ? formatPercent(latest.igEngagementRate, 2)
              : '—'
          }
          spark={trends.length > 1 ? <Sparkline data={trends} valueKey="engagement" /> : null}
        />
      </section>

      {/* PAIN PANEL */}
      <Card>
        <CardHeader>
          <CardTitle>Pain points · Claude Haiku 4.5</CardTitle>
        </CardHeader>
        <CardContent>
          {allPains.length === 0 ? (
            <p className="text-sm text-foreground-subtle">
              No pain extractions for this business yet.
            </p>
          ) : (
            <ol className="space-y-4">
              {allPains.map((p) => (
                <li key={p.id} className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant="accent">{p.category}</Badge>
                    {p.subcategory && (
                      <span className="text-sm text-foreground-muted">{p.subcategory}</span>
                    )}
                    <SeverityBar value={p.severity} />
                    <span className="text-xs text-foreground-subtle tabular-nums">
                      {formatPercent(p.frequencyInSample)} frequency · {p.evidenceCount} evidence
                    </span>
                  </div>
                  <blockquote className="border-l-2 border-accent pl-3 text-sm text-foreground italic">
                    "{p.representativeQuote}"
                  </blockquote>
                  {p.solutionHint && (
                    <p className="text-xs text-foreground-muted ml-3">→ {p.solutionHint}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* REVENUE BAND */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-medium text-foreground tabular-nums">
              {formatCOP(lead.estRevenueLow)} – {formatCOP(lead.estRevenueHigh)}
            </span>
            <span className="text-sm text-foreground-muted">/ year</span>
            <span className="text-xs text-foreground-subtle">
              · confidence {formatPercent(lead.revenueConfidence)}
            </span>
          </div>
          <p className="text-xs text-foreground-subtle mt-2">
            Method: sector heuristic (seats × turnover × ticket × 26 × 12).
            {!b.nit && ' SuperSociedades layer 1 unavailable (no NIT match).'}
          </p>
        </CardContent>
      </Card>

      {/* SERVICE ANGLE */}
      <Card>
        <CardHeader>
          <CardTitle>Service angle · Claude Sonnet 4.6</CardTitle>
        </CardHeader>
        <CardContent>
          {lead.serviceAngle ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {lead.serviceAngle}
            </p>
          ) : (
            <p className="text-sm text-foreground-subtle">
              No service angle synthesized yet. Run{' '}
              <code className="text-xs">pnpm exec tsx scripts/synthesize-angles.ts</code>.
            </p>
          )}
        </CardContent>
      </Card>

      {/* STATUS + NOTES */}
      <Card>
        <CardHeader>
          <CardTitle>Status &amp; notes</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusForm
            leadId={lead.id}
            initialStatus={lead.status}
            initialNotes={lead.notes}
            contactedAt={lead.contactedAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LinkChip({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background-elevated px-2 py-1 text-foreground-muted hover:text-accent hover:border-accent transition-colors"
    >
      {children}
      {label}
    </a>
  );
}

function TractionCard({
  label,
  value,
  spark,
}: {
  label: string;
  value: string;
  spark: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="text-xs text-foreground-muted uppercase tracking-wide">{label}</div>
        <div className="text-xl font-medium text-foreground mt-0.5 tabular-nums">{value}</div>
        <div className="mt-2 -mx-1">{spark}</div>
      </CardContent>
    </Card>
  );
}

function SeverityBar({ value }: { value: number }) {
  const filled = clamp(value, 0, 5);
  return (
    <div className="flex items-center gap-0.5" title={`Severity ${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-3 rounded-sm ${
            i < filled ? 'bg-accent' : 'bg-border'
          }`}
        />
      ))}
    </div>
  );
}
