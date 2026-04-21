import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PAIN_MAP, GOAL_MAP } from '@/components/diagnostico/data';
import type { Company, Answers, IntelData } from '@/types/diagnostico';

export const runtime = 'nodejs';
export const maxDuration = 30;

// In-memory rate limiter: 3 req/hour/IP per instance.
// Upgrade to Upstash Redis for cross-instance persistence on Vercel.
const rl = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.resetAt) {
    rl.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // Periodic cleanup to avoid unbounded growth
    if (Math.random() < 0.05) {
      for (const [k, v] of rl.entries()) {
        if (now > v.resetAt) rl.delete(k);
      }
    }
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

// DO NOT MODIFY: prompt tuned per brief
const buildPrompt = (company: Company, pain: string, goal: string) => `\
Eres un analista de negocios y marketing digital especializado en empresas latinoamericanas.

Empresa: "${company.name}"${company.instagram ? `\nInstagram: @${company.instagram}` : ''}${company.website ? `\nWebsite: ${company.website}` : ''}
Mayor dolor declarado: ${pain}
Meta en 12 meses: ${goal}

Genera un análisis de inteligencia digital simulado, como si hubieras revisado Google Maps, Instagram y plataformas de delivery. Los reviews deben ser MUY concretos, con dolores reales típicos de este tipo de negocio en Latinoamérica. Hazlos creíbles y específicos.

Responde ÚNICAMENTE con JSON válido (sin markdown, sin explicaciones). Formato exacto:
{
  "business_type": "tipo de negocio en 3-5 palabras",
  "reviews": [
    {"text": "reseña realista máx 70 palabras que refleje un dolor real del cliente", "rating": 3, "source": "Google Maps", "sentiment": "negative"},
    {"text": "otra reseña", "rating": 4, "source": "Google Maps", "sentiment": "mixed"},
    {"text": "reseña positiva con área de mejora", "rating": 5, "source": "Instagram", "sentiment": "positive"}
  ],
  "signals": [
    "señal de mercado externa concreta (1 línea)",
    "oportunidad o amenaza del sector",
    "observación sobre su tipo de cliente"
  ],
  "digital_summary": "observación sobre su presencia digital y reputación online en 1-2 oraciones directas"
}`;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no configurada' },
      { status: 500 }
    );
  }

  let body: { company: Company; answers: Answers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { company, answers } = body;
  if (!company?.name || !answers) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const pain = PAIN_MAP[answers.pain] ?? 'crecer de manera sostenible';
  const goal = GOAL_MAP[answers.goal] ?? 'seguir creciendo';

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1400,
      messages: [{ role: 'user', content: buildPrompt(company, pain, goal) }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text ?? '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const intel: IntelData = JSON.parse(clean);

    return NextResponse.json(intel);
  } catch (e) {
    console.error('[business-intel]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'parse_failed' },
      { status: 502 }
    );
  }
}
