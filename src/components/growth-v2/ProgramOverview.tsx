'use client'

import { motion } from 'framer-motion'

interface Props {
  onNext: () => void
}

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

const STAGGER = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const ITEM = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const TRACKS = [
  { color: '#00E5FF', label: 'Liberación de Caja', desc: 'Márgenes, mezcla y flujo' },
  { color: '#7B61FF', label: 'Optimización de Procesos', desc: 'Operación y autonomía' },
  { color: '#00FF8C', label: 'Transformación con IA', desc: 'Automatización estratégica' },
  { color: '#F97316', label: 'Franchise Readiness', desc: 'Modelo replicable' }
]

const LOGOS = [
  { name: 'MinTIC', sub: 'Colombia' },
  { name: 'BID', sub: 'Banco Interamericano' },
  { name: 'PNUD', sub: 'Naciones Unidas' },
  { name: 'Propaís', sub: 'Colombia' },
  { name: 'Corea del Sur', sub: 'Gobierno' }
]

export function ProgramOverview({ onNext }: Props) {
  return (
    <motion.div
      variants={PAGE}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ padding: '4rem 1.5rem', maxWidth: '720px', margin: '0 auto' }}
    >
      <motion.div variants={STAGGER} initial="initial" animate="animate">

        {/* Program header */}
        <motion.div variants={ITEM} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,229,255,0.6)', fontWeight: 600 }}>
            El programa
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#EEF2FF', margin: '0.7rem 0 1rem', lineHeight: 1.1 }}>
            Growth Intelligence System
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(160,175,210,0.6)', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
            Un sistema continuo de aceleración para empresas con señales reales de crecimiento.
          </p>
        </motion.div>

        {/* What it's NOT / IS */}
        <motion.div
          variants={ITEM}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.3rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(140,155,190,0.35)', marginBottom: '0.8rem' }}>No es</p>
            {['Consultoría suelta', 'Esfuerzo aislado', 'Auditoría puntual', 'Teoría sin ejecución'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(255,80,80,0.4)', fontSize: '0.75rem' }}>✕</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(140,155,190,0.45)' }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.1)', borderRadius: '14px', padding: '1.3rem' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,229,255,0.5)', marginBottom: '0.8rem' }}>Sí es</p>
            {['Sistema continuo y sostenido', 'Ruta específica a tu etapa', 'Diagnóstico + ejecución', 'Aceleración con criterio'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#00E5FF', fontSize: '0.75rem' }}>✓</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(180,190,220,0.7)' }}>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tracks */}
        <motion.div variants={ITEM} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(140,155,190,0.35)', marginBottom: '1rem', textAlign: 'center' }}>
            Rutas del programa
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {TRACKS.map(t => (
              <div
                key={t.label}
                style={{
                  background: `${t.color}08`,
                  border: `1px solid ${t.color}20`,
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color, margin: '0 auto 0.6rem', boxShadow: `0 0 10px ${t.color}80` }} />
                <div style={{ fontSize: '0.82rem', color: 'rgba(200,210,240,0.8)', fontWeight: 600, marginBottom: '0.2rem', lineHeight: 1.3 }}>{t.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(140,155,190,0.4)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Credibility strip */}
        <motion.div variants={ITEM} style={{ marginBottom: '3.5rem' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

          <p style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(140,155,190,0.3)', textAlign: 'center', marginBottom: '1.5rem' }}>
            Respaldado por
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {LOGOS.map(logo => (
              <div
                key={logo.name}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(200,210,240,0.7)', letterSpacing: '0.02em' }}>{logo.name}</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(140,155,190,0.35)', marginTop: '0.1rem' }}>{logo.sub}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'rgba(140,155,190,0.35)', textAlign: 'center', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto' }}>
            Programa con historial en transformación, innovación y aceleración empresarial. Ganadores de convocatorias con Colciencias y MinTIC Colombia.
          </p>
        </motion.div>

        {/* CTA to next */}
        <motion.div variants={ITEM} style={{ textAlign: 'center' }}>
          <button
            onClick={onNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255,255,255,0.05)',
              color: '#EEF2FF',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.85rem 2.2rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.06)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,229,255,0.2)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            Ver cómo entrar al programa
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>

      </motion.div>
    </motion.div>
  )
}
