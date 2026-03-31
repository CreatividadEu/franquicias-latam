export type RouteType = 'caja' | 'procesos' | 'ia' | 'franquicia'
export type AnswerValue = 'yes' | 'partial' | 'no'
export type Answers = Record<number, AnswerValue>

export interface RouteData {
  label: string
  tagline: string
  color: string
  glow: string
  description: string
  dimensions: { caja: number; ops: number; escala: number; ia: number }
}

export const ROUTE_DATA: Record<RouteType, RouteData> = {
  caja: {
    label: 'Liberación de Caja',
    tagline: 'Tu próximo paso no es vender más. Es recuperar lo que ya generaste.',
    color: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.15)',
    description: 'Tu restricción principal está en el flujo de caja y la estructura de márgenes. Antes de escalar, hay que fortalecer la base financiera.',
    dimensions: { caja: 88, ops: 52, escala: 58, ia: 44 }
  },
  procesos: {
    label: 'Optimización de Procesos',
    tagline: 'Tienes demanda. El cuello de botella está en cómo ejecutas.',
    color: '#7B61FF',
    glow: 'rgba(123, 97, 255, 0.15)',
    description: 'Tu restricción está en la consistencia operativa. Reducir fricción interna antes de crecer es la prioridad.',
    dimensions: { caja: 55, ops: 90, escala: 62, ia: 48 }
  },
  ia: {
    label: 'Transformación Digital con IA',
    tagline: 'Hay eficiencia visible que aún no estás capturando.',
    color: '#00FF8C',
    glow: 'rgba(0, 255, 140, 0.15)',
    description: 'Tu modelo tiene oportunidades claras de automatización e inteligencia artificial que hoy se están dejando sobre la mesa.',
    dimensions: { caja: 58, ops: 68, escala: 54, ia: 92 }
  },
  franquicia: {
    label: 'Franchise Readiness',
    tagline: 'Tu negocio tiene señales de expansión. Pero primero debe validarse su repetibilidad.',
    color: '#F97316',
    glow: 'rgba(249, 115, 22, 0.15)',
    description: 'Hay potencial de expansión, pero expandirse sin estructura convierte potencial en fricción. Primero hay que validar el modelo.',
    dimensions: { caja: 62, ops: 72, escala: 88, ia: 56 }
  }
}

export const QUESTIONS = [
  {
    id: 0,
    question: '¿Tu caja refleja lo que realmente estás generando?',
    context: 'Flujo de efectivo, márgenes y salud financiera real',
    dimension: 'Caja'
  },
  {
    id: 1,
    question: '¿Tu operación puede absorber más demanda hoy sin frenarse?',
    context: 'Capacidad, procesos y consistencia bajo presión',
    dimension: 'Operación'
  },
  {
    id: 2,
    question: '¿Tu negocio funciona bien cuando no estás presente?',
    context: 'Autonomía del equipo y dependencia del fundador',
    dimension: 'Autonomía'
  },
  {
    id: 3,
    question: '¿Podrías abrir otra sede con el mismo estándar mañana?',
    context: 'Replicabilidad del modelo y readiness para escalar',
    dimension: 'Escala'
  },
  {
    id: 4,
    question: '¿Usas IA y automatización con criterio en tu negocio?',
    context: 'Eficiencia digital y adopción tecnológica estratégica',
    dimension: 'IA & Digital'
  }
]

export const OPTIONS = [
  { value: 'yes' as AnswerValue, label: 'Sí', subtext: 'Lo tenemos bajo control' },
  { value: 'partial' as AnswerValue, label: 'Parcialmente', subtext: 'Hay espacio de mejora' },
  { value: 'no' as AnswerValue, label: 'No realmente', subtext: 'Es un punto de atención' }
]

export function detectRoute(answers: Answers): RouteType {
  const val = (a: AnswerValue) => (a === 'no' ? 2 : a === 'partial' ? 1 : 0)
  const scores: Record<RouteType, number> = {
    caja: val(answers[0] ?? 'partial'),
    procesos: val(answers[1] ?? 'partial') + val(answers[2] ?? 'partial'),
    franquicia: val(answers[3] ?? 'partial'),
    ia: val(answers[4] ?? 'partial')
  }
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as RouteType
}

export type Stage =
  | 'intro'
  | 'context'
  | 'diagnostic'
  | 'analyzing'
  | 'result'
  | 'playground'
  | 'reframe'
  | 'program'
  | 'cta'

export const STAGE_ORDER: Stage[] = [
  'intro', 'context', 'diagnostic', 'analyzing',
  'result', 'playground', 'reframe', 'program', 'cta'
]
