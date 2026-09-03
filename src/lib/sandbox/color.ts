/**
 * Utilidades de color del Sandbox (§5). El chrome es de Franquicias LATAM
 * (navy + teal); el canvas toma el acento del cliente. Si el acento no
 * contrasta sobre el navy, se deriva una tinta más clara automáticamente.
 * Todo puro, sin DOM: se usa en server, cliente y tests.
 */

export const SANDBOX_NAVY = "#0A0F1E";
export const SANDBOX_TEAL = "#00F0FF";
/** Contraste mínimo del acento sobre el navy (WCAG AA texto normal). */
export const MIN_ACCENT_CONTRAST = 4.5;

export type Rgb = { r: number; g: number; b: number };

export function normalizeHex(hex: string): string | null {
  const h = hex.trim().replace(/^#/, "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return /^[0-9a-fA-F]{6}$/.test(full) ? `#${full.toUpperCase()}` : null;
}

export function hexToRgb(hex: string): Rgb | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const v = parseInt(n.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa WCAG 2.x (0 negro → 1 blanco). */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mezcla `hex` hacia el blanco en proporción `amount` (0..1). */
export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex({
    r: rgb.r + (255 - rgb.r) * t,
    g: rgb.g + (255 - rgb.g) * t,
    b: rgb.b + (255 - rgb.b) * t,
  });
}

export type AccentResolution = {
  /** Acento tal como lo cargó el admin (normalizado). */
  raw: string;
  /** Acento que se pinta sobre el navy (igual a raw si ya contrasta). */
  onNavy: string;
  contrast: number;
  adjusted: boolean;
};

/**
 * Deriva una tinta legible del acento sobre el navy: si el contraste ya es
 * ≥ MIN_ACCENT_CONTRAST devuelve el color intacto; si no, lo aclara en pasos
 * del 6% hasta alcanzarlo (máx. 16 pasos → siempre termina). Un hex inválido
 * cae al teal del sistema, nunca a un blanco vacío.
 */
export function resolveAccent(
  hex: string | null | undefined,
  background: string = SANDBOX_NAVY,
  minContrast: number = MIN_ACCENT_CONTRAST,
): AccentResolution {
  const raw = (hex && normalizeHex(hex)) || SANDBOX_TEAL;
  let current = raw;
  let contrast = contrastRatio(current, background);
  let steps = 0;
  while (contrast < minContrast && steps < 16) {
    current = lighten(current, 0.06 * (steps + 1));
    contrast = contrastRatio(current, background);
    steps += 1;
  }
  return { raw, onNavy: current, contrast, adjusted: current !== raw };
}

/** `#FF5A1F` + alpha → `rgba(255, 90, 31, a)` para sombras y rellenos. */
export function hexAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex) ?? hexToRgb(SANDBOX_TEAL)!;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
