import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildDossier } from '@/lib/seneca/engine';
import { BRAND_PORTFOLIO, SEGMENTS } from '@/lib/seneca/knowledge';
import type { Dossier, SegmentId, SenecaRequest } from '@/lib/seneca/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Rate limit en memoria: 30 análisis/hora/IP por instancia.
const rl = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 30;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.resetAt) {
    rl.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (Math.random() < 0.05) {
      for (const [k, v] of rl.entries()) if (now > v.resetAt) rl.delete(k);
    }
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

const VALID_SEGMENTS: SegmentId[] = ['horeca', 'construccion', 'diseno', 'retail', 'corporativo', 'b2c'];

function buildPrompt(client: string, base: Dossier, city?: string): string {
  const portfolio = BRAND_PORTFOLIO.map((b) => `- ${b.brand}: ${b.focus}`).join('\n');
  const segments = VALID_SEGMENTS.map((s) => `- ${s}: ${SEGMENTS[s].label}`).join('\n');
  return `Eres el motor de inteligencia comercial "Seneca Int." de Bamicol, importador de electrodomésticos de alta gama en Colombia (distribuidor exclusivo de Fhiaba, Bertazzoni, Franke y Teka; portafolio con Sub-Zero, Wolf y Cove; atiende hogar y HORECA).

Portafolio Bamicol:
${portfolio}

Segmentos válidos:
${segments}

Cliente potencial a analizar: "${client}"${city ? ` (ciudad: ${city})` : ''}
Clasificación preliminar del motor local: segmento=${base.segment}, subvertical="${base.subVertical}".
Usa tu conocimiento real de esta empresa o persona en Colombia si la reconoces; si no, infiere por el nombre. Puedes corregir el segmento si el preliminar es errado.

Genera un dossier comercial hiperespecífico EN ESPAÑOL para que un vendedor de Bamicol aborde a este cliente. Sé concreto y accionable, con conocimiento del mercado colombiano.

Responde ÚNICAMENTE con JSON válido (sin markdown). Formato exacto:
{
  "segment": "uno de: horeca|construccion|diseno|retail|corporativo|b2c",
  "subVertical": "subvertical específica (3-6 palabras)",
  "confidence": 85,
  "score": 80,
  "summary": "resumen ejecutivo del cliente y por qué es (o no) una gran oportunidad para Bamicol, 2-3 frases",
  "pains": [
    {"title": "dolor", "detail": "explicación específica de este cliente", "severity": 5, "solution": "cómo Bamicol lo resuelve con marcas concretas"}
  ],
  "buyers": [
    {"role": "rol", "title": "cargo", "power": "decisor|influenciador|usuario|bloqueador", "cares": "qué le importa", "angle": "ángulo de entrada concreto"}
  ],
  "products": [
    {"brand": "marca del portafolio", "line": "línea", "why": "por qué para este cliente", "tag": "etiqueta 1-2 palabras"}
  ],
  "signals": ["señal de mercado o social específica de este cliente", "otra señal", "otra"],
  "playbook": {
    "opener": "guion de apertura por WhatsApp personalizado para este cliente, 3-4 frases, tono consultivo colombiano",
    "discovery": ["pregunta 1", "pregunta 2", "pregunta 3", "pregunta 4", "pregunta 5"],
    "objections": [{"objection": "objeción probable", "response": "respuesta ganadora"}],
    "nextSteps": ["paso 1", "paso 2", "paso 3", "paso 4"]
  }
}
Incluye exactamente 5 pains, 4 buyers, 3-4 products, 3 signals, 3 objections.`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
  }

  let body: SenecaRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const client = body.client?.trim();
  if (!client || client.length < 2 || client.length > 120) {
    return NextResponse.json({ error: 'missing_client' }, { status: 400 });
  }
  const segment = body.segment && VALID_SEGMENTS.includes(body.segment) ? body.segment : undefined;

  // Motor local: base garantizada (y respuesta directa en modo fast / sin API key).
  const base = buildDossier(client, { segment, city: body.city });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || body.mode === 'fast') {
    return NextResponse.json(base);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3500,
      messages: [{ role: 'user', content: buildPrompt(client, base, body.city) }],
    });
    const block = msg.content[0];
    const raw = block?.type === 'text' ? block.text : '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const ai = JSON.parse(clean) as Partial<Dossier>;

    const seg: SegmentId = segment ?? (VALID_SEGMENTS.includes(ai.segment as SegmentId) ? (ai.segment as SegmentId) : base.segment);
    const k = SEGMENTS[seg];

    const dossier: Dossier = {
      ...base,
      segment: seg,
      segmentLabel: k.label,
      ticketRange: k.ticketRange,
      labels: { pains: k.painsLabel, buyers: k.buyersLabel },
      subVertical: ai.subVertical || base.subVertical,
      confidence: clamp(ai.confidence, base.confidence),
      score: clamp(ai.score, base.score),
      summary: ai.summary || base.summary,
      pains: Array.isArray(ai.pains) && ai.pains.length ? ai.pains : base.pains,
      buyers: Array.isArray(ai.buyers) && ai.buyers.length ? ai.buyers : base.buyers,
      products: Array.isArray(ai.products) && ai.products.length ? ai.products : base.products,
      signals: Array.isArray(ai.signals) && ai.signals.length ? ai.signals : base.signals,
      playbook: ai.playbook?.opener ? { ...base.playbook, ...ai.playbook } : base.playbook,
      source: 'ai',
    };
    return NextResponse.json(dossier);
  } catch (e) {
    console.error('[seneca] IA falló, usando motor local:', e);
    return NextResponse.json(base);
  }
}

function clamp(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
}
