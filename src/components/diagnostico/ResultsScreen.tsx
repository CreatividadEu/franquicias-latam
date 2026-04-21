'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import RadarChart from './RadarChart';
import IntelligencePanel from './IntelligencePanel';
import Confetti from './Confetti';
import { PROGRAMS, CALENDLY_BASE } from './data';
import { trackEvent } from './analytics';
import type { Scores, Company, Answers, ProgramKey } from '@/types/diagnostico';

function GhostBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full transition-all hover:text-white hover:border-white/30"
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.55)',
        padding: '14px 20px',
        fontSize: '14px',
        fontFamily: "'Bricolage Grotesque', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

interface ResultsScreenProps {
  program: ProgramKey;
  scores: Scores;
  company: Company;
  answers: Answers;
  onRestart: () => void;
}

export default function ResultsScreen({
  program,
  scores,
  company,
  answers,
  onRestart,
}: ResultsScreenProps) {
  const p = PROGRAMS[program];
  const [shown, setShown] = useState(false);
  const total = scores.F + scores.A + scores.D || 1;

  useEffect(() => {
    const id = setTimeout(() => setShown(true), 200);
    return () => clearTimeout(id);
  }, []);

  const bars = [
    { key: 'F' as ProgramKey, label: 'Bootcamp Franquicias',    color: PROGRAMS.F.color, val: Math.round((scores.F / total) * 100) },
    { key: 'A' as ProgramKey, label: 'Aceleración Empresarial', color: PROGRAMS.A.color, val: Math.round((scores.A / total) * 100) },
    { key: 'D' as ProgramKey, label: 'Mejora de Desempeño',     color: PROGRAMS.D.color, val: Math.round((scores.D / total) * 100) },
  ];

  function handleCTA() {
    trackEvent('cta_clicked', { program: p.id });
    const url = new URL(CALENDLY_BASE);
    url.searchParams.set('utm_source', 'diagnostico');
    url.searchParams.set('utm_medium', 'cta');
    url.searchParams.set('utm_campaign', p.id);
    if (company.name) url.searchParams.set('utm_content', company.name);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <Confetti />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden dx-screen-enter">
        {/* Top bar */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: '28px 80px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-5">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase"
              style={{
                background: p.colorSoft,
                border: `1px solid ${p.colorBorder}`,
                color: p.color,
              }}
            >
              ◆ {p.badge}
            </div>
            <div className="text-white/50 text-sm">
              Diagnóstico de <strong className="text-white">{company.name}</strong>
              {company.instagram && (
                <>
                  {' '}·{' '}
                  <span className="font-mono text-white/70">@{company.instagram}</span>
                </>
              )}
            </div>
          </div>
          <GhostBtn onClick={onRestart}>
            <RotateCcw className="w-3.5 h-3.5" /> Nuevo diagnóstico
          </GhostBtn>
        </div>

        {/* Body — 3 columns */}
        <div
          className="flex-1 grid overflow-hidden"
          style={{ gridTemplateColumns: '42% 1fr 1fr' }}
        >
          {/* Col 1 — Program */}
          <div
            className="overflow-y-auto dx-scrollbar"
            style={{ padding: '32px 28px' }}
          >
            <div className="dx-stagger">
              <div
                className="font-display font-extrabold mb-3.5"
                style={{
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  whiteSpace: 'pre-line',
                  color: p.color,
                }}
              >
                {p.name}
              </div>

              <p className="text-white/50 text-sm leading-relaxed mb-6">{p.tagline}</p>

              <div className="flex flex-col gap-2.5 mb-6">
                {p.pillars.map((pl, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3"
                    style={{
                      background: 'rgba(16,21,31,0.75)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="text-lg flex-shrink-0 mt-0.5">{pl.icon}</div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-white mb-0.5">
                        {pl.title}
                      </h4>
                      <p className="text-[12px] text-white/45 leading-snug">
                        {pl.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCTA}
                className="inline-flex items-center gap-2 rounded-full font-display font-semibold transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
                style={{
                  background: p.color,
                  color: p.ctaTextColor,
                  padding: '14px 26px',
                  fontSize: '14px',
                  boxShadow: `0 0 30px ${p.color}44, 0 8px 22px -8px ${p.color}66`,
                }}
              >
                {p.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 2 — Intelligence */}
          <div
            className="overflow-y-auto dx-scrollbar"
            style={{
              padding: '32px 28px',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/40 mb-4 flex items-center gap-2">
              Voz del cliente · Inteligencia digital
              <span
                className="flex-1 h-px"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <IntelligencePanel company={company} answers={answers} />
          </div>

          {/* Col 3 — Profile */}
          <div
            className="overflow-y-auto dx-scrollbar"
            style={{
              padding: '32px 28px',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/40 mb-4 flex items-center gap-2">
              Tu perfil de negocio
              <span
                className="flex-1 h-px"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            </div>

            <div className="flex justify-center mb-5">
              <div
                style={{
                  background: 'rgba(16,21,31,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '16px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 0 60px -20px ${p.color}66`,
                }}
              >
                <RadarChart values={scores._radar} color={p.color} size={200} />
              </div>
            </div>

            <div className="flex flex-col gap-3.5 mt-4">
              <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-white/40 mb-1">
                Compatibilidad con programas
              </div>
              {bars.map((b) => {
                const isWinner = b.key === program;
                return (
                  <div key={b.key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className={isWinner ? 'text-white/80' : 'text-white/45'}>
                        {b.label}
                      </span>
                      <span
                        className="font-bold font-mono"
                        style={{ color: isWinner ? '#fff' : 'rgba(255,255,255,0.6)' }}
                      >
                        {shown ? b.val : 0}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '5px',
                        borderRadius: '100px',
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: shown ? `${b.val}%` : '0%',
                          borderRadius: '100px',
                          background: `linear-gradient(90deg, ${b.color}, ${b.color}dd)`,
                          boxShadow: isWinner ? `0 0 12px ${b.color}` : 'none',
                          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
