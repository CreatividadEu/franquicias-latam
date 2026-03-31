'use client'

import { motion } from 'framer-motion'

interface Props {
  onNext: () => void
}

const PAGE = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } }
}

const STAGGER = {
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } }
}

const ITEM = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const CHIPS = [
  { label: 'Caja', icon: '◈' },
  { label: 'Operación', icon: '⬡' },
  { label: 'Expansión', icon: '⬢' },
  { label: 'IA & Digital', icon: '◉' }
]

export function ContextScreen({ onNext }: Props) {
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
        padding: '2rem 1.5rem'
      }}
    >
      <motion.div
        variants={STAGGER}
        initial="initial"
        animate="animate"
        style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}
      >
        {/* Step indicator */}
        <motion.div variants={ITEM} style={{ marginBottom: '2rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(140,155,190,0.5)',
              fontWeight: 500
            }}
          >
            Etapa 1 de 5
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          variants={ITEM}
          style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: '#EEF2FF',
            margin: '0 0 1rem'
          }}
        >
          Antes de continuar,<br />necesitamos entender<br />en qué punto estás.
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          variants={ITEM}
          style={{
            fontSize: '1rem',
            color: 'rgba(160,175,210,0.6)',
            lineHeight: 1.6,
            marginBottom: '2.5rem'
          }}
        >
          Esto toma menos de 2 minutos.
        </motion.p>

        {/* Dimension chips */}
        <motion.div
          variants={ITEM}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.7rem',
            justifyContent: 'center',
            marginBottom: '3rem'
          }}
        >
          {CHIPS.map((chip, i) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px',
                padding: '0.4rem 1rem',
                fontSize: '0.82rem',
                color: 'rgba(200,210,240,0.7)',
                background: 'rgba(255,255,255,0.03)',
                letterSpacing: '0.02em'
              }}
            >
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{chip.icon}</span>
              {chip.label}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={ITEM}>
          <button
            onClick={onNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255,255,255,0.06)',
              color: '#EEF2FF',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.85rem 2.2rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.08)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,229,255,0.3)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'
            }}
          >
            Empezar evaluación
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
