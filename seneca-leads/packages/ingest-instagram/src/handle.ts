/**
 * IG handle derivation. Three layers, in order:
 *   1. Direct match in business.domain (e.g. "instagram.com/foo")
 *   2. IG link in the cached Google Places observation payload
 *   3. (Apify Instagram Search) — left for the runner; this module derives
 *      cheap candidates first.
 */

const HANDLE_RE = /(?:^|\/)([A-Za-z0-9._]{2,30})(?:\/?|$)/;

export function handleFromInstagramUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
    const seg = u.pathname.replace(/^\//, '').split('/')[0];
    if (!seg) return null;
    const m = seg.match(HANDLE_RE);
    if (!m || !m[1]) return null;
    if (['p', 'reel', 'reels', 'explore', 'tags'].includes(m[1])) return null;
    return m[1].toLowerCase();
  } catch {
    return null;
  }
}

export function handleFromText(text: string): string | null {
  if (!text) return null;
  const m = text.match(/instagram\.com\/([A-Za-z0-9._]{2,30})/i);
  if (!m || !m[1]) return null;
  if (['p', 'reel', 'reels', 'explore', 'tags'].includes(m[1])) return null;
  return m[1].toLowerCase();
}

export interface PlaceObservationPayload {
  website?: string;
  description?: string;
  service_options?: Record<string, unknown>;
  [key: string]: unknown;
}

export function deriveHandleCandidates(input: {
  domain: string | null;
  observationPayload: PlaceObservationPayload | null;
}): string[] {
  const out: string[] = [];

  if (input.domain) {
    const fromDomain = handleFromInstagramUrl(input.domain);
    if (fromDomain) out.push(fromDomain);
  }

  const payload = input.observationPayload;
  if (payload) {
    if (typeof payload.website === 'string') {
      const h = handleFromInstagramUrl(payload.website) ?? handleFromText(payload.website);
      if (h) out.push(h);
    }
    if (typeof payload.description === 'string') {
      const h = handleFromText(payload.description);
      if (h) out.push(h);
    }
    // The full payload is JSON — mine the stringified form too as a last resort.
    const stringified = JSON.stringify(payload);
    const stringHandle = handleFromText(stringified);
    if (stringHandle) out.push(stringHandle);
  }

  return Array.from(new Set(out));
}
