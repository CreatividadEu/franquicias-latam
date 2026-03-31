'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { type RouteType, type Answers, ROUTE_DATA, QUESTIONS } from './types'

interface Props {
  route: RouteType
  answers: Answers
  onNext: () => void
}

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

const STAGGER = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
}

const ITEM = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const DIM_LABELS = [
  { key: 'caja' as const, label: 'Caja', q: 0 },
  { key: 'ops' as const, label: 'Operación', q: 1 },
  { key: 'escala' as const, label: 'Escala', q: 3 },
  { key: 'ia' as const, label: 'IA & Digital', q: 4 }
]

const ANSWER_TO_SCORE: Record<string, number> = { yes: 82, partial: 52, no: 22 }

function DimensionBar({ label, score, color, delay }: { label: string; score: number; color: string; delay: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    const raf = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(raf)
    }
    const timer = setTimeout(() => requestAnimationFrame(raf), delay)
    return () => clearTimeout(timer)
  }, [score, delay])

  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(160,175,210,0.6)', letterSpacing: '0.03em' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'rgba(160,175,210,0.5)', fontVariantNumeric: 'tabular-nums' }}>
          {displayed}
        </span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay: delay / 1000 }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            borderRadius: '999px',
            boxShadow: `0 0 6px ${color}80`
          }}
        />
      </div>
    </div>
  )
}

export function ResultReveal({ route, answers, onNext }: Props) {
  const data = ROUTE_DATA[route]

  const dimScores = {
    caja: ANSWER_TO_SCORE[answers[0] ?? 'partial'] ?? 52,
    ops: Math.round((ANSWER_TO_SCORE[answers[1] ?? 'partial'] + ANSWER_TO_SCORE[answers[2] ?? 'partial']) / 2),
    escala: ANSWER_TO_SCORE[answers[3] ?? 'partial'] ?? 52,
    ia: ANSWER_TO_SCORE[answers[4] ?? 'partial'] ?? 52
  }

  // Invert so that "no" shows high concern
  const concern = {
    caja: 100 - dimScores.caja,
    ops: 100 - dimScores.ops,
    escala: 100 - dimScores.escala,
    ia: 100 - dimScores.ia
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem'
      }}
    >
      {/* Glow */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${data.glow} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <motion.div
        variants={STAGGER}
        initial="initial"
        animate="animate"
        style={{ maxWidth: '620px', width: '100%' }}
      >
        {/* Label */}
        <motion.div variants={ITEM} style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: data.color, fontWeight: 600 }}>
            Resultado del análisis
          </span>
        </motion.div>

        {/* Pre-headline */}
        <motion.p
          variants={ITEM}
          style={{ fontSize: '1rem', color: 'rgba(160,175,210,0.55)', marginBottom: '0.6rem' }}
        >
          Tu restricción dominante hoy es
        </motion.p>

        {/* Route name */}
        <motion.h1
          variants={ITEM}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: data.color,
            margin: '0 0 1rem',
            textShadow: `0 0 40px ${data.color}60`
          }}
        >
          {data.label}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={ITEM}
          style={{
            fontSize: '1rem',
            color: 'rgba(180,190,220,0.7)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '480px'
          }}
        >
          {data.description}
        </motion.p>

        {/* Score card */}
        <motion.div
          variants={ITEM}
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}
        >
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(140,155,190,0.4)', marginBottom: '1.2rem' }}>
            Mapa de atención
          </p>
          {DIM_LABELS.map((dim, i) => (
            <DimensionBar
              key={dim.key}
              label={dim.label}
              score={concern[dim.key]}
              color={data.color}
              delay={200 + i * 150}
            />
          ))}
        </motion.div>

        {/* Answer recap chips */}
        <motion.div
          variants={ITEM}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}
        >
          {QUESTIONS.map((q, i) => {
            const a = answers[i]
            const chipColor = a === 'yes' ? '#00E5FF' : a === 'partial' ? '#7B61FF' : '#F97316'
            const label = a === 'yes' ? 'Sí' : a === 'partial' ? 'Parcial' : 'No'
            return (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  padding: '0.28rem 0.7rem',
                  borderRadius: '999px',
                  border: `1px solid ${chipColor}30`,
                  color: chipColor,
                  background: `${chipColor}0A`
                }}
              >
                <span style={{ opacity: 0.6 }}>{q.dimension}</span> · {label}
              </span>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div variants={ITEM}>
          <button
            onClick={onNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: data.color,
              color: '#06091A',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.9rem 2.2rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 0 32px ${data.color}40`,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            Ver demo de valor en vivo
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
