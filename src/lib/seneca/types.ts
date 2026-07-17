// Seneca Int. — account intelligence types shared by engine, API and UI.

export type SegmentId =
  | 'horeca'
  | 'construccion'
  | 'diseno'
  | 'retail'
  | 'corporativo'
  | 'b2c';

export type BuyerPower = 'decisor' | 'influenciador' | 'usuario' | 'bloqueador';

export interface Pain {
  title: string;
  detail: string;
  /** 1 (leve) – 5 (crítico) */
  severity: number;
  /** Cómo Bamicol resuelve este dolor */
  solution: string;
}

export interface Buyer {
  role: string;
  title: string;
  power: BuyerPower;
  cares: string;
  angle: string;
}

export interface ProductMatch {
  brand: string;
  line: string;
  why: string;
  tag: string;
}

export interface Objection {
  objection: string;
  response: string;
}

export interface Playbook {
  opener: string;
  discovery: string[];
  objections: Objection[];
  nextSteps: string[];
}

export interface Dossier {
  client: string;
  segment: SegmentId;
  segmentLabel: string;
  subVertical: string;
  city: string | null;
  /** 0–100 */
  confidence: number;
  /** 0–100 */
  score: number;
  ticketRange: string;
  summary: string;
  pains: Pain[];
  buyers: Buyer[];
  products: ProductMatch[];
  signals: string[];
  playbook: Playbook;
  /** 'ai' = generado por Claude · 'engine' = motor determinístico local */
  source: 'ai' | 'engine';
  labels: {
    pains: string;
    buyers: string;
  };
}

export interface SenecaRequest {
  client: string;
  /** Forzar segmento; si se omite, Seneca clasifica automáticamente */
  segment?: SegmentId;
  city?: string;
  /** 'fast' se salta la IA y usa solo el motor local */
  mode?: 'ai' | 'fast';
}
