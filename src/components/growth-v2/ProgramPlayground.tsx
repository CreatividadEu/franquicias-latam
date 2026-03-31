'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type RouteType, ROUTE_DATA } from './types'

interface Props {
  route: RouteType
  onNext: () => void
}

const PAGE = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } }
}

// ── CAJA PLAYGROUND ────────────────────────────────────────────────────────

function PlaygroundCaja({ color, onDone }: { color: string; onDone: () => void }) {
  const [products, setProducts] = useState(['', '', '', ''])
  const [margins, setMargins] = useState(['', '', '', ''])
  const [submitted, setSubmitted] = useState(false)

  const marginNums = margins.map(m => parseFloat(m) || 0)
  const filledCount = marginNums.filter(n => n > 0).length
  const avgMargin = filledCount > 0 ? marginNums.reduce((a, b) => a + b, 0) / (filledCount || 1) : 0
  const maxMargin = Math.max(...marginNums)
  const minMargin = Math.min(...marginNums.filter(n => n > 0))
  const spread = maxMargin - minMargin

  const missingData = products.filter(p => p.trim()).length < 2 || marginNums.filter(n => n > 0).length < 2

  function handleSubmit() {
    if (missingData) return
    setSubmitted(true)
  }

  return (
    <div>
      {!submitted ? (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(160,175,210,0.55)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Escribe tus productos más vendidos y su margen bruto aproximado. Si no tienes estos datos claros,{' '}
            <span style={{ color: color }}>ya hay una señal importante aquí.</span>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem 0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(140,155,190,0.4)', paddingBottom: '0.2rem' }}>Producto</div>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(140,155,190,0.4)', paddingBottom: '0.2rem' }}>Margen %</div>
            {products.map((p, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <input
                  value={p}
                  onChange={e => setProducts(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                  placeholder={`Producto ${i + 1}`}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    color: '#EEF2FF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <input
                  value={margins[i]}
                  onChange={e => setMargins(prev => { const n = [...prev]; n[i] = e.target.value.replace(/[^0-9.]/g, ''); return n })}
                  placeholder="45"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    color: '#EEF2FF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '100%',
                    textAlign: 'center'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={missingData}
            style={{
              padding: '0.8rem 1.8rem',
              borderRadius: '999px',
              border: `1px solid ${missingData ? 'rgba(255,255,255,0.08)' : color + '60'}`,
              background: missingData ? 'rgba(255,255,255,0.03)' : `${color}15`,
              color: missingData ? 'rgba(160,175,210,0.3)' : color,
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: missingData ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Analizar mezcla comercial →
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Margen promedio', value: `${avgMargin.toFixed(1)}%`, note: avgMargin < 40 ? 'Por debajo del umbral' : 'Saludable' },
              { label: 'Spread de márgenes', value: `${spread.toFixed(0)} pts`, note: spread > 25 ? 'Mezcla heterogénea' : 'Consistente' }
            ].map(kpi => (
              <div key={kpi.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(140,155,190,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{kpi.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color, marginBottom: '0.2rem' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(160,175,210,0.45)' }}>{kpi.note}</div>
              </div>
            ))}
          </div>

          <div style={{ background: `${color}0A`, border: `1px solid ${color}25`, borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'rgba(200,210,240,0.75)', lineHeight: 1.6, margin: 0 }}>
              {spread > 25
                ? `Tu mezcla comercial tiene productos que pueden estar financiando crecimiento sin caja. Productos con márgenes bajos consumen capacidad sin retornar proporcionalmente.`
                : `Tu estructura de márgenes tiene potencial de optimización. Una revisión de la mezcla puede liberar flujo de caja sin aumentar ventas.`}
              {avgMargin < 40 && ' Hay espacio visible para mejorar rentabilidad antes de escalar.'}
            </p>
          </div>

          <button onClick={onDone} style={{ padding: '0.8rem 1.8rem', borderRadius: '999px', border: `1px solid ${color}40`, background: `${color}15`, color, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
            Continuar →
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ── PROCESOS PLAYGROUND ────────────────────────────────────────────────────

const BOTTLENECKS = ['Gestión de pedidos / entregas', 'Atención al cliente', 'Coordinación de equipo', 'Reportes y seguimiento', 'Calidad del producto/servicio']
const DEPENDENCY_LEVELS = ['El equipo opera solo', 'Superviso decisiones clave', 'Deben consultarme casi todo', 'Sin mí, se para']

function PlaygroundProcesos({ color, onDone }: { color: string; onDone: () => void }) {
  const [bottleneck, setBottleneck] = useState<string | null>(null)
  const [dependency, setDependency] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const insights: Record<number, string> = {
    0: 'Tu equipo tiene autonomía. El siguiente paso es documentar y sistematizar para mantener ese estándar al escalar.',
    1: 'Supervisar decisiones clave puede ser correcto, pero si se convierte en cuello de botella, limita tu capacidad de crecimiento.',
    2: 'Alta dependencia. Antes de crecer, hay que descentralizar decisiones con protocolos y playbooks claros.',
    3: 'El negocio no es aún escalable. La prioridad es crear un sistema que opere sin tu presencia constante.'
  }

  return (
    <div>
      {!submitted ? (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(140,155,190,0.5)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Principal cuello de botella</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {BOTTLENECKS.map(b => (
                <button
                  key={b}
                  onClick={() => setBottleneck(b)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    border: `1px solid ${bottleneck === b ? color + '60' : 'rgba(255,255,255,0.07)'}`,
                    background: bottleneck === b ? `${color}0D` : 'rgba(255,255,255,0.02)',
                    color: bottleneck === b ? color : 'rgba(180,190,220,0.65)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(140,155,190,0.5)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nivel de dependencia del equipo hacia ti</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DEPENDENCY_LEVELS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDependency(i)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    border: `1px solid ${dependency === i ? color + '60' : 'rgba(255,255,255,0.07)'}`,
                    background: dependency === i ? `${color}0D` : 'rgba(255,255,255,0.02)',
                    color: dependency === i ? color : 'rgba(180,190,220,0.65)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => bottleneck && dependency !== null && setSubmitted(true)}
            disabled={!bottleneck || dependency === null}
            style={{
              padding: '0.8rem 1.8rem', borderRadius: '999px',
              border: `1px solid ${(!bottleneck || dependency === null) ? 'rgba(255,255,255,0.08)' : color + '60'}`,
              background: (!bottleneck || dependency === null) ? 'rgba(255,255,255,0.03)' : `${color}15`,
              color: (!bottleneck || dependency === null) ? 'rgba(160,175,210,0.3)' : color,
              fontSize: '0.88rem', fontWeight: 600,
              cursor: (!bottleneck || dependency === null) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Ver diagnóstico →
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: `${color}0A`, border: `1px solid ${color}25`, borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.7rem', color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Diagnóstico operativo</p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(200,210,240,0.75)', lineHeight: 1.6, margin: 0 }}>
              {insights[dependency ?? 1]}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'rgba(160,175,210,0.6)', margin: 0, lineHeight: 1.6 }}>
              El problema en <span style={{ color }}>{bottleneck}</span> no es de demanda — es de consistencia en ejecución. Resolver esto antes de escalar evita amplificar el caos.
            </p>
          </div>
          <button onClick={onDone} style={{ padding: '0.8rem 1.8rem', borderRadius: '999px', border: `1px solid ${color}40`, background: `${color}15`, color, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
            Continuar →
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ── IA PLAYGROUND ──────────────────────────────────────────────────────────

const TASKS = ['Atención y seguimiento de clientes', 'Reportes y análisis', 'Coordinación de equipo', 'Gestión de inventario', 'Prospección y ventas', 'Facturación y cobranza']
const TOOLS = ['WhatsApp manual', 'Hojas de cálculo', 'CRM básico', 'Sin sistema definido', 'Herramientas avanzadas']

function PlaygroundIA({ color, onDone }: { color: string; onDone: () => void }) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [tool, setTool] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const automationScore = Math.min(95, selectedTasks.length * 18 + (tool === 'Sin sistema definido' ? 20 : tool === 'WhatsApp manual' || tool === 'Hojas de cálculo' ? 15 : 5))

  function toggleTask(t: string) {
    setSelectedTasks(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <div>
      {!submitted ? (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(140,155,190,0.5)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>¿Qué tareas consumen más tiempo? (selecciona las que apliquen)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TASKS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTask(t)}
                  style={{
                    padding: '0.45rem 0.9rem', borderRadius: '999px',
                    border: `1px solid ${selectedTasks.includes(t) ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                    background: selectedTasks.includes(t) ? `${color}12` : 'rgba(255,255,255,0.02)',
                    color: selectedTasks.includes(t) ? color : 'rgba(160,175,210,0.55)',
                    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(140,155,190,0.5)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Herramienta principal que usa tu equipo hoy</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {TOOLS.map(t => (
                <button key={t} onClick={() => setTool(t)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: `1px solid ${tool === t ? color + '50' : 'rgba(255,255,255,0.07)'}`, background: tool === t ? `${color}0D` : 'rgba(255,255,255,0.02)', color: tool === t ? color : 'rgba(180,190,220,0.6)', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedTasks.length > 0 && tool && setSubmitted(true)}
            disabled={selectedTasks.length === 0 || !tool}
            style={{ padding: '0.8rem 1.8rem', borderRadius: '999px', border: `1px solid ${(selectedTasks.length === 0 || !tool) ? 'rgba(255,255,255,0.08)' : color + '60'}`, background: (selectedTasks.length === 0 || !tool) ? 'rgba(255,255,255,0.03)' : `${color}15`, color: (selectedTasks.length === 0 || !tool) ? 'rgba(160,175,210,0.3)' : color, fontSize: '0.88rem', fontWeight: 600, cursor: (selectedTasks.length === 0 || !tool) ? 'not-allowed' : 'pointer' }}
          >
            Ver potencial de automatización →
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(140,155,190,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Potencial de automatización</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{automationScore}%</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(160,175,210,0.4)' }}>Estimado sobre tu perfil</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(140,155,190,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Áreas con mayor ROI</div>
              <div style={{ fontSize: '0.92rem', color, fontWeight: 600 }}>{selectedTasks[0]}</div>
              {selectedTasks[1] && <div style={{ fontSize: '0.78rem', color: 'rgba(160,175,210,0.4)', marginTop: '0.2rem' }}>+{selectedTasks.length - 1} más</div>}
            </div>
          </div>
          <div style={{ background: `${color}0A`, border: `1px solid ${color}20`, borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'rgba(200,210,240,0.75)', lineHeight: 1.6, margin: 0 }}>
              IA no debería entrar como parche, sino sobre una secuencia correcta. Tu negocio tiene oportunidades claras de eficiencia — la clave es priorizar dónde el impacto es mayor antes de implementar.
            </p>
          </div>
          <button onClick={onDone} style={{ padding: '0.8rem 1.8rem', borderRadius: '999px', border: `1px solid ${color}40`, background: `${color}15`, color, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Continuar →</button>
        </motion.div>
      )}
    </div>
  )
}

// ── FRANQUICIA PLAYGROUND ──────────────────────────────────────────────────

const READINESS_CRITERIA = [
  { id: 'auto', label: 'El negocio funciona sin mí al menos 2 semanas seguidas' },
  { id: 'proc', label: 'Tengo procesos documentados y repetibles' },
  { id: 'std', label: 'Podría abrir otra sede con el mismo estándar' },
  { id: 'fin', label: 'Tengo claridad financiera: márgenes, costos, breakeven' },
  { id: 'brand', label: 'Mi marca tiene identidad y propuesta de valor clara' }
]

function PlaygroundFranquicia({ color, onDone }: { color: string; onDone: () => void }) {
  const [checked, setChecked] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const score = Math.round((checked.length / READINESS_CRITERIA.length) * 100)

  function toggle(id: string) {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const insight =
    score >= 80
      ? 'Tu negocio muestra un nivel de readiness avanzado. El siguiente paso es la validación formal del modelo y la estructuración legal y operativa para expansión.'
      : score >= 60
      ? 'Hay potencial de expansión, pero algunos pilares críticos aún no están sólidos. Expandirse sin ellos convierte potencial en fricción.'
      : 'Tu modelo aún no está completamente listo para replicarse. Fortalecer los pilares faltantes es la prioridad antes de pensar en franquiciar.'

  return (
    <div>
      {!submitted ? (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(160,175,210,0.55)', marginBottom: '1.2rem' }}>Marca lo que aplica hoy a tu negocio:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {READINESS_CRITERIA.map(c => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.85rem 1rem', borderRadius: '12px',
                  border: `1px solid ${checked.includes(c.id) ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                  background: checked.includes(c.id) ? `${color}0D` : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${checked.includes(c.id) ? color : 'rgba(255,255,255,0.2)'}`, background: checked.includes(c.id) ? color : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {checked.includes(c.id) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#06091A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: '0.88rem', color: checked.includes(c.id) ? 'rgba(220,230,255,0.9)' : 'rgba(160,175,210,0.6)' }}>{c.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setSubmitted(true)} style={{ padding: '0.8rem 1.8rem', borderRadius: '999px', border: `1px solid ${color}50`, background: `${color}12`, color, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
            Ver mi Franchise Readiness Score →
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color, textShadow: `0 0 30px ${color}60`, marginBottom: '0.3rem' }}>{score}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(140,155,190,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Franchise Readiness Score</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', margin: '1rem 0', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.9 }} style={{ height: '100%', background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: '999px' }} />
            </div>
          </div>
          <div style={{ background: `${color}0A`, border: `1px solid ${color}20`, borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'rgba(200,210,240,0.75)', lineHeight: 1.6, margin: 0 }}>{insight}</p>
          </div>
          <button onClick={onDone} style={{ padding: '0.8rem 1.8rem', borderRadius: '999px', border: `1px solid ${color}40`, background: `${color}15`, color, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Continuar →</button>
        </motion.div>
      )}
    </div>
  )
}

// ── MAIN PLAYGROUND WRAPPER ────────────────────────────────────────────────

const PLAYGROUND_LABELS: Record<RouteType, string> = {
  caja: 'Análisis de mezcla comercial',
  procesos: 'Diagnóstico operativo',
  ia: 'Mapa de automatización',
  franquicia: 'Franchise Readiness Assessment'
}

const PLAYGROUND_DESC: Record<RouteType, string> = {
  caja: 'Veamos cómo está tu estructura de márgenes. No necesitas datos exactos — una estimación ya revela mucho.',
  procesos: 'Identifiquemos dónde está la fricción real en tu operación.',
  ia: 'Mapeemos dónde la automatización puede generar mayor impacto en tu negocio.',
  franquicia: 'Evaluemos en qué punto está la preparación de tu modelo para escalar.'
}

export function ProgramPlayground({ route, onNext }: Props) {
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
        padding: '3rem 1.5rem'
      }}
    >
      <div style={{ maxWidth: '620px', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: data.color, fontWeight: 600 }}>
            Demo de valor · {PLAYGROUND_LABELS[route]}
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.025em', color: '#EEF2FF', margin: '0.6rem 0 0.5rem', lineHeight: 1.2 }}>
            {PLAYGROUND_LABELS[route]}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(160,175,210,0.55)', lineHeight: 1.5 }}>
            {PLAYGROUND_DESC[route]}
          </p>
        </div>

        {/* Playground card */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.75rem' }}>
          <AnimatePresence mode="wait">
            {route === 'caja' && <PlaygroundCaja key="caja" color={data.color} onDone={onNext} />}
            {route === 'procesos' && <PlaygroundProcesos key="procesos" color={data.color} onDone={onNext} />}
            {route === 'ia' && <PlaygroundIA key="ia" color={data.color} onDone={onNext} />}
            {route === 'franquicia' && <PlaygroundFranquicia key="franquicia" color={data.color} onDone={onNext} />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
