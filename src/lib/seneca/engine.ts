// Seneca Int. — motor determinístico de clasificación y generación de dossiers.
// Funciona sin IA (fallback instantáneo); la ruta /api/seneca lo usa cuando no
// hay ANTHROPIC_API_KEY o cuando el cliente pide modo 'fast'.

import {
  BUSINESS_MARKERS,
  COMMON_FIRST_NAMES,
  KNOWN_ACCOUNTS,
  SEGMENTS,
  SEGMENT_KEYWORDS,
} from './knowledge';
import type { Dossier, SegmentId } from './types';

export interface Classification {
  segment: SegmentId;
  subVertical: string;
  confidence: number;
  knownNote: string | null;
}

function normalize(raw: string): string {
  return raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/** Hash estable para variar levemente el score entre nombres distintos. */
function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function classify(rawName: string, hint?: SegmentId): Classification {
  const name = normalize(rawName);

  if (hint) {
    return {
      segment: hint,
      subVertical: SEGMENTS[hint].subVerticals[nameHash(name) % SEGMENTS[hint].subVerticals.length],
      confidence: 97,
      knownNote: null,
    };
  }

  for (const [key, acc] of Object.entries(KNOWN_ACCOUNTS)) {
    if (name.includes(normalize(key))) {
      return { segment: acc.segment, subVertical: acc.subVertical, confidence: 95, knownNote: acc.note };
    }
  }

  const scores: Partial<Record<SegmentId, number>> = {};
  for (const [seg, words] of Object.entries(SEGMENT_KEYWORDS)) {
    let s = 0;
    for (const w of words) {
      if (name.includes(normalize(w))) s += 10;
    }
    if (s > 0) scores[seg as SegmentId] = s;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length > 0) {
    const [seg, top] = ranked[0];
    const margin = ranked.length > 1 ? top - ranked[1][1] : top;
    const confidence = Math.min(92, 62 + margin + Math.min(top, 20));
    const k = SEGMENTS[seg as SegmentId];
    return {
      segment: seg as SegmentId,
      subVertical: k.subVerticals[nameHash(name) % k.subVerticals.length],
      confidence,
      knownNote: null,
    };
  }

  // Sin señales de negocio: ¿parece nombre de persona? → B2C
  const hasBusinessMarker = BUSINESS_MARKERS.some((m) => name.includes(m));
  const words = name.split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? '';
  const looksPersonal =
    !hasBusinessMarker &&
    words.length >= 2 &&
    words.length <= 4 &&
    COMMON_FIRST_NAMES.includes(firstWord);

  if (looksPersonal) {
    const k = SEGMENTS.b2c;
    return {
      segment: 'b2c',
      subVertical: k.subVerticals[nameHash(name) % k.subVerticals.length],
      confidence: 74,
      knownNote: null,
    };
  }

  // Default: cuenta corporativa genérica con confianza baja.
  const k = SEGMENTS.corporativo;
  return {
    segment: 'corporativo',
    subVertical: k.subVerticals[nameHash(name) % k.subVerticals.length],
    confidence: 55,
    knownNote: null,
  };
}

const LUX_BOOST_WORDS = ['premium', 'lujo', 'luxury', 'gourmet', 'boutique', 'gold', 'platino', 'exclusiv', 'signature'];

export function buildDossier(rawName: string, opts?: { segment?: SegmentId; city?: string }): Dossier {
  const client = rawName.trim().replace(/\s+/g, ' ');
  const cls = classify(client, opts?.segment);
  const k = SEGMENTS[cls.segment];
  const p = (text: string) => text.replaceAll('{client}', client);

  const norm = normalize(client);
  let score = k.baseScore;
  if (cls.knownNote) score += 8;
  if (LUX_BOOST_WORDS.some((w) => norm.includes(w))) score += 4;
  score += (nameHash(norm) % 13) - 6; // variación estable ±6 por nombre
  score = Math.max(35, Math.min(98, score));

  const signals = k.signals.map(p);
  if (cls.knownNote) signals.unshift(cls.knownNote);

  return {
    client,
    segment: cls.segment,
    segmentLabel: k.label,
    subVertical: cls.subVertical,
    city: opts?.city ?? null,
    confidence: cls.confidence,
    score,
    ticketRange: k.ticketRange,
    summary: p(k.summary),
    pains: k.pains.map((x) => ({ ...x, detail: p(x.detail), solution: p(x.solution) })),
    buyers: k.buyers.map((x) => ({ ...x, cares: p(x.cares), angle: p(x.angle) })),
    products: k.products,
    signals,
    playbook: {
      opener: p(k.opener),
      discovery: k.discovery.map(p),
      objections: k.objections,
      nextSteps: k.nextSteps.map(p),
    },
    source: 'engine',
    labels: { pains: k.painsLabel, buyers: k.buyersLabel },
  };
}

/** Dossier en texto plano para copiar/compartir por WhatsApp o correo. */
export function dossierToText(d: Dossier): string {
  const lines: string[] = [
    `SENECA INT. × BAMICOL — DOSSIER COMERCIAL`,
    `Cliente: ${d.client}`,
    `Segmento: ${d.segmentLabel} · ${d.subVertical}${d.city ? ` · ${d.city}` : ''}`,
    `Score de oportunidad: ${d.score}/100 · Ticket estimado: ${d.ticketRange}`,
    ``,
    `RESUMEN`,
    d.summary,
    ``,
    `${d.labels.pains.toUpperCase()}`,
    ...d.pains.map((x, i) => `${i + 1}. [${'█'.repeat(x.severity)}${'░'.repeat(5 - x.severity)}] ${x.title}\n   ${x.detail}\n   → Bamicol: ${x.solution}`),
    ``,
    `${d.labels.buyers.toUpperCase()}`,
    ...d.buyers.map((b) => `• ${b.role} (${b.power}) — ${b.title}\n  Le importa: ${b.cares}\n  Ángulo: ${b.angle}`),
    ``,
    `PORTAFOLIO RECOMENDADO`,
    ...d.products.map((x) => `• ${x.brand} — ${x.line} [${x.tag}]\n  ${x.why}`),
    ``,
    `SEÑALES`,
    ...d.signals.map((s) => `• ${s}`),
    ``,
    `GUION DE APERTURA`,
    d.playbook.opener,
    ``,
    `PREGUNTAS DE DESCUBRIMIENTO`,
    ...d.playbook.discovery.map((q, i) => `${i + 1}. ${q}`),
    ``,
    `OBJECIONES Y RESPUESTAS`,
    ...d.playbook.objections.map((o) => `• ${o.objection}\n  R/ ${o.response}`),
    ``,
    `PRÓXIMOS PASOS`,
    ...d.playbook.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `— Generado por Seneca Int. (${d.source === 'ai' ? 'IA' : 'motor local'})`,
  ];
  return lines.join('\n');
}
