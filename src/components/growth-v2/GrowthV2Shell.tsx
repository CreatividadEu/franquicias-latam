'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { type Answers, type RouteType, type Stage, STAGE_ORDER, detectRoute } from './types'
import { IntroScreen } from './IntroScreen'
import { ContextScreen } from './ContextScreen'
import { DiagnosticWizard } from './DiagnosticWizard'
import { AnalyzingState } from './AnalyzingState'
import { ResultReveal } from './ResultReveal'
import { ProgramPlayground } from './ProgramPlayground'
import { ValueReframe } from './ValueReframe'
import { ProgramOverview } from './ProgramOverview'
import { FinalCTA } from './FinalCTA'

export function GrowthV2Shell() {
  const [stage, setStage] = useState<Stage>('intro')
  const [answers, setAnswers] = useState<Answers>({})
  const [detectedRoute, setDetectedRoute] = useState<RouteType>('caja')

  const next = useCallback(() => {
    setStage(s => {
      const idx = STAGE_ORDER.indexOf(s)
      return STAGE_ORDER[idx + 1] ?? s
    })
  }, [])

  const handleDiagnosticComplete = useCallback((a: Answers) => {
    setAnswers(a)
    setDetectedRoute(detectRoute(a))
    setStage('analyzing')
    setTimeout(() => setStage('result'), 2400)
  }, [])

  return (
    <div
      style={{
        background: '#06091200',
        backgroundColor: '#060912',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        overflowX: 'hidden'
      }}
    >
      {/* Ambient grid background */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <IntroScreen key="intro" onNext={next} />
          )}
          {stage === 'context' && (
            <ContextScreen key="context" onNext={next} />
          )}
          {stage === 'diagnostic' && (
            <DiagnosticWizard key="diagnostic" onComplete={handleDiagnosticComplete} />
          )}
          {stage === 'analyzing' && (
            <AnalyzingState key="analyzing" />
          )}
          {stage === 'result' && (
            <ResultReveal
              key="result"
              route={detectedRoute}
              answers={answers}
              onNext={next}
            />
          )}
          {stage === 'playground' && (
            <ProgramPlayground
              key="playground"
              route={detectedRoute}
              onNext={next}
            />
          )}
          {stage === 'reframe' && (
            <ValueReframe key="reframe" onNext={next} />
          )}
          {stage === 'program' && (
            <ProgramOverview key="program" onNext={next} />
          )}
          {stage === 'cta' && (
            <FinalCTA key="cta" route={detectedRoute} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
