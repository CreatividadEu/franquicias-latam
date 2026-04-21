'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Answers, type AnswerValue, QUESTIONS, OPTIONS } from './types'

interface Props {
  onComplete: (answers: Answers) => void
}

const PAGE = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } }
}

const QUESTION_ANIM = {
  initial: { opacity: 0, x: 30, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.45 } },
  exit: { opacity: 0, x: -30, filter: 'blur(4px)', transition: { duration: 0.25 } }
}

const OPTION_COLORS: Record<AnswerValue, { border: string; bg: string; glow: string; dot: string }> = {
  yes: { border: 'rgba(0,229,255,0.6)', bg: 'rgba(0,229,255,0.07)', glow: '0 0 20px rgba(0,229,255,0.15)', dot: '#00E5FF' },
  partial: { border: 'rgba(123,97,255,0.6)', bg: 'rgba(123,97,255,0.07)', glow: '0 0 20px rgba(123,97,255,0.15)', dot: '#7B61FF' },
  no: { border: 'rgba(249,115,22,0.5)', bg: 'rgba(249,115,22,0.06)', glow: '0 0 20px rgba(249,115,22,0.12)', dot: '#F97316' }
}

export function DiagnosticWizard({ onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [selected, setSelected] = useState<AnswerValue | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const question = QUESTIONS[currentQ]
  const progress = ((currentQ) / QUESTIONS.length) * 100

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(null)
  }, [currentQ])

  function handleSelect(value: AnswerValue) {
    if (advancing) return
    setSelected(value)
    setAdvancing(true)

    const newAnswers = { ...answers, [currentQ]: value }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1)
        setAdvancing(false)
      } else {
        onComplete(newAnswers)
      }
    }, 550)
  }

  return (
    <motion.div
      variants={PAGE}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem'
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(255,255,255,0.05)',
          zIndex: 10
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00E5FF, #7B61FF)',
            boxShadow: '0 0 10px rgba(0,229,255,0.5)'
          }}
        />
      </div>

      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '3rem'
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(140,155,190,0.5)'
            }}
          >
            Diagnóstico
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentQ ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '999px',
                  background:
                    i < currentQ
                      ? '#00E5FF'
                      : i === currentQ
                      ? 'rgba(0,229,255,0.8)'
                      : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  boxShadow: i <= currentQ ? '0 0 8px rgba(0,229,255,0.4)' : 'none'
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: '0.78rem',
              color: 'rgba(140,155,190,0.5)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {currentQ + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            variants={QUESTION_ANIM}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Dimension tag */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,229,255,0.6)',
                  fontWeight: 600
                }}
              >
                {question.dimension}
              </span>
            </div>

            {/* Question text */}
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: '#EEF2FF',
                margin: '0 0 0.75rem'
              }}
            >
              {question.question}
            </h2>

            {/* Context */}
            <p
              style={{
                fontSize: '0.88rem',
                color: 'rgba(140,155,190,0.5)',
                marginBottom: '2.5rem',
                lineHeight: 1.5
              }}
            >
              {question.context}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {OPTIONS.map(opt => {
                const isSelected = selected === opt.value
                const c = OPTION_COLORS[opt.value]
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    disabled={advancing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.1rem 1.4rem',
                      borderRadius: '14px',
                      border: `1px solid ${isSelected ? c.border : 'rgba(255,255,255,0.07)'}`,
                      background: isSelected ? c.bg : 'rgba(255,255,255,0.025)',
                      cursor: advancing ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? c.glow : 'none',
                      transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                    }}
                    onMouseEnter={e => {
                      if (!advancing && !isSelected) {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                          'rgba(255,255,255,0.15)'
                        ;(e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.04)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                          'rgba(255,255,255,0.07)'
                        ;(e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.025)'
                      }
                    }}
                  >
                    {/* Indicator dot */}
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? c.dot : 'rgba(255,255,255,0.2)'}`,
                        background: isSelected ? c.dot : 'transparent',
                        flexShrink: 0,
                        boxShadow: isSelected ? `0 0 8px ${c.dot}` : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: isSelected ? '#EEF2FF' : 'rgba(200,210,240,0.8)',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'rgba(140,155,190,0.5)',
                          marginTop: '0.15rem'
                        }}
                      >
                        {opt.subtext}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
