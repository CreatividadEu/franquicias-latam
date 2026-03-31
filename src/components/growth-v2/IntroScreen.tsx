'use client'

import { motion } from 'framer-motion'

interface Props {
  onNext: () => void
}

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.7 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

const STAGGER = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
}

const ITEM = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export function IntroScreen({ onNext }: Props) {
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
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Radial glow behind content */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, rgba(123,97,255,0.04) 40%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        variants={STAGGER}
        initial="initial"
        animate="animate"
        style={{
          maxWidth: '680px',
          width: '100%',
          textAlign: 'center'
        }}
      >
        {/* Label */}
        <motion.div variants={ITEM} style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid rgba(0,229,255,0.2)',
              borderRadius: '999px',
              padding: '0.35rem 1rem',
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#00E5FF',
              fontWeight: 500
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00E5FF',
                boxShadow: '0 0 8px #00E5FF',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
            Growth Intelligence System
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={ITEM}
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#EEF2FF',
            margin: '0 0 1.5rem'
          }}
        >
          Tu negocio fue detectado
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            por nuestro radar.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={ITEM}
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: 'rgba(200,210,240,0.7)',
            lineHeight: 1.6,
            marginBottom: '0.9rem',
            fontWeight: 400
          }}
        >
          Identificamos señales de crecimiento en empresas como la tuya.
        </motion.p>

        <motion.p
          variants={ITEM}
          style={{
            fontSize: '0.95rem',
            color: 'rgba(160,175,210,0.55)',
            lineHeight: 1.6,
            marginBottom: '3rem'
          }}
        >
          Ahora necesitamos entender qué está frenando realmente tu siguiente etapa.
        </motion.p>

        {/* CTA */}
        <motion.div variants={ITEM}>
          <button
            onClick={onNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#00E5FF',
              color: '#06091A',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.9rem 2.2rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              boxShadow: '0 0 32px rgba(0,229,255,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 48px rgba(0,229,255,0.45)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 32px rgba(0,229,255,0.3)'
            }}
          >
            Continuar evaluación
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

        {/* Bottom hint */}
        <motion.p
          variants={ITEM}
          style={{
            marginTop: '2rem',
            fontSize: '0.78rem',
            color: 'rgba(140,155,190,0.4)',
            letterSpacing: '0.04em'
          }}
        >
          Evaluación estratégica · 2 minutos
        </motion.p>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  )
}
