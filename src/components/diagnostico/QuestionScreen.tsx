'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import RadarChart from './RadarChart';
import { DIM_LABELS } from './data';
import type { Question, Answers, OptionScores } from '@/types/diagnostico';

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

interface QuestionScreenProps {
  q: Question;
  qIdx: number;
  total: number;
  answers: Answers;
  radarVals: number[];
  onAnswer: (id: string, value: string, scores: OptionScores) => void;
  onNext: () => void;
  onBack: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionScreen({
  q,
  qIdx,
  total,
  answers,
  radarVals,
  onAnswer,
  onNext,
  onBack,
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<string | null>(answers[q.id] || null);

  useEffect(() => {
    setSelected(answers[q.id] || null);
  }, [q.id, answers]);

  function handleSelect(opt: Question['options'][0]) {
    setSelected(opt.value);
    onAnswer(q.id, opt.value, opt.scores);
  }

  return (
    <div className="relative z-10 h-full w-full flex dx-screen-enter">
      {/* Left — Question */}
      <div
        className="flex-1 flex flex-col justify-center"
        style={{ padding: '60px 64px 60px 80px', maxWidth: '60%' }}
      >
        <div className="dx-stagger max-w-2xl">
          <div
            className="font-mono text-xs tracking-[0.14em] uppercase mb-4"
            style={{ color: '#ea5a2a' }}
          >
            Pregunta {qIdx + 1} de {total}
          </div>

          <h2
            className="font-display font-bold text-white mb-3"
            style={{
              fontSize: 'clamp(26px, 3.2vw, 44px)',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
            }}
          >
            {q.text}
          </h2>

          <p className="text-white/45 text-[15px] leading-relaxed mb-9">{q.sub}</p>

          <div className="flex flex-col gap-[11px]">
            {q.options.map((opt, i) => {
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className="group flex items-center gap-4 text-left transition-all relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? 'rgba(234,90,42,0.08)'
                      : 'rgba(16,21,31,0.7)',
                    border: `1px solid ${isSelected ? '#ea5a2a' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding: '17px 22px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    boxShadow: isSelected
                      ? '0 0 0 3px rgba(234,90,42,0.14), 0 0 40px -12px rgba(234,90,42,0.5)'
                      : '0 1px 3px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)',
                    transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.border =
                        '1px solid rgba(234,90,42,0.4)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.border =
                        '1px solid rgba(255,255,255,0.08)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: isSelected
                        ? '#ea5a2a'
                        : 'rgba(255,255,255,0.08)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3.5 mt-7">
            <GhostBtn onClick={onBack}>
              <ArrowLeft className="w-4 h-4" /> Atrás
            </GhostBtn>
            <button
              onClick={() => selected && onNext()}
              disabled={!selected}
              className="inline-flex items-center gap-2.5 rounded-full font-display font-semibold text-white transition-all disabled:opacity-0 disabled:pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, #f47238 0%, #ea5a2a 100%)',
                padding: '14px 28px',
                fontSize: '15px',
                boxShadow:
                  '0 0 0 1px rgba(234,90,42,.3), 0 10px 28px -8px rgba(234,90,42,.55)',
                opacity: selected ? 1 : 0,
                transform: selected ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'opacity 0.3s, transform 0.3s',
              }}
            >
              {qIdx === total - 1 ? 'Ver mi diagnóstico' : 'Siguiente'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right — Radar + dimension tags */}
      <div
        className="w-[40%] hidden md:flex flex-col items-center justify-center p-10"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-white/40">
            Construyendo tu perfil
          </div>
          <div
            style={{
              background: 'rgba(16,21,31,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 60px -20px rgba(234,90,42,0.25)',
            }}
          >
            <RadarChart values={radarVals} color="#ea5a2a" size={220} />
          </div>
          <div className="flex flex-wrap justify-center gap-[7px] max-w-[290px]">
            {DIM_LABELS.map((d, i) => {
              const active = radarVals[i] > 0;
              return (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-500 font-mono"
                  style={{
                    background: active
                      ? 'rgba(234,90,42,0.1)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      active ? 'rgba(234,90,42,0.35)' : 'rgba(255,255,255,0.08)'
                    }`,
                    color: active ? '#ea5a2a' : 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {d}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
