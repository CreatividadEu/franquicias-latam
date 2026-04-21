'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import type { Screen } from '@/types/diagnostico';

// ─── Top HUD ──────────────────────────────────────────────────────────────────
interface TopHudProps {
  screen: Screen;
  qIdx: number;
}

export function TopHud({ screen, qIdx }: TopHudProps) {
  const [runs, setRuns] = useState(12847);

  useEffect(() => {
    const id = setInterval(
      () => setRuns((c) => c + ((Math.random() * 3) | 0)),
      2200
    );
    return () => clearInterval(id);
  }, []);

  const leftLabel = (() => {
    if (screen === 'intro')      return 'ai diagnostic engine';
    if (screen === 'company')    return 'onboarding · target profile';
    if (screen === 'question')   return `assessment · ${qIdx + 1}/6`;
    if (screen === 'processing') return 'intelligence · running';
    if (screen === 'results')    return 'diagnostic complete';
    return 'ai diagnostic engine';
  })();

  return (
    <>
      <div
        className="flex items-center gap-3 font-mono text-[11px] tracking-wider"
        style={{ position: 'absolute', top: 20, left: 24, zIndex: 30 }}
      >
        <div className="flex items-center gap-2 text-white/40">
          <span className="text-white/60">franquicias·latam</span>
          <span className="text-white/20">/</span>
          <span style={{ color: '#4fd4e0' }}>{leftLabel}</span>
          <span className="text-white/20">v1.2</span>
        </div>
      </div>

      <div
        className="hidden sm:flex items-center gap-4 font-mono text-[11px] tracking-wider text-white/40"
        style={{ position: 'absolute', top: 20, right: 24, zIndex: 30 }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: '#4ade80', animation: 'dx-ping 1.4s cubic-bezier(0,0,0.2,1) infinite' }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: '#4ade80' }}
            />
          </span>
          <span>neural · online</span>
        </div>
        <span className="text-white/20">·</span>
        <span>claude-sonnet-4</span>
        <span className="text-white/20">·</span>
        <span>{runs.toLocaleString()} runs</span>
      </div>
    </>
  );
}

// ─── Bottom HUD ───────────────────────────────────────────────────────────────
interface BottomHudProps {
  screen: Screen;
}

export function BottomHud({ screen }: BottomHudProps) {
  const label = (() => {
    if (screen === 'intro')      return 'awaiting input';
    if (screen === 'company')    return 'collecting target metadata';
    if (screen === 'question')   return 'scoring · real-time';
    if (screen === 'processing') return 'processing · claude api';
    if (screen === 'results')    return 'report ready';
    return 'idle';
  })();

  return (
    <>
      <div
        className="font-mono text-[11px] tracking-wider text-white/30 hidden sm:flex items-center gap-3"
        style={{ position: 'absolute', bottom: 20, left: 24, zIndex: 30 }}
      >
        <Activity className="w-3 h-3" style={{ color: '#4fd4e0' }} />
        <span>{label}</span>
      </div>
      <div
        className="font-mono text-[11px] tracking-wider text-white/30 hidden sm:block"
        style={{ position: 'absolute', bottom: 20, right: 24, zIndex: 30 }}
      >
        powered by{' '}
        <span className="text-white/50">claude + franquicias·latam intelligence</span>
      </div>
    </>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(255,255,255,0.04)',
        zIndex: 40,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #ea5a2a 0%, #f47238 50%, #4fd4e0 100%)',
          boxShadow: '0 0 14px rgba(234,90,42,0.55)',
          transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
}
