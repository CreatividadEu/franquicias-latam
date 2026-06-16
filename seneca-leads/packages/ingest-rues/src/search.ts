/**
 * RUES Elasticsearch search client. Reverse-engineered from the
 * rues.org.co frontend bundle (services__372 + services__888):
 *
 *   wire    = base64( "Salted__" || randomSalt8 || AES-256-CBC(plain) )
 *   plain   = JSON.stringify({ term, offset, type: 1, filter: RM_FILTER })
 *   key/iv  = OpenSSL EVP_BytesToKey(MD5, 1 iter) from passphrase + salt
 *   passphrase = "ac1244b5-8bee-47b2-a4a5-924a748d907f"
 *   POST https://elasticprd.rues.org.co/query  body: { dataBody: <wire> }
 *
 * No Playwright, no CAPTCHA, no browser. Plain fetch + native crypto.
 */
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { childLogger } from '@seneca/shared';
import type { RuesCandidate } from './match.js';

const log = childLogger({ module: 'rues-search' });

const RUES_API = 'https://elasticprd.rues.org.co';
const RUES_KEY = 'ac1244b5-8bee-47b2-a4a5-924a748d907f';

const RM_FILTER = {
  Category: ['JURIDICA', 'NATURAL', 'COMERCIO', 'SUCURSAL', 'AGENCIA'],
  Status: ['ACTIVA'],
  advanced: false,
  tipoRegistro: 'RM',
} as const;

interface RuesHitSource {
  razon_social?: string;
  nit?: string | null;
  numero_identificacion?: string | null;
  matricula?: string;
  fecha_matricula?: string; // YYYYMMDD
  desc_matricula?: string; // "ACTIVA"
  desc_dpto?: string;
  desc_municipio?: string;
  cod_ciiu_act_econ_pri?: string | null;
  desc_org_juridica?: string;
  camara?: string;
  sigla?: string | null;
  desc_tipo_sociedad?: string | null;
  desc_categoria_matricula?: string | null;
}

interface RuesHit {
  _index: string;
  _id: string;
  _source: RuesHitSource;
}

interface RuesQueryResponse {
  featured?: RuesHit[];
  hits?: RuesHit[];
  total?: number;
  message?: string;
}

function evpBytesToKey(
  passphrase: Buffer,
  salt: Buffer,
  keyLen: number,
  ivLen: number,
): { key: Buffer; iv: Buffer } {
  const out = Buffer.alloc(keyLen + ivLen);
  let prev = Buffer.alloc(0);
  let written = 0;
  while (written < keyLen + ivLen) {
    const h = createHash('md5');
    h.update(prev);
    h.update(passphrase);
    h.update(salt);
    prev = h.digest();
    prev.copy(out, written);
    written += prev.length;
  }
  return { key: out.subarray(0, keyLen), iv: out.subarray(keyLen, keyLen + ivLen) };
}

function cryptoJsEncrypt(plaintext: string): string {
  const salt = randomBytes(8);
  const { key, iv } = evpBytesToKey(Buffer.from(RUES_KEY, 'utf8'), salt, 32, 16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([Buffer.from('Salted__', 'utf8'), salt, ct]).toString('base64');
}

function hitToCandidate(hit: RuesHit): RuesCandidate {
  const s = hit._source;
  // RUES sometimes pads NITs to length 14 with leading zeros; strip.
  const rawNit = (s.nit ?? s.numero_identificacion ?? '').replace(/^0+/, '');
  return {
    matricula: s.matricula ?? '',
    ...(rawNit && rawNit.length >= 6 ? { nit: rawNit } : {}),
    razonSocial: s.razon_social ?? '',
    estado: s.desc_matricula,
    ciudad: s.desc_municipio,
    departamento: s.desc_dpto,
    ...(s.cod_ciiu_act_econ_pri ? { ciiu: s.cod_ciiu_act_econ_pri } : {}),
    ...(s.fecha_matricula ? { matriculaDate: s.fecha_matricula } : {}),
    rawHtml: JSON.stringify(s),
  };
}

export interface SearchOptions {
  /** Max candidates to consider; spec says top 5. Default 5. */
  limit?: number;
}

export async function searchRues(
  query: string,
  opts: SearchOptions = {},
): Promise<RuesCandidate[]> {
  const limit = opts.limit ?? 5;
  const payload = {
    term: query,
    offset: 0,
    type: 1,
    filter: RM_FILTER,
  };
  const wire = cryptoJsEncrypt(JSON.stringify(payload));

  const res = await fetch(`${RUES_API}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
      Origin: 'https://www.rues.org.co',
      Referer: 'https://www.rues.org.co/',
      'app-name': 'RuesFront',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({ dataBody: wire }),
  });

  if (!res.ok && res.status !== 400) {
    log.error({ status: res.status, query }, 'RUES API error');
    throw new Error(`RUES API ${res.status}`);
  }

  const json = (await res.json()) as RuesQueryResponse;
  if (json.message && (!json.hits || json.hits.length === 0)) {
    log.debug({ query, message: json.message }, 'RUES query returned warning');
  }

  // Combine featured (high-confidence boosted) + first hits, dedupe by _id.
  const seen = new Set<string>();
  const combined: RuesHit[] = [];
  for (const list of [json.featured ?? [], json.hits ?? []]) {
    for (const h of list) {
      if (!seen.has(h._id)) {
        seen.add(h._id);
        combined.push(h);
      }
    }
  }

  return combined.slice(0, limit).map(hitToCandidate);
}
