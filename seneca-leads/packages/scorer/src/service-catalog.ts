/**
 * Parent-firm service catalog, hardcoded per spec §3.2.
 * Embedded once for the pain→service semantic-match component of fitScore.
 */
import OpenAI from 'openai';
import { childLogger } from '@seneca/shared';

const log = childLogger({ module: 'service-catalog' });

export interface Service {
  key: string;
  name: string;
  description: string;
}

export const SERVICE_CATALOG: Service[] = [
  {
    key: 'franquicias_latam',
    name: 'Franquicias LATAM',
    description:
      'Franchise model design, multi-unit operations, expansion playbook. Helps restaurants and SMBs scale from one location to many with consistent operations, brand standards, and replicable unit economics.',
  },
  {
    key: 'seneor_lawyers_ip',
    name: 'Seneor Lawyers IP',
    description:
      'Trademark protection, brand monitoring, contracts. Protects brand identity from copycats, secures intellectual property, drafts and reviews franchise agreements and commercial contracts.',
  },
  {
    key: 'stoika',
    name: 'Stoika',
    description:
      'Margin intelligence and pricing optimization. Identifies where margins leak (ingredient cost, supplier inefficiency, mispriced menu items), recommends price points and cost structures.',
  },
  {
    key: 'franquiciaos',
    name: 'FranquiciaOS',
    description:
      'SaaS for franchise development. Manages multi-unit operations, royalties, training, and standard operating procedures via a software platform.',
  },
  {
    key: 'ai_transformation',
    name: 'AI Transformation',
    description:
      'Bespoke AI pipelines, operations automation, customer data unification. Automates service quality monitoring, order accuracy checks, staff allocation, inventory alerts, and customer feedback analysis.',
  },
];

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing in environment');
  _client = new OpenAI({ apiKey });
  return _client;
}

let _cache: Map<string, number[]> | null = null;

/**
 * Compute (or return cached) embeddings for the 5-service catalog. Cached
 * in-process — same vectors served for every scoring run within one process.
 */
export async function getServiceEmbeddings(): Promise<Map<string, number[]>> {
  if (_cache) return _cache;
  log.info({ count: SERVICE_CATALOG.length }, 'embedding service catalog');
  const inputs = SERVICE_CATALOG.map((s) => `${s.name}: ${s.description}`);
  const res = await client().embeddings.create({
    model: 'text-embedding-3-small',
    input: inputs,
  });
  _cache = new Map();
  for (let i = 0; i < SERVICE_CATALOG.length; i++) {
    _cache.set(SERVICE_CATALOG[i]!.key, res.data[i]!.embedding);
  }
  return _cache;
}
