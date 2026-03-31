'use client'

import { motion } from 'framer-motion'
import { type RouteType, ROUTE_DATA } from './types'
import { STRIPE_LINK, CALENDLY_LINK } from './config'

interface Props {
  route: RouteType
}

const PAGE = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

const STAGGER = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const ITEM = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function FinalCTA({ route }: Props) {
  const data = ROUTE_DATA[route]

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
        padding: '3rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${data.glow} 0%, rgba(123,97,255,0.05) 40%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <motion.div
        variants={STAGGER}
        initial="initial"
        animate="animate"
        style={{ maxWidth: '580px', width: '100%', textAlign: 'center', position: 'relative' }}
      >
        {/* Route reminder chip */}
        <motion.div variants={ITEM} style={{ marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: data.color,
            border: `1px solid ${data.color}30`,
            background: `${data.color}0A`,
            borderRadius: '999px',
            padding: '0.35rem 0.9rem'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: data.color, display: 'inline-block' }} />
            {data.label}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          variants={ITEM}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#EEF2FF',
            margin: '0 0 1.2rem'
          }}
        >
          Si ves el potencial,<br />este es el momento de entrar.
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          variants={ITEM}
          style={{
            fontSize: '1rem',
            color: 'rgba(160,175,210,0.6)',
            lineHeight: 1.6,
            marginBottom: '3rem',
            maxWidth: '440px',
            margin: '0 auto 3rem'
          }}
        >
          Los negocios correctos no necesitan más teoría.
          Necesitan la ruta correcta y ejecución.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={ITEM} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* Primary CTA */}
          <a
            href={STRIPE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#00E5FF',
              color: '#06091A',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '1rem 2.5rem',
              borderRadius: '999px',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(0,229,255,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 56px rgba(0,229,255,0.5)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(0,229,255,0.35)'
            }}
          >
            Separar mi cupo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* Secondary CTA */}
          <a
            href={CALENDLY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(160,175,210,0.6)',
              fontSize: '0.9rem',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(200,210,240,0.85)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(160,175,210,0.6)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Agendar llamada primero
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={ITEM}
          style={{
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center'
          }}
        >
          {[
            'MinTIC · BID · PNUD',
            'Programa acreditado',
            'Resultados medibles'
          ].map(t => (
            <span key={t} style={{ fontSize: '0.72rem', color: 'rgba(140,155,190,0.3)', letterSpacing: '0.04em' }}>
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
