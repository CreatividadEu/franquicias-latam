const LEGAL_SUFFIX_PATTERNS = [
  /\bs\.?\s?a\.?\s?s\.?\b/g,
  /\bs\.?\s?a\.?\b/g,
  /\bltda\.?\b/g,
  /\b&\s*cia\.?\b/g,
  /\be\.?\s?u\.?\b/g,
  /\bs\.?\s?c\.?\s?a\.?\b/g,
  /\binc\.?\b/g,
  /\bllc\.?\b/g,
];

export function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function normalizeBusinessName(input: string): string {
  if (!input) return '';
  let s = stripAccents(input).toLowerCase();
  for (const pattern of LEGAL_SUFFIX_PATTERNS) {
    s = s.replace(pattern, ' ');
  }
  s = s.replace(/[^\p{L}\p{N}\s&-]/gu, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export function normalizeAddress(input: string): string {
  if (!input) return '';
  let s = stripAccents(input).toLowerCase();
  s = s.replace(/[#°·]/g, ' ');
  s = s.replace(/\bcalle\b/g, 'cl');
  s = s.replace(/\bcarrera\b/g, 'cr');
  s = s.replace(/\bavenida\b/g, 'av');
  s = s.replace(/\bdiagonal\b/g, 'dg');
  s = s.replace(/\btransversal\b/g, 'tv');
  s = s.replace(/[^\p{L}\p{N}\s-]/gu, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

const SPANISH_STOPWORDS = new Set([
  'de',
  'la',
  'el',
  'con',
  'que',
  'para',
  'los',
  'las',
  'una',
  'uno',
  'por',
  'en',
  'es',
  'muy',
  'pero',
  'mas',
  'también',
  'tambien',
  'también',
  'sin',
  'sobre',
  'cuando',
  'porque',
  'aunque',
  'desde',
  'hasta',
]);

const ENGLISH_STOPWORDS = new Set([
  'the',
  'and',
  'is',
  'in',
  'to',
  'of',
  'a',
  'with',
  'for',
  'that',
  'this',
  'but',
  'they',
  'their',
  'have',
  'from',
  'were',
  'was',
  'are',
  'we',
]);

export function detectLanguage(text: string): 'es' | 'en' {
  if (!text) return 'es';
  const tokens = stripAccents(text)
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  let es = 0;
  let en = 0;
  for (const t of tokens) {
    if (SPANISH_STOPWORDS.has(t)) es++;
    if (ENGLISH_STOPWORDS.has(t)) en++;
  }
  return en > es ? 'en' : 'es';
}

export function stripPiiFromReview(text: string): string {
  if (!text) return text;
  let cleaned = text;
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[email]');
  cleaned = cleaned.replace(/\+?\d[\d\s().-]{6,}\d/g, '[phone]');
  return cleaned;
}
