import type { Question, ProgramKey } from '@/types/diagnostico';

// ─── DO NOT MODIFY: scoring logic locked per brief ───────────────────────────
export const QUESTIONS: Question[] = [
  {
    id: 'years',
    text: '¿Cuánto tiempo llevas operando tu negocio?',
    sub: 'Incluye el tiempo desde que abriste la primera unidad.',
    dimension: 'Madurez',
    options: [
      { label: 'Menos de 1 año',   value: 'new',    scores: { D: 3, A: 0, F: 0 } },
      { label: '1 a 3 años',       value: 'early',  scores: { D: 2, A: 1, F: 0 } },
      { label: '3 a 5 años',       value: 'mid',    scores: { D: 0, A: 2, F: 1 } },
      { label: 'Más de 5 años',    value: 'mature', scores: { D: 0, A: 1, F: 3 } },
    ],
  },
  {
    id: 'units',
    text: '¿Cuántas unidades o sucursales tienes actualmente?',
    sub: 'Locales propios, franquicias activas, o puntos de venta.',
    dimension: 'Escala Actual',
    options: [
      { label: 'Solo tengo 1',    value: 'one',    scores: { D: 2, A: 1, F: 0 } },
      { label: 'Entre 2 y 5',     value: 'few',    scores: { D: 1, A: 2, F: 1 } },
      { label: 'Entre 6 y 20',    value: 'medium', scores: { D: 0, A: 2, F: 2 } },
      { label: 'Más de 20',       value: 'large',  scores: { D: 0, A: 1, F: 3 } },
    ],
  },
  {
    id: 'pain',
    text: '¿Cuál es el mayor dolor de tu negocio hoy?',
    sub: 'Sé honesto — esto es lo que más nos importa entender.',
    dimension: 'Área de Oportunidad',
    options: [
      { label: 'Conseguir más clientes y ventas',       value: 'sales',  scores: { D: 1, A: 2, F: 1 } },
      { label: 'Mejorar mis operaciones y procesos',    value: 'ops',    scores: { D: 2, A: 1, F: 1 } },
      { label: 'Construir y retener un buen equipo',    value: 'people', scores: { D: 2, A: 1, F: 0 } },
      { label: 'Escalar sin perder calidad ni control', value: 'scale',  scores: { D: 0, A: 2, F: 2 } },
    ],
  },
  {
    id: 'systems',
    text: '¿Qué tan bien documentados están tus procesos?',
    sub: 'Piensa en manuales, procedimientos, métricas y protocolos.',
    dimension: 'Sistematización',
    options: [
      { label: 'Todo está en mi cabeza',               value: 'zero',  scores: { D: 3, A: 0, F: 0 } },
      { label: 'Tenemos algo escrito, pero informal',   value: 'low',   scores: { D: 2, A: 1, F: 0 } },
      { label: 'Bien documentados y funcionales',       value: 'high',  scores: { D: 0, A: 2, F: 1 } },
      { label: 'Muy sistematizados, casi replicables',  value: 'vhigh', scores: { D: 0, A: 1, F: 3 } },
    ],
  },
  {
    id: 'franchise',
    text: '¿Has pensado en replicar tu modelo de negocio?',
    sub: 'Ya sea vendiendo franquicias, abriendo sucursales o licenciando.',
    dimension: 'Potencial de Réplica',
    options: [
      { label: 'Sí, es mi objetivo principal',       value: 'dream',  scores: { D: 0, A: 1, F: 3 } },
      { label: 'Lo he considerado seriamente',        value: 'maybe',  scores: { D: 0, A: 1, F: 2 } },
      { label: 'Prefiero crecer de otra forma',       value: 'no',     scores: { D: 0, A: 3, F: 0 } },
      { label: 'No sé si aplica para mi negocio',    value: 'unsure', scores: { D: 2, A: 1, F: 0 } },
    ],
  },
  {
    id: 'goal',
    text: '¿Cuál es tu meta principal en los próximos 12 meses?',
    sub: 'La que más te genere emoción, no la que suena mejor.',
    dimension: 'Visión de Crecimiento',
    options: [
      { label: 'Abrir más sucursales propias',              value: 'expand', scores: { D: 0, A: 3, F: 1 } },
      { label: 'Vender mis primeras franquicias',           value: 'sell_f', scores: { D: 0, A: 0, F: 4 } },
      { label: 'Hacer mi negocio mucho más rentable',       value: 'profit', scores: { D: 1, A: 2, F: 1 } },
      { label: 'Ordenar el equipo y la operación',          value: 'order',  scores: { D: 3, A: 1, F: 0 } },
    ],
  },
];

