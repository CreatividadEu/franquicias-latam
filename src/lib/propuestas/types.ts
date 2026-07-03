/**
 * Sandbox de Propuesta — tipos del módulo.
 *
 * Una `Proposal` es la configuración completa de un sandbox de venta
 * personalizado por prospecto, renderizado en /propuesta/[slug].
 * Números y logos son placeholders configurables por cliente.
 */

export type Escenario = {
  /** 'conservador' | 'base' | 'agresivo' (o por ruta de expansión) */
  id: string;
  nombre: string;
  /** 1 línea */
  descripcion: string;
  /** Unidades acumuladas por año, p.ej. [3, 9, 20] — para animar la curva */
  unidadesPorAno: number[];
  paybackMeses?: number;
  regaliaPct?: number;
  /** Marca "recomendado" */
  destacado?: boolean;
};

export type ProposalFinanzas = {
  /** Ventas mensuales actuales (COP) — ejemplo ilustrativo editable */
  ventasMensuales: number;
  /** % que le queda a los dueños hoy */
  utilidadActualPct: number;
  /** % desde el mes de inflexión */
  utilidadOptimizadaPct: number;
  /** Mes en que aplica la optimización, p.ej. 2 */
  mesInflexion: number;
  paybackMeses?: number;
};

/** Card de video para la franja de prueba social (Fase 05). */
export type VideoCredencial = {
  titulo: string;
  /** p.ej. "@sebastianyatra" */
  handle: string;
  vistas: number;
  thumbnailUrl?: string;
  href?: string;
};

/** Módulo del stack de manuales (Fase 03). */
export type ModuloManual = {
  nombre: string;
  /** 1 línea */
  descripcion: string;
};

export type Proposal = {
  /** /propuesta/[slug] */
  slug: string;
  /** "La Clásica" */
  cliente: string;
  logoUrl?: string;
  /** "F&B" */
  industria?: string;
  /** Hex opcional; si no viene se usa el token de marca del repo */
  acento?: string;

  /** FASE 1 — ejemplo financiero (ilustrativo y editable por cliente) */
  finanzas: ProposalFinanzas;

  /** FASE 2 — hasta 3 modelos */
  escenarios: Escenario[];

  /** Oferta / urgencia */
  mesObjetivo: string; // "Agosto"
  descuentoPct: number; // 10
  /** ISO — se setea al crear la propuesta */
  createdAt: string;
  /** ISO — si no viene, se resuelve como createdAt + 7 días */
  deadline?: string;

  /** CTA / contacto */
  /** Deep-link E.164, p.ej. "+573001234567" */
  whatsapp?: string;
  /** Cal.com self-hosted */
  calUrl?: string;
  /** No indexar / no listar */
  unlisted?: boolean;
  /** Si se define, la URL requiere ?k=<accessKey> para abrir */
  accessKey?: string;

  /** Overrides opcionales de contenido (hay defaults sobrios) */
  videosMercadeo?: VideoCredencial[];
  modulosManuales?: ModuloManual[];
};
