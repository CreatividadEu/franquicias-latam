'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MESSAGES = [
  'Analizando señales…',
  'Leyendo patrón de crecimiento…',
  'Detectando restricción dominante…'
]

export function AnalyzingState() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const intervals = [800, 1500]
    const timers = intervals.map((delay, i) =>
      setTimeout(() => setMsgIndex(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem'
      }}
    >
      {/* Scanning ring */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(0,229,255,0.15)',
            animation: 'scan-expand 1.8s ease-out infinite'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            border: '1px solid rgba(0,229,255,0.25)',
            animation: 'scan-expand 1.8s ease-out 0.4s infinite'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '22px',
            borderRadius: '50%',
            border: '2px solid rgba(0,229,255,0.5)',
            animation: 'spin-slow 3s linear infinite'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '33px',
            borderRadius: '50%',
            background: 'rgba(0,229,255,0.15)',
            boxShadow: '0 0 20px rgba(0,229,255,0.4)'
          }}
        />
      </div>

      {/* Message */}
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          fontSize: '0.9rem',
          color: 'rgba(0,229,255,0.7)',
          letterSpacing: '0.05em',
          fontWeight: 500
        }}
      >
        {MESSAGES[msgIndex]}
      </motion.p>

      <style>{`
        @keyframes scan-expand {
          0% { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
