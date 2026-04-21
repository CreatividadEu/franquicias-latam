'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center dx-screen-enter">
      <div className="max-w-3xl w-full flex flex-col items-center gap-7 dx-stagger">
        <div
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full font-mono text-[11px] tracking-[0.14em] uppercase"
          style={{
            background: 'rgba(79,212,224,.08)',
            border: '1px solid rgba(79,212,224,.22)',
            color: '#4fd4e0',
          }}
        >
          <Sparkles className="w-3 h-3" />
          <span>Diagnóstico de negocio</span>
        </div>

        <h1
          className="font-display font-extrabold text-white"
          style={{
            fontSize: 'clamp(42px, 7.5vw, 96px)',
            lineHeight: 0.96,
            letterSpacing: '-0.035em',
            maxWidth: '14ch',
          }}
        >
          <span className="block">Descubre cuál es</span>
          <span
            className="block"
            style={{
              background:
                'linear-gradient(135deg, #4fd4e0 0%, #a78bfa 45%, #e8c557 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            tu próximo nivel.
          </span>
        </h1>

        <p
          className="text-white/50 max-w-[52ch]"
          style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.55 }}
        >
          6 preguntas. 3 minutos. Un camino claro hacia el crecimiento de tu empresa.
        </p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-3 rounded-full font-display font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 group"
          style={{
            background: 'linear-gradient(180deg, #f47238 0%, #ea5a2a 100%)',
            boxShadow:
              '0 0 0 1px rgba(234,90,42,.4), 0 12px 32px -8px rgba(234,90,42,.65), 0 0 60px -10px rgba(234,90,42,.5)',
            fontSize: '17px',
            padding: '18px 38px',
          }}
        >
          Comenzar diagnóstico
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="flex items-center gap-6 flex-wrap justify-center mt-2 text-white/40 text-sm">
          <span className="flex items-center gap-2">
            <span style={{ color: '#4fd4e0' }}>◆</span> 6 preguntas
          </span>
          <span className="flex items-center gap-2">
            <span style={{ color: '#4fd4e0' }}>◆</span> Resultado inmediato
          </span>
          <span className="flex items-center gap-2">
            <span style={{ color: '#4fd4e0' }}>◆</span> Inteligencia digital incluida
          </span>
        </div>
      </div>
    </div>
  );
}
