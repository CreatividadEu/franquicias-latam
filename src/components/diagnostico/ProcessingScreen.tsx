'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Company } from '@/types/diagnostico';

interface ProcessingScreenProps {
  company: Company;
  onDone: () => void;
}

export default function ProcessingScreen({ company, onDone }: ProcessingScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    'Analizando tu perfil de negocio…',
    `Escaneando señales digitales de ${company.name}…`,
    'Consultando reseñas y menciones…',
    'Generando tu recomendación…',
  ];

  useEffect(() => {
    let s = 0;
    const tick = () => {
      s++;
      setStep(s);
      if (s < steps.length - 1) {
        setTimeout(tick, s === 1 ? 2200 : 800);
      } else {
        setTimeout(onDone, 700);
      }
    };
    const id = setTimeout(tick, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-7 dx-screen-enter px-5">
      {/* Spinner */}
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          style={{ width: '100%', height: '100%', animation: 'dx-spin-slow 1.5s linear infinite' }}
        >
          <circle
            cx="50" cy="50" r="44"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            cx="50" cy="50" r="44"
            stroke="url(#pg)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="72 204"
          />
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea5a2a" />
              <stop offset="100%" stopColor="#4fd4e0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[34px]">🔬</div>
      </div>

      <div className="text-center">
        <h2
          className="font-display font-bold text-white mb-3"
          style={{ fontSize: '26px', letterSpacing: '-0.02em' }}
        >
          Procesando tu diagnóstico
        </h2>
        <div
          className="inline-flex items-center gap-2 text-[13px] font-mono"
          style={{
            background: 'rgba(16,21,31,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '8px 16px',
            borderRadius: '100px',
            color: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
          }}
        >
          Empresa:{' '}
          <span className="text-white font-semibold not-italic">{company.name}</span>
          {company.instagram && (
            <>
              <span className="text-white/30">·</span>
              <span className="text-white">@{company.instagram}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-2">
        {steps.map((s, i) => {
          const done   = step > i;
          const active = step === i;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 text-sm transition-all duration-400"
              style={{
                color: done
                  ? 'rgba(255,255,255,0.4)'
                  : active
                  ? '#fff'
                  : 'rgba(255,255,255,0.3)',
              }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all"
                style={{
                  background: done ? '#ea5a2a' : 'rgba(255,255,255,0.04)',
                  border: done
                    ? '1px solid #ea5a2a'
                    : active
                    ? '1px solid #ea5a2a'
                    : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  animation: active ? 'dx-pulse-dot 1s infinite' : 'none',
                }}
              >
                {done && <Check className="w-3 h-3" />}
              </div>
              <span>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
