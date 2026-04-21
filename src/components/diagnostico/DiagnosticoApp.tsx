'use client';

import { useState, useEffect, useCallback } from 'react';
import MatrixRain from './MatrixRain';
import { TopHud, BottomHud, ProgressBar } from './HudChrome';
import IntroScreen from './IntroScreen';
import CompanyScreen from './CompanyScreen';
import QuestionScreen from './QuestionScreen';
import ProcessingScreen from './ProcessingScreen';
import ResultsScreen from './ResultsScreen';
import { trackEvent } from './analytics';
import { QUESTIONS, DIM_Q_MAP } from './data';
import type {
  Screen,
  Answers,
  Scores,
  Company,
  ProgramKey,
  DxState,
  OptionScores,
} from '@/types/diagnostico';

const STORAGE_KEY = 'dx_state_v2';

const DEFAULT_SCORES: Scores = { F: 0, A: 0, D: 0, _radar: [0, 0, 0, 0, 0] };
const DEFAULT_COMPANY: Company = { name: '', instagram: '', website: '' };

function matrixIntensityFor(screen: Screen): number {
  switch (screen) {
    case 'intro':      return 1.0;
    case 'company':    return 0.35;
    case 'question':   return 0.28;
    case 'processing': return 0.9;
    case 'results':    return 0.18;
  }
}

function progressFor(screen: Screen, qIdx: number): number {
  const total = QUESTIONS.length;
  switch (screen) {
    case 'intro':      return 0;
    case 'company':    return 5;
    case 'question':   return 10 + ((qIdx + 1) / total) * 80;
    case 'processing': return 95;
    case 'results':    return 100;
  }
}

// DO NOT MODIFY: winner + radar algorithm locked per brief
function computeScores(
  answers: Answers,
  changedId?: string,
  changedValue?: string
): Scores {
  const s = { F: 0, A: 0, D: 0 };
  const radar = [0, 0, 0, 0, 0];

  QUESTIONS.forEach((q, qi) => {
    const av = q.id === changedId ? changedValue : answers[q.id];
    if (!av) return;
    const opt = q.options.find((o) => o.value === av);
    if (!opt) return;
    s.F += opt.scores.F;
    s.A += opt.scores.A;
    s.D += opt.scores.D;
    const di = DIM_Q_MAP.indexOf(qi);
    if (di >= 0) {
      const mx = Math.max(...q.options.map((o) => o.scores.F + o.scores.A + o.scores.D));
      const tot = opt.scores.F + opt.scores.A + opt.scores.D;
      radar[di] = Math.min(1, (mx > 0 ? tot / mx : 0.3) + 0.2);
    }
  });

  return { ...s, _radar: radar };
}

function getWinner(scores: Scores): ProgramKey {
  const { F, A, D } = scores;
  if (F >= A && F >= D) return 'F';
  if (A >= F && A >= D) return 'A';
  return 'D';
}

export default function DiagnosticoApp() {
  const [screen, setScreen]   = useState<Screen>('intro');
  const [qIdx, setQIdx]       = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [scores, setScores]   = useState<Scores>(DEFAULT_SCORES);
  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY);

  // ── localStorage restore (dx_state_v2) ───────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: DxState = JSON.parse(raw);
      // Never resume mid-processing — it would stall
      const safeScreen =
        saved.screen === 'processing' ? 'question' : saved.screen;
      // React 18 batches these automatically inside effects
      /* eslint-disable react-hooks/set-state-in-effect */
      setScreen(safeScreen);
      setQIdx(saved.qIdx ?? 0);
      setAnswers(saved.answers ?? {});
      setScores(saved.scores ?? DEFAULT_SCORES);
      setCompany(saved.company ?? DEFAULT_COMPANY);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // Corrupted state — start fresh
    }
  }, []);

  // ── localStorage persist on every state change ────────────────────────────
  useEffect(() => {
    try {
      const state: DxState = { screen, qIdx, answers, scores, company };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode, full quota)
    }
  }, [screen, qIdx, answers, scores, company]);

  // ── Analytics: fire on screen transitions ────────────────────────────────
  useEffect(() => {
    if (screen === 'company')  trackEvent('diagnostic_started');
    if (screen === 'results')  trackEvent('diagnostic_completed', { program: getWinner(scores) });
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Answer handler ────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (id: string, value: string, _optScores: OptionScores) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: value };
        setScores(computeScores(next, id, value));
        return next;
      });
      const qI = QUESTIONS.findIndex((q) => q.id === id);
      trackEvent('question_answered', { qIdx: qI, questionId: id, value });
    },
    []
  );

  // ── Navigation helpers ────────────────────────────────────────────────────
  function handleCompanyNext(c: Company) {
    setCompany(c);
    setScreen('question');
    setQIdx(0);
    trackEvent('company_submitted', { hasInstagram: !!c.instagram, hasWebsite: !!c.website });
  }

  function handleQuestionNext() {
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx((i) => i + 1);
    } else {
      setScreen('processing');
    }
  }

  function handleQuestionBack() {
    if (qIdx > 0) setQIdx((i) => i - 1);
    else setScreen('company');
  }

  function restart() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    setScreen('intro');
    setQIdx(0);
    setAnswers({});
    setScores(DEFAULT_SCORES);
    setCompany(DEFAULT_COMPANY);
  }

  const intensity = matrixIntensityFor(screen);
  const progress  = progressFor(screen, qIdx);
  // Key forces full remount (and entrance animation) on every screen/question change
  const contentKey = screen + (screen === 'question' ? `-${qIdx}` : '');

  return (
    <div
      className="dx-root"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0a0e1a',
        color: '#e5e7eb',
        fontFamily: "var(--font-bricolage), ui-sans-serif, system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Matrix rain — persistent across all screens */}
      <MatrixRain intensity={intensity} />

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage:
            'radial-gradient(ellipse 85% 75% at 50% 50%, black 35%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 75% at 50% 50%, black 35%, transparent 100%)',
          opacity: 0.3,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(10,14,26,0.58) 0%, rgba(10,14,26,0.4) 30%, rgba(10,14,26,0.1) 60%, rgba(10,14,26,0.85) 100%)',
        }}
      />

      {/* Scan line — intro only */}
      {screen === 'intro' && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, zIndex: 3, pointerEvents: 'none',
            height: '140px',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(79,212,224,0.05) 40%, rgba(79,212,224,0.12) 50%, rgba(79,212,224,0.05) 60%, transparent 100%)',
            animation: 'dx-scan 10s linear infinite',
          }}
        />
      )}

      <ProgressBar progress={progress} />
      <TopHud screen={screen} qIdx={qIdx} />
      <BottomHud screen={screen} />

      {/* Screen content — keyed for entrance animation on every transition */}
      <div
        key={contentKey}
        style={{ position: 'absolute', inset: 0, zIndex: 10, overflow: 'hidden' }}
      >
        {screen === 'intro' && (
          <IntroScreen onStart={() => setScreen('company')} />
        )}

        {screen === 'company' && (
          <CompanyScreen onNext={handleCompanyNext} onBack={() => setScreen('intro')} />
        )}

        {screen === 'question' && (
          <QuestionScreen
            q={QUESTIONS[qIdx]}
            qIdx={qIdx}
            total={QUESTIONS.length}
            answers={answers}
            radarVals={scores._radar}
            onAnswer={handleAnswer}
            onNext={handleQuestionNext}
            onBack={handleQuestionBack}
          />
        )}

        {screen === 'processing' && (
          <ProcessingScreen
            company={company}
            onDone={() => setScreen('results')}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            program={getWinner(scores)}
            scores={scores}
            company={company}
            answers={answers}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}
