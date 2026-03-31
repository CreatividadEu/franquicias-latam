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
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function ValueReframe({ onNext }: Props) {
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
        {/* Divider line */}
        <motion.div
          variants={ITEM}
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            margin: '0 auto 2.5rem'
          }}
        />

        {/* Main headline */}
        <motion.h2
          variants={ITEM}
          style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            color: '#EEF2FF',
            margin: '0 0 1.2rem'
          }}
        >
          Esto no es<br />el programa completo.
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          variants={ITEM}
          style={{
            fontSize: '1.05rem',
            color: 'rgba(160,175,210,0.6)',
            lineHeight: 1.6,
            marginBottom: '3rem',
            maxWidth: '440px',
            margin: '0 auto 3rem'
          }}
        >
          Es solo una pequeña muestra de cómo identificamos la ruta correcta
          y activamos mejoras reales en cada etapa del negocio.
        </motion.p>

        {/* Value chips */}
        <motion.div
          variants={ITEM}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '3rem',
            textAlign: 'left'
          }}
        >
          {[
            { icon: '◈', text: 'Diagnóstico continuo, no puntual' },
            { icon: '⬡', text: 'Rutas específicas por restricción' },
            { icon: '◉', text: 'Implementación, no solo análisis' },
            { icon: '⬢', text: 'Sistema que escala contigo' }
          ].map(chip => (
            <div
              key={chip.text}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.9rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px'
              }}
            >
              <span style={{ color: 'rgba(0,229,255,0.5)', fontSize: '0.85rem', marginTop: '0.05rem' }}>
                {chip.icon}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(180,190,220,0.65)', lineHeight: 1.4 }}>
                {chip.text}
              </span>
            </div>
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
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.07)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,229,255,0.25)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            Ver el programa completo
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
