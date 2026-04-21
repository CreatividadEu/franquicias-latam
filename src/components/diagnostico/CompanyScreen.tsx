'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { Company } from '@/types/diagnostico';

const INPUT_BASE: React.CSSProperties = {
  background: 'rgba(16,21,31,0.7)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '16px 20px',
  fontSize: '16px',
  fontFamily: "'Bricolage Grotesque', sans-serif",
  backdropFilter: 'blur(10px)',
  width: '100%',
  color: '#fff',
  outline: 'none',
};

const INPUT_FOCUS: React.CSSProperties = {
  border: '1px solid rgba(234,90,42,0.45)',
  boxShadow: '0 0 0 3px rgba(234,90,42,0.08)',
};

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-[0.08em] uppercase text-white/40">
        {label}
      </label>
      {children}
    </div>
  );
}

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

interface CompanyScreenProps {
  onNext: (company: Company) => void;
  onBack: () => void;
}

export default function CompanyScreen({ onNext, onBack }: CompanyScreenProps) {
  const [name, setName] = useState('');
  const [ig, setIg] = useState('');
  const [web, setWeb] = useState('');

  const ready = name.trim().length >= 2;
  const initials = name.trim().slice(0, 2).toUpperCase() || '?';

  function handleNext() {
    if (ready) onNext({ name: name.trim(), instagram: ig.trim(), website: web.trim() });
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    Object.assign(e.target.style, INPUT_FOCUS);
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.border = '1px solid rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
  }

  return (
    <div className="relative z-10 h-full w-full flex dx-screen-enter">
      {/* Left — Form */}
      <div
        className="flex-1 flex flex-col justify-center"
        style={{ padding: '60px 64px 60px 80px', maxWidth: '60%' }}
      >
        <div className="dx-stagger max-w-xl">
          <div
            className="font-mono text-xs tracking-[0.14em] uppercase mb-4"
            style={{ color: '#ea5a2a' }}
          >
            Paso previo · Tu empresa
          </div>

          <h2
            className="font-display font-bold text-white mb-3"
            style={{
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Cuéntanos sobre<br />tu negocio
          </h2>

          <p className="text-white/50 text-[15px] leading-relaxed mb-9">
            Esta información nos permite personalizar tu diagnóstico y analizar tu presencia digital.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            <Field label="Nombre de la empresa *">
              <input
                autoFocus
                style={INPUT_BASE}
                placeholder="Ej: Tacos El Gordo, Clínica Salud+"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>

            <Field label="Instagram">
              <div className="relative">
                <span
                  className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none text-white/40 font-semibold"
                  style={{ fontSize: '16px' }}
                >
                  @
                </span>
                <input
                  style={{ ...INPUT_BASE, paddingLeft: '44px' }}
                  placeholder="tunegocio"
                  value={ig}
                  onChange={(e) => setIg(e.target.value.replace('@', ''))}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <span className="text-xs text-white/30 mt-1 block">
                Nos ayuda a entender tu presencia en redes
              </span>
            </Field>

            <Field
              label={
                <>
                  Sitio web{' '}
                  <span
                    className="text-white/30 font-normal normal-case"
                    style={{ letterSpacing: 0 }}
                  >
                    (opcional)
                  </span>
                </>
              }
            >
              <input
                style={INPUT_BASE}
                placeholder="www.tunegocio.com"
                value={web}
                onChange={(e) => setWeb(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>
          </div>

          <div className="flex gap-3 items-center">
            <GhostBtn onClick={onBack}>
              <ArrowLeft className="w-4 h-4" /> Atrás
            </GhostBtn>
            <button
              onClick={handleNext}
              disabled={!ready}
              className="inline-flex items-center gap-2.5 rounded-full font-display font-semibold text-white transition-all disabled:cursor-not-allowed"
              style={{
                background: ready
                  ? 'linear-gradient(180deg, #f47238 0%, #ea5a2a 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: ready ? '#fff' : 'rgba(255,255,255,0.3)',
                padding: '16px 30px',
                fontSize: '15px',
                boxShadow: ready
                  ? '0 0 0 1px rgba(234,90,42,.3), 0 10px 28px -8px rgba(234,90,42,.55)'
                  : 'none',
                opacity: ready ? 1 : 0.4,
              }}
            >
              Comenzar diagnóstico
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right — Preview card */}
      <div
        className="w-[40%] hidden md:flex flex-col items-center justify-center p-10"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-full max-w-[300px]">
          <div
            className="p-7 text-center"
            style={{
              background: 'rgba(16,21,31,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              className="w-[72px] h-[72px] rounded-[20px] mx-auto mb-4 flex items-center justify-center text-white font-extrabold text-[28px]"
              style={{ background: 'linear-gradient(135deg, #ea5a2a, #e8c557)' }}
            >
              {initials}
            </div>
            <div className="text-white font-bold text-lg mb-1 min-h-[26px]">
              {name || 'Tu empresa'}
            </div>
            <div className="text-white/40 text-[13px] mb-4 min-h-[18px] font-mono">
              {ig ? `@${ig}` : 'handle de instagram'}
            </div>
            <div className="flex gap-1.5 justify-center flex-wrap">
              <span
                className="text-[11px] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(234,90,42,0.12)',
                  border: '1px solid rgba(234,90,42,0.25)',
                  color: '#ea5a2a',
                }}
              >
                Diagnóstico activo
              </span>
              {ig && (
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(79,212,224,0.1)',
                    border: '1px solid rgba(79,212,224,0.25)',
                    color: '#4fd4e0',
                  }}
                >
                  IG verificado
                </span>
              )}
              {web && (
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(232,197,87,0.1)',
                    border: '1px solid rgba(232,197,87,0.25)',
                    color: '#e8c557',
                  }}
                >
                  Web detectada
                </span>
              )}
            </div>
          </div>
          <p className="text-center mt-4 text-[12px] text-white/35 leading-relaxed font-mono">
            Usaremos IA para analizar señales digitales de tu negocio y enriquecer tu reporte.
          </p>
        </div>
      </div>
    </div>
  );
}