// DO NOT MODIFY: algorithm locked
export const DIM_Q_MAP = [0, 1, 3, 4, 5]; // radar axis idx → question idx
export const DIM_LABELS = ['Madurez', 'Escala', 'Sistemas', 'Potencial', 'Visión'];
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgramDef {
  id: string;
  name: string;
  badge: string;
  color: string;
  colorSoft: string;
  colorBorder: string;
  tagline: string;
  pillars: { icon: string; title: string; desc: string }[];
  cta: string;
  ctaTextColor: string;
}

export const PROGRAMS: Record<ProgramKey, ProgramDef> = {
  F: {
    id: 'franquicias',
    name: 'Bootcamp de\nFranquicias',
    badge: 'Tu camino: Franquicias',
    color: '#e8c557',
    colorSoft: 'rgba(232,197,87,0.1)',
    colorBorder: 'rgba(232,197,87,0.3)',
    tagline:
      'Tu modelo tiene potencial para convertirse en una franquicia exitosa. Te enseñamos a documentar, replicar y vender tu sistema.',
    pillars: [
      { icon: '📋', title: 'Diseño del Sistema',    desc: 'Manuales, procesos y estándares de tu marca' },
      { icon: '📣', title: 'Estrategia de Venta',   desc: 'Atracción y cierre de franquiciatarios calificados' },
      { icon: '🤝', title: 'Red de Franquicias',    desc: 'Soporte, control y cultura de red' },
    ],
    cta: 'Quiero franquiciar mi negocio',
    ctaTextColor: '#0a0e1a',
  },
  A: {
    id: 'aceleracion',
    name: 'Aceleración\nEmpresarial',
    badge: 'Tu camino: Aceleración',
    color: '#6a72ff',
    colorSoft: 'rgba(106,114,255,0.12)',
    colorBorder: 'rgba(106,114,255,0.35)',
    tagline:
      'Tienes un negocio sólido con grandes posibilidades. Te ayudamos a escalar con estrategia, sistemas y el equipo correcto.',
    pillars: [
      { icon: '📈', title: 'Estrategia de Escala', desc: 'Modelo de crecimiento y expansión sostenible' },
      { icon: '⚙️', title: 'Sistemas y Procesos',  desc: 'Operaciones que no dependen de ti' },
      { icon: '🔥', title: 'Liderazgo y Equipo',   desc: 'Cultura y estructura de alto desempeño' },
    ],
    cta: 'Quiero acelerar mi empresa',
    ctaTextColor: '#ffffff',
  },
  D: {
    id: 'desempeno',
    name: 'Programa de\nDesempeño',
    badge: 'Tu camino: Desempeño',
    color: '#3fd39a',
    colorSoft: 'rgba(63,211,154,0.12)',
    colorBorder: 'rgba(63,211,154,0.35)',
    tagline:
      'Antes de escalar, hay que fortalecer. Te acompañamos a ordenar tu negocio, mejorar resultados y prepararte para el siguiente nivel.',
    pillars: [
      { icon: '📊', title: 'Métricas y Control',      desc: 'Dashboard de indicadores clave de tu negocio' },
      { icon: '🔧', title: 'Mejora de Procesos',       desc: 'Eliminar cuellos de botella y desperdicios' },
      { icon: '🎯', title: 'Cultura de Resultados',    desc: 'Equipos que ejecutan y miden lo que importa' },
    ],
    cta: 'Quiero mejorar mi desempeño',
    ctaTextColor: '#0a0e1a',
  },
};

export const PAIN_MAP: Record<string, string> = {
  sales:  'conseguir más clientes y ventas',
  ops:    'mejorar sus operaciones internas',
  people: 'construir y retener equipo',
  scale:  'escalar sin perder calidad',
};

export const GOAL_MAP: Record<string, string> = {
  expand: 'abrir más sucursales',
  sell_f: 'vender franquicias',
  profit: 'aumentar rentabilidad',
  order:  'ordenar equipo y operación',
};

export const CALENDLY_BASE =
  'https://calendly.com/franquicias_latam/programa_aceleradora_franquicias';
