import { randomBytes } from "crypto";

/**
 * Slugs públicos no adivinables para /sandbox/[slug]. Base58 (sin 0/O/l/I,
 * que se confunden al dictarlos en una llamada), 12 caracteres ≈ 70 bits.
 */
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const SANDBOX_SLUG_LENGTH = 12;

export function generateSandboxSlug(length: number = SANDBOX_SLUG_LENGTH): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Slugs válidos: los generados o los fijos del seed (kebab-case corto). */
export function isValidSandboxSlug(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9-]{3,63}$/.test(value);
}

export function isValidPin(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}
