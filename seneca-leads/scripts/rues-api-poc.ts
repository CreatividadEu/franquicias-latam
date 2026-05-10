/**
 * Proof of concept: call the RUES Elasticsearch API directly using the
 * encryption key + format reverse-engineered from services__372.js.
 *
 *   key   = "ac1244b5-8bee-47b2-a4a5-924a748d907f"
 *   wire  = AES.encrypt(JSON.stringify({term, offset, type, filter}), key).toString()
 *   send  = POST https://elasticprd.rues.org.co/query  body: {dataBody: <wire>}
 *
 * CryptoJS's `AES.encrypt(plain, passphrase).toString()` uses OpenSSL
 * EVP_BytesToKey (MD5, 1 iteration) to derive a 32-byte key + 16-byte IV
 * from the passphrase and a fresh random 8-byte salt, then AES-256-CBC.
 * The output is base64 of "Salted__" || salt || ciphertext.
 * We reproduce that with Node's built-in `crypto` — no extra dep.
 */
import { createHash, createCipheriv, randomBytes } from 'node:crypto';

/* eslint-disable no-console */

const RUES_KEY = 'ac1244b5-8bee-47b2-a4a5-924a748d907f';
const RUES_API = 'https://elasticprd.rues.org.co';

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

function cryptoJsEncrypt(plaintext: string, passphrase: string): string {
  const salt = randomBytes(8);
  const { key, iv } = evpBytesToKey(Buffer.from(passphrase, 'utf8'), salt, 32, 16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([Buffer.from('Salted__', 'utf8'), salt, ct]).toString('base64');
}

async function callQuery(payload: {
  term: string;
  offset: number;
  type: number;
  filter: unknown;
}): Promise<unknown> {
  const wire = cryptoJsEncrypt(JSON.stringify(payload), RUES_KEY);
  console.log(`  encrypted body starts with: ${wire.slice(0, 20)}... (length ${wire.length})`);
  const res = await fetch(`${RUES_API}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
      Origin: 'https://www.rues.org.co',
      Referer: 'https://www.rues.org.co/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({ dataBody: wire }),
  });
  console.log(`  status: ${res.status}`);
  console.log(`  content-type: ${res.headers.get('content-type')}`);
  const text = await res.text();
  console.log(`  body length: ${text.length}`);
  console.log(`  body preview: ${text.slice(0, 500)}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function main(): Promise<void> {
  // First sanity check: verify our encryption produces the expected
  // "Salted__"-prefixed base64 by encrypting a known string and decoding.
  const sample = cryptoJsEncrypt('hello', RUES_KEY);
  const decoded = Buffer.from(sample, 'base64');
  console.log('=== Encryption format sanity check ===');
  console.log(`  encrypted: ${sample}`);
  console.log(`  decoded prefix: ${decoded.subarray(0, 8).toString('utf8')}  (must be "Salted__")`);
  console.log(`  starts with U2FsdGVkX1: ${sample.startsWith('U2FsdGVkX1')}`);

  console.log('\n=== Trying RUES API ===');

  // Filter shape from services__888.js default state
  const RM_FILTER = {
    Category: ['JURIDICA', 'NATURAL', 'COMERCIO', 'SUCURSAL', 'AGENCIA'],
    Status: ['ACTIVA'],
    advanced: false,
    tipoRegistro: 'RM',
  };

  // Decrypted from a captured successful /query: type is the number 1
  const trials: Array<{ name: string; payload: Parameters<typeof callQuery>[0] }> = [
    { name: 'exact captured payload', payload: { term: 'La Puerta Falsa', offset: 0, type: 1, filter: RM_FILTER } },
  ];
  for (const t of trials) {
    console.log(`\n[${t.name}]`);
    try {
      const result = (await callQuery(t.payload)) as { featured?: unknown[]; hits?: unknown[]; total?: number };
      if (typeof result === 'object' && result !== null) {
        console.log(
          `  ✓ parsed: featured=${result.featured?.length ?? '?'} hits=${result.hits?.length ?? '?'} total=${result.total ?? '?'}`,
        );
      }
    } catch (err) {
      console.log(`  ✗ error: ${err instanceof Error ? err.message : err}`);
    }
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
