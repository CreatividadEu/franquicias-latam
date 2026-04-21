'use client';

import { useState, useEffect } from 'react';
import { Loader2, Map, Instagram, Star, AlertCircle } from 'lucide-react';
import type { Company, Answers, IntelData, IntelReview } from '@/types/diagnostico';

// DO NOT MODIFY: prompt is tuned and sent server-side via /api/business-intel

interface IntelligencePanelProps {
  company: Company;
  answers: Answers;
}

function sourceStyle(source: string) {
  const sl = source.toLowerCase();
  if (sl.includes('google'))
    return {
      bg: 'rgba(66,133,244,0.14)',
      color: '#7ba4f4',
      border: 'rgba(66,133,244,0.3)',
      icon: <Map className="w-3 h-3" />,
    };
  if (sl.includes('instagram'))
    return {
      bg: 'rgba(225,48,108,0.12)',
      color: '#ef6a9f',
      border: 'rgba(225,48,108,0.3)',
      icon: <Instagram className="w-3 h-3" />,
    };
  return {
    bg: 'rgba(255,102,0,0.12)',
    color: '#ff8f4a',
    border: 'rgba(255,102,0,0.3)',
    icon: <span className="w-3 h-3 text-[10px]">📦</span>,
  };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{
            color: i < rating ? '#e8c557' : 'rgba(255,255,255,0.15)',
            fill: i < rating ? '#e8c557' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: IntelReview }) {
  const src = sourceStyle(r.source);
  const sentBg =
    r.sentiment === 'positive'
      ? 'rgba(63,211,154,0.14)'
      : r.sentiment === 'negative'
      ? 'rgba(239,68,68,0.14)'
      : 'rgba(232,197,87,0.14)';
  const sentColor =
    r.sentiment === 'positive'
      ? '#3fd39a'
      : r.sentiment === 'negative'
      ? '#f87171'
      : '#e8c557';
  const sentLabel =
    r.sentiment === 'positive'
      ? '✓ Positivo'
      : r.sentiment === 'negative'
      ? '⚠ Dolor detectado'
      : '◑ Mixto';

  return (
    <div
      className="mb-3 transition-all"
      style={{
        background: 'rgba(16,21,31,0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <StarRow rating={r.rating} />
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full"
          style={{
            background: src.bg,
            color: src.color,
            border: `1px solid ${src.border}`,
          }}
        >
          {src.icon}
          {r.source}
        </span>
      </div>
      <div className="text-[13px] italic text-white/65 leading-relaxed">
        &ldquo;{r.text}&rdquo;
      </div>
      {r.sentiment && (
        <div
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2"
          style={{ background: sentBg, color: sentColor }}
        >
          {sentLabel}
        </div>
      )}
    </div>
  );
}

export default function IntelligencePanel({ company, answers }: IntelligencePanelProps) {
  const [intel, setIntel] = useState<IntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchIntel() {
      try {
        const res = await fetch('/api/business-intel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company, answers }),
        });
        if (res.status === 429) {
          if (!cancelled)
            setError('Límite de consultas alcanzado. Intenta en una hora.');
          return;
        }
        if (!res.ok) {
          if (!cancelled)
            setError('No se pudo obtener el análisis digital. Intenta recargar.');
          return;
        }
        const data: IntelData = await res.json();
        if (!cancelled) setIntel(data);
      } catch {
        if (!cancelled)
          setError('No se pudo obtener el análisis digital. Intenta recargar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchIntel();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ea5a2a' }} />
        <span className="text-white/40 text-sm">
          Analizando señales digitales de {company.name}…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-2.5"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
          padding: '14px 16px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
        }}
      >
        <AlertCircle
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: '#ef4444' }}
        />
        <span>{error}</span>
      </div>
    );
  }

  if (!intel) return null;

  return (
    <div className="dx-screen-enter">
      {intel.reviews?.map((r, i) => (
        <ReviewCard key={i} r={r} />
      ))}

      {intel.signals?.length > 0 && (
        <div className="mt-4">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/40 mb-3 flex items-center gap-2">
            Señales de mercado
            <span
              className="flex-1 h-px"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
          </div>
          {intel.signals.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 py-2.5 text-[13px] text-white/55 leading-relaxed"
              style={{
                borderBottom:
                  i < intel.signals.length - 1
                    ? '1px solid rgba(255,255,255,0.06)'
                    : 'none',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
                style={{ background: '#ea5a2a' }}
              />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {intel.digital_summary && (
        <div
          className="mt-3.5 flex items-start gap-2.5"
          style={{
            background: 'rgba(234,90,42,0.08)',
            border: '1px solid rgba(234,90,42,0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: '#ea5a2a' }}>💡</span>
          <span>{intel.digital_summary}</span>
        </div>
      )}
    </div>
  );
}
